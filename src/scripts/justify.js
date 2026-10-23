// Long text (over 200 characters) is justified; short text stays left aligned.
document.querySelectorAll('p, .pf-text, li, dd').forEach((el) => {
  if (el.closest('header, nav, footer, button, a, .pf-toast, [role="dialog"]')) return;
  if (el.querySelector('p, li, div')) return;
  if ((el.textContent || '').trim().length > 200) {
    el.style.textAlign = 'justify';
    el.style.textJustify = 'inter-word';
  }
});
