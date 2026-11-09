const CV_FILE = 'cv/Resume_AmnaArshad.pdf';

/* ---------- icon graphics: pixel icons from the skin pack ---------- */
const ico = n => `<img class="pix" src="assets/icons/${n}.png" alt="" draggable="false">`;
const ico16 = n => `<img class="pix" src="assets/icons/16/${n}.png" alt="">`;
const desktopIcons = {
  'ic-projects':     ['folder-02', 'Projects'],
  'ic-skills':       ['folder-05', 'Skills'],
  'ic-software':     ['folder-06', 'Software'],
  'ic-community':    ['folder-07', 'Community &amp; Leadership'],
  'ic-certificates': ['document-04', 'Certificates'],
  'ic-contact':      ['mail-01', 'contact.txt'],
  'ic-avocado':      ['internet', 'tired avocado 🥑'],
  'ic-cv':           ['document-01', 'CV']
};
Object.entries(desktopIcons).forEach(([id,[img,label]])=>{
  document.getElementById(id).innerHTML = ico(img) + `<div class="icon-label">${label}</div>`;
});
const fileSVG = () => ico('document-01');   // project files
const pdfSVG  = () => ico('document-03');   // certificate files

/* ---------- window management ---------- */
let zTop = 10;
function focusWin(el){
  document.querySelectorAll('.win.active').forEach(w=>w.classList.remove('active'));
  el.classList.add('active');
  el.style.zIndex = ++zTop;
}
function fitWin(el){          // clamp into the viewport; centre horizontally on phones
  const iw = window.innerWidth, ih = window.innerHeight, m = 6, bar = 48;
  const w = el.offsetWidth, hgt = el.offsetHeight;
  let x = iw <= 640 ? (iw - w) / 2 : el.offsetLeft;
  let y = el.offsetTop;
  x = Math.max(m, Math.min(x, iw - w - m));
  y = Math.max(m, Math.min(y, ih - bar - hgt));
  el.style.left = x + 'px'; el.style.top = y + 'px';
}
function openWin(name){
  const el = document.getElementById('win-'+name);
  const wasOpen = el.classList.contains('open');
  el.classList.add('open');
  if(!wasOpen) fitWin(el);
  focusWin(el);
  document.body.classList.add('busy');                       // pixel hourglass cursor flash
  setTimeout(()=> document.body.classList.remove('busy'), 260);
}
function closeWin(name){
  document.getElementById('win-'+name).classList.remove('open','active');
}
document.querySelectorAll('.win').forEach(w=>{
  w.addEventListener('pointerdown', ()=> focusWin(w));
});

/* ---------- draggable windows (pointer events: mouse + touch) ---------- */
document.querySelectorAll('[data-drag]').forEach(bar=>{
  const win = bar.closest('.win');
  let dragging=false, offX=0, offY=0;
  bar.addEventListener('pointerdown', e=>{
    if(e.target.closest('.win-controls')) return;
    dragging = true;
    focusWin(win);
    const rect = win.getBoundingClientRect();
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    if(bar.setPointerCapture) bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e=>{
    if(!dragging) return;
    let x = e.clientX - offX;
    let y = e.clientY - offY;
    x = Math.max(4, Math.min(x, window.innerWidth - win.offsetWidth - 4));
    y = Math.max(4, Math.min(y, window.innerHeight - 48));
    win.style.left = x + 'px';
    win.style.top = y + 'px';
  });
  bar.addEventListener('pointerup', ()=>{ dragging = false; });
  bar.addEventListener('pointercancel', ()=>{ dragging = false; });
});

/* ---------- live draggable desktop icons ---------- */
function handleIconAction(icon){
  const action = icon.dataset.action;
  if(!action) return;
  const idx = action.indexOf(':');
  const type = action.slice(0, idx);
  const val = action.slice(idx + 1);
  if(type === 'open') openWin(val);
  else if(type === 'download') downloadFile(val);
  else if(type === 'link') window.open(val, '_blank');
}

function downloadFile(path){
  const a = document.createElement('a');
  a.href = path; a.download = path.split('/').pop();
  document.body.appendChild(a); a.click(); a.remove();
}
document.getElementById('ic-cv').dataset.action = 'download:' + CV_FILE;
document.getElementById('cvBtn').setAttribute('href', CV_FILE);

function makeIconDraggable(icon){
  let startX=0, startY=0, origLeft=0, origTop=0, dragging=false, moved=false;

  icon.addEventListener('pointerdown', e=>{
    if(icon.setPointerCapture) icon.setPointerCapture(e.pointerId);
    const r = icon.getBoundingClientRect();
    const dRect = document.getElementById('desktop').getBoundingClientRect();
    origLeft = r.left - dRect.left;
    origTop = r.top - dRect.top;
    startX = e.clientX;
    startY = e.clientY;
    dragging = true;
    moved = false;
    icon.style.zIndex = 6;
  });

  icon.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if(Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    if(moved){
      let x = origLeft + dx;
      let y = origTop + dy;
      x = Math.max(0, Math.min(x, window.innerWidth - icon.offsetWidth));
      y = Math.max(0, Math.min(y, window.innerHeight - icon.offsetHeight - 56));
      icon.style.left = x + 'px';
      icon.style.top = y + 'px';
      icon.style.bottom = 'auto';
      icon.style.right = 'auto';
    }
  });

  icon.addEventListener('pointerup', e=>{
    if(dragging && !moved) handleIconAction(icon);
    dragging = false;
    moved = false;
    icon.style.zIndex = '';
  });

  icon.addEventListener('pointercancel', ()=>{ dragging=false; moved=false; icon.style.zIndex=''; });
}

