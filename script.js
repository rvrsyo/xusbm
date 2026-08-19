let ALL_FACULTY = [];
let activeDept = "All";

const directoryEl = document.getElementById('directory');
const tabsEl = document.getElementById('tabs');
const emptyStateEl = document.getElementById('empty-state');
const searchEl = document.getElementById('search');

const ICONS = {
  mail: '<svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>',
  phone: '<svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  room: '<svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
};

function initials(name){
  return name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0,2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

async function init(){
  try{
    const res = await fetch('faculty.json');
    const raw = await res.json();
    // assign a stable registry number in file order
    ALL_FACULTY = raw.map((f, i) => ({ ...f, id: i + 1 }));
  } catch(e){
    directoryEl.innerHTML = `<p style="font-family:var(--mono);color:var(--muted)">Could not load faculty.json — make sure it sits next to index.html.</p>`;
    return;
  }
  buildStats();
  buildTabs();
  render();
  searchEl.addEventListener('input', render);
}

function buildStats(){
  document.getElementById('stat-total').textContent = ALL_FACULTY.length;
  document.getElementById('stat-depts').textContent = new Set(ALL_FACULTY.map(f => f.department)).size;
}

function buildTabs(){
  const depts = ["All", ...new Set(ALL_FACULTY.map(f => f.department))];
  tabsEl.innerHTML = depts.map(d =>
    `<button class="tab ${d === activeDept ? 'active' : ''}" data-dept="${d}" role="tab" aria-selected="${d===activeDept}">${d}</button>`
  ).join('');

  tabsEl.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeDept = btn.dataset.dept;
      tabsEl.querySelectorAll('.tab').forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn);
      });
      render();
    });
  });
}

function render(){
  const term = searchEl.value.trim().toLowerCase();

  let filtered = ALL_FACULTY.filter(f => {
    const matchesDept = activeDept === "All" || f.department === activeDept;
    const matchesTerm = !term ||
      f.name.toLowerCase().includes(term) ||
      f.department.toLowerCase().includes(term) ||
      (f.role || '').toLowerCase().includes(term);
    return matchesDept && matchesTerm;
  });

  emptyStateEl.classList.toggle('show', filtered.length === 0);
  directoryEl.innerHTML = '';
  if(filtered.length === 0) return;

  // group by department, preserving first-seen order
  const groups = [];
  filtered.forEach(f => {
    let g = groups.find(g => g.department === f.department);
    if(!g){ g = { department: f.department, items: [] }; groups.push(g); }
    g.items.push(f);
  });

  directoryEl.innerHTML = groups.map((g, gi) => `
    <section class="dept-group">
      <div class="dept-head">
        <span class="dept-num">DEPT. ${String(gi+1).padStart(2,'0')}</span>
        <h2>${g.department}</h2>
        <span class="dept-rule"></span>
        <span class="count">${g.items.length} ${g.items.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      <div class="grid">
        ${g.items.map(f => cardHTML(f)).join('')}
      </div>
    </section>
  `).join('');
}

function avatarHTML(f){
  const fallback = `<div class="avatar avatar-fallback">${initials(f.name)}</div>`;
  if(!f.photo) return fallback;
  // Photo shown if it loads; silently falls back to initials if the file
  // is missing (this sample data references filenames that don't exist yet).
  return `
    <div class="avatar-wrap">
      <img class="avatar-photo" src="${f.photo}" alt="${f.name}"
           onerror="this.closest('.avatar-wrap').outerHTML = '${fallback.replace(/'/g, "\\'")}'">
    </div>`;
}

function cardHTML(f){
  return `
    <article class="card">
      <div class="card-top">
        <span class="index-no">No. ${String(f.id).padStart(3,'0')}</span>
        ${avatarHTML(f)}
      </div>
      <h3>${f.name}</h3>
      <p class="title">${f.role}</p>
      <span class="tag">${f.department}</span>
      <div class="card-details">
        ${f.email ? `<a href="mailto:${f.email}">${ICONS.mail}${f.email}</a>` : ''}
        ${f.office ? `<span>${ICONS.room}${f.office}</span>` : ''}
      </div>
    </article>
  `;
}

init();
