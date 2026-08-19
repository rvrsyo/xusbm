let ALL_FACULTY = [];
let activeDept = "All";

const ICONS = {
  mail: '<svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="m22 6-10 7L2 6"/></svg>',
  phone: '<svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  room: '<svg class="icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
};

const FALLBACK_FACULTY = [
  { name: "Ruth Love V. Russell", role: "Dean", department: "Dean's Office", email: "rrussell@xu.edu.ph", office: "SBM 203, SBM Building", photo: "assets/photos/rrussell.jpg" },
  { name: "Toni Rose Tahil-Fabroa", role: "Associate Dean", department: "Dean's Office", email: "ttahil-fabroa@xu.edu.ph", office: "SBM 203, SBM Building", photo: "assets/photos/faculty2.jpg" },
  { name: "Riza O. Mabelin", role: "Staff", department: "Dean's Office", email: "rmabelin@xu.edu.ph", office: "SBM 203, SBM Building", photo: "assets/photos/faculty2.jpg" },
  { name: "Sherlyn F. Sarraga", role: "Staff", department: "Dean's Office", email: "ssarraga@xu.edu.ph", office: "SBM 203, SBM Building", photo: "" },
  { name: "Rose Enaje", role: "Staff", department: "Graduate Studies", email: "renaje@xu.edu.ph", office: "SBM Faculty Room 102", photo: "" },
  { name: "Rustum D. Gevero", role: "Director", department: "Graduate Studies", email: "rgevero@xu.edu.ph", office: "SBM Faculty Room 102", photo: "assets/photos/rgevero.jpg" },
  { name: "Leo Santiago Arrabaca", role: "Chair", department: "Business Administration", email: "larrabaca@xu.edu.ph", office: "", photo: "" },
  { name: "Tracy June C. Dy", role: "Assistant Chair", department: "Business Administration", email: "tdy@xu.edu.ph", office: "", photo: "" },
  { name: "Valerie Irene C. Arellano", role: "Faculty", department: "Business Administration", email: "varellano@xu.edu.ph", office: "", photo: "" },
  { name: "Milbert P. Dialogo", role: "CTTL Director", department: "Business Administration", email: "mdialogo@xu.edu.ph", office: "", photo: "" },
  { name: "Jimbo A. Fuentes", role: "DM–Research Coordinator", department: "Business Administration", email: "jfuentes@xu.edu.ph", office: "", photo: "" },
  { name: "Desiree M. La", role: "SEC Director", department: "Business Administration", email: "dla@xu.edu.ph", office: "", photo: "" },
  { name: "Jo-jean M. Lumayag", role: "SD Coordinator", department: "Business Administration", email: "jlumayag@xu.edu.ph", office: "", photo: "" },
  { name: "Edgardo A. Palasan", role: "Faculty", department: "Business Administration", email: "epalasan@xu.edu.ph", office: "", photo: "" },
  { name: "Bonna L. Soriano", role: "Attorney", department: "Business Administration", email: "bsoriano@xu.edu.ph", office: "", photo: "" },
  { name: "Abel Nicolo Yu", role: "Chair", department: "Accountancy", email: "ayu@xu.edu.ph", office: "", photo: "" },
  { name: "Marie Antonette B. Emata", role: "Full-Time Faculty", department: "Accountancy", email: "memata@xu.edu.ph", office: "", photo: "" },
  { name: "Laneza Mae Quidit", role: "Full-Time Faculty", department: "Accountancy", email: "lquidit@xu.edu.ph", office: "", photo: "" },
  { name: "Rolan Literatus", role: "Full-Time Faculty", department: "Accountancy", email: "rliteratus@xu.edu.ph", office: "", photo: "" }
];

function initials(name){
  return name
    .replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

async function init(){
  try {
    const res = await fetch('faculty.json');
    if (!res.ok) throw new Error('File load failed');
    const raw = await res.json();
    ALL_FACULTY = raw.map((f, i) => ({ ...f, id: i + 1 }));
  } catch(e) {
    ALL_FACULTY = FALLBACK_FACULTY.map((f, i) => ({ ...f, id: i + 1 }));
  }

  buildStats();
  buildTabs();
  render();

  const searchEl = document.getElementById('search');
  if (searchEl) {
    searchEl.addEventListener('input', render);
  }
}

function buildStats(){
  const statTotal = document.getElementById('stat-total');
  const statDepts = document.getElementById('stat-depts');
  if (statTotal) statTotal.textContent = ALL_FACULTY.length;
  if (statDepts) statDepts.textContent = new Set(ALL_FACULTY.map(f => f.department)).size;
}

function buildTabs(){
  const tabsEl = document.getElementById('tabs');
  if (!tabsEl) return;

  const depts = ["All", ...new Set(ALL_FACULTY.map(f => f.department))];
  tabsEl.innerHTML = depts.map(d =>
    `<button class="tab ${d === activeDept ? 'active' : ''}" data-dept="${d}" role="tab" aria-selected="${d === activeDept}">${d}</button>`
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
  const directoryEl = document.getElementById('directory');
  const emptyStateEl = document.getElementById('empty-state');
  const searchEl = document.getElementById('search');
  if (!directoryEl) return;

  const term = searchEl ? searchEl.value.trim().toLowerCase() : '';

  const filtered = ALL_FACULTY.filter(f => {
    const matchesDept = activeDept === "All" || f.department === activeDept;
    const matchesTerm = !term ||
      f.name.toLowerCase().includes(term) ||
      f.department.toLowerCase().includes(term) ||
      (f.role || '').toLowerCase().includes(term);
    return matchesDept && matchesTerm;
  });

  if (emptyStateEl) {
    emptyStateEl.classList.toggle('show', filtered.length === 0);
  }

  directoryEl.innerHTML = '';
  if (filtered.length === 0) return;

  const groups = [];
  filtered.forEach(f => {
    let g = groups.find(g => g.department === f.department);
    if (!g) { g = { department: f.department, items: [] }; groups.push(g); }
    g.items.push(f);
  });

  directoryEl.innerHTML = groups.map((g, gi) => `
    <section class="dept-group">
      <div class="dept-head">
        <span class="dept-num">DEPT. ${String(gi + 1).padStart(2, '0')}</span>
        <h2>${g.department}</h2>
        <span class="dept-rule"></span>
        <span class="count">${g.items.length} ${g.items.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      <div class="grid">
        ${g.items.map(f => cardHTML(f)).join('')}
      </div>
    </section>
  `).join('');

  directoryEl.querySelectorAll('.avatar-photo').forEach(img => {
    img.addEventListener('error', function(){
      const name = this.getAttribute('alt') || '';
      const fallback = document.createElement('div');
      fallback.className = 'avatar avatar-fallback';
      fallback.textContent = initials(name);
      const wrap = this.closest('.avatar-wrap');
      if (wrap) wrap.replaceWith(fallback);
    });
  });
}

function avatarHTML(f){
  if (!f.photo) {
    return `<div class="avatar avatar-fallback">${initials(f.name)}</div>`;
  }
  return `
    <div class="avatar-wrap">
      <img class="avatar-photo" src="${f.photo}" alt="${f.name}">
    </div>`;
}

function cardHTML(f){
  return `
    <article class="card">
      <div class="card-top">
        <span class="index-no">No. ${String(f.id).padStart(3, '0')}</span>
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
```[cite: 3, 4]
