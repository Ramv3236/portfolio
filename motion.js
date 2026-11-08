// Animations: 3D ring carousel (hero), moving showcase strip, walking cursor buddy.
// Uses `projects`, `img` and `openProject` from script.js.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Shape of each design, so strip items have the right width before images load.
const ratioOf = (p, n) => {
  if (p.folder === "banners") return 2;
  if (p.folder === "thumbnails") return [0.87, 0.667, 1.78][n - 1];
  if (p.folder === "dental" || p.folder.startsWith("speech")) return 1;
  return 0.8;
};

// ---------- 3D RING CAROUSEL ----------
(() => {
  const stage = document.getElementById("ring-stage");
  const ring = document.getElementById("ring");
  // Covers: first slide of every portrait/square project, plus a few strong second slides
  const picks = [];
  projects.forEach((p, i) => { if (p.folder !== "banners") picks.push([i, 1]); });
  [["ent", 2], ["dental", 2], ["speech-and-language-assessment-carousel", 2]].forEach(([f, n]) => {
    picks.push([projects.findIndex(p => p.folder === f), n]);
  });
  const N = picks.length, step = 360 / N;
  ring.innerHTML = picks.map(([i, n]) =>
    `<button class="ring-card" data-i="${i}" data-n="${n}" aria-label="Open ${projects[i].title}">
       <img src="${img(projects[i], n, true)}" alt="" draggable="false"></button>`).join("");
  const cards = [...ring.children];

  let radius = 0;
  const layout = () => {
    const w = ring.offsetWidth;
    radius = Math.round((w / 2) / Math.tan(Math.PI / N)) + 18;
    cards.forEach((c, k) => { c.style.transform = `rotateY(${k * step}deg) translateZ(${radius}px)`; });
  };
  layout(); addEventListener("resize", layout);

  let angle = 0, vel = reduceMotion ? 0 : -0.12, autoVel = vel, dragging = false, lastX = 0, moved = 0;
  const render = () => {
    ring.style.transform = `translateZ(${-radius}px) rotateY(${angle}deg)`;
    cards.forEach((c, k) => {
      let rel = ((k * step + angle) % 360 + 540) % 360 - 180; // -180..180, 0 = front
      const f = Math.cos(rel * Math.PI / 180);                  // 1 front, -1 back
      c.style.filter = `brightness(${0.55 + 0.45 * Math.max(f, 0)}) saturate(${0.6 + 0.4 * Math.max(f, 0)})`;
      c.style.zIndex = Math.round(f * 100) + 100;
    });
  };
  const tick = () => {
    if (!dragging) { vel += (autoVel - vel) * 0.03; angle += vel; }
    render();
    requestAnimationFrame(tick);
  };
  tick();

  stage.addEventListener("pointerdown", e => {
    dragging = true; moved = 0; lastX = e.clientX; vel = 0;
    stage.classList.add("dragging"); stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    angle += dx * 0.35; vel = dx * 0.35;
  });
  const end = e => {
    if (!dragging) return;
    dragging = false; stage.classList.remove("dragging");
    // Treat a tiny drag as a click on the card under the pointer
    if (moved < 6) {
      const hit = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.classList.contains("ring-card"));
      if (hit) openProject(+hit.dataset.i, +hit.dataset.n);
    }
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("mouseenter", () => { autoVel = 0; });
  stage.addEventListener("mouseleave", () => { autoVel = reduceMotion ? 0 : -0.12; });
  // Keyboard: Enter on a focused card opens it
  ring.addEventListener("keydown", e => {
    const c = e.target.closest(".ring-card");
    if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openProject(+c.dataset.i, +c.dataset.n); }
  });
})();

// ---------- SHOWCASE STRIP (every design) ----------
(() => {
  const all = [];
  projects.forEach((p, i) => { for (let n = 1; n <= p.count; n++) all.push({ p, i, n }); });
  // Shuffle in a fixed way so projects mix nicely across both rows
  const mixed = all.map((x, k) => ({ x, key: (k * 37) % all.length })).sort((a, b) => a.key - b.key).map(o => o.x);
  const rows = [mixed.filter((_, k) => k % 2 === 0), mixed.filter((_, k) => k % 2 === 1)];
  ["track-1", "track-2"].forEach((id, r) => {
    const el = document.getElementById(id);
    const html = rows[r].map(({ p, i, n }) =>
      `<button class="m-item" data-i="${i}" data-n="${n}" style="aspect-ratio:${ratioOf(p, n)}" aria-label="Open ${p.title}, slide ${n}">
         <img src="${img(p, n, true)}" alt="" loading="lazy"><span>${p.title}</span></button>`).join("");
    el.innerHTML = html + html.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" '); // copy for seamless loop
    el.style.setProperty("--dur", `${rows[r].length * 4.2}s`);
    el.addEventListener("click", e => {
      const b = e.target.closest(".m-item"); if (b) openProject(+b.dataset.i, +b.dataset.n);
    });
  });
})();

// ---------- WALKING BUDDY ----------
(() => {
  const buddy = document.getElementById("buddy");
  if (reduceMotion || !matchMedia("(hover: hover) and (pointer: fine)").matches) { buddy.remove(); return; }
  const bubble = document.getElementById("buddy-bubble");
  const pupils = buddy.querySelector(".b-pupils");
  let mx = -100, my = -100, x = -100, y = -100, started = false, facing = 1;

  addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    if (!started) { x = mx; y = my; started = true; }
    buddy.classList.add("on");
  }, { passive: true });
  document.addEventListener("mouseleave", () => buddy.classList.remove("on"));

  // Speech bubbles for things under the mouse
  const lines = [
    [".card, .m-item, .ring-card", "Click to open!"],
    [".reel", "Tap for sound 🔊"],
    [".ig-card", "My Instagram work ✨"],
    [".page-card", "Visit the page →"],
    [".contact .btn, .nav-cta", "Let's work together!"],
    [".btn", "Let's go!"],
  ];
  let frame = 0, current = null;
  const checkHover = () => {
    const el = document.elementFromPoint(mx, my);
    const hit = el && lines.find(([sel]) => el.closest(sel));
    const text = hit ? hit[1] : null;
    if (text === current) return;
    current = text;
    if (text) bubble.textContent = text;
    bubble.classList.toggle("show", !!text);
    buddy.classList.toggle("happy", !!text);
  };

  const W = 50, H = 62; // drawn size of the buddy
  const tick = () => {
    // Stand just below-right of the cursor, so it never covers what you point at
    const tx = mx + 14, ty = my + 14;
    const dx = tx - x, dy = ty - y;
    const dist = Math.hypot(dx, dy);
    const speed = Math.min(dist * 0.09, 9);           // walk, don't teleport
    if (dist > 0.5) { x += (dx / dist) * speed; y += (dy / dist) * speed; }
    const walking = dist > 3;
    buddy.classList.toggle("walking", walking && !buddy.classList.contains("happy"));
    if (Math.abs(dx) > 4) facing = dx > 0 ? 1 : -1;
    buddy.classList.toggle("left", facing < 0);
    // Eyes look toward the cursor
    const ex = Math.max(-1.5, Math.min(1.5, (mx - x - W / 2) / 40));
    const ey = Math.max(-1.5, Math.min(1.5, (my - y - H / 2) / 40));
    pupils.style.transform = `translate(${ex * facing}px, ${ey}px)`;
    buddy.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (++frame % 8 === 0) checkHover();
    requestAnimationFrame(tick);
  };
  tick();
})();
