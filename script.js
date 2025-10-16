const STORE_KEY = "subject_tree_v1";
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

  let state = {
  subject: "",
  verb: "",
  topics: [],
  theme: {
    primary: "#7c5cff",
    secondary:"#00d2ff",
    good:"#22c55e"
  },
  layoutSeed: 0
};

function load(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && typeof parsed === 'object'){
        state = {...state, ...parsed};
      }
    }
  }catch(e){ console.warn("load error", e); }
}
function save(showToast=true){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
  if(showToast) flashToast("Saved ✔️");
}

function uid(){ return Math.random().toString(36).slice(2,9); }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

const subjectInput = $("#subjectInput");
const verbInput = $("#verbInput");
const topicInput = $("#topicInput");
const addTopicBtn = $("#addTopicBtn");
const topicList = $("#topicList");
const subjectLabel = $("#subjectLabel");
const progressFill = $("#progressFill");
const progressText = $("#progressText");
const subjectText = $("#subjectText");
const verbText = $("#verbText");
const edgesG = $("#edges");
const nodesG = $("#nodes");
const saveBtn = $("#saveBtn");
const resetBtn = $("#resetBtn");
const reflowBtn = $("#reflowBtn");
const shuffleBtn = $("#shuffleBtn");

const colorPrimary = $("#colorPrimary");
const colorSecondary = $("#colorSecondary");
const colorGood = $("#colorGood");

/* confetti canvas */
const confetti = (() => {
  const cvs = document.createElement("canvas");
  cvs.style.position = "fixed";
  cvs.style.inset = "0";
  cvs.style.pointerEvents = "none";
  cvs.style.zIndex = "70";
  document.body.appendChild(cvs);
  const ctx = cvs.getContext("2d");
  let W = cvs.width = innerWidth, H = cvs.height = innerHeight;
  addEventListener("resize", () => { W = cvs.width = innerWidth; H = cvs.height = innerHeight; });

  let pieces = [];
  function burst() {
    const N = 160;
    for(let i=0;i<N;i++){
      pieces.push({
        x: W/2, y: H*0.25,
        vx: (Math.random()*2-1)*6,
        vy: Math.random()*-6-2,
        g: 0.15 + Math.random()*0.15,
        s: 6 + Math.random()*6,
        a: Math.random()*Math.PI,
        av: (Math.random()*2-1)*0.2,
        col: `hsl(${Math.floor(Math.random()*360)},90%,60%)`,
        life: 220 + Math.random()*60
      });
    }
    if(!animating) animate();
  }
  let animating=false;
  function animate(){
    animating = true;
    ctx.clearRect(0,0,W,H);
    pieces = pieces.filter(p => p.life>0);
    for(const p of pieces){
      p.vy += p.g;
      p.x += p.vx; p.y += p.vy;
      p.a += p.av; p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.col;
      ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s*Math.sin(p.a*2));
      ctx.restore();
    }
    if(pieces.length>0) requestAnimationFrame(animate);
    else animating=false;
  }
  return { burst };
})();

/* toast */
function flashToast(msg){
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1200);
}

function renderList(){
  topicList.innerHTML = "";
  for(const t of state.topics){
    const row = document.createElement("div");
    row.className = "topic" + (t.done ? " done" : "");
    row.dataset.id = t.id;

    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = t.done;
    cb.addEventListener("change", () => {
      t.done = cb.checked;
      row.classList.toggle("done", t.done);
      updateProgress();
      renderDiagram();
      save();
      if(allDone()) celebrate();
    });

    const name = document.createElement("input");
    name.className = "tname";
    name.value = t.name;
    name.addEventListener("change", () => {
      t.name = name.value.trim() || t.name;
      renderDiagram(); save();
    });
    name.addEventListener("keydown", e => {
      if(e.key==="Enter"){ name.blur(); }
    });

    const del = document.createElement("button");
    del.className = "iconbtn";
    del.title = "Delete";
    del.innerHTML = "🗑️";
    del.addEventListener("click", () => {
      state.topics = state.topics.filter(x => x.id !== t.id);
      renderList(); renderDiagram(); updateProgress(); save();
    });

    const up = document.createElement("button");
    up.className = "iconbtn";
    up.title = "Move up";
    up.innerHTML = "⬆️";
    up.addEventListener("click", () => {
      const i = state.topics.findIndex(x=>x.id===t.id);
      if(i>0){
        [state.topics[i-1], state.topics[i]] = [state.topics[i], state.topics[i-1]];
        renderList(); renderDiagram(); save();
      }
    });

    row.append(cb, name, up, del);
    topicList.append(row);
  }
}