document.querySelectorAll('.desktop-icon').forEach(makeIconDraggable);

/* ---------- projects: file grid + detail popup ---------- */
const projectsData = [
  { title: 'Cybersecurity Analysis Agent',
    stack: ['React.js','Node.js','Express.js','MongoDB','REST API'],
    bullets: [
      'Built a full stack MERN web platform designed for cybersecurity threat monitoring, automated incident response, and live security telemetry analysis.',
      'Designed a modular and scalable REST API architecture covering attack logs, threat intelligence feeds, IP blacklisting, and alert management.'
    ] },
  { title: 'Hate Speech Detection System',
    stack: ['Python','Flask','Scikit-learn','Pandas','HTML','CSS (Bootstrap)'],
    bullets: [
      'Developed a full stack web application integrating Machine Learning and Natural Language Processing (NLP) pipelines to automate high throughput online content moderation.',
      'Engineered an end-to-end NLP pipeline utilizing TF-IDF feature extraction techniques.',
      'Trained, cross-validated, and optimized classification algorithms (SVM, Logistic Regression) to categorize unstructured text data with enhanced F1-scores.'
    ] },
  { title: 'PowerTrack: Electricity Usage & Billing Monitor',
    stack: ['Flutter','Dart','Supabase'],
    bullets: [
      'Conceptualized and designed a comprehensive mobile application to help users monitor real-time electricity consumption and track interactive billing history.',
      'Implemented modular UI flows and robust state management architectures to ensure a seamless, high-performance user experience for complex meter management.'
    ] },
  { title: 'OPD Connect: Hospital Management System',
    stack: ['HTML','CSS','JavaScript','SQL','PHP'],
    bullets: [
      'Developed a full-stack web application designed to streamline hospital outpatient department operations and scheduling workflows.',
      'Architected a robust multi-table SQL database schema to scale and handle patient records, automated appointments, and medical histories with strict data integrity.'
    ] },
  { title: 'Predictive Income Modeling',
    stack: ['Python','Scikit-learn','Jupyter Notebook'],
    bullets: [
      'Performed deep Exploratory Data Analysis (EDA) and implemented optimized Linear and Multiple Linear Regression models to accurately predict regional economic indicators.',
      'Utilized Python data visualization suites to present production trends and optimized mathematical model parameters for precise predictive reporting.'
    ] }
];

function renderProjects(){
  const nav = document.getElementById('projectNav');
  nav.innerHTML = projectsData.map((p, i) =>
    `<div class="proj-item" data-index="${i}">${ico16('document-01')}<span>${p.title}</span></div>`).join('');
  nav.querySelectorAll('.proj-item').forEach(it =>
    it.addEventListener('click', () => selectProject(parseInt(it.dataset.index, 10))));
  selectProject(0);
}
function selectProject(i){
  const p = projectsData[i];
  if(!p) return;
  document.querySelectorAll('#projectNav .proj-item').forEach((el, k) => el.classList.toggle('sel', k === i));
  document.getElementById('projectDetailTitle').textContent = p.title;
  document.getElementById('projectDetailStack').innerHTML = p.stack.map(s => `<span class="tag alt">${s}</span>`).join('');
  document.getElementById('projectDetailBullets').innerHTML = p.bullets.map(b => `<li style="margin-bottom:6px;">${b}</li>`).join('');
  document.querySelector('.proj-pane').scrollTop = 0;
}
renderProjects();

