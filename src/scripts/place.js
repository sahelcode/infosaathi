/* ===== famous place page ===== */
(function(){
  const BN='০১২৩৪৫৬৭৮৯', bn=s=>String(s).replace(/\d/g,d=>BN.charAt(d));

  /* gallery: each bar runs its slide; when a bar ends, the next slide fades in */
  const g=document.querySelector('[data-gal]');
  const one=g&&g.querySelectorAll('.pl-slide').length<2;
  if(one){ const s=g.querySelector('.pl-slide'); if(s) s.classList.add('on','live'); }
  if(g&&!one){
    const slides=Array.from(g.querySelectorAll('.pl-slide')), bars=Array.from(g.querySelectorAll('.pl-bars span'));
    const thumbs=Array.from(document.querySelectorAll('[data-go]')), count=g.querySelector('[data-count]');
    const still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(still) g.classList.add('static');
    let cur=0, holds=0;
    const hold=on=>{ holds=Math.max(0,holds+(on?1:-1)); g.classList.toggle('paused',holds>0); };

    function show(i){
      const prev=slides[cur];
      cur=(i+slides.length)%slides.length;
      const next=slides[cur];
      slides.forEach((s,k)=>{ s.classList.toggle('on',k===cur); s.setAttribute('aria-hidden',k===cur?'false':'true'); });
      /* the old slide keeps zooming while it fades out, so it never jumps */
      next.classList.remove('live'); void next.offsetWidth; next.classList.add('live');
      if(prev!==next) setTimeout(()=>{ if(!prev.classList.contains('on')) prev.classList.remove('live'); },950);
      bars.forEach((b,k)=>{ b.classList.remove('on'); b.classList.toggle('done',k<cur); });
      void bars[cur].offsetWidth; bars[cur].classList.add('on');
      thumbs.forEach((t,k)=>{ t.classList.toggle('on',k===cur); t.setAttribute('aria-current',k===cur?'true':'false'); });
      if(count) count.textContent=bn(cur+1)+' / '+bn(slides.length);
    }
    bars.forEach(b=>b.addEventListener('animationend',()=>{ if(!still&&b.classList.contains('on')) show(cur+1); }));
    g.querySelector('.pl-nav.prev').addEventListener('click',()=>show(cur-1));
    g.querySelector('.pl-nav.next').addEventListener('click',()=>show(cur+1));
    thumbs.forEach(t=>t.addEventListener('click',()=>show(+t.dataset.go)));
    g.addEventListener('keydown',e=>{ if(e.key==='ArrowRight') show(cur+1); else if(e.key==='ArrowLeft') show(cur-1); });

    /* pause while hovered, held, off screen, or the tab is hidden */
    g.addEventListener('mouseenter',()=>hold(true)); g.addEventListener('mouseleave',()=>hold(false));
    let x0=null, held=false;
    g.addEventListener('pointerdown',e=>{ if(e.pointerType==='mouse') return; x0=e.clientX; held=true; hold(true); });
    const end=e=>{
      if(!held) return; held=false; hold(false);
      if(e.type==='pointerup'&&x0!==null){ const dx=e.clientX-x0; if(Math.abs(dx)>40) show(dx<0?cur+1:cur-1); }
      x0=null;
    };
    g.addEventListener('pointerup',end); g.addEventListener('pointercancel',end);
    let offscreen=false;
    if('IntersectionObserver' in window) new IntersectionObserver(es=>{ const o=!es[0].isIntersecting; if(o!==offscreen){ offscreen=o; hold(o); } }).observe(g);
    let hidden=false;
    document.addEventListener('visibilitychange',()=>{ if(document.hidden!==hidden){ hidden=document.hidden; hold(hidden); } });
    show(0);
  }

  /* best-time strip: mark this month (Bangladesh time) */
  const months=document.querySelector('.pl-months');
  if(months){
    let m=new Date().getMonth();
    try{ m=+new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',month:'numeric'}).format(new Date())-1; }catch(_){}
    const li=months.children[m]; if(li){ li.classList.add('now'); li.setAttribute('aria-current','date'); }
  }
})();
