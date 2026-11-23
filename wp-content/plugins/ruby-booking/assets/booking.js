/* Ruby Booking – front-end (vanilla JS, không cần thư viện) */
(function () {
  'use strict';
  var D = window.RB_DATA;
  if (!D) return;
  var ICON = {"check": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5l10 -10\" /></svg>", "down": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 9l6 6l6 -6\" /></svg>", "eye": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /> <path d=\"M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6\" /></svg>", "sparkles": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6\" /></svg>", "user": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\" /> <path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\" /></svg>", "cal": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12\" /> <path d=\"M16 3l0 4\" /> <path d=\"M8 3l0 4\" /> <path d=\"M4 11l16 0\" /> <path d=\"M8 15h2v2h-2l0 -2\" /></svg>", "left": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l14 0\" /> <path d=\"M5 12l6 6\" /> <path d=\"M5 12l6 -6\" /></svg>", "right": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l14 0\" /> <path d=\"M13 18l6 -6\" /> <path d=\"M13 6l6 6\" /></svg>", "gift": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 9a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1l0 -2\" /> <path d=\"M12 8l0 13\" /> <path d=\"M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7\" /> <path d=\"M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5\" /></svg>", "clock": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /> <path d=\"M12 7v5l3 3\" /></svg>", "users": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" /> <path d=\"M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\" /> <path d=\"M16 3.13a4 4 0 0 1 0 7.75\" /> <path d=\"M21 21v-2a4 4 0 0 0 -3 -3.85\" /></svg>", "userCheck": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\" /> <path d=\"M6 21v-2a4 4 0 0 1 4 -4h4\" /> <path d=\"M15 19l2 2l4 -4\" /></svg>", "phone": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2\" /></svg>", "mail": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10\" /> <path d=\"M3 7l9 6l9 -6\" /></svg>", "upload": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 8h.01\" /> <path d=\"M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5\" /> <path d=\"M3 16l5 -5c.928 -.893 2.072 -.893 3 0l3.5 3.5\" /> <path d=\"M14 14l1 -1c.679 -.653 1.473 -.829 2.214 -.526\" /> <path d=\"M19 22v-6\" /> <path d=\"M22 19l-3 -3l-3 3\" /></svg>", "x": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 6l-12 12\" /> <path d=\"M6 6l12 12\" /></svg>", "alert": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /> <path d=\"M12 8v4\" /> <path d=\"M12 16h.01\" /></svg>", "ok": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /> <path d=\"M9 12l2 2l4 -4\" /></svg>", "edit": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\" /> <path d=\"M13.5 6.5l4 4\" /></svg>", "copy": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666\" /> <path d=\"M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1\" /></svg>", "search": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" /> <path d=\"M21 21l-6 -6\" /></svg>", "home": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l-2 0l9 -9l9 9l-2 0\" /> <path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\" /> <path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\" /></svg>", "ticket": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 5l0 2\" /> <path d=\"M15 11l0 2\" /> <path d=\"M15 17l0 2\" /> <path d=\"M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2\" /></svg>", "plus": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 5l0 14\" /> <path d=\"M5 12l14 0\" /></svg>", "arrowUR": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17 7l-10 10\" /> <path d=\"M8 7l9 0l0 9\" /></svg>", "refresh": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4\" /> <path d=\"M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4\" /></svg>"};
  var CATS = { nail: 'Nail', mi: 'Mi', combo: 'Combo' };
  var WD = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  var WDS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  var STEPS = ['Dịch vụ', 'Kỹ thuật viên', 'Ngày giờ', 'Thông tin', 'Xác nhận'];
  var S = D.settings;
  // Build the date strip in the browser so a cached page never shows stale days.
  (function () {
    var out = [], now = new Date(), n = S.daysAhead || 14, open = S.openDays || [0, 1, 2, 3, 4, 5, 6];
    for (var i = 0; i < n; i++) {
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      var ymd = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
      out.push({ date: ymd, open: open.indexOf(d.getDay()) > -1 });
    }
    D.days = out;
  })();

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function ic(name, cls) { return '<span class="rb-i' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + (ICON[name] || '') + '</span>'; }
  function money(n) { return (n || 0).toLocaleString('vi-VN').replace(/,/g, '.') + 'đ'; }
  function dur(m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + ' giờ' + (r ? ' ' + r + ' phút' : '') : r + ' phút'; }
  function parseDate(ymd) { var p = ymd.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dmy(ymd) { var p = ymd.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function longDate(ymd) { return WD[parseDate(ymd).getDay()] + ', ' + dmy(ymd); }
  function addMin(hm, m) { var p = hm.split(':'), t = +p[0] * 60 + +p[1] + m; return ('0' + Math.floor(t / 60)).slice(-2) + ':' + ('0' + t % 60).slice(-2); }
  function qs(name) { var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; }
  function svc(id) { for (var i = 0; i < D.services.length; i++) if (D.services[i].id === id) return D.services[i]; return null; }
  function staffById(id) { for (var i = 0; i < D.staff.length; i++) if (D.staff[i].id === id) return D.staff[i]; return null; }

  function api(path, opts) {
    opts = opts || {};
    if (D.nonce) { opts.headers = opts.headers || {}; opts.headers['X-WP-Nonce'] = D.nonce; opts.credentials = 'same-origin'; }
    return fetch(D.api + path, opts).then(function (r) {
      return r.json().catch(function () { return { ok: false, message: 'Máy chủ phản hồi không hợp lệ.' }; })
        .then(function (j) { j._status = r.status; return j; });
    }).catch(function () { return { ok: false, message: 'Không kết nối được. Kiểm tra mạng và thử lại.' }; });
  }

  /* =====================================================
   * ĐẶT LỊCH
   * =================================================== */
  function Booking(root) {
    var st = {
      step: 1, cat: 'all', services: [], staff: null, date: null, time: null,
      slots: {}, loadingSlots: false, slotError: '',
      form: { name: D.user ? D.user.name || '' : '', phone: D.user ? D.user.phone || '' : '', email: D.user ? D.user.email || '' : '', note: '', agree: false, website: '' },
      files: [], errors: {}, submitting: false, submitError: '', done: null
    };

    var SAVE_KEY = 'rb_booking_sel_v1';
    function ids(str) { return String(str || '').split(/[\s,]+/).map(function (x) { return parseInt(x, 10); }).filter(function (id) { return id && svc(id); }); }
    // Restore what the customer picked before visiting a detail page (2-hour window).
    try {
      var saved = JSON.parse(sessionStorage.getItem(SAVE_KEY) || 'null');
      if (saved && Date.now() - saved.t < 7200000) {
        st.services = ids(saved.services.join(','));
        if (saved.staff === 0 || staffById(saved.staff)) st.staff = saved.staff;
        st.cat = saved.cat || 'all';
      }
    } catch (e) {}
    // Services chosen on the Dịch vụ / chi tiết pages: /dat-lich/?chon=9 or ?chon=9,10,11
    st.pinned = ids(qs('chon') + ',' + qs('dich-vu')).filter(function (id, i, a) { return a.indexOf(id) === i; });
    st.pinned.sort(function (a, b) { return D.services.indexOf(svc(a)) - D.services.indexOf(svc(b)); });
    st.pinned.forEach(function (id) { if (st.services.indexOf(id) < 0) st.services.push(id); });
    if (st.pinned.length) { st.cat = 'all'; st.notice = true; }
    function save() {
      try { sessionStorage.setItem(SAVE_KEY, JSON.stringify({ services: st.services, staff: st.staff, cat: st.cat, t: Date.now() })); } catch (e) {}
    }

    // Detail page + photos come from the site's service catalog (window.RN) when present,
    // or from the link / image set in Đặt lịch → Dịch vụ.
    function catalog(id) { try { return window.RN && RN.byBid && RN.byBid[id] ? RN.byBid[id] : null; } catch (e) { return null; } }
    function detailUrl(s) {
      if (s.detail_url) return s.detail_url;
      var c = catalog(s.id);
      try { return c && c.slug && RN.detailUrl ? RN.detailUrl(c.slug) : ''; } catch (e) { return ''; }
    }
    function photo(s) {
      if (s.image) return s.image;
      var c = catalog(s.id);
      try { var a = c && RN.imgs ? RN.imgs(c.slug) : []; return a && a.length ? (a[0].src || a[0].url || a[0]) : ''; } catch (e) { return ''; }
    }

    function selected() { return st.services.map(svc).filter(Boolean); }
    function totals() {
      var s = selected(), d = 0, p = 0;
      s.forEach(function (x) { d += x.duration; p += x.price; });
      return { dur: d, price: p, count: s.length };
    }
    function eligibleStaff() {
      return D.staff.filter(function (s) {
        if (!s.service_ids.length) return true;
        return st.services.every(function (id) { return s.service_ids.indexOf(id) > -1; });
      });
    }
    function slotKey() { return st.date + '|' + st.services.join(',') + '|' + (st.staff || 0); }

    function canNext(step) {
      if (step === 1) return st.services.length > 0;
      if (step === 2) return st.staff !== null;
      if (step === 3) return !!(st.date && st.time);
      if (step === 4) return validate(false);
      return true;
    }

    function validate(show) {
      var f = st.form, e = {};
      if (f.name.trim().length < 2) e.name = 'Vui lòng nhập họ tên.';
      var ph = f.phone.replace(/\D/g, '');
      if (!ph) e.phone = 'Vui lòng nhập số điện thoại.';
      else if (!/^0[35789]\d{8}$/.test(ph)) e.phone = 'Số điện thoại chưa đúng (cần 10 số, bắt đầu bằng 0).';
      if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Email chưa đúng định dạng.';
      if (!f.agree) e.agree = 'Vui lòng đồng ý với chính sách hủy/đổi lịch.';
      if (show) st.errors = e;
      return !Object.keys(e).length;
    }

    function go(step) {
      if (step > st.step) {
        for (var s = st.step; s < step; s++) {
          if (s === 4 && !validate(true)) { st.step = 4; render(); focusError(); return; }
          if (!canNext(s)) { st.step = s; render(); return; }
        }
      }
      st.step = step;
      render();
      var top = root.getBoundingClientRect().top + window.pageYOffset - 90;
      if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
      if (step === 3) ensureDate();
    }

    function focusError() {
      var el = root.querySelector('.rb-field.is-err input, .rb-field.is-err textarea, .rb-agree.is-err input');
      if (el) el.focus();
    }

    /* ---------- progress + summary ---------- */
    // Highest step the customer may jump to: every step before it is complete.
    function reach() { var k = 1; while (k < 5 && canNext(k)) k++; return k; }

    function progress() {
      var max = reach(), h = '<ol class="rb-prog">';
      STEPS.forEach(function (n, i) {
        var k = i + 1, complete = k < max && k !== st.step;
        var cls = k === st.step ? 'cur' : (complete ? 'done' : (k === max && k > st.step ? 'next' : ''));
        var clickable = k !== st.step && k <= max;
        h += '<li class="' + cls + '">' + (clickable ? '<button type="button" data-go="' + k + '" title="Đến bước ' + k + ': ' + n + '">' : '<span>') +
          '<i>' + (complete ? ICON.check : k) + '</i><em>' + n + '</em>' + (clickable ? '</button>' : '</span>') + '</li>';
      });
      return h + '</ol>';
    }

    function summary(mobile) {
      var t = totals(), s = selected();
      if (mobile) {
        return '<details class="rb-msum"><summary><div><small>' + (t.count ? t.count + ' dịch vụ' + (st.date && st.time ? ' · ' + dmy(st.date).slice(0, 5) + ' · ' + st.time : '') : 'Chưa chọn dịch vụ') +
          '</small><b>' + money(t.price) + '</b></div><span>Chi tiết ' + ic('down') + '</span></summary>' + summaryBody(s, t) + '</details>';
      }
      return '<aside class="rb-sum"><h3>Lịch hẹn của bạn</h3>' + summaryBody(s, t) + '</aside>';
    }

    function summaryBody(s, t) {
      var h = '';
      if (!s.length) h += '<p class="rb-empty">Chọn dịch vụ để bắt đầu.</p>';
      s.forEach(function (x) {
        h += '<div class="rb-sr">' + ic(x.category === 'mi' ? 'eye' : 'sparkles') + '<div><b>' + esc(x.name) + '</b><small>' + dur(x.duration) + '</small></div><span>' + money(x.price) + '</span></div>';
      });
      if (st.staff !== null) {
        var sf = st.staff ? staffById(st.staff) : null;
        h += '<div class="rb-sr rb-meta">' + ic('user') + '<div><small>Kỹ thuật viên</small><b>' + (sf ? esc(sf.name) : 'Để tiệm sắp xếp') + '</b></div></div>';
      }
      if (st.date) {
        h += '<div class="rb-sr rb-meta">' + ic('cal') + '<div><small>Thời gian</small><b>' + longDate(st.date) + (st.time ? ' · ' + st.time + ' – ' + addMin(st.time, t.dur) : '') + '</b></div></div>';
      }
      if (s.length) h += '<div class="rb-tot"><span>Tổng tạm tính<small>' + dur(t.dur) + '</small></span><b>' + money(t.price) + '</b></div>';
      return h;
    }

    function nav() {
      var t = totals();
      var nextLabel = st.step === 5 ? (st.submitting ? 'Đang gửi…' : 'Xác nhận đặt lịch') : (st.step === 4 ? 'Tiếp tục: Xem lại' : 'Tiếp tục');
      var dis = st.step === 5 ? st.submitting : !canNext(st.step) && st.step !== 4;
      return '<div class="rb-nav">' +
        (st.step > 1 ? '<button type="button" class="rb-btn rb-ghost" data-go="' + (st.step - 1) + '">' + ic('left') + '<span>Quay lại</span></button>' : '<span class="rb-navtot"><small>Tổng tạm tính</small><b>' + money(t.price) + '</b></span>') +
        '<button type="button" class="rb-btn rb-primary" data-next' + (dis ? ' disabled' : '') + '>' + nextLabel + ic(st.step === 5 ? 'check' : 'right') + '</button></div>';
    }

    /* ---------- steps ---------- */
    var CAT_ICON = { nail: 'sparkles', mi: 'eye', combo: 'gift' };

    function cardMedia(img, cat, letter) {
      if (img) return '<img src="' + esc(img) + '" alt="" loading="lazy" decoding="async">';
      return '<span class="rb-ph rb-ph-' + esc(cat) + '">' + (letter ? '<b>' + esc(letter) + '</b>' : ic(CAT_ICON[cat] || 'sparkles')) + '</span>';
    }

    function step1() {
      var cats = ['all'].concat(Object.keys(CATS).filter(function (c) { return D.services.some(function (s) { return s.category === c; }); }));
      var h = head('Chọn dịch vụ', 'Chạm vào thẻ để chọn – bạn có thể chọn nhiều dịch vụ trong cùng một lần hẹn.');
      if (st.notice && st.pinned.length) {
        h += '<div class="rb-pre" role="status">' + ic('check') + '<div><b>Đã chọn sẵn ' + st.pinned.map(function (id) { return esc(svc(id).name); }).join(', ') + '</b>' +
          '<small>Bạn có thể chọn thêm dịch vụ khác, hoặc sang bước chọn kỹ thuật viên ngay.</small></div>' +
          '<button type="button" class="rb-btn rb-primary rb-sm" data-go="2">Chọn kỹ thuật viên' + ic('right') + '</button>' +
          '<button type="button" class="rb-x" data-dismiss aria-label="Đóng">' + ICON.x + '</button></div>';
      }
      h += '<div class="rb-chips" role="tablist">' + cats.map(function (c) {
        var n = c === 'all' ? D.services.length : D.services.filter(function (s) { return s.category === c; }).length;
        return '<button type="button" class="rb-chip' + (st.cat === c ? ' on' : '') + '" data-cat="' + c + '">' + (c === 'all' ? 'Tất cả' : CATS[c]) + '<small>' + n + '</small></button>';
      }).join('') + '</div><div class="rb-cards">';
      var list = D.services.filter(function (s) { return st.cat === 'all' || s.category === st.cat; });
      if (st.pinned.length) { // services chosen on the Dịch vụ page come first
        list = list.filter(function (s) { return st.pinned.indexOf(s.id) > -1; }).concat(list.filter(function (s) { return st.pinned.indexOf(s.id) < 0; }));
      }
      list.forEach(function (s, n) {
        var on = st.services.indexOf(s.id) > -1, cat = CATS[s.category] || 'Dịch vụ', more = detailUrl(s);
        h += '<div class="rb-card' + (on ? ' on' : '') + (st.pinned.indexOf(s.id) > -1 ? ' rb-pinned' : '') + '" style="--i:' + n + '">' +
          '<span class="rb-card-media">' + cardMedia(photo(s), s.category) + '</span><span class="rb-card-shade"></span><span class="rb-card-shine"></span>' +
          '<button type="button" class="rb-card-hit" data-svc="' + s.id + '" aria-pressed="' + on + '" aria-label="Chọn ' + esc(s.name) + ', ' + money(s.price) + '"></button>' +
          '<span class="rb-card-top"><span class="rb-card-tag">' + ic('clock') + dur(s.duration) + '</span><i class="rb-tick">' + ICON.check + '</i></span>' +
          '<span class="rb-card-body"><small class="rb-card-kicker">' + ('0' + (n + 1)).slice(-2) + ' / ' + esc(cat) + '</small>' +
          '<b class="rb-card-title">' + esc(s.name) + '</b>' +
          (s.description ? '<span class="rb-card-desc">' + esc(s.description) + '</span>' : '') +
          '<span class="rb-card-price">' + money(s.price) + '</span>' +
          '<span class="rb-card-foot">' + (more ? '<a class="rb-card-more" href="' + esc(more) + '">Xem chi tiết' + ic('arrowUR') + '</a>' : '<span></span>') +
          '<span class="rb-card-cta"><em class="rb-off">Chọn</em><em class="rb-onl">Đã chọn</em><span class="rb-card-btn"><span class="rb-off">' + ICON.plus + '</span><span class="rb-onl">' + ICON.check + '</span></span></span>' +
          '</span></span></div>';
      });
      return h + '</div>';
    }

    function step2() {
      var list = eligibleStaff();
      var h = head('Chọn kỹ thuật viên', 'Chọn người bạn muốn, hoặc để tiệm sắp xếp người phù hợp nhất.');
      h += '<div class="rb-cards">';
      h += staffCard({ id: 0, name: 'Để tiệm sắp xếp', title: 'Nhanh nhất – có nhiều khung giờ trống hơn' }, 0, true);
      list.forEach(function (s, n) { h += staffCard(s, n + 1); });
      h += '</div>';
      if (!list.length) h += '<p class="rb-warn">Hiện chưa có kỹ thuật viên làm được tất cả dịch vụ bạn chọn cùng lúc. Tiệm sẽ sắp xếp giúp bạn.</p>';
      return h;
    }
    function staffCard(s, n, any) {
      var on = st.staff === s.id;
      var media = any ? '<span class="rb-ph rb-ph-any">' + ic('users') + '</span>' : cardMedia(s.image || s.photo, 'staff', s.name.split(' ').pop().charAt(0));
      return '<div class="rb-card rb-card-staff' + (any ? ' rb-card-any' : '') + (on ? ' on' : '') + '" style="--i:' + n + '">' +
        '<span class="rb-card-media">' + media + '</span><span class="rb-card-shade"></span><span class="rb-card-shine"></span>' +
        '<button type="button" class="rb-card-hit" data-staff="' + s.id + '" aria-pressed="' + on + '" aria-label="Chọn ' + esc(s.name) + '"></button>' +
        '<span class="rb-card-top">' + (any ? '<span class="rb-card-tag">' + ic('sparkles') + 'Gợi ý</span>' : '<span></span>') + '<i class="rb-tick">' + ICON.check + '</i></span>' +
        '<span class="rb-card-body"><small class="rb-card-kicker">' + (any ? 'Linh hoạt' : ('0' + n).slice(-2) + ' / Kỹ thuật viên') + '</small>' +
        '<b class="rb-card-title">' + esc(s.name) + '</b>' + (s.title ? '<span class="rb-card-desc">' + esc(s.title) + '</span>' : '') +
        '<span class="rb-card-foot"><span></span><span class="rb-card-cta"><em class="rb-off">Chọn</em><em class="rb-onl">Đã chọn</em><span class="rb-card-btn"><span class="rb-off">' + ICON.arrowUR + '</span><span class="rb-onl">' + ICON.check + '</span></span></span></span>' +
        '</span></div>';
    }

    function step3() {
      var h = head('Chọn ngày & giờ', 'Chỉ hiển thị khung giờ còn trống · Mở cửa ' + S.open + ' – ' + S.close);
      h += '<div class="rb-days">';
      D.days.forEach(function (d) {
        var dt = parseDate(d.date);
        h += '<button type="button" class="rb-day' + (st.date === d.date ? ' on' : '') + '" data-date="' + d.date + '"' + (d.open ? '' : ' disabled') + '>' +
          '<small>' + WDS[dt.getDay()] + '</small><b>' + ('0' + dt.getDate()).slice(-2) + '</b><small>Th' + (dt.getMonth() + 1) + '</small></button>';
      });
      h += '</div><div class="rb-slots">';
      if (!st.date) h += '<p class="rb-empty">Chọn một ngày để xem giờ trống.</p>';
      else if (st.loadingSlots) h += '<div class="rb-skel">' + new Array(9).join('<span></span>') + '</div>';
      else if (st.slotError) h += '<p class="rb-warn">' + esc(st.slotError) + '</p>';
      else {
        var slots = st.slots[slotKey()] || [];
        if (!slots.length) h += '<div class="rb-none">' + ic('cal') + '<p><b>Ngày này đã kín lịch</b><br>Bạn thử chọn ngày khác' + (st.staff ? ' hoặc chọn “Để tiệm sắp xếp”' : '') + ' nhé.</p></div>';
        var groups = [['Buổi sáng', 0, 12], ['Buổi chiều', 12, 17], ['Buổi tối', 17, 24]];
        groups.forEach(function (g) {
          var items = slots.filter(function (t) { var hr = +t.split(':')[0]; return hr >= g[1] && hr < g[2]; });
          if (!items.length) return;
          h += '<div class="rb-sg"><h4>' + g[0] + '</h4><div class="rb-sgrid">' + items.map(function (t) {
            return '<button type="button" class="rb-slot' + (st.time === t ? ' on' : '') + '" data-time="' + t + '">' + t + '</button>';
          }).join('') + '</div></div>';
        });
        if (st.time) h += '<p class="rb-hint">' + ic('clock') + ' Dự kiến từ <b>' + st.time + '</b> đến <b>' + addMin(st.time, totals().dur) + '</b></p>';
      }
      return h + '</div>';
    }

    function fieldOk(key, v) {
      v = (v || '').trim();
      if (key === 'name') return v.length >= 2;
      if (key === 'phone') return /^0[35789]\d{8}$/.test(v.replace(/\D/g, ''));
      if (key === 'email') return !!v && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      return false;
    }

    function field(key, label, req, icon, type, ph, extra) {
      var e = st.errors[key], v = st.form[key];
      var okNow = !e && fieldOk(key, v);
      var input = type === 'textarea'
        ? '<textarea id="rb-' + key + '" name="' + key + '" rows="3" placeholder="' + esc(ph) + '">' + esc(v) + '</textarea>'
        : '<input id="rb-' + key + '" name="' + key + '" type="' + type + '" value="' + esc(v) + '" placeholder="' + esc(ph) + '"' + (extra || '') + '>';
      return '<div class="rb-field' + (e ? ' is-err' : '') + (okNow ? ' is-ok' : '') + (type === 'textarea' ? ' is-area' : '') + '">' +
        '<label for="rb-' + key + '">' + label + (req ? ' <em>*</em>' : ' <small>(không bắt buộc)</small>') + '</label>' +
        '<div class="rb-in">' + (icon ? ic(icon) : '') + input + '<span class="rb-st-ic">' + (e ? ICON.alert : ICON.ok) + '</span></div>' +
        '<p class="rb-err" id="rb-' + key + '-err">' + (e ? esc(e) : '') + '</p></div>';
    }

    function step4() {
      var h = head('Thông tin của bạn', 'Tiệm sẽ liên hệ qua số điện thoại này nếu cần xác nhận lịch hẹn.');
      h += '<div class="rb-guest">' + ic('userCheck') + '<div><b>Không cần tạo tài khoản</b> – chỉ cần số điện thoại để đặt và tra cứu lịch hẹn.</div></div>';
      h += '<div class="rb-row2">' + field('name', 'Họ và tên', true, 'user', 'text', 'Nguyễn Thị Lan', ' autocomplete="name"') +
        field('phone', 'Số điện thoại', true, 'phone', 'tel', '09xx xxx xxx', ' inputmode="tel" autocomplete="tel"') + '</div>';
      h += field('email', 'Email', false, 'mail', 'email', 'Để nhận xác nhận & nhắc lịch qua email', ' autocomplete="email"');
      h += field('note', 'Ghi chú cho tiệm', false, '', 'textarea', 'VD: móng yếu, muốn làm nhẹ tay, dị ứng keo…');
      if (S.maxImages > 0) {
        h += '<div class="rb-field"><label>Ảnh mẫu nail / mi <small>(không bắt buộc)</small></label><div class="rb-up">' +
          '<label class="rb-drop"' + (st.files.length >= S.maxImages ? ' aria-disabled="true"' : '') + '>' + ic('upload') +
          '<span><b>Tải ảnh mẫu lên</b><small>Kéo thả hoặc bấm để chọn · JPG, PNG · tối đa ' + S.maxImages + ' ảnh, ' + S.maxImageMb + 'MB/ảnh</small></span>' +
          '<input type="file" accept="image/jpeg,image/png,image/webp" multiple data-files></label><div class="rb-thumbs">';
        st.files.forEach(function (f, i) {
          h += '<span class="rb-th"><img src="' + f.url + '" alt="Ảnh mẫu ' + (i + 1) + '"><button type="button" data-rmfile="' + i + '" aria-label="Xóa ảnh">' + ICON.x + '</button></span>';
        });
        h += '</div></div><p class="rb-err">' + esc(st.errors.files || '') + '</p></div>';
      }
      var policy = S.policyUrl ? '<a href="' + esc(S.policyUrl) + '" target="_blank" rel="noopener">Chính sách hủy/đổi lịch</a>' : 'Chính sách hủy/đổi lịch';
      h += '<label class="rb-agree' + (st.errors.agree ? ' is-err' : '') + '"><input type="checkbox" name="agree"' + (st.form.agree ? ' checked' : '') + '><i>' + ICON.check + '</i><span>Tôi đồng ý với ' + policy + ' của ' + esc(S.siteName) + ' <em>*</em></span></label>';
      if (st.errors.agree) h += '<p class="rb-err rb-err-agree">' + esc(st.errors.agree) + '</p>';
      h += '<input type="text" name="website" class="rb-hp" tabindex="-1" autocomplete="off" aria-hidden="true">';
      return h;
    }

    function step5() {
      var t = totals(), s = selected(), sf = st.staff ? staffById(st.staff) : null, f = st.form;
      var h = head('Xem lại & xác nhận', 'Kiểm tra lại thông tin trước khi gửi lịch hẹn.');
      h += '<div class="rb-review">';
      h += rv('Dịch vụ', 1, s.map(function (x) { return '<div class="rb-rl"><span>' + esc(x.name) + ' <small>· ' + dur(x.duration) + '</small></span><b>' + money(x.price) + '</b></div>'; }).join(''));
      h += rv('Kỹ thuật viên', 2, '<p>' + (sf ? esc(sf.name) : 'Để tiệm sắp xếp') + '</p>');
      h += rv('Thời gian', 3, '<p>' + longDate(st.date) + '<br><b>' + st.time + ' – ' + addMin(st.time, t.dur) + '</b> <small>(' + dur(t.dur) + ')</small></p>');
      h += rv('Thông tin liên hệ', 4, '<p>' + esc(f.name) + ' · ' + esc(f.phone) + (f.email ? '<br>' + esc(f.email) : '') + (f.note ? '<br><small>Ghi chú: ' + esc(f.note) + '</small>' : '') + '</p>' +
        (st.files.length ? '<div class="rb-thumbs sm">' + st.files.map(function (x) { return '<span class="rb-th"><img src="' + x.url + '" alt=""></span>'; }).join('') + '</div>' : ''));
      h += '<div class="rb-tot big"><span>Tổng tạm tính<small>Thanh toán tại tiệm</small></span><b>' + money(t.price) + '</b></div></div>';
      if (st.submitError) h += '<p class="rb-warn" role="alert">' + esc(st.submitError) + '</p>';
      return h;
    }
    function rv(title, step, body) {
      return '<section class="rb-rv"><header><h4>' + title + '</h4><button type="button" class="rb-link" data-go="' + step + '">' + ic('edit') + 'Sửa</button></header>' + body + '</section>';
    }
    function head(t, sub) { return '<div class="rb-head"><h2>' + t + '</h2><p>' + sub + '</p></div>'; }

    function success() {
      var b = st.done;
      var gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Hẹn tại ' + S.siteName) +
        '&dates=' + b.date.replace(/-/g, '') + 'T' + b.start.replace(':', '') + '00/' + b.date.replace(/-/g, '') + 'T' + b.end.replace(':', '') + '00' +
        '&ctz=Asia/Ho_Chi_Minh&location=' + encodeURIComponent(S.shopAddress) +
        '&details=' + encodeURIComponent('Mã lịch hẹn: ' + b.code + '\n' + b.services.map(function (x) { return x.name; }).join(', '));
      var statusLink = S.statusUrl ? S.statusUrl + (S.statusUrl.indexOf('?') > -1 ? '&' : '?') + 'ma=' + encodeURIComponent(b.code) : '';
      var pending = b.status === 'pending';
      var h = '<div class="rb-success">' +
        '<div class="rb-done-hero"><span class="rb-done-ic">' + ICON.check + '</span><h2>Đặt lịch thành công!</h2>' +
        '<p>' + (pending ? 'Tiệm đã nhận yêu cầu và sẽ liên hệ xác nhận qua số <b>' + esc(st.form.phone) + '</b>.' : 'Lịch hẹn của bạn đã được xác nhận. Hẹn gặp bạn tại tiệm!') + '</p>' +
        '<div class="rb-code"><small>Mã lịch hẹn</small><b>' + esc(b.code) + '</b><button type="button" class="rb-link" data-copy="' + esc(b.code) + '">' + ic('copy') + '<span>Sao chép</span></button></div></div>' +
        '<div class="rb-done-body">' +
        '<div class="rb-rl"><span>Trạng thái</span><span class="rb-badge rb-' + b.status + '">' + esc(b.status_label) + '</span></div>' +
        '<div class="rb-rl"><span>Thời gian</span><b>' + b.start + ' – ' + b.end + ', ' + longDate(b.date) + '</b></div>' +
        '<div class="rb-rl"><span>Kỹ thuật viên</span><b>' + (b.staff_auto ? 'Tiệm sắp xếp' : esc(b.staff)) + '</b></div>' +
        '<div class="rb-rl"><span>Dịch vụ</span><b>' + b.services.map(function (x) { return esc(x.name); }).join('<br>') + '</b></div>' +
        '<div class="rb-rl"><span>Địa chỉ</span><b>' + esc(S.shopAddress) + '</b></div>' +
        '<div class="rb-tot"><span>Tổng tạm tính</span><b>' + money(b.total) + '</b></div></div>' +
        '<div class="rb-done-acts"><a class="rb-btn rb-primary" href="' + gcal + '" target="_blank" rel="noopener">' + ic('cal') + '<span>Thêm vào Google Calendar</span></a>' +
        (statusLink ? '<a class="rb-btn rb-ghost" href="' + esc(statusLink) + '">' + ic('search') + '<span>Tra cứu lịch hẹn</span></a>' : '') +
        '<a class="rb-btn rb-ghost" href="' + esc(S.home) + '">' + ic('home') + '<span>Về trang chủ</span></a></div>' +
        '<p class="rb-small">Cần đổi lịch? Gọi <a href="tel:' + esc(S.shopPhone.replace(/\s/g, '')) + '">' + esc(S.shopPhone) + '</a>' + (S.cancelBefore ? ' · Có thể hủy online trước giờ hẹn ' + S.cancelBefore + ' tiếng.' : '') + '</p></div>';
      return h;
    }

    /* ---------- render ---------- */
    function render() {
      if (st.done) { root.innerHTML = success(); return; }
      var body = [null, step1, step2, step3, step4, step5][st.step]();
      var key = st.step + '|' + st.cat, anim = key !== st.animKey;
      st.animKey = key;
      root.innerHTML = '<div class="rb-progwrap">' + progress() + '</div>' +
        '<div class="rb-grid' + (st.step <= 2 ? ' rb-full' : '') + '"><div class="rb-main' + (anim ? ' rb-anim' : '') + '">' +
        '<div class="rb-msumwrap">' + summary(true) + '</div><div class="rb-body">' + body + '</div>' +
        '<div class="rb-navwrap">' + nav() + '</div></div><div class="rb-sumwrap">' + summary(false) + '</div></div>';
      bump();
    }

    // Refresh only progress, summary and bottom bar (cards stay put, no flicker).
    function renderChrome() {
      var parts = { '.rb-progwrap': progress(), '.rb-msumwrap': summary(true), '.rb-navwrap': nav(), '.rb-sumwrap': summary(false) };
      Object.keys(parts).forEach(function (sel) { var n = root.querySelector(sel); if (n) n.innerHTML = parts[sel]; });
      bump();
    }

    function bump() {
      var p = totals().price;
      if (st.lastPrice != null && st.lastPrice !== p) {
        root.querySelectorAll('.rb-tot b, .rb-navtot b, .rb-msum summary b').forEach(function (b) { b.classList.add('rb-bump'); });
      }
      st.lastPrice = p;
    }

    function pulse(el) { el.classList.remove('rb-pulse'); void el.offsetWidth; el.classList.add('rb-pulse'); }

    function ensureDate() {
      if (!st.date) {
        for (var i = 0; i < D.days.length; i++) if (D.days[i].open) { pickDate(D.days[i].date); return; }
      } else if (!st.slots[slotKey()]) loadSlots();
    }

    function pickDate(d) { st.date = d; st.time = null; render(); loadSlots(); }

    function loadSlots() {
      var key = slotKey();
      if (st.slots[key]) { render(); return; }
      st.loadingSlots = true; st.slotError = ''; render();
      api('/slots?date=' + st.date + '&services=' + st.services.join(',') + '&staff=' + (st.staff || 0)).then(function (r) {
        if (key !== slotKey()) return;
        st.loadingSlots = false;
        if (r.ok) st.slots[key] = r.slots; else st.slotError = r.message || 'Không tải được khung giờ.';
        render();
      });
    }

    function resetTime() { st.time = null; st.slots = {}; }

    function addFiles(list) {
      var errs = [];
      Array.prototype.forEach.call(list, function (f) {
        if (st.files.length >= S.maxImages) { errs.push('Chỉ được tải tối đa ' + S.maxImages + ' ảnh.'); return; }
        if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { errs.push('Chỉ nhận ảnh JPG, PNG hoặc WEBP.'); return; }
        if (f.size > S.maxImageMb * 1048576) { errs.push('Ảnh “' + f.name + '” lớn hơn ' + S.maxImageMb + 'MB.'); return; }
        st.files.push({ file: f, url: URL.createObjectURL(f) });
      });
      st.errors.files = errs[0] || '';
      render();
    }

    function submit() {
      if (!validate(true)) { st.step = 4; render(); focusError(); return; }
      st.submitting = true; st.submitError = ''; render();
      var fd = new FormData();
      fd.append('services', st.services.join(','));
      fd.append('staff', st.staff || 0);
      fd.append('date', st.date);
      fd.append('time', st.time);
      ['name', 'phone', 'email', 'note', 'website'].forEach(function (k) { fd.append(k, st.form[k]); });
      fd.append('agree', st.form.agree ? '1' : '0');
      st.files.forEach(function (x) { fd.append('images[]', x.file, x.file.name); });
      api('/bookings', { method: 'POST', body: fd }).then(function (r) {
        st.submitting = false;
        if (r.ok) {
          st.done = r.booking; try { sessionStorage.removeItem(SAVE_KEY); } catch (e) {} render();
          try { new BroadcastChannel('rb-notify').postMessage({ t: 'poke' }); } catch (e) {} // báo ngay cho tab quản lý cùng trình duyệt
          window.scrollTo({ top: root.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
          return;
        }
        if (r.code === 'slot_taken') {
          resetTime(); st.step = 3; st.slotError = ''; render(); loadSlots();
          setTimeout(function () { var n = root.querySelector('.rb-slots'); if (n) n.insertAdjacentHTML('afterbegin', '<p class="rb-warn">' + esc(r.message) + '</p>'); }, 50);
          return;
        }
        if (r.errors) { st.errors = r.errors; if (r.errors.name || r.errors.phone || r.errors.email || r.errors.agree) { st.step = 4; render(); focusError(); return; } }
        st.submitError = r.message || 'Không gửi được lịch hẹn. Vui lòng thử lại.';
        render();
      });
    }

    /* ---------- events ---------- */
    root.addEventListener('click', function (e) {
      var t = e.target.closest('button, [data-go]');
      if (!t || !root.contains(t)) return;
      if (t.hasAttribute('data-go')) { go(+t.getAttribute('data-go')); return; }
      if (t.hasAttribute('data-next')) { if (st.step === 5) submit(); else go(st.step + 1); return; }
      if (t.hasAttribute('data-cat')) { st.cat = t.getAttribute('data-cat'); save(); render(); return; }
      if (t.hasAttribute('data-dismiss')) { st.notice = false; var b = root.querySelector('.rb-pre'); if (b) b.remove(); return; }
      if (t.hasAttribute('data-svc')) {
        var id = +t.getAttribute('data-svc'), i = st.services.indexOf(id);
        if (i > -1) st.services.splice(i, 1); else st.services.push(id);
        if (st.staff && eligibleStaff().every(function (s) { return s.id !== st.staff; })) st.staff = null;
        resetTime(); save();
        var card = t.closest('.rb-card');
        card.classList.toggle('on', i < 0); t.setAttribute('aria-pressed', String(i < 0)); pulse(card);
        renderChrome(); return;
      }
      if (t.hasAttribute('data-staff')) {
        st.staff = +t.getAttribute('data-staff'); resetTime(); save();
        root.querySelectorAll('[data-staff]').forEach(function (c) { var on = c === t; c.closest('.rb-card').classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
        pulse(t.closest('.rb-card')); renderChrome(); return;
      }
      if (t.hasAttribute('data-date')) { pickDate(t.getAttribute('data-date')); return; }
      if (t.hasAttribute('data-time')) { st.time = t.getAttribute('data-time'); render(); return; }
      if (t.hasAttribute('data-rmfile')) { var f = st.files.splice(+t.getAttribute('data-rmfile'), 1)[0]; if (f) URL.revokeObjectURL(f.url); st.errors.files = ''; render(); return; }
      if (t.hasAttribute('data-copy')) {
        var code = t.getAttribute('data-copy');
        if (navigator.clipboard) navigator.clipboard.writeText(code);
        t.querySelector('span:last-child').textContent = 'Đã chép';
      }
    });

    root.addEventListener('input', function (e) {
      var n = e.target.name;
      if (!n || !(n in st.form) || n === 'agree') return;
      st.form[n] = e.target.value;
      if (st.errors[n]) { // clear error live once fixed
        var tmp = st.errors; validate(true); var still = st.errors[n]; st.errors = tmp;
        if (!still) {
          delete st.errors[n];
          var fl = e.target.closest('.rb-field'); if (fl) { fl.classList.remove('is-err'); fl.querySelector('.rb-err').textContent = ''; }
        }
      }
    });
    root.addEventListener('change', function (e) {
      if (e.target.name === 'agree') { st.form.agree = e.target.checked; if (e.target.checked) delete st.errors.agree; render(); }
      if (e.target.hasAttribute('data-files')) { addFiles(e.target.files); }
    });
    root.addEventListener('focusout', function (e) {
      var n = e.target.name;
      if (st.step !== 4 || !n || !(n in st.form) || n === 'note' || n === 'agree' || n === 'website') return;
      if (!st.form[n] && n !== 'email') return;
      var tmp = st.errors; validate(true); var err = st.errors[n]; st.errors = tmp;
      var fl = e.target.closest('.rb-field'); if (!fl) return;
      if (err) { st.errors[n] = err; fl.classList.add('is-err'); fl.classList.remove('is-ok'); fl.querySelector('.rb-err').textContent = err; }
      else if (st.form[n]) { fl.classList.add('is-ok'); }
    });
    root.addEventListener('dragover', function (e) { var d = e.target.closest('.rb-drop'); if (d) { e.preventDefault(); d.classList.add('drag'); } });
    root.addEventListener('dragleave', function (e) { var d = e.target.closest('.rb-drop'); if (d) d.classList.remove('drag'); });
    root.addEventListener('drop', function (e) { var d = e.target.closest('.rb-drop'); if (d) { e.preventDefault(); addFiles(e.dataTransfer.files); } });

    if (st.pinned.length) save();
    render();
  }

  /* =====================================================
   * TRA CỨU LỊCH HẸN
   * =================================================== */
  function Status(root, only) {
    var st = { code: qs('ma').toUpperCase(), phone: '', loading: false, error: '', b: null, confirmCancel: false, cancelling: false, msg: '',
      mine: null, mineErr: '', showPast: false, askCancel: 0, busyCancel: 0, mineMsg: '' };
    var ORDER = ['pending', 'confirmed', 'done'];
    var bookUrl = S.home.replace(/\/$/, '') + '/dat-lich/';

    function gcal(b) {
      return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Hẹn tại ' + S.siteName) +
        '&dates=' + b.date.replace(/-/g, '') + 'T' + b.start.replace(':', '') + '00/' + b.date.replace(/-/g, '') + 'T' + b.end.replace(':', '') + '00' +
        '&ctz=Asia/Ho_Chi_Minh&location=' + encodeURIComponent(S.shopAddress) + '&details=' + encodeURIComponent('Mã lịch hẹn: ' + b.code);
    }
    function mcard(b, past) {
      var d = parseDate(b.date);
      var h = '<article class="rb-mcard' + (past ? ' past' : '') + '"><div class="rb-mdate"><small>' + WDS[d.getDay()] + '</small><b>' + ('0' + d.getDate()).slice(-2) + '</b><small>Th' + (d.getMonth() + 1) + '</small></div>' +
        '<div class="rb-mmain"><div class="rb-mtop"><b>' + b.services.map(function (x) { return esc(x.name); }).join(' + ') + '</b><span class="rb-badge rb-' + b.status + '">' + esc(b.status_label) + '</span></div>' +
        '<p>' + ic('clock') + b.start + ' – ' + b.end + ' · ' + ic('user') + (b.staff_auto && b.status === 'pending' ? 'Tiệm sắp xếp' : esc(b.staff || 'Tiệm sắp xếp')) + ' · ' + money(b.total) + '</p>' +
        '<small class="rb-mcode">Mã ' + esc(b.code) + '</small>';
      if (!past) {
        if (st.askCancel === b.id) {
          h += '<div class="rb-cc"><p>Hủy lịch hẹn ' + esc(b.code) + '?</p><div><button type="button" class="rb-btn rb-ghost rb-sm" data-mc-no>Không</button><button type="button" class="rb-btn rb-danger rb-sm" data-mc-yes="' + b.id + '"' + (st.busyCancel ? ' disabled' : '') + '>' + (st.busyCancel ? 'Đang hủy…' : 'Hủy lịch') + '</button></div></div>';
        } else {
          h += '<div class="rb-macts"><a class="rb-link" href="' + gcal(b) + '" target="_blank" rel="noopener">' + ic('cal') + 'Thêm vào Google Calendar</a>' +
            (b.can_cancel ? '<button type="button" class="rb-link rb-link-danger" data-mc="' + b.id + '">' + ic('x') + 'Hủy lịch</button>' : '<span class="rb-small-note">Đổi/hủy: gọi ' + esc(S.shopPhone) + '</span>') + '</div>';
        }
      } else {
        h += '<div class="rb-macts"><a class="rb-link" href="' + bookUrl + '?chon=' + b.services.map(function (x) { return x.id; }).join(',') + '">' + ic('refresh') + 'Đặt lại dịch vụ này</a></div>';
      }
      return h + '</div></article>';
    }
    function mine() {
      var embedded = !!root.closest('.rtk') || only; // page already has its own title
      var h = '<section class="rb-mine"><div class="rb-head">' + (embedded ? '' : '<h2>Lịch hẹn của tôi</h2>') + '<p>Lịch đặt bằng tài khoản này' + (st.mine && st.mine.phone ? ' hoặc số ' + esc(st.mine.phone) : '') + '.</p></div>';
      if (st.mineMsg) h += '<p class="rb-okmsg">' + ic('ok') + esc(st.mineMsg) + '</p>';
      if (st.mineErr) h += '<p class="rb-warn">' + esc(st.mineErr) + '</p>';
      if (!st.mine) return h + '<div class="rb-skel rb-skel-list"><span></span><span></span></div></section>';
      var up = st.mine.upcoming, past = st.mine.past;
      if (only) h += '<h3 class="rb-msec">' + ic('cal') + 'Lịch hẹn sắp tới <span>' + up.length + '</span></h3>';
      if (!up.length) h += '<div class="rb-none">' + ic('cal') + '<p><b>Bạn chưa có lịch hẹn sắp tới</b><br>Đặt lịch chỉ mất khoảng 1 phút.</p><a class="rb-btn rb-primary rb-sm" href="' + bookUrl + '">Đặt lịch ngay' + ic('right') + '</a></div>';
      else h += '<div class="rb-mlist">' + up.map(function (b) { return mcard(b, false); }).join('') + '</div>';
      if (only) {
        h += '<h3 class="rb-msec">' + ic('clock') + 'Lịch hẹn cũ <span>' + past.length + '</span></h3>';
        h += past.length ? '<div class="rb-mlist">' + past.map(function (b) { return mcard(b, true); }).join('') + '</div>' : '<p class="rb-small-note rb-mempty">Chưa có lịch hẹn nào đã qua.</p>';
      } else if (past.length) {
        h += '<button type="button" class="rb-link rb-pasttoggle" data-past>' + (st.showPast ? 'Ẩn lịch sử' : 'Xem lịch sử (' + past.length + ' lịch hẹn)') + ic(st.showPast ? 'down' : 'right') + '</button>';
        if (st.showPast) h += '<div class="rb-mlist">' + past.map(function (b) { return mcard(b, true); }).join('') + '</div>';
      }
      return h + '</section>';
    }
    function loadMine() {
      api('/my-bookings').then(function (r) {
        if (r.ok) st.mine = r; else { st.mine = { upcoming: [], past: [] }; st.mineErr = r.message || 'Không tải được lịch hẹn.'; }
        render();
      });
    }

    function render() {
      var h = '';
      if (only) { root.innerHTML = D.user ? mine() : '<p class="rb-warn">Vui lòng đăng nhập để xem lịch hẹn.</p>'; return; }
      if (D.user) h += mine();
      if (S.portal) h += '<p class="rb-okmsg">' + ic('ok') + 'Bạn đang đăng nhập bằng tài khoản nhân viên. <a href="' + esc(S.portal) + '">Mở trang quản lý lịch hẹn</a></p>';
      var openLookup = !D.user || st.code || st.b || st.error;
      h += (D.user ? '<details class="rb-other"' + (openLookup ? ' open' : '') + '><summary>' + ic('search') + 'Tra cứu lịch hẹn khác bằng mã</summary>' : '') +
        '<div class="rb-lookup">' + (D.user ? '' : '<div class="rb-head"><h2>Tra cứu lịch hẹn</h2><p>Nhập mã lịch hẹn và số điện thoại đã dùng khi đặt.</p></div>') +
        '<form class="rb-lform" novalidate><div class="rb-field"><label for="rb-code">Mã lịch hẹn</label><div class="rb-in">' + ic('ticket') +
        '<input id="rb-code" name="code" value="' + esc(st.code) + '" placeholder="VD: RB-1211-K7P" autocomplete="off"></div></div>' +
        '<div class="rb-field"><label for="rb-lphone">Số điện thoại</label><div class="rb-in">' + ic('phone') +
        '<input id="rb-lphone" name="phone" type="tel" inputmode="tel" value="' + esc(st.phone) + '" placeholder="09xx xxx xxx"></div></div>' +
        '<button class="rb-btn rb-primary" type="submit"' + (st.loading ? ' disabled' : '') + '>' + ic('search') + '<span>' + (st.loading ? 'Đang tìm…' : 'Tra cứu') + '</span></button></form>';
      if (st.error) h += '<p class="rb-warn" role="alert">' + esc(st.error) + '</p>';
      if (st.b) h += card(st.b);
      root.innerHTML = h + '</div>' + (D.user ? '</details>' : '');
    }

    function card(b) {
      var idx = b.status === 'in_progress' ? 1 : ORDER.indexOf(b.status), cancelled = b.status === 'cancelled' || b.status === 'no_show';
      var tl = '<ol class="rb-tl' + (cancelled ? ' x' : '') + '">' + ['Đã đặt', 'Đã xác nhận', 'Hoàn thành'].map(function (n, i) {
        var cls = cancelled ? (i === 0 ? 'done' : '') : (i <= idx ? 'done' : '');
        if (!cancelled && i === idx) cls += ' cur';
        return '<li class="' + cls + '"><i>' + (cls.indexOf('done') > -1 ? ICON.check : '') + '</i><span>' + n + '</span></li>';
      }).join('') + (cancelled ? '<li class="cx"><i>' + ICON.x + '</i><span>' + esc(b.status_label) + '</span></li>' : '') + '</ol>';
      var h = '<div class="rb-scard"><header><div><small>Mã lịch hẹn</small><b>' + esc(b.code) + '</b></div><span class="rb-badge rb-' + b.status + '">' + esc(b.status_label) + '</span></header>' + tl +
        '<div class="rb-done-body">' +
        '<div class="rb-rl"><span>Khách hàng</span><b>' + esc(b.name) + ' · ' + esc(b.phone_masked) + '</b></div>' +
        '<div class="rb-rl"><span>Thời gian</span><b>' + b.start + ' – ' + b.end + ', ' + longDate(b.date) + '</b></div>' +
        '<div class="rb-rl"><span>Kỹ thuật viên</span><b>' + (b.staff_auto ? 'Tiệm sắp xếp' + (b.status === 'confirmed' && b.staff ? ' (' + esc(b.staff) + ')' : '') : esc(b.staff)) + '</b></div>' +
        '<div class="rb-rl"><span>Dịch vụ</span><b>' + b.services.map(function (x) { return esc(x.name); }).join('<br>') + '</b></div>' +
        (b.images.length ? '<div class="rb-rl"><span>Ảnh mẫu</span><div class="rb-thumbs sm">' + b.images.map(function (u) { return '<span class="rb-th"><img src="' + esc(u) + '" alt=""></span>'; }).join('') + '</div></div>' : '') +
        '<div class="rb-tot"><span>Tổng tạm tính</span><b>' + money(b.total) + '</b></div></div>';
      if (st.msg) h += '<p class="rb-okmsg">' + ic('ok') + esc(st.msg) + '</p>';
      if (b.can_cancel) {
        h += st.confirmCancel
          ? '<div class="rb-cc"><p>Bạn chắc chắn muốn hủy lịch hẹn này?</p><div><button type="button" class="rb-btn rb-ghost" data-cc="no">Không</button><button type="button" class="rb-btn rb-danger" data-cc="yes"' + (st.cancelling ? ' disabled' : '') + '>' + (st.cancelling ? 'Đang hủy…' : 'Hủy lịch hẹn') + '</button></div></div>'
          : '<div class="rb-sacts"><button type="button" class="rb-btn rb-ghost" data-cancel>' + ic('x') + '<span>Hủy lịch hẹn</span></button><a class="rb-btn rb-ghost" href="tel:' + esc(S.shopPhone.replace(/\s/g, '')) + '">' + ic('phone') + '<span>Gọi tiệm để đổi lịch</span></a></div>';
      } else if (!cancelled && b.status !== 'done') {
        h += '<p class="rb-small">Cần thay đổi? Gọi tiệm: <a href="tel:' + esc(S.shopPhone.replace(/\s/g, '')) + '">' + esc(S.shopPhone) + '</a></p>';
      }
      return h + '</div>';
    }

    function lookup(path) {
      var f = root.querySelector('.rb-lform');
      st.code = f.code.value.trim().toUpperCase(); st.phone = f.phone.value.trim();
      if (!st.code || !st.phone) { st.error = 'Vui lòng nhập mã lịch hẹn và số điện thoại.'; render(); return; }
      var fd = new FormData(); fd.append('code', st.code); fd.append('phone', st.phone);
      if (path === '/cancel') st.cancelling = true; else { st.loading = true; st.msg = ''; }
      st.error = ''; render();
      api(path, { method: 'POST', body: fd }).then(function (r) {
        st.loading = false; st.cancelling = false; st.confirmCancel = false;
        if (r.ok) { st.b = r.booking; if (path === '/cancel') st.msg = 'Đã hủy lịch hẹn. Hẹn gặp bạn lần sau!'; }
        else { st.error = r.message; if (path !== '/cancel') st.b = null; }
        render();
      });
    }

    root.addEventListener('submit', function (e) { e.preventDefault(); lookup('/lookup'); });
    root.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.hasAttribute('data-past')) { st.showPast = !st.showPast; render(); return; }
      if (t.hasAttribute('data-mc')) { st.askCancel = +t.getAttribute('data-mc'); st.mineMsg = ''; render(); return; }
      if (t.hasAttribute('data-mc-no')) { st.askCancel = 0; render(); return; }
      if (t.hasAttribute('data-mc-yes')) {
        st.busyCancel = 1; render();
        api('/my-bookings/' + t.getAttribute('data-mc-yes') + '/cancel', { method: 'POST' }).then(function (r) {
          st.busyCancel = 0; st.askCancel = 0;
          if (r.ok) { st.mine = r; st.mineMsg = 'Đã hủy lịch hẹn. Tiệm đã nhận được thông báo.'; st.mineErr = ''; } else { st.mineErr = r.message; }
          render();
        });
        return;
      }
      if (t.hasAttribute('data-cancel')) { st.confirmCancel = true; render(); }
      if (t.getAttribute('data-cc') === 'no') { st.confirmCancel = false; render(); }
      if (t.getAttribute('data-cc') === 'yes') lookup('/cancel');
    });
    render();
    if (D.user) loadMine();
  }

  function boot() {
    document.querySelectorAll('.rb-app').forEach(function (el) {
      if (el.getAttribute('data-rb-ready')) return;
      el.setAttribute('data-rb-ready', '1');
      var v = el.getAttribute('data-rb-view');
      if (v === 'status' || v === 'mine') Status(el, v === 'mine'); else Booking(el);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
