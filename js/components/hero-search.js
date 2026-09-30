/* ==================== ЖИВОЙ ПОИСК ==================== */
const suggestIcons = {
  doc:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>',
  archive: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
  name:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  geo:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-8-7.5-8-12a8 8 0 1116 0c0 4.5-8 12-8 12z"/><circle cx="12" cy="9" r="3"/></svg>'
};

let searchIndex = [];
function buildSearchIndex(){
  const idx = [];

  documents.forEach(d => {
    idx.push({
      type:'doc',
      title: d.t,
      meta: `${d.s} · ${d.d}`,
      group: 'Документы Реестра',
      link: '#detail/' + d.n,
      hay: [d.t, d.s, d.d, d.author, d.type, (d.keywords||[]).join(' '),
            (d.persons||[]).join(' '), (d.geoindex||[]).join(' ')].join(' ').toLowerCase()
    });
  });

  Object.keys(archivesData).forEach(tab => {
    archivesData[tab].forEach(rec => {
      const [name, addr] = rec.split('|');
      idx.push({
        type:'archive',
        title: name,
        meta: addr || '',
        group: 'Архивы-хранители',
        link: '#archives',
        hay: (name + ' ' + (addr||'')).toLowerCase()
      });
    });
  });

  names.forEach(n => {
    idx.push({
      type:'name',
      title: n,
      meta: 'Именной указатель',
      group: 'Персоналии',
      link: '#names',
      hay: n.toLowerCase()
    });
  });

  geo.forEach(g => {
    idx.push({
      type:'geo',
      title: g,
      meta: 'Географический указатель',
      group: 'Топонимы',
      link: '#geo',
      hay: g.toLowerCase()
    });
  });

  return idx;
}

function searchItems(query, limit = 8){
  const q = query.trim().toLowerCase();
  if(q.length < 2) return [];
  const scored = [];
  for(const item of searchIndex){
    const pos = item.hay.indexOf(q);
    if(pos < 0) continue;
    let score = 3;
    if(pos === 0) score = 0;
    else if(item.hay[pos - 1] === ' ') score = 1;
    else score = 2;
    if(item.type === 'doc') score -= 0.5;
    scored.push({ item, score });
  }
  scored.sort((a,b) => a.score - b.score);
  return scored.slice(0, limit).map(r => r.item);
}

function initHeroSuggest(){
  const input     = el('heroSearch');
  const suggest   = el('heroSuggest');
  const form      = input?.closest('.hero__search');
  if(!input || !suggest || !form) return;

  let items = [];
  let activeIdx = -1;

  function close(){
    suggest.hidden = true;
    suggest.innerHTML = '';
    items = [];
    activeIdx = -1;
  }

  function setActive(idx){
    const nodes = suggest.querySelectorAll('.hero__suggest-item');
    nodes.forEach(n => n.classList.remove('is-active'));
    if(idx < 0 || idx >= nodes.length) return;
    nodes[idx].classList.add('is-active');
    activeIdx = idx;
    nodes[idx].scrollIntoView({ block:'nearest' });
  }

  function render(query){
    const q = query.trim();
    if(q.length < 2){ close(); return; }
    const found = searchItems(q, 8);

    if(!found.length){
      items = []; activeIdx = -1;
      suggest.innerHTML = `<div class="hero__suggest-empty">Ничего не найдено по запросу <strong>«${escapeHtml(q)}»</strong></div>`;
      suggest.hidden = false;
      return;
    }

    const groups = {};
    found.forEach(it => { (groups[it.group] = groups[it.group] || []).push(it); });

    let html = '';
    let idx = 0;
    Object.keys(groups).forEach(g => {
      html += `<div class="hero__suggest-group">${escapeHtml(g)}</div>`;
      groups[g].forEach(it => {
        html += `
          <a class="hero__suggest-item${idx === 0 ? ' is-active' : ''}"
             href="${it.link}"
             data-idx="${idx}"
             role="option">
            <span class="hero__suggest-type hero__suggest-type--${it.type}">${suggestIcons[it.type] || ''}</span>
            <span class="hero__suggest-body">
              <span class="hero__suggest-title">${highlightMatch(it.title, q)}</span>
              <span class="hero__suggest-meta">${escapeHtml(it.meta)}</span>
            </span>
          </a>`;
        idx++;
      });
    });

    html += `
      <div class="hero__suggest-footer">
        <span>Найдено: <strong>${found.length}</strong></span>
        <span><kbd>↑</kbd><kbd>↓</kbd> — выбор · <kbd>Enter</kbd> — открыть · <kbd>Esc</kbd> — закрыть</span>
      </div>`;

    suggest.innerHTML = html;
    suggest.hidden = false;
    items = found;
    activeIdx = 0;
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('focus', () => { if(input.value.trim().length >= 2) render(input.value); });

  input.addEventListener('keydown', e => {
    if(suggest.hidden) return;
    const nodes = suggest.querySelectorAll('.hero__suggest-item');
    if(e.key === 'ArrowDown'){
      e.preventDefault();
      setActive(Math.min(activeIdx + 1, nodes.length - 1));
    } else if(e.key === 'ArrowUp'){
      e.preventDefault();
      setActive(Math.max(activeIdx - 1, 0));
    } else if(e.key === 'Enter'){
      if(activeIdx >= 0 && nodes[activeIdx]){
        e.preventDefault();
        const href = nodes[activeIdx].getAttribute('href');
        input.value = '';
        close();
        if(href.startsWith('#')) window.location.hash = href.slice(1);
        else window.location.href = href;
      }
    } else if(e.key === 'Escape'){
      close();
      input.blur();
    }
  });

  suggest.addEventListener('mousemove', e => {
    const item = e.target.closest('.hero__suggest-item');
    if(!item) return;
    const idx = +item.dataset.idx;
    if(idx !== activeIdx) setActive(idx);
  });

  suggest.addEventListener('click', e => {
    const item = e.target.closest('.hero__suggest-item');
    if(!item) return;
    setTimeout(() => { input.value = ''; close(); }, 0);
  });

  document.addEventListener('click', e => {
    if(!form.contains(e.target)) close();
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && !suggest.hidden) close();
  });
}