/* ---------- community and leadership ---------- */ 
const communityData = [
  { title: 'Vice President', nav: 'VP · Literary Society', org: 'COMSATS Literary Society', period: 'Jun 2026 – Present',
    tags: ['Strategic Planning','Administration','Policy'],
    bullets: ['Contributed to strategic planning, administrative management, and constitutional policy updates for society initiatives.'] },
  { title: 'General Secretary', nav: 'Gen. Sec. · IEEE RAS', org: 'IEEE Robotics and Automation Society', period: 'Feb 2026 – Sep 2026',
    tags: ['Event Coordination','Correspondence','Workshops'],
    bullets: ['Managed official correspondence, participant notifications, and workshop coordination for chapter events.',
              'Served as an organizer for the online session on AI Prompt Engineering, driving successful event planning and execution alongside organizing multiple online workshops.'] },
  { title: 'General Secretary', nav: 'Gen. Sec. · Literary Society', org: 'COMSATS Literary Society', period: 'Dec 2025 – Jun 2026',
    tags: ['Leadership','Documentation','Team Coordination'],
    bullets: ['Lead 90+ members, coordinate between 6 teams and university administration for event execution.',
              'Manage official society documentation, professional correspondence, and strategic planning for literary initiatives.'] }
];

function renderCommunity(){
  const nav = document.getElementById('communityNav');
  const empty = !communityData.length;
  const roles = empty ? [{ title:'add your first role', org:'', period:'',
    bullets:['open script.js and add an entry to communityData (see the "ADD COMMUNITY & LEADERSHIP ROLES HERE" comment).'] }] : communityData;
  nav.innerHTML = roles.map((r, i) =>
    `<div class="proj-item" data-index="${i}">${ico16('folder-07')}<span>${r.nav || r.title}</span></div>`).join('');
  const select = i => {
    const r = roles[i];
    nav.querySelectorAll('.proj-item').forEach((el, k) => el.classList.toggle('sel', k === i));
    document.getElementById('roleTitle').textContent = r.title;
    document.getElementById('roleMeta').textContent = [r.org, r.period].filter(Boolean).join('  \u2022  ');
    document.getElementById('roleTags').innerHTML = (r.tags || []).map(t => `<span class="tag alt">${t}</span>`).join('');
    document.getElementById('roleBullets').innerHTML = (r.bullets || []).map(b => `<li style="margin-bottom:6px;">${b}</li>`).join('');
    document.getElementById('communityPane').scrollTop = 0;
  };
  nav.querySelectorAll('.proj-item').forEach(it => it.addEventListener('click', () => select(parseInt(it.dataset.index, 10))));
  select(0);
}
renderCommunity();

/* ---------- certificates: PDF file grid ---------- */
const certificatesData = [
  { title: "Data Analytics", file: "certificates/deloitte_completion_certificate.pdf" },
  { title: "AI for Research and Insights", file: "certificates/Coursera 6E7I5LCQXO41.pdf" },
  { title: "AI Fundamentals", file: "certificates/Coursera UDCXPY2OI5O9.pdf" },
  { title: "Google AI", file: "certificates/Coursera HNHWIURBSLY3.pdf" },
];

if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function pdfFallback(view, c){      // if pdf.js can't load/render, use the browser's own viewer
  view.outerHTML = `<iframe class="cert-frame" src="${c.file}#toolbar=0&navpanes=0&view=Fit" title="${c.title}" loading="lazy"></iframe>`;
}
function renderPdfCert(view, c){    // draw page 1 on a canvas -> card is exactly the certificate's shape
  if(!window.pdfjsLib){ pdfFallback(view, c); return; }
  pdfjsLib.getDocument(c.file).promise.then(pdf => pdf.getPage(1)).then(page => {
    const base = page.getViewport({ scale: 1 });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vp = page.getViewport({ scale: (700 * dpr) / base.width });
    const cv = view.querySelector('canvas');
    cv.width = vp.width; cv.height = vp.height;
    view.style.aspectRatio = base.width + ' / ' + base.height;
    return page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
  }).catch(() => pdfFallback(view, c));
}

