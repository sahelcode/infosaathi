/* Site search: loads /search-index.json once, matches in the browser. No server, no tracking. */
(function () {
  var idx = null, loading = null;
  function load() {
    if (idx) return Promise.resolve(idx);
    if (!loading) loading = fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (d) {
      d.forEach(function (r) { r._n = norm(r.t + ' ' + r.s + ' ' + r.x); r._t = norm(r.t); });
      idx = d; return d;
    });
    return loading;
  }
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFC')
      .replace(/[.,;:!?()'"‘’“”।\-\/]/g, ' ')
      .replace(/(^|\s)(ডা|ডাঃ|ডাক্তার|অধ্যাপক|প্রফেসর|প্রফ|dr|prof|professor)(?=\s|$)/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function search(q, limit) {
    var toks = norm(q).split(' ').filter(Boolean);
    if (!toks.length || !idx) return [];
    var res = [];
    idx.forEach(function (r) {
      var score = 0;
      for (var i = 0; i < toks.length; i++) {
        var p = r._n.indexOf(toks[i]);
        if (p < 0) return;
        score += r._t.indexOf(toks[i]) === 0 ? 3 : r._t.indexOf(toks[i]) > 0 ? 2 : 1;
      }
      res.push([score, r]);
    });
    res.sort(function (a, b) { return b[0] - a[0]; });
    return res.slice(0, limit || 50).map(function (x) { return x[1]; });
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function row(r) { return '<a class="sr-row" href="' + esc(r.u) + '"><span class="sr-k">' + esc(r.k) + '</span><span class="sr-t"><b>' + esc(r.t) + '</b><small>' + esc(r.s) + '</small></span></a>'; }

  /* dropdown under an input */
  function attach(input) {
    var box = input.closest('.search-box') || input.parentNode;
    box.style.position = 'relative';
    var panel = document.createElement('div'); panel.className = 'sr-panel'; panel.hidden = true; box.appendChild(panel);
    var cur = -1;
    function items() { return [].slice.call(panel.querySelectorAll('.sr-row')); }
    function mark() { items().forEach(function (a, i) { a.classList.toggle('on', i === cur); }); }
    function render() {
      var q = input.value.trim();
      if (!q) { panel.hidden = true; return; }
      load().then(function () {
        if (input.value.trim() !== q) return;
        var r = search(q, 7);
        panel.innerHTML = r.length ? r.map(row).join('') + '<a class="sr-all" href="/search/?q=' + encodeURIComponent(q) + '">সব ফলাফল দেখুন</a>'
          : '<p class="sr-none">"' + esc(q) + '" নামে কিছু পাওয়া যায়নি। অন্য শব্দে চেষ্টা করুন।</p>';
        panel.hidden = false; cur = -1;
      });
    }
    input.addEventListener('focus', function () { load(); });
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      var it = items();
      if (e.key === 'ArrowDown' && it.length) { e.preventDefault(); cur = (cur + 1) % it.length; mark(); }
      else if (e.key === 'ArrowUp' && it.length) { e.preventDefault(); cur = (cur - 1 + it.length) % it.length; mark(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (cur >= 0 && it[cur]) location.href = it[cur].getAttribute('href'); else if (input.value.trim()) location.href = '/search/?q=' + encodeURIComponent(input.value.trim()); }
      else if (e.key === 'Escape') { panel.hidden = true; }
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) panel.hidden = true; });
    var btn = box.querySelector('.search-btn');
    if (btn) btn.addEventListener('click', function () { if (input.value.trim()) location.href = '/search/?q=' + encodeURIComponent(input.value.trim()); else input.focus(); });
  }

  /* full results page */
  function resultsPage() {
    var list = document.getElementById('srList'); if (!list) return;
    var input = document.getElementById('srQ');
    var q = new URLSearchParams(location.search).get('q') || '';
    input.value = q;
    function show() {
      var v = input.value.trim();
      if (!v) { list.innerHTML = '<p class="sr-none">ডাক্তার, হাসপাতাল, বিশ্ববিদ্যালয় বা জায়গার নাম লিখুন।</p>'; return; }
      load().then(function () {
        var r = search(v, 60);
        list.innerHTML = r.length ? '<p class="sr-count">' + r.length + 'টি ফলাফল</p>' + r.map(row).join('') : '<p class="sr-none">"' + esc(v) + '" নামে কিছু পাওয়া যায়নি। অন্য শব্দে চেষ্টা করুন, যেমন ডাক্তারের নাম, বিশেষজ্ঞ বিভাগ বা জেলা।</p>';
      });
    }
    input.addEventListener('input', function () { history.replaceState(null, '', '/search/?q=' + encodeURIComponent(input.value.trim())); show(); });
    show();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var hero = document.getElementById('heroSearch'); if (hero) attach(hero);
    resultsPage();
  });
})();
