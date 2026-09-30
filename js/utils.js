/* ==================== УТИЛИТЫ ==================== */
const el = id => document.getElementById(id);
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderEmpty(title, hint){
  return `<div class="empty-state"><strong>${title}</strong>${hint||''}</div>`;
}

async function copyTextToClipboard(text){
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      return true;
    }
  }catch(e){ /* fallthrough */ }

  try{
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }catch(e){
    return false;
  }
}

let toastTimer = null;
function showToast(title, body){
  let toast = document.getElementById('appToast');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast__title">${escapeHtml(title)}</span>` +
                    (body ? `<span class="toast__body">${escapeHtml(body)}</span>` : '');
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
}

function highlightMatch(text, query){
  const safe = escapeHtml(text);
  if(!query) return safe;
  const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'ig');
  return safe.replace(re, '<mark>$1</mark>');
}

function buildCitation(d){
  const parts = [];
  if(d.author && !/съезд|совет|правительств/i.test(d.author)){
    parts.push(d.author + '.');
  }
  parts.push(d.t + ' //');
  parts.push('Государственный реестр уникальных документов Архивного фонда Российской Федерации.');
  if(d.d) parts.push(d.d + '.');
  if(d.archiveCode) parts.push(d.archiveCode);
  parts.push('Рег. № ' + d.n + '.');
  const url = location.origin + location.pathname + '#detail/' + d.n;
  parts.push('URL: ' + url);
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  parts.push('(дата обращения: ' + dd + '.' + mm + '.' + yyyy + ').');
  return parts.join(' ');
}