function renderCertificateFileGrid(){
  const list = document.getElementById('certFileGrid');
  const note = document.getElementById('certEmptyNote');
  if(!certificatesData.length){ list.innerHTML = ''; note.style.display = 'block'; return; }
  note.style.display = 'none';
  list.innerHTML = certificatesData.map((c, i) => {
    const isImg = /\.(png|jpe?g|webp|gif)$/i.test(c.file);
    const view = isImg
      ? `<img class="cert-img" src="${c.file}" alt="${c.title}">`
      : `<a class="cert-view" data-pdf="${i}" href="${c.file}" target="_blank" rel="noopener"><canvas></canvas></a>`;
    return `<div class="cert-card"><div class="cert-title">${ico16('document-03')}<span>${c.title}</span></div>${view}` +
           `<a class="cert-open" href="${c.file}" target="_blank" rel="noopener">open full size</a></div>`;
  }).join('');
  list.querySelectorAll('.cert-view[data-pdf]').forEach(v => renderPdfCert(v, certificatesData[+v.dataset.pdf]));
}
renderCertificateFileGrid();

/* ---------- search decoy: hilarious canned answers ---------- */
const funnyAnswers = [
  q => `404: brain not found for “${q}”. try again in 5 minutes (or 5 years).`,
  q => `our servers thought reeeally hard about “${q}” and concluded: 42.`,
  q => `congrats! you're the 1,000,000th person to search “${q}”. you win absolutely nothing 🎉`,
  q => `results for “${q}”: have you tried turning it off and on again?`,
  q => `“${q}” is now banned in 3 countries. proceed with caution 🚨`,
  q => `we searched everywhere for “${q}” and all we found was a jpeg of a cat.`,
];
let funnyIdx = 0;   // goes through the answers in order, then loops
function runFunnySearch(){
  const input = document.getElementById('searchInput');
  const q = input.value.trim() || 'nothing';
  const pick = funnyAnswers[funnyIdx++ % funnyAnswers.length];
  document.getElementById('searchResultText').textContent = pick(q);
  openWin('searchresult');
  input.value = '';
}
document.getElementById('searchGoBtn').addEventListener('click', runFunnySearch);
document.getElementById('searchInput').addEventListener('keydown', e=>{
  if(e.key === 'Enter'){ e.preventDefault(); runFunnySearch(); }
});

/* ---------- sound: click + error from the skin pack ---------- */
const sndClick = new Audio('assets/sounds/click.wav');
const sndErr   = new Audio('assets/sounds/err.wav');
let soundOn = true;
function playSnd(a){
  if(!soundOn) return;
  try{ const n = a.cloneNode(); n.volume = .6; n.play().catch(()=>{}); }catch(err){}
}
const CLICKABLE = '.proj-item,.desktop-icon,.win-controls span,.file-item,.btn,#startBtn,#monitorWrap,#searchGoBtn,.deco-x,#soundBtn,.win-body a';
document.addEventListener('pointerdown', e=>{ if(e.target.closest(CLICKABLE)) playSnd(sndClick); });
document.getElementById('soundBtn').addEventListener('click', e=>{
  soundOn = !soundOn;
  e.currentTarget.classList.toggle('muted', !soundOn);
});

/* ---------- clock ---------- */
function tick(){
  const d = new Date();
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  document.getElementById('clockBox').textContent =
    `${h}:${m.toString().padStart(2,'0')} ${ampm}`;
}
tick(); setInterval(tick, 1000*15);

/* ---------- boot: open About, then a lil easter-egg dialog ---------- */
window.addEventListener('load', ()=>{
  setTimeout(()=> openWin('about'), 350);
  const eggDelay = 40000 + Math.random() * 30000; // random, 40–70s after load
  setTimeout(()=>{
    const t = document.getElementById('errToast');
    t.style.opacity = '1';
    t.style.pointerEvents = 'auto';
    t.style.transform = 'translateX(-50%) translateY(0)';
    playSnd(sndErr);
    setTimeout(()=> hideToast(), 4500);
  }, eggDelay);
});
function hideToast(){
  const t = document.getElementById('errToast');
  t.style.opacity = '0';
  t.style.pointerEvents = 'none';
  t.style.transform = 'translateX(-50%) translateY(20px)';
}