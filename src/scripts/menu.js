/* ===== v17: menu ===== */
(function(){
  const b=document.body, btn=document.getElementById('menuBtn'), ov=document.getElementById('drawerOverlay'), dr=document.getElementById('drawer');
  if(!btn||!dr) return;
  const isOpen=()=>b.classList.contains('menu-open');
  const set=o=>{b.classList.toggle('menu-open',o);btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'মেনু বন্ধ করুন':'মেনু');dr.setAttribute('aria-hidden',!o);};
  btn.addEventListener('click',()=>set(!isOpen()));
  ov.addEventListener('click',()=>set(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())set(false);});

  /* menu links: close first, then glide to the section with its heading visible under the sticky bar */
  dr.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    set(false);
    if(!t) return;
    e.preventDefault();
    const sec=t.closest('section')||t, bar=document.querySelector('.navbar');
    const y=sec.getBoundingClientRect().top+window.scrollY-(bar?bar.offsetHeight:0)-14;
    setTimeout(()=>window.scrollTo({top:y,behavior:'smooth'}),180);
  }));

  /* swipe right to close */
  let x0=null, dx=0;
  dr.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;dx=0;},{passive:true});
  dr.addEventListener('touchmove',e=>{
    if(x0===null) return;
    dx=Math.max(0,e.touches[0].clientX-x0);
    if(dx>6){dr.classList.add('dragging');dr.style.transform='translate3d('+dx+'px,0,0)';}
  },{passive:true});
  dr.addEventListener('touchend',()=>{
    if(x0===null) return;
    dr.classList.remove('dragging');dr.style.transform='';
    if(dx>70) set(false);
    x0=null;dx=0;
  });
})();

