/* Custom dropdown on top of native selects (.bo-sel > select): same values and change events, nicer panel. */
function init() {
  var boxes = [].slice.call(document.querySelectorAll('.bo-sel'));
  function close(except) { boxes.forEach(function (b) { if (b !== except) { b.classList.remove('open'); var bt = b.querySelector('.bo-btn'); if (bt) bt.setAttribute('aria-expanded', 'false'); } }); }
  boxes.forEach(function (box) {
    var sel = box.querySelector('select'); if (!sel || box.classList.contains('enh')) return;
    box.classList.add('enh');
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bo-btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    var panel = document.createElement('div'); panel.className = 'bo-panel'; panel.setAttribute('role', 'listbox');
    box.appendChild(btn); box.appendChild(panel);
    function sync() {
      btn.textContent = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : '';
      btn.disabled = sel.disabled;
    }
    function build() {
      panel.innerHTML = '';
      [].slice.call(sel.options).forEach(function (o, i) {
        var it = document.createElement('button'); it.type = 'button'; it.setAttribute('role', 'option');
        it.className = 'bo-opt' + (i === sel.selectedIndex ? ' on' : ''); it.textContent = o.textContent;
        it.addEventListener('click', function () { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); sync(); box.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); });
        panel.appendChild(it);
      });
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation(); if (sel.disabled) return;
      var open = !box.classList.contains('open'); close(box);
      if (open) { build(); box.classList.add('open'); var on = panel.querySelector('.on'); if (on) panel.scrollTop = on.offsetTop - 8; }
      else box.classList.remove('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    sel.addEventListener('change', sync);
    new MutationObserver(sync).observe(sel, { attributes: true, attributeFilter: ['disabled'] });
    sync();
  });
  document.addEventListener('click', function () { close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
}
init();
