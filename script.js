// Projects shown in the Work grid. To add one: put images in assets/work/<folder>/
// as 1.jpg, 2.jpg… (plus 1_t.jpg… small thumbnails) and add an entry here.
const projects = [
  { folder: "ent", title: "Snoring & ENT awareness", client: "Amrita ENT Head & Neck Hospital", type: "post", count: 8 },
  { folder: "dental", title: "Meet the 32 Heroes", client: "Blume Dental", type: "carousel", count: 6, square: true },
  { folder: "speech-and-language-assessment-carousel", title: "7 signs your child may need a speech assessment", client: "Amrita ENT Head & Neck Hospital", type: "carousel", count: 6, square: true },
  { folder: "screen-time-and-speech-development-carousel", title: "Screen time & speech development", client: "Amrita ENT Head & Neck Hospital", type: "carousel", count: 5 },
  { folder: "audiometry-hearing-assessment", title: "Everyday activities that encourage communication", client: "Hearing & speech care", type: "carousel", count: 6 },
  { folder: "opthomology-insta-posts", title: "Tired eyes? Eye-care posts", client: "Ophthalmology clinic", type: "post", count: 4 },
  { folder: "thumbnails", title: "Posters & YouTube thumbnails", client: "Sports, film promo & YouTube", type: "poster", count: 3, fill: true },
  { folder: "banners", title: "Advanced ENT Care banners", client: "Amrita ENT Head & Neck Hospital", type: "banner", count: 4, wide: true },
];

const reels = [
  { src: "reels/lipstick", title: "Lipstick showcase", note: "Beauty · AI UGC reel" },
  { src: "reels/nasal", title: "Nasal spray", note: "Healthcare · AI UGC reel" },
  { src: "reels/gelmask", title: "Collagen gel mask", note: "Skincare · AI UGC reel" },
  { src: "videos/momentum", title: "Eye infection explainer", note: "Healthcare · 2D motion graphics" },
  { src: "reels/ai-scholarship", title: "AI scholarship explainer", note: "Education · Motion graphics" },
];
const wideVideos = [
  { src: "videos/kiran-trailer", title: "Kiran Abbavaram × Honest Townhall — trailer cut", note: "YouTube · Multicam edit, motion graphics, sound design" },
  { src: "videos/insta", title: "Kinetic typography edit", note: "Instagram · Motion text & colour grade" },
];

const img = (p, n, thumb) => `assets/work/${p.folder}/${n}${thumb ? "_t" : ""}.jpg`;
const typeLabel = { carousel: "Carousel", post: "Posts", banner: "Banners", poster: "Posters" };

// ---- Work grid ----
const grid = document.getElementById("grid");
grid.innerHTML = projects.map((p, i) => {
  const peeks = [2, 3, 4].filter(n => n <= p.count).map(n => `<img src="${img(p, n, true)}" alt="" loading="lazy">`).join("");
  return `
  <button class="card reveal ${p.wide ? "wide" : ""} ${p.fill ? "fill" : ""}" data-type="${p.type}" data-index="${i}" aria-label="Open ${p.title}, ${p.count} slides">
    <div class="card-media">
      <img src="${img(p, 1, !p.wide)}" alt="${p.title} — cover design for ${p.client}" loading="lazy">
      <span class="badge">${typeLabel[p.type]} · ${p.count}</span>
      ${p.wide ? "" : `<div class="peek">${peeks}</div>`}
    </div>
    <div class="card-meta"><h3>${p.title}</h3><p>${p.client}</p></div>
  </button>`;
}).join("");

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
    const f = chip.dataset.filter;
    grid.querySelectorAll(".card").forEach(card => {
      card.hidden = f !== "all" && card.dataset.type !== f;
    });
  });
});

// ---- Lightbox ----
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbTitle = document.getElementById("lb-title");
const lbCount = document.getElementById("lb-count");
const lbThumbs = document.getElementById("lb-thumbs");
let cur = null, slide = 1, lastFocus = null;

function openProject(i, start = 1) {
  cur = projects[i]; slide = start; lastFocus = document.activeElement;
  lbThumbs.innerHTML = Array.from({ length: cur.count }, (_, k) =>
    `<button data-n="${k + 1}" aria-label="Slide ${k + 1}"><img src="${img(cur, k + 1, true)}" alt=""></button>`).join("");
  lb.hidden = false; document.body.style.overflow = "hidden";
  show(start);
  lb.querySelector(".lb-close").focus();
}
function show(n) {
  slide = ((n - 1 + cur.count) % cur.count) + 1;
  lbImg.src = img(cur, slide);
  lbImg.alt = `${cur.title}, slide ${slide}`;
  lbTitle.textContent = cur.title;
  lbCount.textContent = `${slide} / ${cur.count}`;
  lbThumbs.querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.n === slide));
  // preload next
  new Image().src = img(cur, (slide % cur.count) + 1);
}
function closeLb() { lb.hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); }