function updateProgress(){
  const total = state.topics.length;
  const done = state.topics.filter(t=>t.done).length;
  const pct = total ? Math.round(done/total*100) : 0;
  progressFill.style.setProperty("--pct", pct+"%");
  progressText.textContent = `${pct}%`;
  subjectLabel.textContent = state.subject ? `${state.subject}` : "No Subject Yet";

  progressFill.style.background = `linear-gradient(90deg, ${state.theme.primary}, ${state.theme.secondary})`;
}

function renderDiagram(){
  // Subject + verb
  subjectText.textContent = state.subject || "Your Subject";
  verbText.textContent = state.verb || "Verb";

  // Update theme gradients
  const svg = $("#svg");
  svg.querySelector("#ribbonGrad stop[offset='0%']").setAttribute("stop-color", state.theme.primary);
  svg.querySelector("#ribbonGrad stop[offset='100%']").setAttribute("stop-color", state.theme.secondary);
  svg.querySelector("#nodeGradDone stop[offset='0%']").setAttribute("stop-color", shade(state.theme.good, -10));
  svg.querySelector("#nodeGradDone stop[offset='100%']").setAttribute("stop-color", shade(state.theme.good, -35));

  const W = 1200, H = 560;
  const cx = 600, cy = 220; 
  const ringR = 200; 
  const jitter = 26;

  edgesG.innerHTML = "";
  nodesG.innerHTML = "";

  const N = state.topics.length;
  for(let i=0;i<N;i++){
    const t = state.topics[i];
    const theta = (i / Math.max(1,N)) * Math.PI * 2 - Math.PI/2;
    const jx = seededNoise(i + state.layoutSeed) * jitter;
    const jy = seededNoise(i*2 + state.layoutSeed) * jitter;

    const x = cx + Math.cos(theta) * ringR + jx;
    const y = cy + Math.sin(theta) * ringR + jy;

    // Edge
    const edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
    edge.setAttribute("x1", cx);
    edge.setAttribute("y1", cy+5);
    edge.setAttribute("x2", x);
    edge.setAttribute("y2", y);
    edge.setAttribute("class", "edge"+(t.done?" done":""));
    edge.style.strokeDasharray = "6 6";
    edge.style.animation = "dash 1.6s linear infinite";
    edgesG.appendChild(edge);

    // Node group
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class","node");
    g.style.cursor = "pointer";

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 28);
    circle.setAttribute("class", t.done ? "done" : "");
    circle.addEventListener("click", () => {
      toggleTopic(t.id);
    });

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x);
    label.setAttribute("y", y+4);
    label.setAttribute("text-anchor","middle");
    label.setAttribute("fill","#e7edff");
    label.textContent = t.name.length>14 ? t.name.slice(0,12)+"…" : t.name;

    // hover title
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = (t.done ? "✅ " : "⬜ ") + t.name + " — click to toggle";
    circle.appendChild(title);

    g.append(circle, label);
    nodesG.appendChild(g);
  }
}

function shade(hex, amt){
  const {r,g,b} = hexToRgb(hex);
  const nr = clamp(r + amt, 0, 255);
  const ng = clamp(g + amt, 0, 255);
  const nb = clamp(b + amt, 0, 255);
  return `rgb(${nr}, ${ng}, ${nb})`;
}
function hexToRgb(hex){
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if(!m) return {r:124,g:92,b:255};
  return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) };
}

