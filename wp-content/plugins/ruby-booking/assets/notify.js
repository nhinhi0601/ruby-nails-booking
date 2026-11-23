/* Ruby Booking – loa thông báo lịch hẹn mới.
 * Chạy trên MỌI trang (website, wp-admin, /quan-ly/) khi nhân viên đăng nhập.
 * - Kiểm tra lịch mới mỗi 5 giây (đồng hồ chạy trong Web Worker nên không bị trình duyệt làm chậm khi tab ẩn).
 * - Nhiều tab cùng mở: chỉ 1 tab hỏi máy chủ, 1 tab phát loa (không bị đọc trùng).
 * - Âm thanh: tiếng "ting ting" → câu ghi âm của tiệm (nếu có) → giọng đọc tiếng Việt (nếu máy có).
 * - Loa Bluetooth: phát tín hiệu cực nhỏ liên tục để loa không tự ngủ / không bị mất tiếng đầu câu.
 */
(function () {
  'use strict';
  var C = window.RBN;
  if (!C || window.RBNotify) return;

  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var S = {
    on: LS.get('rbn_on') !== '0', // bật sẵn cho nhân viên; tắt khi người dùng chủ động tắt
    unlocked: false, ctx: null, keep: null, clip: null, voice: null,
    last: 0, leader: false, polling: false, nonce: C.nonce, failures: 0
  };
  var bc = 'BroadcastChannel' in window ? new BroadcastChannel('rb-notify') : null;
  var listeners = [];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function emit(type, data) { listeners.forEach(function (f) { try { f(type, data); } catch (e) {} }); try { window.dispatchEvent(new CustomEvent('rb:' + type, { detail: data })); } catch (e) {} }

  /* ---------------- âm thanh ---------------- */
  function ctx() {
    if (!S.ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; S.ctx = new A(); }
    return S.ctx;
  }
  function keepAwake() {
    // Tín hiệu 25Hz, biên độ rất nhỏ (tai không nghe thấy) giữ loa Bluetooth luôn "thức".
    var c = ctx(); if (!c || S.keep || !S.on) return;
    try {
      var o = c.createOscillator(), g = c.createGain();
      o.frequency.value = 25; g.gain.value = 0.0012; o.connect(g); g.connect(c.destination); o.start();
      S.keep = { o: o, g: g };
    } catch (e) {}
  }
  function stopKeep() { if (S.keep) { try { S.keep.o.stop(); } catch (e) {} S.keep = null; } }
  function unlock() {
    var c = ctx(); if (!c) return Promise.resolve(false);
    var p = c.state === 'running' ? Promise.resolve() : c.resume();
    return Promise.resolve(p).then(function () {
      if (c.state !== 'running') return false;
      if (!S.unlocked) {
        S.unlocked = true;
        // "mồi" giọng đọc trong lúc có thao tác người dùng (Chrome yêu cầu)
        if ('speechSynthesis' in window) { try { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {} }
        if (S.on) keepAwake();
        loadClip();
        paintBell(); emit('state', state());
      }
      return true;
    }).catch(function () { return false; });
  }
  function onGesture() { if (S.on) unlock(); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, onGesture, { capture: true, passive: true }); });

  function chime(times) {
    var c = ctx(); if (!c || c.state !== 'running') return 0;
    var t = c.currentTime + 0.05;
    [[1046.5, 0], [1568, 0.16], [1046.5, 0.55], [1568, 0.71]].slice(0, times === 1 ? 2 : 4).forEach(function (n) {
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = n[0]; o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(0.5, t + n[1] + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + 0.5);
      o.start(t + n[1]); o.stop(t + n[1] + 0.55);
    });
    return times === 1 ? 800 : 1300;
  }
  function loadClip() {
    if (!C.audio || S.clip || !ctx()) return;
    fetch(C.audio, { credentials: 'same-origin' }).then(function (r) { return r.arrayBuffer(); })
      .then(function (b) { return new Promise(function (ok, no) { S.ctx.decodeAudioData(b, ok, no); }); })
      .then(function (buf) { S.clip = buf; }).catch(function () {});
  }
  function playClip() {
    if (!S.clip || !S.ctx) return 0;
    var s = S.ctx.createBufferSource(); s.buffer = S.clip; s.connect(S.ctx.destination); s.start();
    return Math.round(S.clip.duration * 1000) + 250;
  }
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^vi/i.test(v.lang); });
    if (!vs.length) return null;
    var best = vs.filter(function (v) { return /Natural|Online|HoaiMy|NamMinh|Google|Linh/i.test(v.name); });
    return best[0] || vs[0];
  }
  if ('speechSynthesis' in window) { S.voice = pickVoice(); speechSynthesis.onvoiceschanged = function () { S.voice = pickVoice(); emit('state', state()); }; }
  // Đọc lần lượt từng câu (câu ngắn để Chrome không cắt giữa chừng)
  function sayList(lines) {
    if (!('speechSynthesis' in window)) return;
    S.voice = S.voice || pickVoice();
    if (!S.voice) return;
    try {
      speechSynthesis.cancel(); speechSynthesis.resume();
      lines.filter(Boolean).forEach(function (text) {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = S.voice.lang || 'vi-VN'; u.voice = S.voice; u.rate = 1; u.volume = 1;
        speechSynthesis.speak(u);
      });
    } catch (e) {}
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function todayStr(add) { var d = new Date(); d.setDate(d.getDate() + (add || 0)); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function hm(t) { var p = t.split(':'), H = +p[0], M = +p[1]; return H + ' giờ' + (M ? ' ' + M : ''); }
  function dayWord(ymd) {
    if (ymd === todayStr()) return 'hôm nay';
    if (ymd === todayStr(1)) return 'ngày mai';
    var d = new Date(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8));
    return ['chủ nhật', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy'][d.getDay()] + ' ngày ' + +ymd.slice(8) + ' tháng ' + +ymd.slice(5, 7);
  }
  // "Khách Trần Văn Beo. Dịch vụ Sơn thường. Khung giờ 9 giờ 30 đến 10 giờ, ngày mai. Nhân viên Ngọc Anh."
  function line(b) {
    return [
      'Khách ' + b.name + '.',
      'Dịch vụ ' + b.services.map(function (x) { return x.name; }).join(' và ') + '.',
      'Khung giờ ' + hm(b.start) + (b.end ? ' đến ' + hm(b.end) : '') + ', ' + dayWord(b.date) + '.',
      b.staff_name ? 'Nhân viên ' + b.staff_name + '.' : 'Chưa chọn nhân viên.'
    ];
  }
  var ORD = ['thứ nhất', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm'];
  function newLines(list) {
    if (list.length === 1) return ['Vừa có lịch hẹn mới.'].concat(line(list[0]));
    var out = ['Vừa có ' + list.length + ' lịch hẹn mới.'];
    list.slice(0, 3).forEach(function (b, i) { out = out.concat(['Lịch ' + ORD[i] + '.'], line(b)); });
    if (list.length > 3) out.push('Và ' + (list.length - 3) + ' lịch khác, mời xem trên trang quản lý.');
    return out;
  }
  function pendingLines(list) {
    if (!list.length) return ['Hiện không có lịch hẹn nào đang chờ xác nhận.'];
    var out = ['Có ' + list.length + ' lịch hẹn đang chờ xác nhận.'];
    list.slice(0, 5).forEach(function (b, i) { out = out.concat(list.length > 1 ? ['Lịch ' + ORD[i] + '.'] : [], line(b)); });
    if (list.length > 5) out.push('Và ' + (list.length - 5) + ' lịch khác.');
    return out;
  }
  // kind: 'new' (ting ting + câu ghi âm + đọc) | 'plain' (ting + đọc)
  function speak(lines, kind) {
    if (!S.unlocked) return false;
    var wait = chime(kind === 'new' ? 2 : 1);
    setTimeout(function () {
      var w2 = kind === 'new' ? playClip() : 0;
      setTimeout(function () { sayList(lines); }, w2);
    }, wait);
    return true;
  }
  // Chỉ 1 tab đọc cho mỗi lịch mới
  function claimAndSpeak(list) {
    if (!S.on || !S.unlocked) return;
    var key = 'rbn_spoken', top = list[list.length - 1].id;
    var run = function () { if (+(LS.get(key) || 0) >= top) return; LS.set(key, String(top)); speak(newLines(list), 'new'); };
    if (navigator.locks && navigator.locks.request) {
      navigator.locks.request('rbn-speak', { ifAvailable: true }, function (lock) { if (lock) run(); return new Promise(function (r) { setTimeout(r, 300); }); });
    } else setTimeout(run, Math.random() * 250);
  }

  /* ---------------- hỏi máy chủ ---------------- */
  function refreshNonce() {
    if (!C.ajax) return Promise.resolve();
    return fetch(C.ajax + '?action=rb_nonce', { credentials: 'same-origin' }).then(function (r) { return r.json(); })
      .then(function (j) { if (j && j.nonce) { S.nonce = j.nonce; emit('nonce', j.nonce); } }).catch(function () {});
  }
  function poll() {
    if (S.polling) return;
    S.polling = true;
    fetch(C.api + '/feed' + (S.last ? '?after=' + S.last : ''), { credentials: 'same-origin', headers: { 'X-WP-Nonce': S.nonce } })
      .then(function (r) { return r.json().then(function (j) { j._s = r.status; return j; }); })
      .then(function (r) {
        S.polling = false;
        if (r._s === 403 || r._s === 401) { if (++S.failures < 4) refreshNonce(); return; }
        S.failures = 0;
        if (!r.ok) return;
        var first = !S.last;
        S.last = r.last || S.last;
        var msg = { last: S.last, bookings: first ? [] : r.bookings, pending: r.pending_all };
        if (bc) bc.postMessage({ t: 'feed', d: msg });
        handle(msg);
      }).catch(function () { S.polling = false; });
  }
  function handle(msg) {
    S.last = Math.max(S.last, msg.last || 0);
    emit('feed', msg);
    if (!msg.bookings || !msg.bookings.length) return;
    var web = msg.bookings.filter(function (b) { return !C.me || b.created_by !== C.me; }); // mọi lịch mới, trừ lịch do chính mình tạo
    emit('new', { bookings: msg.bookings, web: web });
    if (!web.length) return;
    popup(web);
    claimAndSpeak(web);
    systemNotify(web);
  }
  if (bc) bc.onmessage = function (e) {
    var m = e.data || {};
    if (m.t === 'feed' && !S.leader) handle(m.d);
    if (m.t === 'poke' && S.leader) poll(); // khách vừa đặt lịch trên cùng trình duyệt → hỏi ngay
  };

  // Đồng hồ trong Web Worker: không bị giới hạn 1 lần/phút như setInterval ở tab ẩn.
  function startTimer(fn, ms) {
    try {
      var src = 'setInterval(function(){postMessage(1)},' + ms + ')';
      var w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      w.onmessage = fn; return;
    } catch (e) {}
    setInterval(fn, ms);
  }
  function becomeLeader() {
    S.leader = true; poll();
    startTimer(function () { if (S.leader) poll(); }, C.interval || 5000);
  }
  if (navigator.locks && navigator.locks.request) {
    navigator.locks.request('rbn-leader', function () { becomeLeader(); return new Promise(function () {}); });
  } else becomeLeader();

  /* ---------------- giao diện ---------------- */
  var css = '' +
    '.rbn-bell{position:fixed;left:16px;bottom:16px;z-index:999998;display:flex;align-items:center;gap:8px;height:44px;padding:0 14px 0 12px;border-radius:999px;border:1px solid #EFC9D4;background:#fff;color:#6E1631;font:500 13.5px/1 "Be Vietnam Pro",system-ui,sans-serif;box-shadow:0 10px 30px -12px rgba(110,22,49,.45);cursor:pointer}' +
    '.rbn-bell svg{width:20px;height:20px;flex:none}' +
    '.rbn-bell.off{color:#7A6168}.rbn-bell.wait{background:#FFF4E0;border-color:#F2D29B;color:#8A5A00;animation:rbnPulse 1.6s infinite}' +
    '.rbn-bell.on .rbn-dot{width:8px;height:8px;border-radius:50%;background:#1F6B41;box-shadow:0 0 0 3px #E3F4EA}' +
    '.rbn-bell.mini span:not(.rbn-dot){display:none}.rbn-bell.mini{padding:0 12px}' +
    '@keyframes rbnPulse{50%{box-shadow:0 0 0 6px rgba(242,210,155,.45)}}' +
    '.rbn-pop{position:fixed;right:16px;top:16px;z-index:999999;width:min(360px,calc(100vw - 32px));background:#fff;border:1px solid #EFC9D4;border-radius:16px;box-shadow:0 24px 60px -20px rgba(110,22,49,.5);font:14px/1.45 "Be Vietnam Pro",system-ui,sans-serif;color:#2F2226;overflow:hidden;animation:rbnIn .35s cubic-bezier(.2,.9,.3,1.2)}' +
    '.rbn-pop header{display:flex;align-items:center;gap:8px;background:#8B1E3F;color:#fff;padding:10px 14px;font-weight:600}' +
    '.rbn-pop header button{margin-left:auto;background:none;border:0;color:#fff;font-size:20px;line-height:1;cursor:pointer;padding:0 2px}' +
    '.rbn-pop .rbn-b{padding:10px 14px;border-bottom:1px solid #F3E6EA}.rbn-pop .rbn-b b{display:block}.rbn-pop .rbn-b small{color:#7A6168}' +
    '.rbn-pop footer{display:flex;gap:8px;padding:10px 14px}.rbn-pop footer a{flex:1;text-align:center;background:#8B1E3F;color:#fff;border-radius:999px;padding:9px 12px;text-decoration:none;font-weight:500}' +
    '.rbn-pop .rbn-hint{background:#FFF4E0;color:#8A5A00;padding:8px 14px;font-size:13px}' +
    '@keyframes rbnIn{from{opacity:0;transform:translateY(-12px) scale(.97)}}' +
    '@media print{.rbn-bell,.rbn-pop{display:none}}';
  var ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6"/><path d="M9 17v1a3 3 0 0 0 6 0v-1"/><path d="M21 6.727a11.05 11.05 0 0 0 -2.794 -3.727"/><path d="M3 6.727a11.05 11.05 0 0 1 2.792 -3.727"/></svg>';
  var ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.346 5.353c.21 -.129 .428 -.246 .654 -.353a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3m-1 3h-13a4 4 0 0 0 2 -3v-3a6.996 6.996 0 0 1 1.273 -3.707"/><path d="M9 17v1a3 3 0 0 0 5.913 .716"/><path d="M3 3l18 18"/></svg>';
  var bell = null;
  function ready(fn) { if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    if (C.bell) {
      bell = document.createElement('button'); bell.type = 'button'; bell.className = 'rbn-bell';
      bell.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
      document.body.appendChild(bell); paintBell();
      setTimeout(function () { if (bell && S.unlocked) bell.classList.add('mini'); }, 6000);
    }
    if (S.on) unlock(); // một số trình duyệt (app đã cài, trang hay dùng) cho phát ngay không cần chạm
  });
  function paintBell() {
    if (!bell) return;
    var cls = !S.on ? 'off' : S.unlocked ? 'on' : 'wait';
    var label = !S.on ? 'Loa thông báo: tắt' : S.unlocked ? 'Loa đang bật' : 'Chạm vào trang để bật loa';
    bell.className = 'rbn-bell ' + cls + (S.unlocked && bell.classList.contains('mini') ? ' mini' : '');
    bell.title = label + ' (bấm để ' + (S.on ? 'tắt' : 'bật') + ')';
    bell.setAttribute('aria-label', bell.title);
    bell.innerHTML = (S.on ? ICON_ON : ICON_OFF) + '<span>' + label + '</span>' + (cls === 'on' ? '<span class="rbn-dot"></span>' : '');
  }
  var popTimer;
  function popup(list) {
    if (C.noPopup) return;
    var old = document.querySelector('.rbn-pop'); if (old) old.remove();
    var el = document.createElement('div'); el.className = 'rbn-pop'; el.setAttribute('role', 'alert');
    el.innerHTML = '<header>' + ICON_ON.replace('<svg', '<svg width="18" height="18"') + 'Lịch hẹn mới (' + list.length + ')<button type="button" aria-label="Đóng">×</button></header>' +
      list.slice(0, 3).map(function (b) {
        return '<div class="rbn-b"><b>' + esc(b.name) + ' · ' + esc(b.start) + ' ' + esc(b.date.slice(8) + '/' + b.date.slice(5, 7)) + '</b><small>' + esc(b.services.map(function (x) { return x.name; }).join(', ')) + (b.status === 'pending' ? ' · Chờ xác nhận' : '') + '</small></div>';
      }).join('') +
      (S.on && !S.unlocked ? '<div class="rbn-hint">Loa chưa bật trên trang này – chạm vào trang 1 lần để nghe thông báo.</div>' : '') +
      '<footer><a href="' + esc(C.portal + (C.canManage && list.some(function (b) { return b.status === 'pending'; }) ? '#/cho-duyet' : '#/lich')) + '">Xem lịch hẹn</a></footer>';
    el.querySelector('header button').onclick = function () { el.remove(); };
    document.body.appendChild(el);
    clearTimeout(popTimer); popTimer = setTimeout(function () { el.remove(); }, 20000);
  }
  function systemNotify(list) {
    // Thông báo hệ điều hành khi trình duyệt đang thu nhỏ / ở tab khác
    if (!document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      var b = list[0];
      var n = new Notification('Lịch hẹn mới – ' + (C.shop || 'Ruby'), { body: list.length > 1 ? list.length + ' lịch hẹn mới' : b.name + ' · ' + b.start + ' ' + b.date.slice(8) + '/' + b.date.slice(5, 7) + ' · ' + b.services.map(function (x) { return x.name; }).join(', '), tag: 'rb-' + b.id, icon: C.icon || '' });
      n.onclick = function () { window.focus(); location.href = C.portal + '#/lich'; };
    } catch (e) {}
  }

  function readPending(prefix) {
    if (!C.canManage) { if (prefix) speak([prefix], 'plain'); return Promise.resolve(); }
    return fetch(C.api + '/pending', { credentials: 'same-origin', headers: { 'X-WP-Nonce': S.nonce } })
      .then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok) speak((prefix ? [prefix] : []).concat(pendingLines(r.bookings || [])), 'plain'); })
      .catch(function () {});
  }
  function state() { return { on: S.on, unlocked: S.unlocked, voice: S.voice ? S.voice.name : '', clip: !!C.audio }; }
  function toggle(force) {
    var on = typeof force === 'boolean' ? force : !(S.on && S.unlocked);
    S.on = on; LS.set('rbn_on', on ? '1' : '0');
    if (on) {
      unlock().then(function (ok) {
        if (ok) { keepAwake(); readPending('Đã bật loa thông báo.'); }
        if ('Notification' in window && Notification.permission === 'default') { try { Notification.requestPermission(); } catch (e) {} }
        paintBell(); emit('state', state());
      });
    } else {
      stopKeep(); if ('speechSynthesis' in window) speechSynthesis.cancel();
    }
    paintBell(); emit('state', state());
    return on;
  }

  window.RBNotify = {
    toggle: toggle,
    test: function () {
      return unlock().then(function () {
        speak(newLines([{ name: 'Nguyễn Thị Mẫu', services: [{ name: 'Sơn gel' }], start: '09:30', end: '10:30', date: todayStr(1), staff_name: 'Ngọc Anh' }]), 'new');
        return state();
      });
    },
    readPending: readPending,
    state: state,
    on: function (f) { listeners.push(f); },
    poll: poll,
    setAudio: function (url) { C.audio = url; S.clip = null; if (S.unlocked) loadClip(); },
    lines: newLines
  };
})();
