/* ==================== СТРАНИЦА «РЕЕСТР» ==================== */
function renderRegister(){
  const num = el('regNumFilter').value.trim();
  const yearRaw = el('regYearFilter').value.trim();
  const yearRange = yearRaw.match(/(\d{4})\s*[-–—]\s*(\d{4})/);
  const yearSingle = /^\d{4}$/.test(yearRaw) ? yearRaw : null;

  const filtered = documents.filter(d=>{
    if(num && !d.n.includes(num)) return false;
    if(yearRange){
      const from = +yearRange[1], to = +yearRange[2];
      if(+d.year < from || +d.year > to) return false;
    } else if(yearSingle && d.year !== yearSingle) return false;
    return true;
  });
  el('registerMeta').innerHTML = `<span>Найдено: <strong>${filtered.length}</strong> из ${documents.length}</span>`;
  el('registerList').innerHTML = filtered.length
    ? filtered.map(renderDocumentCard).join('')
    : renderEmpty('Ничего не найдено','Попробуйте изменить регистрационный номер или год.');
}
el('regNumFilter').addEventListener('input', renderRegister);
el('regYearFilter').addEventListener('input', renderRegister);
el('regApply').addEventListener('click', renderRegister);
el('regReset').addEventListener('click', ()=>{ el('regNumFilter').value=''; el('regYearFilter').value=''; renderRegister(); });

/* ==================== СТРАНИЦА «АРХИВЫ» ==================== */
const tabTitles = { federal:'Федеральные архивы', regional:'Региональные архивы', museums:'Музеи', ngo:'Некоммерческие организации' };
function renderArchivesList(tab){
  const list = archivesData[tab] || [];
  el('archivesSubtitle').textContent = tabTitles[tab] || '';
  el('archivesList').innerHTML = list.length ? list.map(a=>{
    const parts = a.split('|');
    const addrs = parts.slice(1).map(x=>`<p class="card__row"><span class="card__key">${escapeHtml(x)}</span></p>`).join('');
    return `<article class="card card--no-thumb" style="cursor:default"><div class="card__body"><div class="card__header"><span>${escapeHtml(parts[0])}</span></div><div class="card__content">${addrs}<p class="card__row" style="margin-top:6px"><a href="#" style="color:#2F586E;text-decoration:underline">Страница архива на Портале «Архивы России»</a></p></div></div></article>`;
  }).join('') : renderEmpty('В этой категории пока нет архивов');
}
el('archivesTabs').addEventListener('click', e=>{
  const tab = e.target.closest('.tab');
  if(!tab) return;
  el('archivesTabs').querySelectorAll('.tab').forEach(t=>t.classList.toggle('tab--active', t===tab));
  renderArchivesList(tab.dataset.tab);
});

/* ==================== УКАЗАТЕЛИ ==================== */
function renderIndexList(containerId, metaId, items, query){
  const q = (query||'').trim().toLowerCase();
  const filtered = q ? items.filter(x=>x.toLowerCase().includes(q)) : items;
  el(metaId).innerHTML = `<span>Найдено: <strong>${filtered.length}</strong> из ${items.length}</span>`;
  el(containerId).innerHTML = filtered.length
    ? filtered.map(x=>`<div class="index-item"><a href="#">${escapeHtml(x)}</a></div>`).join('')
    : renderEmpty('Ничего не найдено','Попробуйте изменить поисковый запрос.');
}
function renderNames(){ renderIndexList('namesList','namesMeta', names, el('namesQuery').value); }
function renderGeo(){ renderIndexList('geoList','geoMeta', geo, el('geoQuery').value); }
el('namesQuery').addEventListener('input', renderNames);
el('geoQuery').addEventListener('input', renderGeo);
el('namesReset').addEventListener('click', ()=>{ el('namesQuery').value=''; renderNames(); });
el('geoReset').addEventListener('click', ()=>{ el('geoQuery').value=''; renderGeo(); });

/* ==================== ПОИСК ==================== */
const activeFilters = new Set();
function matchesQuery(d, q){
  if(!q) return true;
  const text = `${d.t} ${d.s} ${d.d} ${d.n} ${d.type} ${d.author} ${(d.keywords||[]).join(' ')}`.toLowerCase();
  return text.includes(q.toLowerCase());
}
function matchesFilters(d){
  if(activeFilters.size === 0) return true;
  const groups = {};
  activeFilters.forEach(tag=>{ const k = tag.split(':')[0]; (groups[k] = groups[k] || []).push(tag); });
  for(const k in groups){ if(!groups[k].some(tag => d.tags.includes(tag))) return false; }
  return true;
}
function renderSearch(){
  const q = el('searchQuery').value.trim();
  const filtered = documents.filter(d => matchesQuery(d, q) && matchesFilters(d));
  el('searchMeta').innerHTML = `<span>Найдено: <strong>${filtered.length}</strong> из ${documents.length}</span>` +
    (activeFilters.size ? `<span>Активных фильтров: <strong>${activeFilters.size}</strong></span>` : '');
  el('searchResults').innerHTML = filtered.length
    ? filtered.map(renderDocumentCard).join('')
    : renderEmpty('Ничего не найдено','Попробуйте изменить запрос или сбросить фильтры.');

  /* Обновляем счётчик активных фильтров на кнопке */
  if(typeof window.updateFiltersCount === 'function') window.updateFiltersCount();
}


