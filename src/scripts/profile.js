/* ===== doctor profile v2 ===== */
(function(){
  const $=(s,r)=>(r||document).querySelector(s), $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
  const toastEl=$('.pf-toast'); let tt=0;
  const toast=msg=>{ if(!toastEl) return; toastEl.textContent=msg; toastEl.hidden=false; toastEl.style.animation='none'; void toastEl.offsetWidth; toastEl.style.animation=''; clearTimeout(tt); tt=setTimeout(()=>{toastEl.hidden=true;},2200); };
  const BN='০১২৩৪৫৬৭৮৯', bn=s=>String(s).replace(/\d/g,d=>BN.charAt(d));
  const DAYN=['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];

  /* ---- Bangladesh time (whatever the visitor's own clock zone is) ---- */
  let day=new Date().getDay(), mins=new Date().getHours()*60+new Date().getMinutes(), ymd=new Date().toISOString().slice(0,10);
  try{
    const p={}; new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Dhaka',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit'})
      .formatToParts(new Date()).forEach(x=>{p[x.type]=x.value;});
    day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday); mins=Number(p.hour)*60+Number(p.minute); ymd=p.year+'-'+p.month+'-'+p.day;
  }catch(_){}
  const toMin=t=>{ const a=t.split(':'); return Number(a[0])*60+Number(a[1]); };
  const startWord=t=>{ const h=Math.floor(toMin(t)/60), w=h<12?'সকাল':h<15?'দুপুর':h<18?'বিকাল':h<20?'সন্ধ্যা':'রাত'; return w+' '+bn(h%12||12)+'টায় শুরু'; };

  /* ---- notice: hide once over; on the notice days the doctor is away ---- */
  let away=false;
  const notice=$('.pf-notice');
  if(notice){ const from=notice.dataset.from||'0000', until=notice.dataset.until||'9999';
    if(ymd>until) notice.remove(); else if(ymd>=from) away=true; }

  /* ---- today ---- */
  $$('[data-today-name]').forEach(el=>el.textContent='('+DAYN.at(day)+')');
  $$('.pf-day[data-d="'+day+'"]').forEach(el=>el.classList.add('is-today'));
  const list=$('[data-today-list]'); let sessions=0;
  $$('.pf-chamber').forEach(ch=>{
    const days=(ch.dataset.days||'').split(',').map(Number);
    if(away||days.indexOf(day)<0) return;
    sessions++;
    const s=toMin(ch.dataset.start), e=toMin(ch.dataset.end);
    const st=mins<s?['soon',startWord(ch.dataset.start)]:mins<e?['now','এখন রোগী দেখছেন']:['done','আজকের সময় শেষ'];
    const live=$('[data-live]',ch); if(live){ live.textContent=st[1]; live.classList.add(st[0]); live.hidden=false; }
    if(list){
      const name=$('.pf-ch-txt b',ch).firstChild.textContent, time=$('.pf-v',ch).textContent.replace(st[1],'').trim();
      const row=document.createElement('a'); row.className='pf-ts'; row.href='#'+(ch.id||'chambers');
      row.innerHTML='<span class="pf-ts-txt"><b></b><span></span></span><span class="pf-live '+st[0]+'"></span>';
      row.querySelector('b').textContent=name; row.querySelector('.pf-ts-txt span').textContent=time; row.querySelector('.pf-live').textContent=st[1];
      list.appendChild(row);
    }
  });
  if(list&&!sessions){ const p=document.createElement('p'); p.className='pf-today-empty'; p.textContent=away?'আজ ছুটিতে আছেন, কোনো চেম্বারে বসবেন না':'আজ '+DAYN.at(day)+' কোনো চেম্বারে বসেন না'; list.appendChild(p); }
  $$('[data-today]').forEach(el=>{ el.textContent=away?'আজ ছুটিতে':sessions?'আজ রোগী দেখবেন':'আজ বন্ধ'; el.classList.add(sessions?'open':'closed'); el.hidden=false; });

  /* ---- copy a phone number ---- */
  const CHECKSVG='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const writeText=async t=>{
    try{ await navigator.clipboard.writeText(t); return true; }
    catch(_){ const a=document.createElement('textarea'); a.value=t; a.setAttribute('readonly',''); a.style.position='fixed'; a.style.opacity='0'; document.body.appendChild(a); a.select(); let ok=false; try{ ok=document.execCommand('copy'); }catch(e){} a.remove(); return ok; }
  };
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-copy-num]'); if(!b) return;
    const ok=await writeText(b.dataset.copyNum);
    if(!ok){ toast('কপি হয়নি, নম্বরটি চেপে ধরে কপি করুন'); return; }
    if(!b.dataset.icon) b.dataset.icon=b.innerHTML;
    b.innerHTML=CHECKSVG; b.classList.add('done'); toast(b.dataset.copyMsg||('নম্বর কপি হয়েছে: '+bn(b.dataset.copyNum)));
    clearTimeout(b._t); b._t=setTimeout(()=>{ b.innerHTML=b.dataset.icon; b.classList.remove('done'); },1600);
  });

  /* ---- bottom sheets (serial numbers, share) ---- */
  let lastFocus=null;
  const openSheet=name=>{ const sh=$('[data-sheet="'+name+'"]'); if(!sh) return; lastFocus=document.activeElement; sh.hidden=false; document.body.classList.add('pf-locked');
    requestAnimationFrame(()=>requestAnimationFrame(()=>sh.classList.add('open'))); const x=$('.pf-sheet-x',sh); if(x) x.focus({preventScroll:true}); };
  const closeSheets=()=>{ $$('[data-sheet].open').forEach(sh=>{ sh.classList.remove('open'); setTimeout(()=>{ if(!sh.classList.contains('open')) sh.hidden=true; },330); });
    document.body.classList.remove('pf-locked'); if(lastFocus) lastFocus.focus({preventScroll:true}); };
  $$('[data-sheet-open]').forEach(b=>b.addEventListener('click',()=>openSheet(b.dataset.sheetOpen)));
  $$('[data-sheet-close]').forEach(b=>b.addEventListener('click',closeSheets));

  /* ---- banner zoom ---- */
  const zb=$('[data-zoombox]'), zi=$('[data-zoom-img]');
  const openZoom=src=>{ if(!zb) return; zi.src=src; zb.hidden=false; document.body.classList.add('pf-locked'); requestAnimationFrame(()=>requestAnimationFrame(()=>zb.classList.add('open'))); };
  const closeZoom=()=>{ if(!zb||zb.hidden) return; zb.classList.remove('open'); document.body.classList.remove('pf-locked'); setTimeout(()=>{ if(!zb.classList.contains('open')) zb.hidden=true; },220); };
  $$('[data-zoom]').forEach(b=>b.addEventListener('click',()=>openZoom($('img',b).src)));
  if(zb) zb.addEventListener('click',e=>{ if(e.target===zb||e.target.closest('[data-zoom-close]')) closeZoom(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeSheets(); closeZoom(); } });

  /* ---- share: the phone's own share menu when it has one, otherwise our sheet ---- */
  const url=location.href.split('#')[0], title=document.title, U=encodeURIComponent(url), T=encodeURIComponent(title), TU=encodeURIComponent(title+'\n'+url);
  const links={wa:'https://wa.me/?text='+TU, fb:'https://www.facebook.com/sharer/sharer.php?u='+U, ms:'fb-messenger://share/?link='+U,
    tg:'https://t.me/share/url?url='+U+'&text='+T, x:'https://twitter.com/intent/tweet?url='+U+'&text='+T, sms:'sms:?&body='+TU, mail:'mailto:?subject='+T+'&body='+TU};
  $$('[data-wa]').forEach(a=>a.href=links.wa); $$('[data-fb]').forEach(a=>a.href=links.fb);
  $$('[data-to]').forEach(a=>{ a.href=links[a.dataset.to]; a.addEventListener('click',()=>setTimeout(closeSheets,300)); });
  $$('[data-share-url]').forEach(el=>el.textContent=url.replace(/^https?:\/\//,''));
  $$('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{ toast(await writeText(url)?'লিঙ্ক কপি হয়েছে':'কপি হয়নি'); }));
  $$('[data-share]').forEach(b=>b.addEventListener('click',async()=>{
    if(navigator.share){ try{ await navigator.share({title,url}); return; }catch(err){ if(err&&err.name==='AbortError') return; } }
    openSheet('share');
  }));

  /* ---- correction form (no backend yet) ---- */
  $$('[data-report]').forEach(f=>f.addEventListener('submit',e=>{ e.preventDefault(); f.reset(); const d=f.closest('details'); if(d) d.open=false; toast('ধন্যবাদ! যাচাই করে ঠিক করা হবে'); }));

  /* ---- sticky bar steps aside at the footer ---- */
  const bar=$('.pf-sticky'), foot=$('footer');
  if(bar&&foot&&'IntersectionObserver' in window) new IntersectionObserver(es=>bar.classList.toggle('hide',es[0].isIntersecting),{rootMargin:'0px 0px -40px 0px'}).observe(foot);
})();