/* seeded noise for stable jitter across reloads */
function seededNoise(n){
  const x = Math.sin(n*9999.123 + state.layoutSeed*0.123) * 43758.5453;
  return x - Math.floor(x) - 0.5; // [-0.5, 0.5)
}

function addTopic(name){
  name = (name||"").trim();
  if(!name) return;
  state.topics.push({id:uid(), name, done:false});
  topicInput.value = "";
  renderList(); renderDiagram(); updateProgress(); save();
}
function toggleTopic(id){
  const t = state.topics.find(x=>x.id===id);
  if(!t) return;
  t.done = !t.done;
  renderList(); renderDiagram(); updateProgress(); save();
  if(allDone()) celebrate();
}
function allDone(){
  return state.topics.length>0 && state.topics.every(t=>t.done);
}
function celebrate(){
  confetti.burst();
  flashToast("🎉 All subtopics complete — congrats!");
}

addTopicBtn.addEventListener("click", () => addTopic(topicInput.value));
topicInput.addEventListener("keydown", e => { if(e.key==="Enter") addTopic(topicInput.value); });

subjectInput.addEventListener("input", () => { state.subject = subjectInput.value; updateProgress(); renderDiagram(); });
verbInput.addEventListener("input", () => { state.verb = verbInput.value; renderDiagram(); });

saveBtn.addEventListener("click", () => save());
resetBtn.addEventListener("click", () => {
  if(confirm("Reset EVERYTHING? This clears subject, verb, topics and theme.")){
    state = { subject:"", verb:"", topics:[], theme:{primary:"#7c5cff", secondary:"#00d2ff", good:"#22c55e"}, layoutSeed:0 };
    subjectInput.value = ""; verbInput.value = ""; topicInput.value = "";
    colorPrimary.value = state.theme.primary;
    colorSecondary.value = state.theme.secondary;
    colorGood.value = state.theme.good;
    renderList(); renderDiagram(); updateProgress(); save();
  }
});
reflowBtn.addEventListener("click", () => renderDiagram());
shuffleBtn.addEventListener("click", () => { state.layoutSeed = Math.floor(Math.random()*1e6); renderDiagram(); save(false); });

colorPrimary.addEventListener("input", () => { state.theme.primary = colorPrimary.value; applyTheme(); renderDiagram(); save(false); });
colorSecondary.addEventListener("input", () => { state.theme.secondary = colorSecondary.value; applyTheme(); renderDiagram(); save(false); });
colorGood.addEventListener("input", () => { state.theme.good = colorGood.value; applyTheme(); renderDiagram(); save(false); });

function applyTheme(){
  document.documentElement.style.setProperty("--accent", state.theme.primary);
  document.documentElement.style.setProperty("--accent-2", state.theme.secondary);
  document.documentElement.style.setProperty("--good", state.theme.good);
}

function init(){
  load();
  // restore inputs
  subjectInput.value = state.subject;
  verbInput.value = state.verb;
  colorPrimary.value = state.theme.primary;
  colorSecondary.value = state.theme.secondary;
  colorGood.value = state.theme.good;

  applyTheme();
  renderList();
  renderDiagram();
  updateProgress();

  // autosave on unload
  window.addEventListener("beforeunload", () => save(false));
}
init();

(function addStripeAnim(){
  const style = document.createElement("style");
  style.textContent = `
    .progress-fill{ background-size: 28px 14px, 100% 100%;
      background-image:
        linear-gradient(45deg, rgba(255,255,255,.18) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.18) 75%, transparent 75%, transparent 100%),
        linear-gradient(90deg, ${state.theme.primary}, ${state.theme.secondary});
      animation: move 18s linear infinite;
    }
    @keyframes move { to { background-position: 280px 0, 0 0; } }
    @keyframes dash { to { stroke-dashoffset: -24; } }
  `;
  document.head.appendChild(style);
})();
