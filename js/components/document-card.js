/* ==================== КАРТОЧКА ДОКУМЕНТА ==================== */
function renderDocumentCard(d){
  return `
    <article class="card" data-doc-id="${d.n}" tabindex="0" role="link"
             aria-label="Открыть документ ${escapeHtml(d.t)}">
      <div class="card__thumb">
        <div class="card__thumb-paper">
          ${d.preview
            ? `<img src="${d.preview}" alt="${escapeHtml(d.t)}" loading="lazy" width="480" height="640">`
            : ''}
        </div>
      </div>
      <div class="card__body">
        <div class="card__header">
          <span>${escapeHtml(d.t)}</span>
          <span class="card__num">№ ${d.n}</span>
        </div>
        <div class="card__content">
          <div class="card__fields">
          <div class="card__field"><span class="card__label">Самоназвание документа:</span><span class="card__value">${escapeHtml(d.s)}</span></div>
          <div class="card__field"><span class="card__label">Дата создания документа:</span><span class="card__value">${escapeHtml(d.d)}</span></div>
          <div class="card__field"><span class="card__label">Дата включения в реестр:</span><span class="card__value card__value--sm">25 апреля ${d.year} г.</span></div>
          <div class="card__field"><span class="card__label">Место хранения документа:</span><span class="card__value card__value--sm">${escapeHtml(d.storagePlace.split('\n')[0])}</span></div>
          </div>
          <div class="card__more">Регистрационный номер: <strong style="color:#333">${d.n}</strong></div>
        </div>
      </div>
    </article>`;
}