grid.addEventListener("click", e => { const c = e.target.closest(".card"); if (c) openProject(+c.dataset.index); });
lb.querySelector(".lb-prev").onclick = () => show(slide - 1);
lb.querySelector(".lb-next").onclick = () => show(slide + 1);
lb.querySelector(".lb-close").onclick = closeLb;
lbThumbs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(+b.dataset.n); });
lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("lb-stage")) closeLb(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowRight") show(slide + 1);
  if (e.key === "ArrowLeft") show(slide - 1);
});
let touchX = null;
lb.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) show(slide + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ---- Reels ----
const reelsList = document.getElementById("reels-list");
const reelHTML = (r, extra = "") => `
  <div class="reel reveal ${extra}" tabindex="0" role="button" aria-label="Play ${r.title} with sound">
    <video src="assets/${r.src}.mp4" poster="assets/${r.src}.jpg" muted loop playsinline preload="metadata"></video>
    <div class="reel-ui"><div><h3>${r.title}</h3><p>${r.note}</p></div><span class="sound" aria-hidden="true">🔇</span></div>
  </div>`;
reelsList.innerHTML = reels.map(r => reelHTML(r)).join("");
document.getElementById("wide-video").innerHTML = wideVideos.map(v => reelHTML(v, "landscape")).join("");

const reelEls = [...document.querySelectorAll(".reel")];
function setSound(target) {
  reelEls.forEach(el => {
    const v = el.querySelector("video");
    const on = el === target && v.muted;
    v.muted = !on;
    el.classList.toggle("playing-sound", on);
    el.querySelector(".sound").textContent = on ? "🔊" : "🔇";
    if (on) { v.play(); }
  });
}
reelEls.forEach(el => {
  el.addEventListener("click", () => setSound(el));
  el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSound(el); } });
});
// Autoplay muted while reels are on screen
const reelObs = new IntersectionObserver(entries => entries.forEach(en => {
  const v = en.target.querySelector("video");
  if (en.isIntersecting) v.play().catch(() => {}); else v.pause();
}), { threshold: .4 });
reelEls.forEach(el => reelObs.observe(el));

// ---- Instagram pages & reels ----
const igPages = [
  { handle: "amrita.ent_hospital", name: "Amrita ENT Head & Neck Hospital", followers: "2.9K" },
  { handle: "drgreeshma_ent", name: "Dr Greeshma Pulluri, ENT surgeon", followers: "5.3K" },
  { handle: "_blume.dental", name: "Blume Dental", followers: "Since launch" },
  { handle: "blume.health_", name: "Blume Health Hospital", followers: "Since launch" },
];
// Reel codes come from the instagram.com/reel/<code>/ links. Views as of Nov 2026.
const igReels = [
  { code: "De9XoQMio2j", title: "A new tooth in 24 hours", page: "Blume Dental", views: "6.5K" },
  { code: "DfPfGmHhuT7", title: "Cochlear implants with Nucleus SmartNav", page: "Dr Greeshma × Cochlear", views: "5.9K" },
  { code: "De4YGpZvKPR", title: "Navigation-guided sinus surgery", page: "Dr Greeshma Pulluri", views: "4.5K" },
  { code: "DfBy1xMORTR", title: "Blocked nose? Nasal spray overuse", page: "Amrita ENT", views: "2.5K" },
  { code: "De9dgQLNG7s", title: "Success story: coblation adenoidectomy", page: "Dr Greeshma × Amrita ENT", views: "2.1K" },
  { code: "DfAMFCUM7Sw", title: "Stuttering is not a weakness", page: "Amrita ENT", views: "1.8K" },
  { code: "DfUoszziDLM", title: "Braces or aligners?", page: "Blume Dental", views: "1.2K" },
  { code: "DdwFfo4IDdi", title: "Stop DIY teeth whitening", page: "Blume Dental × Blume Health", views: "800" },
];
document.getElementById("ig-pages").innerHTML = igPages.map(p => `
  <a class="page-card" href="https://www.instagram.com/${p.handle}/" target="_blank" rel="noopener">
    <span class="ig-icon" aria-hidden="true"></span>
    <span class="page-text"><b>@${p.handle}</b><span>${p.name}</span></span>
    <span class="page-stat">${p.followers}${/K$/.test(p.followers) ? " followers" : ""}</span>
  </a>`).join("");

const igRow = document.getElementById("ig-reels");
igRow.innerHTML = igReels.map(r => `
  <figure class="ig-card">
    <div class="ig-frame" data-code="${r.code}">
      <a class="ig-fallback" href="https://www.instagram.com/reel/${r.code}/" target="_blank" rel="noopener">Loading reel… <span>Open on Instagram ↗</span></a>
    </div>
    <figcaption><b>${r.title}</b><span>${r.page} · ${r.views} views</span></figcaption>
  </figure>`).join("");

// Load each Instagram embed only when it scrolls near the screen
const igObs = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const box = en.target;
  const f = document.createElement("iframe");
  f.src = `https://www.instagram.com/reel/${box.dataset.code}/embed/`;
  f.title = "Instagram reel";
  f.loading = "lazy";
  f.allow = "autoplay; encrypted-media; picture-in-picture";
  f.setAttribute("scrolling", "no");
  box.appendChild(f);
  igObs.unobserve(box);
}), { rootMargin: "300px" });
igRow.querySelectorAll(".ig-frame").forEach(el => igObs.observe(el));

document.querySelectorAll(".ig-arrow").forEach(b => b.addEventListener("click", () => {
  igRow.scrollBy({ left: +b.dataset.dir * (igRow.clientWidth * .8), behavior: "smooth" });
}));

// ---- Nav border + scroll reveal ----
const nav = document.querySelector(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 10), { passive: true });
const revObs = new IntersectionObserver(entries => entries.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("in"); revObs.unobserve(en.target); }
}), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll(".reveal").forEach(el => revObs.observe(el));
