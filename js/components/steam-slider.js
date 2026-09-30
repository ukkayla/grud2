/* ==================== STEAM-СЛАЙДЕР ==================== */
const featuredSlides = documents
  .filter(d => (d.images || 0) >= 4)
  .slice(0, 5)
  .map(d => d.n);

const slideBanners = {
  '1': 'assets/images/s1.jpg',
  '2': 'assets/images/s2.jpg',
  '3': 'assets/images/s3.jpg',
  '4': 'assets/images/s4.png',
  '6': 'assets/images/s5.jpg'
};

function renderSideGallery(doc){
  const count = Math.min(4, doc.images || 0);
  const items = Array.from({length: count}, (_, i) => `
    <a class="steam-gallery__item" href="#detail/${doc.n}">
      <div class="steam-gallery__img"></div>
      <div class="steam-gallery__body">
        <div class="steam-gallery__title">Лист ${52 + i}</div>
        <div class="steam-gallery__meta">${escapeHtml(doc.archiveCode || 'ГА РФ. Ф. Р-1235. Оп. 4. Ед. хр. 11')}</div>
      </div>
    </a>
  `).join('');
  return `
    <div class="steam-slider__gallery-title">Цифровые образы документа</div>
    <div class="steam-gallery">
      ${items}
    </div>
  `;
}

function initSteamSlider({ root, slidesData, renderSlide, autoplay = 7000 }){
  if(!root) return;
  const track      = root.querySelector('[data-track]');
  const dotsWrap   = root.querySelector('[data-dots]');
  const progress   = root.querySelector('[data-progress]');
  const galleryWrap= root.querySelector('[data-gallery]');
  const prevBtn    = root.querySelector('[data-prev]');
  const nextBtn    = root.querySelector('[data-next]');

  track.innerHTML = slidesData.map((item, i) => `
    <div class="steam-slider__slide${i === 0 ? ' is-active' : ''}" data-index="${i}">
      ${renderSlide(item)}
    </div>
  `).join('');

  dotsWrap.innerHTML = slidesData.map((_, i) => `
    <button class="steam-slider__dot${i === 0 ? ' is-active' : ''}"
            type="button" data-dot="${i}"
            aria-label="Слайд ${i + 1}"></button>
  `).join('');

  const slides = () => track.querySelectorAll('.steam-slider__slide');
  const dots   = () => dotsWrap.querySelectorAll('.steam-slider__dot');
  let current = 0;
  let lastGalleryIdx = -1;
  let timer = null;
  let progressTimer = null;

  function goTo(idx){
    const total = slides().length;
    if(!total) return;
    idx = ((idx % total) + total) % total;
    track.style.transform = `translateX(-${idx * 100}%)`;
    slides().forEach((el, i) => el.classList.toggle('is-active', i === idx));
    dots().forEach((el, i) => el.classList.toggle('is-active', i === idx));
    current = idx;

    if(idx !== lastGalleryIdx && galleryWrap){
      const doc = documents.find(d => d.n === slidesData[idx]);
      if(doc){
        galleryWrap.innerHTML = renderSideGallery(doc);
        lastGalleryIdx = idx;
      }
    }
  }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  dotsWrap.addEventListener('click', e => {
    const dot = e.target.closest('[data-dot]');
    if(!dot) return;
    goTo(+dot.dataset.dot);
    resetAuto();
  });

  track.addEventListener('click', e => {
    if(e.target.closest('a')) return;
    const slide = e.target.closest('.steam-slider__slide');
    if(!slide) return;
    const link = slide.querySelector('[data-slide-link]');
    if(link) window.location.href = link.getAttribute('href');
  });

  let startX = null, startY = null;
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive:true });

  track.addEventListener('touchend', e => {
    if(startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
      goTo(current + (dx < 0 ? 1 : -1));
      resetAuto();
    }
    startX = startY = null;
  }, { passive:true });

  root.setAttribute('tabindex', '0');
  root.addEventListener('keydown', e => {
    if(e.key === 'ArrowLeft'){ goTo(current - 1); resetAuto(); }
    if(e.key === 'ArrowRight'){ goTo(current + 1); resetAuto(); }
  });

  function resetAuto(){
    clearInterval(timer);
    clearInterval(progressTimer);
    if(progress) progress.style.width = '0%';
    if(!autoplay) return;
    const startedAt = Date.now();
    progressTimer = setInterval(() => {
      const pct = Math.min(((Date.now() - startedAt) / autoplay) * 100, 100);
      if(progress) progress.style.width = pct + '%';
    }, 50);
    timer = setInterval(() => {
      goTo(current + 1);
      resetAuto();
    }, autoplay);
  }
  resetAuto();

  root.addEventListener('mouseenter', () => {
    clearInterval(timer);
    clearInterval(progressTimer);
    if(progress) progress.style.width = '0%';
  });
  root.addEventListener('mouseleave', resetAuto);

  goTo(0);
}

function renderSteamSlider(){
  initSteamSlider({
    root: document.getElementById('steamSlider'),
    slidesData: featuredSlides,
    autoplay: 7000,
    renderSlide: docId => {
      const doc = documents.find(d => d.n === docId);
      if(!doc) return '';
      const tags = (doc.keywords || []).slice(0, 4);
      const bg = slideBanners[docId] || '';
      const bgStyle = bg ? ` style="background-image:url('${bg}')"` : '';
      return `
        <div class="slide-banner">
          <div class="slide-banner__img"${bgStyle}></div>
          <div class="slide-banner__overlay"></div>
          <div class="slide-banner__content">
            <h3 class="slide-banner__title">${escapeHtml(doc.t)}</h3>
            <div class="slide-banner__tags">
              ${tags.map(t => `<span class="slide-banner__tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <p class="slide-banner__desc">${escapeHtml(doc.annotation || '')}</p>
            <a class="slide-banner__cta" href="#detail/${doc.n}" data-slide-link>Подробнее</a>
          </div>
        </div>
      `;
    }
  });
}