/* ==================== НАВИГАЦИЯ ПО ДОКУМЕНТАМ ==================== */
document.addEventListener('click', e => {
  const navLink = e.target.closest('[data-nav]');
  if(navLink){
    e.preventDefault();
    goTo(navLink.dataset.nav);
    return;
  }
  const card = e.target.closest('.card[data-doc-id]');
  if(card){ goTo('detail/' + card.dataset.docId); }
});

document.addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === ' '){
    const card = e.target.closest('.card[data-doc-id]');
    if(card){ e.preventDefault(); goTo('detail/' + card.dataset.docId); }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('mainNav');
  if(nav){
    nav.addEventListener('click', e => {
      const btn = e.target.closest('.nav__link');
      if(btn) goTo(btn.dataset.page);
    });
  }
});
/* ==================== МОБИЛЬНОЕ МЕНЮ (гамбургер) ==================== */
(function initMobileMenu(){
  const burger   = document.getElementById('navBurger');
  const nav      = document.getElementById('siteNav');
  const backdrop = document.getElementById('navBackdrop');
  const list     = document.getElementById('mainNav');
  if(!burger || !nav) return;

  function openMenu(){
    document.body.classList.add('menu-open');
    backdrop?.classList.add('is-visible');
    burger.setAttribute('aria-expanded', 'true');
  }

  function closeMenu(){
    document.body.classList.remove('menu-open');
    backdrop?.classList.remove('is-visible');
    burger.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu(){
    document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
  }

  burger.addEventListener('click', toggleMenu);
  backdrop?.addEventListener('click', closeMenu);

  // Esc
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && document.body.classList.contains('menu-open')) closeMenu();
  });

  // Автозакрытие при выборе пункта на мобильном
  list?.addEventListener('click', e => {
    const btn = e.target.closest('.nav__link');
    if(btn && window.matchMedia('(max-width: 860px)').matches) closeMenu();
  });

  // При развороте окна на десктоп — закрываем меню
  window.addEventListener('resize', () => {
    if(window.innerWidth > 860 && document.body.classList.contains('menu-open')) closeMenu();
  });
})();