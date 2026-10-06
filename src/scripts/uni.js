/* ===== university page ===== */
(function(){
  const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
  const BN='০১২৩৪৫৬৭৮৯', bn=s=>String(s).replace(/\d/g,d=>BN.charAt(d));

  /* admission window, counted in Bangladesh dates */
  let ymd=new Date().toISOString().slice(0,10);
  try{ const p={}; new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(x=>{p[x.type]=x.value;}); ymd=p.year+'-'+p.month+'-'+p.day; }catch(_){}
  const days=(a,b)=>Math.round((Date.parse(b)-Date.parse(a))/864e5);
  const box=$('.un-adm');
  if(box){
    const open=box.dataset.open||'', close=box.dataset.close||'9999-12-31', left=$('[data-adm-left]',box), fill=$('[data-adm-fill]',box);
    let state, text, pct;
    if(!box.dataset.open&&box.dataset.close&&ymd<=close){ const d=days(ymd,close); state=['soon','শেষ তারিখ ঘোষিত']; text=d===0?'আজই আবেদনের শেষ দিন':'আবেদনের শেষ তারিখ আর '+bn(d)+' দিন পর'; pct=0; }
    else if(ymd<open){ state=['soon','শীঘ্রই শুরু']; text='আবেদন শুরু হবে আর '+bn(days(ymd,open))+' দিন পর'; pct=0; }
    else if(ymd<=close){ const d=days(ymd,close); state=['open','আবেদন চলছে']; text=d===0?'আজই আবেদনের শেষ দিন':'আবেদনের আর '+bn(d)+' দিন বাকি'; pct=Math.max(4,Math.min(100,days(open,ymd)/Math.max(1,days(open,close))*100)); }
    else { state=['closed','আবেদন শেষ']; text='এই সেশনের আবেদন শেষ হয়েছে'; pct=100; box.classList.add('closed'); }
    if(left) left.textContent=text;
    if(fill) requestAnimationFrame(()=>{ fill.style.width=pct+'%'; });
    $$('[data-adm-status]').forEach(el=>{ el.textContent=state[1]; el.classList.add(state[0]); el.hidden=false; });
  }

  /* programmes: faculty chips + search together */
  const q=$('[data-prog-q]'), chips=$$('[data-pfac]'), rows=$$('.un-prog'), empty=$('[data-prog-empty]'), list=$('.un-progs');
  let fac='all';
  const run=()=>{
    const term=(q&&q.value||'').trim().toLowerCase(); let shown=0, first=true;
    rows.forEach(r=>{ const ok=(fac==='all'||r.dataset.fac===fac)&&(!term||r.dataset.q.indexOf(term)>-1);
      r.hidden=!ok; r.classList.toggle('is-first',ok&&first); if(ok){ shown++; first=false; } });
    if(empty) empty.hidden=shown>0; if(list) list.hidden=shown===0;
  };
  chips.forEach(c=>c.addEventListener('click',()=>{ chips.forEach(x=>x.classList.toggle('on',x===c)); fac=c.dataset.pfac; run(); }));
  if(q) q.addEventListener('input',run);
})();