el('searchQuery').addEventListener('input', renderSearch);
el('searchApply').addEventListener('click', renderSearch);
el('searchReset').addEventListener('click', ()=>{ el('searchQuery').value=''; activeFilters.clear(); syncSidebarCheckboxes(); renderSearch(); });
el('sidebarReset').addEventListener('click', ()=>{ activeFilters.clear(); syncSidebarCheckboxes(); renderSearch(); });

/* ==================== АККОРДЕОН ==================== */
function renderSidebar(){
  el('sidebarAccordion').innerHTML = sidebarGroups.map(g=>{
    const opts = g.options.map(o=>{
      const value = `${g.key}:${o}`;
      return `<label class="accordion__option"><input type="checkbox" value="${escapeHtml(value)}"> ${escapeHtml(o)}</label>`;
    }).join('');
    return `<div class="accordion__group" data-key="${g.key}"><button class="accordion__item" type="button"><span class="accordion__item-left"><span>${escapeHtml(g.name)}</span><span class="accordion__badge" style="display:none">0</span></span><span class="accordion__plus">+</span></button><div class="accordion__panel">${opts}</div></div>`;
  }).join('');
}
function syncSidebarCheckboxes(){
  el('sidebarAccordion').querySelectorAll('input[type="checkbox"]').forEach(cb=>{ cb.checked = activeFilters.has(cb.value); });
  updateBadges();
}
function updateBadges(){
  el('sidebarAccordion').querySelectorAll('.accordion__group').forEach(group=>{
    const count = [...activeFilters].filter(t=>t.startsWith(group.dataset.key+':')).length;
    const badge = group.querySelector('.accordion__badge');
    if(count > 0){ badge.style.display = ''; badge.textContent = count; }
    else { badge.style.display = 'none'; }
  });
}
el('sidebarAccordion').addEventListener('click', e=>{
  const header = e.target.closest('.accordion__item');
  if(!header) return;
  header.closest('.accordion__group').classList.toggle('open');
});
el('sidebarAccordion').addEventListener('change', e=>{
  const cb = e.target.closest('input[type="checkbox"]');
  if(!cb) return;
  if(cb.checked) activeFilters.add(cb.value); else activeFilters.delete(cb.value);
  updateBadges(); renderSearch();
});

