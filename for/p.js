// Visit counter for the diagnostic pages: no cookies, no IP stored.
// Sends one record per visit to n8n, which writes the Engagement tab of the prospects sheet.
(function () {
  var EP = 'https://n8n.srv1665995.hstgr.cloud/webhook/qanat-track-7h3k';
  var slug = location.pathname.split('/').filter(Boolean).pop() || '';
  var q = new URLSearchParams(location.search);
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  if (q.get('me') === '1') store('qanat-me', '1');
  if (q.get('me') === '0') store('qanat-me', '0');
  if (store('qanat-me') === '1' || navigator.webdriver || location.protocol === 'file:' || /localhost|127\.0\.0\.1/.test(location.hostname)) return;

  var ref = document.referrer && !/qanatstudio\.com/.test(document.referrer) ? 'ref' : '';
  var src = /^(wa|li)$/.test(q.get('s') || '') ? q.get('s') : (ref || 'em');
  var vid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  var seenKey = 'qanat-seen-' + slug;
  var returning = store(seenKey) ? 1 : 0;
  var st = { sec: {}, act: {}, t: 0, start: Date.now(), opened: false, hot: false };
  var last = Date.now();

  function send(ev) {
    var b = new URLSearchParams({
      e: ev, v: vid, p: slug, s: src,
      d: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      r: String(returning), st: String(st.start), t: String(Math.round(st.t)),
      sec: Object.keys(st.sec).join(' '), a: Object.keys(st.act).join(' ')
    });
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon(EP, b))) fetch(EP, { method: 'POST', body: b, mode: 'no-cors', keepalive: true });
    } catch (e) {}
  }
  function tick() {
    var n = Date.now();
    if (document.visibilityState === 'visible') st.t += Math.min(n - last, 30000) / 1000;
    last = n;
  }
  setInterval(function () {
    tick();
    if (!st.opened && st.t >= 3) {
      st.opened = true;
      send(returning ? 'return' : 'first_open');
      store(seenKey, '1');
    }
    if (st.opened && !st.hot && st.t >= 120) { st.hot = true; send('hot'); }
  }, 1000);
  document.addEventListener('visibilitychange', function () {
    tick();
    if (document.visibilityState === 'hidden' && st.opened) send('update');
  });
  window.addEventListener('pagehide', function () { tick(); if (st.opened) send('update'); });

  var SEC = { today: '01', 'new': '02', wa: '03', report: '04', plan: '05', worth: '06', talk: 'cta' };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        var code = SEC[x.target.id];
        if (x.isIntersecting && code && !st.sec[code]) {
          st.sec[code] = 1;
          if (st.opened) send('update');
        }
      });
    }, { threshold: 0.2 });
    Object.keys(SEC).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  function act(name, hot) {
    if (st.act[name] && !hot) return;
    st.act[name] = 1;
    send(hot ? 'action' : 'update');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a,button') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (a.hasAttribute('data-book')) act('book', true);
    else if (/wa\.me|whatsapp/i.test(href)) act('whatsapp', true);
    else if (/^mailto:/.test(href)) act('email', true);
    else if (a.closest('.site, .m-site, [data-widget]')) act('mockup');
  }, true);
  document.addEventListener('input', function (e) {
    if (e.target.closest && e.target.closest('.inputs')) act('calculator');
  }, true);
})();
