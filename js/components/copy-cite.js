/* ==================== КНОПКА «СКОПИРОВАТЬ ЦИТАТУ» ==================== */
function initCopyCite(){
  const btn = document.getElementById('copyCiteBtn');
  if(!btn) return;
  if(btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';

  btn.addEventListener('click', async () => {
    const id = btn.dataset.docId;
    const d = documents.find(x => x.n === id);
    if(!d) return;

    const citation = buildCitation(d);
    const ok = await copyTextToClipboard(citation);

    if(ok){
      btn.classList.add('is-copied');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Скопировано`;
      showToast('Цитата скопирована', 'Вставьте её в свою работу — формат по ГОСТ Р 7.0.5-2008.');
      setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.innerHTML = originalHTML;
      }, 2200);
    } else {
      showToast('Не удалось скопировать', 'Скопируйте вручную: ' + citation.slice(0, 80) + '…');
    }
  });
}