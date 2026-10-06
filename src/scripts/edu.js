/* ===== college + school page ===== */
(function(){
  const res=document.querySelector('.ed-res');
  if(res&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>{ if(es[0].isIntersecting){ res.classList.add('anim'); io.disconnect(); } },{threshold:.3});
    io.observe(res);
  }
})();