/* ==================== ДЕТАЛЬНАЯ ДОКУМЕНТА ==================== */
function detailRow(label, value){
  if(!value || value === '—') value = '—';
  return `<div class="detail__row"><div class="detail__label">${escapeHtml(label)}</div><div class="detail__value">${value.replace(/\n/g,'<br>')}</div></div>`;
}
function detailRowFull(label, value){
  if(!value) return '';
  return `<div class="detail__row detail__row--full"><div class="detail__label">${escapeHtml(label)}</div><div class="detail__value">${value.replace(/\n/g,'<br>')}</div></div>`;
}
function renderDetail(id){
  const d = documents.find(x => x.n === id);
  if(!d){ el('detailContent').innerHTML = renderEmpty('Документ не найден'); return; }
  const keywords = (d.keywords || []).join(', ');
  const persons = (d.persons || []).join(', ');
  const geoindex = (d.geoindex || []).join(', ');
  const galleryItems = Array.from({length: d.images || 0}, (_, i) => {
    return `<div class="gallery__item"><div class="gallery__img"></div><div class="gallery__caption">ГАРФ. Ф. Р-1235. Оп. 4. Ед. хр. 11. Л. ${52+i}.</div></div>`;
  }).join('');
  el('detailContent').innerHTML = `
    <div class="breadcrumbs">
      <a href="#" data-nav="register">Главная</a>
      <span class="sep">/</span>
      <a href="#" data-nav="register">Федеральный архив</a>
      <span class="sep">/</span>
      <a href="#" data-nav="register">Федеральное казенное учреждение «Государственный архив Российской Федерации»</a>
    </div>
    <div class="detail__topline">
      <div><span class="label">Ключевые слова:</span> ${escapeHtml(keywords)}</div>
      <div><span class="label">Именной указатель:</span> ${escapeHtml(persons)}</div>
      <div><span class="label">Географический указатель:</span> ${escapeHtml(geoindex)}</div>
    </div>
    <div class="detail__intro">
      <div class="detail__key">Регистрационный номер:</div><div class="detail__val">${d.n}</div>
      <div class="detail__key">Дата включения документа в Государственный реестр:</div><div class="detail__val">25 апреля ${d.year} г.</div>
    </div>

    <div class="detail__row detail__row--full" style="margin-bottom:8px">
      <div class="detail__label">Название (заголовок) документа:</div>
    </div>
    <div class="detail__head">
      <h2 class="detail__headline">${escapeHtml(d.t)}</h2>
      <button class="copy-cite" type="button" id="copyCiteBtn" data-doc-id="${d.n}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
        Скопировать цитату
      </button>
    </div>

    <div class="detail__section">
      ${detailRow('Самоназвание документа:', escapeHtml(d.s))}
      ${detailRow('Вид документа:', escapeHtml(d.type))}
      ${detailRow('Автор документа:', escapeHtml(d.author))}
      ${detailRow('Дата (время создания) документа:', escapeHtml(d.d))}
      ${detailRow('Век:', escapeHtml(d.century))}
      ${detailRow('Язык документа:', escapeHtml(d.language))}
    </div>
    <div class="detail__section">
      ${detailRowFull('Аннотация:', escapeHtml(d.annotation))}
      ${detailRowFull('Историческая справка:', escapeHtml(d.historicalNote))}
    </div>
    <div class="detail__section">
      <div class="detail__group">
        ${detailRow('Наличие драгоценных металлов и камней:', escapeHtml(d.preciousMetals))}
        ${detailRow('Палеографические особенности:', escapeHtml(d.paleography))}
        ${detailRow('Печати:', escapeHtml(d.seals))}
        ${detailRow('Художественные особенности:', escapeHtml(d.artisticFeatures))}
      </div>
      <div class="detail__group">
        ${detailRowFull('Опубликованность документа:', escapeHtml(d.published))}
        ${detailRowFull('Экспонирование:', escapeHtml(d.exhibited))}
      </div>
      <div class="detail__group">
        ${detailRow('Собственность:', escapeHtml(d.ownership))}
        ${detailRowFull('Место хранения документа:', escapeHtml(d.storagePlace))}
        ${detailRow('Архивный шифр:', escapeHtml(d.archiveCode))}
        ${detailRow('Материальный носитель:', escapeHtml(d.carrier))}
        ${detailRow('Размеры документа:', escapeHtml(d.size))}
        ${detailRow('Объем документа:', escapeHtml(d.volume))}
        ${detailRow('Физическое состояние:', escapeHtml(d.physicalState))}
        ${detailRow('Потребность в реставрации:', escapeHtml(d.restorationNeed))}
      </div>
      <div class="detail__group">
        <div class="detail__group-title">Страховая оценка документа</div>
        ${detailRow('Дата оценки:', escapeHtml(d.insurance?.date || '—'))}
        ${detailRow('Сумма (руб.):', escapeHtml(d.insurance?.sum || '—'))}
      </div>
    </div>

    <h3 class="detail__group-title" style="font-size:22px;margin-top:34px;font-weight:400;font-family:var(--font-serif)">Цифровые образы документа</h3>
    <div class="gallery">${galleryItems}</div>

    <h3 class="detail__group-title" style="font-size:22px;margin-top:34px;font-weight:400;font-family:var(--font-serif)">Похожие документы</h3>
    <section class="hero-slider hero-slider--detail">
      <div class="splide" id="detailSimilarSlider">
        <div class="splide__track">
          <ul class="splide__list"></ul>
        </div>
      </div>
    </section>

    <div style="margin:16px 0 40px">
      <a class="back-link" href="#" data-nav="register">Вернуться к реестру</a>
    </div>
  `;

  renderDetailSlider(id);
  initCopyCite();
}

