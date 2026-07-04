function formatDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleString();
}

function isDueSoon(iso){
  const d = new Date(iso);
  const now = new Date();
  const diff = d - now;
  return diff > 0 && diff < 3*24*60*60*1000; // 3日以内
}

let tasks = [];

async function loadTasks(){
  const loadingEl = document.getElementById('loading');
  loadingEl.hidden = false;
  document.getElementById('tasks-body').innerHTML = '';
  try{
    tasks = await window.api.fetchTasks();
    renderTasks(applyFilters(tasks));
    populateServiceFilter(tasks);
  }catch(e){
    document.getElementById('tasks-body').innerHTML = `<tr><td colspan="5">エラー: ${escapeHtml(e.message || String(e))}</td></tr>`;
  }finally{
    loadingEl.hidden = true;
  }
}

function populateServiceFilter(tasks){
  const sel = document.getElementById('filter-service');
  sel.innerHTML = '<option value="all">すべて</option>';
  const services = Array.from(new Set(tasks.map(t=>t.service))).sort();
  services.forEach(s=>{
    const opt = document.createElement('option'); opt.value=s; opt.textContent=s; sel.appendChild(opt);
  });
}

function applyFilters(arr){
  const svc = document.getElementById('filter-service').value;
  const st = document.getElementById('filter-status').value;
  const q = document.getElementById('search').value.trim().toLowerCase();
  return arr.filter(t=>{
    if(svc!=='all' && t.service!==svc) return false;
    if(st!=='all' && t.status!==st) return false;
    if(q && !(t.title.toLowerCase().includes(q) || t.course.toLowerCase().includes(q))) return false;
    return true;
  }).sort((a,b)=> new Date(a.due)-new Date(b.due));
}

function renderTasks(arr){
  const tbody = document.getElementById('tasks-body');
  if(!arr.length){ tbody.innerHTML = '<tr><td colspan="5">データがありません</td></tr>'; return }
  tbody.innerHTML = '';
  arr.forEach(t => {
    const tr = document.createElement('tr');
    const dueClass = isDueSoon(t.due) ? 'due-soon' : '';
    const statusClass = t.status==='提出済み' ? 'status-submitted' : 'status-missing';
    tr.innerHTML = `<td class="title">${escapeHtml(t.title)}</td><td class="course">${escapeHtml(t.course)}</td><td class="service">${escapeHtml(t.service)}</td><td class="due ${dueClass}">${formatDate(t.due)}</td><td class="status ${statusClass}">${escapeHtml(t.status)}</td>`;
    tbody.appendChild(tr);
  });
}

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

function setup(){
  document.getElementById('filter-service').addEventListener('change',()=>renderTasks(applyFilters(tasks)));
  document.getElementById('filter-status').addEventListener('change',()=>renderTasks(applyFilters(tasks)));
  // debounce search input
  let debounceTimer = null;
  document.getElementById('search').addEventListener('input',()=>{
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(()=>renderTasks(applyFilters(tasks)), 250);
  });
  document.getElementById('reload').addEventListener('click',()=>loadTasks());
  loadTasks();
}

document.addEventListener('DOMContentLoaded', setup);
