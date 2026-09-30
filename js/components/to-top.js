/* ==================== КНОПКА «НАВЕРХ» ==================== */
(function initToTop(){
  const btn = document.getElementById('toTop');
  if(!btn) return;

  const SHOW_AFTER = 600;
  let visible = false;

  function update(){
    const shouldShow = window.scrollY > SHOW_AFTER;
    if(shouldShow === visible) return;
    visible = shouldShow;
    btn.classList.toggle('is-visible', shouldShow);
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }, { passive:true });

  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  update();
})();