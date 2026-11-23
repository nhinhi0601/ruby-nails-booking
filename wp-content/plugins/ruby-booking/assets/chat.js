/* Ruby Booking – chatbot tư vấn (FR10, FR11). Vanilla JS, không cần thư viện.
 * Nút tròn góc phải dưới → khung chat nhỏ: màn chào, câu hỏi gợi ý, trả lời tự động / AI,
 * hỏi bằng giọng nói (Web Speech API, tiếng Việt) và đọc to câu trả lời.
 */
(function () {
  'use strict';
  var C = window.RBC;
  if (!C || document.getElementById('rbc')) return;

  var KEY = 'rbc_v1';
  var S = { open: false, view: 'home', msgs: [], speak: false, busy: false, tease: false };
  try { var saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (saved) { S.view = saved.view || 'home'; S.msgs = saved.msgs || []; S.speak = !!saved.speak; S.tease = !!saved.tease; S.seen = !!saved.seen; } } catch (e) {}
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ view: S.view, msgs: S.msgs.slice(-40), speak: S.speak, tease: S.tease, seen: S.seen })); } catch (e) {} }

  /* ---------------- icons & mascot ---------------- */
  function ic(p, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + p + '</svg>'; }
  var I = {
    msg: ic('<path d="M3 20l1.3-3.9A9 8 0 1 1 7.7 19L3 20"/>'),
    x: ic('<path d="M18 6L6 18M6 6l12 12"/>'),
    down: ic('<path d="M6 9l6 6 6-6"/>'),
    vol: ic('<path d="M15 8a5 5 0 0 1 0 8"/><path d="M17.7 5a9 9 0 0 1 0 14"/><path d="M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5L6 15"/>'),
    voloff: ic('<path d="M6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l3.5-4.5A.8.8 0 0 1 11 5v14a.8.8 0 0 1-1.5.5L6 15"/><path d="M16 10l4 4m0-4l-4 4"/>'),
    dots: ic('<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>'),
    refresh: ic('<path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>'),
    phone: ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    fb: ic('<path d="M3 20l1.3-3.9A9 8 0 1 1 7.7 19L3 20"/><path d="M8 13l3-2 2 2 3-3"/>'),
    mic: ic('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M8 21h8M12 17v4"/>'),
    send: ic('<path d="M10 14L21 3M21 3l-6.5 18a.55.55 0 0 1-1 0L10 14l-7-3.5a.55.55 0 0 1 0-1L21 3"/>'),
    arrow: ic('<path d="M5 12h14M13 18l6-6-6-6"/>'),
    cal: ic('<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>'),
    pin: ic('<path d="M12 8a3 3 0 1 0 0 6a3 3 0 1 0 0-6"/><path d="M17.7 16.7L13.4 21a2 2 0 0 1-2.8 0l-4.3-4.3a8 8 0 1 1 11.3 0z"/>'),
    link: ic('<path d="M9 15l6-6M11 6l.5-.5a5 5 0 0 1 7 7L18 13M13 18l-.4.5a5 5 0 0 1-7-7L6 11"/>')
  };
  // Linh vật "Ruby": viên đá ruby có gương mặt, đeo tai nghe tư vấn (vẽ riêng cho dự án).
  var FACE = '<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="rbcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8577F"/><stop offset="1" stop-color="#8B1E3F"/></linearGradient></defs>' +
    '<circle cx="60" cy="60" r="60" fill="#F9E4EA"/><circle cx="60" cy="118" r="44" fill="#F3CAD6"/>' +
    '<path d="M33 50L47 33H73L87 50L60 94Z" fill="url(#rbcG)"/>' +
    '<path d="M33 50H87M47 33L54 50L60 94L66 50L73 33M54 50L60 33L66 50" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M50 37L45 47" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>' +
    '<ellipse cx="52" cy="60" rx="4.2" ry="5.2" fill="#2B1A20"/><ellipse cx="68" cy="60" rx="4.2" ry="5.2" fill="#2B1A20"/>' +
    '<circle cx="53.4" cy="58.2" r="1.5" fill="#fff"/><circle cx="69.4" cy="58.2" r="1.5" fill="#fff"/>' +
    '<circle cx="45.5" cy="68" r="3.6" fill="#FF9DB5" opacity=".9"/><circle cx="74.5" cy="68" r="3.6" fill="#FF9DB5" opacity=".9"/>' +
    '<path d="M55 69Q60 74 65 69" fill="none" stroke="#2B1A20" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M30 56A30 30 0 0 1 90 56" fill="none" stroke="#3A2A30" stroke-width="4" stroke-linecap="round"/>' +
    '<rect x="24" y="52" width="10" height="16" rx="5" fill="#3A2A30"/><rect x="86" y="52" width="10" height="16" rx="5" fill="#3A2A30"/>' +
    '<path d="M91 66Q92 80 74 80" fill="none" stroke="#3A2A30" stroke-width="2.4" stroke-linecap="round"/><circle cx="72" cy="80" r="3" fill="#3A2A30"/>' +
    '<path d="M95 24l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#fff"/></svg>';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(t) { // plain text → safe HTML: **đậm**, dòng "- " thành danh sách, link
    var lines = esc(t).split(/\n/), out = '', list = false;
    lines.forEach(function (l) {
      l = l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      var m = l.match(/^\s*[-•*]\s+(.*)$/);
      if (m) { if (!list) { out += '<ul>'; list = true; } out += '<li>' + m[1] + '</li>'; return; }
      if (list) { out += '</ul>'; list = false; }
      if (l.trim()) out += '<p>' + l + '</p>';
    });
    return out + (list ? '</ul>' : '');
  }
  var tel = String(C.phone || '').replace(/[^\d+]/g, '');

  /* ---------------- build DOM ---------------- */
  var root = document.createElement('div');
  root.id = 'rbc';
  root.innerHTML =
    '<button type="button" class="rbc-launch" aria-label="Mở khung chat tư vấn" aria-expanded="false"><span class="rbc-face">' + FACE + '</span><span class="rbc-x">' + I.down + '</span><span class="rbc-dot">1</span></button>' +
    '<section class="rbc-panel" role="dialog" aria-label="Chat tư vấn ' + esc(C.title) + '">' +
      '<header class="rbc-head"><span class="rbc-ava">' + FACE + '</span><div><h2>' + esc(C.title) + '</h2><small><i></i>' + (+C.ai ? 'Trợ lý AI · trả lời ngay' : 'Online · trả lời ngay') + '</small></div>' +
        '<div class="rbc-hb"><button type="button" class="rbc-ib" data-a="speak" hidden></button><button type="button" class="rbc-ib" data-a="menu" aria-label="Tùy chọn">' + I.dots + '</button><button type="button" class="rbc-ib" data-a="close" aria-label="Thu nhỏ">' + I.down + '</button></div></header>' +
      '<div class="rbc-body"></div>' +
    '</section>';
  document.body.appendChild(root);
  document.body.classList.add('rbc-on');
  var $ = function (s) { return root.querySelector(s); };
  var panel = $('.rbc-panel'), body = $('.rbc-body');
  body.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column';
  if (S.seen) root.classList.add('seen');

  function contactsHtml(cls) {
    var h = '';
    if (C.zalo) h += '<a class="' + cls + ' zalo" href="https://zalo.me/' + esc(C.zalo) + '" target="_blank" rel="noopener" aria-label="Chat Zalo">' + (cls === 'rbc-ct' ? 'Zalo' : I.msg + 'Zalo') + '</a>';
    if (tel) h += '<a class="' + cls + ' tel" href="tel:' + esc(tel) + '" aria-label="Gọi điện cho tiệm">' + I.phone + (cls === 'rbc-ct' ? '' : 'Gọi ' + esc(C.phone)) + '</a>';
    if (C.messenger) h += '<a class="' + cls + ' fb" href="https://m.me/' + esc(C.messenger) + '" target="_blank" rel="noopener" aria-label="Nhắn Messenger">' + I.fb + (cls === 'rbc-ct' ? '' : 'Messenger') + '</a>';
    return h;
  }

  function renderHome() {
    body.innerHTML = '<div class="rbc-home">' +
      '<div class="rbc-hero"><div class="rbc-face">' + FACE + '</div><span class="rbc-say">Hi! Mình là <b>' + esc(C.name) + '</b><br>Hỏi mình nhé!</span></div>' +
      '<h3>Chào mừng đến ' + esc(C.title) + '!</h3>' +
      '<p>Bấm Chat ngay để được tư vấn dịch vụ, giá và đặt lịch cùng ' + esc(C.name) + ' nhé! Mình luôn sẵn sàng hỗ trợ bạn.</p>' +
      '<button type="button" class="rbc-cta" data-a="start">' + I.msg + 'Chat ngay</button>' +
      '<div class="rbc-or">Hoặc liên hệ trực tiếp với tiệm</div>' +
      '<div class="rbc-contacts">' + contactsHtml('rbc-ct') + '</div>' +
      (C.suggest && C.suggest.length ? '<div class="rbc-quick"><h4>Câu hỏi thường gặp</h4>' + C.suggest.slice(0, 4).map(function (q) { return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + I.arrow + '</button>'; }).join('') + '</div>' : '') +
      '</div>';
  }

  function renderChat() {
    body.innerHTML = '<div class="rbc-chat"><div class="rbc-log" aria-live="polite"></div>' +
      '<div class="rbc-listen" hidden><span class="rbc-wave"><i></i><i></i><i></i><i></i></span><span>Đang nghe… bạn cứ nói câu hỏi</span></div>' +
      '<div class="rbc-sug"></div>' +
      '<form class="rbc-bar"><textarea class="rbc-in" rows="1" maxlength="500" placeholder="Nhập câu hỏi…" aria-label="Nhập câu hỏi"></textarea>' +
      (REC ? '<button type="button" class="rbc-mic" data-a="mic" aria-label="Hỏi bằng giọng nói">' + I.mic + '</button>' : '') +
      '<button type="submit" class="rbc-send" aria-label="Gửi" disabled>' + I.send + '</button></form>' +
      '<div class="rbc-foot">Trợ lý trả lời theo bảng giá chính thức của tiệm</div></div>';
    var input = $('.rbc-in');
    input.addEventListener('input', function () { autosize(); $('.rbc-send').disabled = !input.value.trim(); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); } });
    $('.rbc-bar').addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    renderLog(); renderSug();
  }
  function autosize() { var i = $('.rbc-in'); if (!i) return; i.style.height = 'auto'; i.style.height = Math.min(i.scrollHeight, 110) + 'px'; }

  function msgHtml(m) {
    if (m.role === 'user') return '<div class="rbc-row u"><div class="rbc-b">' + fmt(m.text) + (m.voice ? '<span class="rbc-meta" style="color:#fff;opacity:.75">🎙 hỏi bằng giọng nói</span>' : '') + '</div></div>';
    var h = '<div class="rbc-row b"><span class="rbc-ava">' + FACE + '</span><div class="rbc-b">' + fmt(m.text) + '</div></div>';
    var extra = '';
    (m.services || []).forEach(function (s) {
      extra += '<div class="rbc-card"><div><b>' + esc(s.name) + '</b><small>' + esc(s.price) + ' · ' + esc(s.duration) + '</small></div>' +
        (s.detail ? '<a class="ghost" href="' + esc(s.detail) + '">Chi tiết</a>' : '') + '<a href="' + esc(s.book) + '">Đặt lịch</a></div>';
    });
    var links = (m.links || []).map(function (l) { return '<a href="' + esc(l.url) + '"' + (/^https?:\/\/(www\.)?google\./.test(l.url) ? ' target="_blank" rel="noopener"' : '') + '>' + (/map/i.test(l.url) ? I.pin : /dat-lich/.test(l.url) ? I.cal : I.link) + esc(l.label) + '</a>'; }).join('');
    if (m.contact) links += contactsHtml('');
    if (links) extra += '<div class="rbc-links">' + links + '</div>';
    return h + (extra ? '<div class="rbc-extra">' + extra + '</div>' : '');
  }
  function renderLog() {
    var log = $('.rbc-log'); if (!log) return;
    log.innerHTML = S.msgs.map(msgHtml).join('') + (S.busy ? '<div class="rbc-row b"><span class="rbc-ava">' + FACE + '</span><div class="rbc-b rbc-typing"><i></i><i></i><i></i></div></div>' : '');
    log.scrollTop = log.scrollHeight;
  }
  function renderSug() {
    var box = $('.rbc-sug'); if (!box) return;
    var asked = S.msgs.filter(function (m) { return m.role === 'user'; }).map(function (m) { return m.text; });
    var list = (C.suggest || []).filter(function (q) { return asked.indexOf(q) < 0; });
    if (S.msgs.length > 2) list = ['Đặt lịch như thế nào?'].concat(list).filter(function (q, i, a) { return a.indexOf(q) === i && asked.indexOf(q) < 0; });
    box.hidden = !list.length;
    box.innerHTML = list.slice(0, 6).map(function (q) { return '<button type="button" data-q="' + esc(q) + '">' + esc(q) + '</button>'; }).join('');
  }

  function render() {
    root.classList.toggle('open', S.open);
    $('.rbc-launch').setAttribute('aria-expanded', S.open ? 'true' : 'false');
    $('.rbc-launch').setAttribute('aria-label', S.open ? 'Thu nhỏ khung chat' : 'Mở khung chat tư vấn');
    if (S.view === 'chat') renderChat(); else renderHome();
    paintSpeak();
  }

  /* ---------------- talk to the server ---------------- */
  function greet() { if (!S.msgs.length) S.msgs.push({ role: 'bot', text: C.greeting }); }
  function submit() { var i = $('.rbc-in'); if (!i) return; var t = i.value.trim(); if (!t || S.busy) return; i.value = ''; autosize(); $('.rbc-send').disabled = true; ask(t, false); }
  function ask(text, voice) {
    if (S.view !== 'chat') { S.view = 'chat'; greet(); render(); }
    S.msgs.push({ role: 'user', text: text, voice: !!voice });
    S.busy = true; save(); renderLog(); renderSug();
    var payload = { messages: S.msgs.slice(-10).map(function (m) { return { role: m.role, text: m.text }; }) };
    fetch(C.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r || !r.reply) throw new Error('empty');
        S.msgs.push({ role: 'bot', text: r.reply, services: r.services || [], links: r.links || [], contact: !!r.contact, src: r.source });
        if (S.speak || voice) say(r.reply);
      })
      .catch(function () {
        S.msgs.push({ role: 'bot', text: 'Mạng đang chập chờn nên mình chưa trả lời được. Bạn thử gửi lại, hoặc liên hệ tiệm trực tiếp nhé!', contact: true });
      })
      .then(function () { S.busy = false; save(); renderLog(); renderSug(); var i = $('.rbc-in'); if (i && !voice && window.innerWidth > 480) i.focus(); });
  }

  /* ---------------- voice: speech-to-text ---------------- */
  var REC = window.SpeechRecognition || window.webkitSpeechRecognition;
  var rec = null, recOn = false;
  function micState(on) {
    recOn = on;
    var b = $('.rbc-mic'); if (b) { b.classList.toggle('rec', on); b.setAttribute('aria-label', on ? 'Dừng nghe' : 'Hỏi bằng giọng nói'); }
    var l = $('.rbc-listen'); if (l) l.hidden = !on;
  }
  function toggleMic() {
    if (!REC) return;
    if (recOn && rec) { rec.stop(); return; }
    stopSay();
    rec = new REC();
    rec.lang = 'vi-VN'; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = false;
    var finalText = '';
    rec.onresult = function (e) {
      var t = '';
      for (var k = e.resultIndex; k < e.results.length; k++) { if (e.results[k].isFinal) finalText += e.results[k][0].transcript; else t += e.results[k][0].transcript; }
      var i = $('.rbc-in'); if (i) { i.value = (finalText + t).trim(); autosize(); }
    };
    rec.onerror = function (e) {
      micState(false);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') S.msgs.push({ role: 'bot', text: 'Trình duyệt chưa cho phép dùng micro. Bạn bấm biểu tượng ổ khóa cạnh địa chỉ web → cho phép Micro rồi thử lại nhé.' });
      else if (e.error === 'no-speech') S.msgs.push({ role: 'bot', text: 'Mình chưa nghe thấy gì. Bạn bấm micro và nói lại nhé!' });
      else if (e.error === 'network') S.msgs.push({ role: 'bot', text: 'Nhận giọng nói cần kết nối mạng ổn định. Bạn thử lại hoặc gõ câu hỏi nhé.' });
      save(); renderLog();
    };
    rec.onend = function () {
      micState(false);
      var i = $('.rbc-in'), t = (finalText || (i && i.value) || '').trim();
      if (t) { if (i) { i.value = ''; autosize(); } ask(t, true); }
    };
    try { rec.start(); micState(true); } catch (e) { micState(false); }
  }

  /* ---------------- voice: text-to-speech ---------------- */
  // Ưu tiên: giọng nữ AI của Google (máy chủ, khi tiệm bật Gemini) → giọng nữ có sẵn trên máy → giọng khác (nâng tông).
  var TTS = 'speechSynthesis' in window, voice = null, voiceFemale = false, audio = null, sayId = 0;
  var FEMALE = /HoaiMy|Hoài My|Linh|An ?Nhiên|Mai|Female|nữ|Google/i;
  function pickVoice() {
    if (!TTS) return;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^vi/i.test(v.lang); });
    var f = vs.filter(function (v) { return FEMALE.test(v.name) && !/NamMinh|Nam Minh|\bAn\b(?! ?Nhiên)/i.test(v.name); });
    voice = f[0] || vs[0] || null;
    voiceFemale = !!f[0];
    paintSpeak();
  }
  if (TTS) { pickVoice(); if ('onvoiceschanged' in speechSynthesis) speechSynthesis.addEventListener('voiceschanged', pickVoice); }
  function moneyWords(n) {
    n = parseInt(String(n).replace(/\D/g, ''), 10); if (!n) return '0 đồng';
    var tr = Math.floor(n / 1e6), ng = Math.floor((n % 1e6) / 1000), d = n % 1000, out = [];
    if (tr) out.push(tr + ' triệu'); if (ng) out.push(ng + ' nghìn'); if (d) out.push(d);
    return out.join(' ') + ' đồng';
  }
  var NOTLETTER = '(?![A-Za-zÀ-ỹà-ỹĐđ])';
  function speakable(t) {
    return String(t)
      .replace(/https?:\/\/\S+/g, '')
      .replace(new RegExp('(\\d{1,3}(?:[.,]\\d{3})+|\\d+)\\s*(?:đồng|đ|vnđ|vnd)' + NOTLETTER, 'gi'), function (_, n) { return moneyWords(n); })
      .replace(new RegExp('(\\d+)\\s?k' + NOTLETTER, 'gi'), function (_, n) { return moneyWords(n * 1000); })
      .replace(/\b(\d{1,3}(?:\.\d{3})+)\b/g, function (x) { return x.replace(/\./g, ''); })
      .replace(/\b(\d{1,2}):(\d{2})\b/g, function (_, h, m) { return +h + ' giờ' + (+m ? ' ' + +m : ''); })
      .replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/g, function (_, d, m, y) { return 'ngày ' + +d + ' tháng ' + +m + (y ? ' năm ' + y : ''); })
      .replace(/[*_#>`"]/g, '').replace(/^\s*[-•]\s+/gm, '').replace(/\s*[–—]\s*/g, ' đến ').replace(/\n+/g, '. ').replace(/\.\s*\./g, '.');
  }
  function sayDevice(text) {
    if (!TTS || !voice) return;
    try {
      speechSynthesis.cancel();
      (text.match(/[^.!?]+[.!?]*/g) || []).filter(function (x) { return x.trim(); }).forEach(function (part) {
        var u = new SpeechSynthesisUtterance(part); u.voice = voice; u.lang = voice.lang;
        u.rate = 1.02; u.pitch = voiceFemale ? 1.05 : 1.35; // máy chỉ có giọng nam → nâng tông cho nhẹ hơn
        speechSynthesis.speak(u);
      });
    } catch (e) {}
  }
  function say(raw) {
    var text = speakable(raw), id = ++sayId;
    stopSay(true);
    if (!+C.tts) { sayDevice(text); return; }
    fetch(C.ttsApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text }) })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (id !== sayId) return;
        if (!r || !r.ok || !r.url) throw new Error('tts');
        audio = new Audio(r.url);
        return audio.play();
      })
      .catch(function () { if (id === sayId) sayDevice(text); });
  }
  function stopSay(keepId) {
    if (!keepId) sayId++;
    if (audio) { try { audio.pause(); } catch (e) {} audio = null; }
    if (TTS) try { speechSynthesis.cancel(); } catch (e) {}
  }
  function paintSpeak() {
    var b = $('[data-a="speak"]'); if (!b) return;
    b.hidden = !(((TTS && voice) || +C.tts) && +C.voice);
    b.classList.toggle('on', S.speak);
    b.innerHTML = S.speak ? I.vol : I.voloff;
    b.setAttribute('aria-label', S.speak ? 'Tắt đọc câu trả lời' : 'Bật đọc câu trả lời');
    b.title = b.getAttribute('aria-label');
  }
  if (!+C.voice) REC = null;

  /* ---------------- events ---------------- */
  function openPanel(v) {
    S.open = v; S.seen = true; root.classList.add('seen');
    var t = document.querySelector('.rbc-tease'); if (t) t.remove();
    if (!v) { stopSay(); if (rec && recOn) rec.stop(); }
    save(); render();
    if (v && S.view === 'chat') setTimeout(function () { var i = $('.rbc-in'); if (i && window.innerWidth > 480) i.focus(); }, 250);
  }
  $('.rbc-launch').addEventListener('click', function () { openPanel(!S.open); });
  root.addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]');
    if (q) { ask(q.getAttribute('data-q'), false); return; }
    var a = e.target.closest('[data-a]'); if (!a) { var m0 = $('.rbc-menu'); if (m0 && !e.target.closest('.rbc-menu')) m0.remove(); return; }
    var act = a.getAttribute('data-a');
    var menu = $('.rbc-menu'); if (menu && act !== 'menu') menu.remove();
    if (act === 'close') openPanel(false);
    else if (act === 'start') { S.view = 'chat'; greet(); save(); render(); var i = $('.rbc-in'); if (i && window.innerWidth > 480) i.focus(); }
    else if (act === 'speak') { S.speak = !S.speak; if (!S.speak) stopSay(); else say('Đã bật đọc câu trả lời.'); save(); paintSpeak(); }
    else if (act === 'mic') toggleMic();
    else if (act === 'menu') {
      if (menu) { menu.remove(); return; }
      var m = document.createElement('div'); m.className = 'rbc-menu';
      m.innerHTML = '<button type="button" data-a="restart">' + I.refresh + 'Bắt đầu cuộc trò chuyện mới</button>' +
        '<a href="' + esc(C.booking) + '">' + I.cal + 'Đến trang đặt lịch</a>' +
        (tel ? '<a href="tel:' + esc(tel) + '">' + I.phone + 'Gọi tiệm ' + esc(C.phone) + '</a>' : '') +
        (S.view === 'chat' ? '<button type="button" data-a="home">' + I.msg + 'Về màn hình chào</button>' : '');
      panel.appendChild(m);
    }
    else if (act === 'restart') { stopSay(); S.msgs = []; S.view = 'chat'; greet(); save(); render(); }
    else if (act === 'home') { S.view = 'home'; save(); render(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.open) openPanel(false); });

  // Lời mời nhỏ cạnh nút chat (1 lần mỗi phiên).
  if (!S.tease && !S.seen) {
    setTimeout(function () {
      if (S.open || S.seen) return;
      var t = document.createElement('div'); t.className = 'rbc-tease'; t.setAttribute('role', 'status');
      t.innerHTML = 'Chào bạn 👋 <b>' + esc(C.name) + '</b> có thể tư vấn giá & giúp bạn đặt lịch!<button type="button" aria-label="Đóng">×</button>';
      t.addEventListener('click', function (e) { if (e.target.tagName === 'BUTTON') { t.remove(); S.tease = true; save(); return; } openPanel(true); });
      root.appendChild(t); S.tease = true; save();
      setTimeout(function () { if (t.parentNode) t.remove(); }, 12000);
    }, 4000);
  }

  render();
})();
