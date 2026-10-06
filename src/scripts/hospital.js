/* ===== hospital page ===== */
(function(){
  const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));

  /* doctors: filter by specialty */
  const docChips=$$('[data-spec]');
  docChips.forEach(c=>c.addEventListener('click',()=>{
    docChips.forEach(x=>x.classList.toggle('on',x===c));
    const k=c.dataset.spec;
    $$('.hp-doc').forEach(d=>{ d.hidden=!(k==='all'||d.dataset.sp===k); });
  }));

  /* test fees: category tabs + search box, both at once */
  const q=$('[data-fee-q]'), tabs=$$('[data-feetab]'), rows=$$('.hp-fee'), empty=$('[data-fee-empty]');
  let cat='all';
  const run=()=>{
    const term=(q&&q.value||'').trim().toLowerCase(); let shown=0, first=true;
    rows.forEach(r=>{
      const ok=(cat==='all'||r.dataset.cat===cat)&&(!term||r.dataset.q.indexOf(term)>-1);
      r.hidden=!ok; r.classList.toggle('is-first',ok&&first); if(ok){ shown++; first=false; }
    });
    if(empty) empty.hidden=shown>0;
    const list=$('.hp-fees'); if(list) list.hidden=shown===0;
  };
  tabs.forEach(t=>t.addEventListener('click',()=>{ tabs.forEach(x=>x.classList.toggle('on',x===t)); cat=t.dataset.feetab; run(); }));
  if(q) q.addEventListener('input',run);

  /* rating bars grow when they come into view */
  const rt=$('.hp-rating');
  if(rt&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>{ if(es[0].isIntersecting){ rt.classList.add('anim'); io.disconnect(); } },{threshold:.3}); io.observe(rt);
  }

  /* review button: no backend yet */
  const rv=$('[data-review]'), toastEl=$('.pf-toast');
  if(rv) rv.addEventListener('click',()=>{ if(!toastEl) return; toastEl.textContent='মতামত দেওয়ার সুবিধা শীঘ্রই আসছে'; toastEl.hidden=false; setTimeout(()=>{toastEl.hidden=true;},2200); });
})();
