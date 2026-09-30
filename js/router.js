/* ==================== РОУТИНГ ==================== */
function showPage(page){
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('page--active', p.dataset.page === page));
  document.querySelectorAll('.nav__link').forEach(b => b.classList.toggle('nav__link--active', b.dataset.page === page));
  window.scrollTo({top:0});
}

function route(){
  const hash = location.hash.replace('#','') || 'home';
  if(hash.startsWith('detail/')){
    const id = hash.split('/')[1];
    renderDetail(id); showPage('detail');
  } else if(document.querySelector(`.page[data-page="${hash}"]`)){
    showPage(hash);
  } else {
    showPage('home');
  }
}

function goTo(page){
  if(location.hash === '#'+page){ route(); }
  else location.hash = page;
}

window.addEventListener('hashchange', route);