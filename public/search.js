/* Site search: loads /search-index.json once, matches in the browser. No server, no tracking. */
(function () {
  var idx = null, loading = null;
  function load() {
    if (idx) return Promise.resolve(idx);
    if (!loading) loading = fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (d) {
      d.forEach(function (r) { r._n = norm(r.t + ' ' + r.s + ' ' + r.x) + ' ' + r.k; r._t = norm(r.t); });
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
    if (!toks.length) toks = String(q).toLowerCase().replace(/[.\s]+/g, ' ').trim().split(' ').filter(Boolean);
    if (!toks.length || !idx) return [];
    var res = [], ql = String(q).toLowerCase();
    idx.forEach(function (r) {
      var score = ql.indexOf(r.k) >= 0 ? 5 : 0;
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

  /* full-screen search layer: tapping the homepage search box opens it, results show there, closing returns to the page */
  function attach(hero) {
    var layer = document.createElement('div'); layer.className = 'sx'; layer.hidden = true;
    layer.innerHTML = '<div class="sx-bar"><div class="sx-field"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><input class="sx-in" type="search" autocomplete="off" enterkeyhint="search" placeholder="' + esc(hero.placeholder || '') + '" aria-label="খুঁজুন"></div><button type="button" class="sx-x">বাতিল</button></div><div class="sx-res" role="listbox"></div>';
    document.body.appendChild(layer);
    var inp = layer.querySelector('.sx-in'), res = layer.querySelector('.sx-res'), cur = -1;
    function items() { return [].slice.call(res.querySelectorAll('.sr-row')); }
    function mark() { items().forEach(function (a, i) { a.classList.toggle('on', i === cur); }); }
    function hint() { res.innerHTML = '<p class="sx-hint">ডাক্তার, হাসপাতাল, বিশ্ববিদ্যালয়, হোটেল বা জায়গার নাম লিখুন।</p>'; }
    function render() {
      var q = inp.value.trim();
      if (!q) { hint(); return; }
      load().then(function () {
        if (inp.value.trim() !== q) return;
        var r = search(q, 20);
        res.innerHTML = r.length ? r.map(row).join('') : '<p class="sx-hint">"' + esc(q) + '" নামে কিছু পাওয়া যায়নি। অন্য শব্দে চেষ্টা করুন, যেমন ডাক্তারের নাম, বিশেষজ্ঞ বিভাগ বা জেলা।</p>';
        cur = -1; res.scrollTop = 0;
      });
    }
    function open() {
      load(); layer.hidden = false; document.documentElement.classList.add('sx-lock');
      inp.value = hero.value; hero.blur(); inp.focus(); render();
    }
    function close() {
      layer.hidden = true; document.documentElement.classList.remove('sx-lock'); inp.blur(); hero.value = '';
    }
    hero.addEventListener('focus', open);
    hero.addEventListener('click', open);
    var btn = hero.closest('.search-box') && hero.closest('.search-box').querySelector('.search-btn');
    if (btn) btn.addEventListener('click', open);
    layer.querySelector('.sx-x').addEventListener('click', close);
    inp.addEventListener('input', render);
    inp.addEventListener('keydown', function (e) {
      var it = items();
      if (e.key === 'ArrowDown' && it.length) { e.preventDefault(); cur = (cur + 1) % it.length; mark(); it[cur].scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp' && it.length) { e.preventDefault(); cur = (cur - 1 + it.length) % it.length; mark(); it[cur].scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter') { e.preventDefault(); if (cur >= 0 && it[cur]) location.href = it[cur].getAttribute('href'); else inp.blur(); }
      else if (e.key === 'Escape') close();
    });
    layer.addEventListener('click', function (e) { if (e.target === layer) close(); });
    window.addEventListener('pageshow', function () { if (!layer.hidden) close(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var hero = document.getElementById('heroSearch'); if (hero) attach(hero);
  });
})();