/* ==================== СЛАЙДЕР «ПОХОЖИЕ ДОКУМЕНТЫ» ==================== */
function renderDetailSlider(currentId){
  const list = document.querySelector('#detailSimilarSlider .splide__list');
  if(!list) return;

  const pool = documents.filter(d => d.n !== currentId);
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);

  list.innerHTML = shuffled.map(d => `
    <li class="splide__slide">
      <div class="slide-card">
        <div class="slide-card__img"></div>
        <div class="slide-card__body">
          <div class="slide-card__title">${escapeHtml(d.t)}</div>
          <div class="slide-card__meta">${escapeHtml(d.s)} · ${escapeHtml(d.d)}</div>
          <a class="slide-card__link" href="#detail/${d.n}">Подробнее</a>
        </div>
      </div>
    </li>
  `).join('');

  const sliderEl = document.getElementById('detailSimilarSlider');
  if(!sliderEl) return;

  if(sliderEl.splide) sliderEl.splide.destroy();

  const init = () => {
    if(typeof Splide === 'undefined'){
      window.addEventListener('DOMContentLoaded', init, { once:true });
      return;
    }
    new Splide(sliderEl, {
      type: 'loop',
      perPage: 3,
      perMove: 1,
      gap: '20px',
      autoplay: true,
      interval: 5000,
      pauseOnHover: true,
      pagination: true,
      arrows: true,
      breakpoints: { 960: { perPage: 2 }, 600: { perPage: 1 } }
    }).mount();
  };
  init();
}

/* ==================== ИНИЦИАЛИЗАЦИЯ ==================== */
renderRegister();
renderArchivesList('federal');
renderNames();
renderGeo();
renderSidebar();
renderSearch();
renderSteamSlider();
searchIndex = buildSearchIndex();
initHeroSuggest();
route();
/* ==================== МОБИЛЬНЫЕ ФИЛЬТРЫ ==================== */
(function initMobileFilters(){
  const toggle   = document.getElementById('filtersToggle');
  const sidebar  = document.getElementById('sidebar');
  const closeBtn = document.getElementById('sidebarClose');
  const applyBtn = document.getElementById('sidebarApply');
  const backdrop = document.getElementById('filtersBackdrop');
  if(!toggle || !sidebar) return;

  function openFilters(){
    sidebar.classList.add('is-open');
    backdrop?.classList.add('is-visible');
    document.body.classList.add('filters-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeFilters(){
    sidebar.classList.remove('is-open');
    backdrop?.classList.remove('is-visible');
    document.body.classList.remove('filters-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? closeFilters() : openFilters();
  });

  closeBtn?.addEventListener('click', closeFilters);
  applyBtn?.addEventListener('click', closeFilters);
  backdrop?.addEventListener('click', closeFilters);

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && sidebar.classList.contains('is-open')) closeFilters();
  });

  window.addEventListener('resize', () => {
    if(window.innerWidth > 960 && sidebar.classList.contains('is-open')) closeFilters();
  });

  /* Счётчик активных фильтров на кнопке */
  const countEl = document.getElementById('filtersCount');
  function updateFiltersCount(){
    const n = (typeof activeFilters !== 'undefined' && activeFilters) ? activeFilters.size : 0;
    if(!countEl) return;
    if(n > 0){
      countEl.hidden = false;
      countEl.textContent = n;
    } else {
      countEl.hidden = true;
    }
  }

  // Обновляем счётчик после изменений в аккордеоне
  const accordion = document.getElementById('sidebarAccordion');
  accordion?.addEventListener('change', updateFiltersCount);

  // И после сброса
  document.getElementById('sidebarReset')?.addEventListener('click', () => {
    setTimeout(updateFiltersCount, 0);
  });

  // И при инициализации
  updateFiltersCount();

  // Публичный вызов из других мест (например, после renderSearch)
  window.updateFiltersCount = updateFiltersCount;
})();

/* ==================== АККОРДЕОН НА ГЛАВНОЙ ==================== */
(function initHomeAccordion(){
  const blocks = document.querySelectorAll('.home-block[data-accordion]');
  if(!blocks.length) return;

  // Синхронизируем aria-expanded с классом open при загрузке
  blocks.forEach(block => {
    const btn = block.querySelector('.home-block__title');
    if(!btn) return;
    btn.setAttribute('aria-expanded', block.classList.contains('open') ? 'true' : 'false');
  });

  function isMobile(){
    return window.matchMedia('(max-width: 1000px)').matches;
  }

  blocks.forEach(block => {
    const btn = block.querySelector('.home-block__title');
    if(!btn) return;

    btn.addEventListener('click', () => {
      if(!isMobile()) return; // на десктопе не реагируем

      const willOpen = !block.classList.contains('open');

      // По желанию: закрываем остальные при открытии текущего.
      // Если хотите — уберите этот блок, чтобы можно было открыть несколько.
      if(willOpen){
        blocks.forEach(other => {
          if(other !== block){
            other.classList.remove('open');
            other.querySelector('.home-block__title')?.setAttribute('aria-expanded', 'false');
          }
        });
      }

      block.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  // При развороте окна на десктоп — сбрасываем все открытые состояния
  window.addEventListener('resize', () => {
    if(!isMobile()){
      blocks.forEach(block => {
        block.classList.remove('open');
        block.querySelector('.home-block__title')?.setAttribute('aria-expanded', 'false');
      });
    }
  });
})();
