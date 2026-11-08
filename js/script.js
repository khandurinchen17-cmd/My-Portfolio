const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Footer year
$("#year").textContent = new Date().getFullYear();

// Mobile nav
const navToggle = $("#nav-toggle"), navLinks = $("#nav-links");
navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});
$$("a", navLinks).forEach((a) => a.addEventListener("click", () => {
  navLinks.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}));

// Scroll-spy
const navAnchors = $$("#nav-links a[data-nav]");
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((s) => spy.observe(s));

// "Hop counter": scroll progress bar styled as a signal line
const bar = document.createElement("div");
bar.className = "hop-bar";
bar.innerHTML = '<span class="hop-fill"></span><span class="hop-label">hop 1/5</span>';
$("#nav").appendChild(bar);
const hopFill = $(".hop-fill", bar), hopLabel = $(".hop-label", bar);
const hopIds = ["about", "skills", "projects", "education", "contact"];
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  hopFill.style.transform = `scaleX(${p})`;
  const hop = Math.min(hopIds.length, Math.floor(p * hopIds.length) + 1);
  hopLabel.textContent = `hop ${hop}/${hopIds.length}`;
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Typed terminal line (multiple phrases)
const typedEl = $("#typed");
const phrases = ["WELCOME TO MY PROFILE"];
if (reduceMotion) {
  typedEl.textContent = phrases[0];
} else {
  let p = 0, c = 0, del = false;
  (function step() {
    const phrase = phrases[p];
    c += del ? -1 : 1;
    typedEl.textContent = phrase.slice(0, c);
    let d = del ? 30 : 65;
    if (!del && c === phrase.length) { d = 1600; del = true; }
    else if (del && c === 0) { del = false; p = (p + 1) % phrases.length; d = 350; }
    setTimeout(step, d);
  })();
}

// Hero network: nodes, links, and packets that travel along them.
// The pointer acts as a node, so the network reaches toward the visitor.
const canvas = $("#node-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };
  let nodes = [], packets = [], links = [], raf;

  const size = () => {
    const h = canvas.parentElement;
    canvas.width = h.clientWidth * dpr; canvas.height = h.clientHeight * dpr;
    canvas.style.width = h.clientWidth + "px"; canvas.style.height = h.clientHeight + "px";
  };
  const make = () => {
    const n = Math.max(18, Math.min(Math.round(canvas.width * canvas.height / (26000 * dpr * dpr)), 46));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.18 * dpr, vy: (Math.random() - 0.5) * 0.18 * dpr,
      r: (Math.random() * 1.4 + 1.2) * dpr, pulse: 0,
    }));
    packets = [];
  };
  const linkDist = () => 150 * dpr;

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    links = [];
    const L = linkDist();
    nodes.forEach((a, i) => {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > canvas.width) a.vx *= -1;
      if (a.y < 0 || a.y > canvas.height) a.vy *= -1;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < L) {
          links.push([a, b]);
          ctx.strokeStyle = `rgba(39,166,164,${0.22 * (1 - d / L)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x * dpr, a.y - mouse.y * dpr);
      if (md < L * 1.3) {
        ctx.strokeStyle = `rgba(226,165,61,${0.45 * (1 - md / (L * 1.3))})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x * dpr, mouse.y * dpr); ctx.stroke();
      }
    });

    // spawn a packet on a random link
    if (!reduceMotion && links.length && packets.length < 8 && Math.random() < 0.04) {
      const [a, b] = links[(Math.random() * links.length) | 0];
      packets.push({ a, b, t: 0, speed: 0.012 + Math.random() * 0.012 });
    }
    packets = packets.filter((k) => {
      k.t += k.speed;
      if (k.t >= 1) { k.b.pulse = 1; return false; }
      const x = k.a.x + (k.b.x - k.a.x) * k.t, y = k.a.y + (k.b.y - k.a.y) * k.t;
      ctx.fillStyle = "#27A6A4";
      ctx.shadowColor = "#27A6A4"; ctx.shadowBlur = 10 * dpr;
      ctx.fillRect(x - 2 * dpr, y - 2 * dpr, 4 * dpr, 4 * dpr);
      ctx.shadowBlur = 0;
      return true;
    });

    // nodes flash when a packet arrives
    nodes.forEach((n) => {
      ctx.fillStyle = "rgba(226,165,61,0.55)";
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill();
      if (n.pulse > 0) {
        ctx.strokeStyle = `rgba(226,165,61,${n.pulse * 0.7})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (1 - n.pulse) * 16 * dpr, 0, 7); ctx.stroke();
        n.pulse -= 0.03;
      }
    });
    if (!reduceMotion) raf = requestAnimationFrame(frame);
  }
  const init = () => { cancelAnimationFrame(raf); size(); make(); frame(); };
  init();
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(init, 200); });
  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
}

// Count-up for numeric facts (e.g. "3+")
const countObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    countObs.unobserve(e.target);
    const m = e.target.textContent.match(/^(\d+)(.*)$/);
    if (!m || reduceMotion) return;
    const end = +m[1], suffix = m[2], t0 = performance.now();
    (function tick(t) {
      const k = Math.min((t - t0) / 900, 1);
      e.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  });
});
$$(".fact-value").forEach((el) => countObs.observe(el));

// Project filter (with a short pop-in on the cards that appear)
const filterButtons = $$(".filter-btn"), cards = $$(".project-card");
filterButtons.forEach((btn) => btn.addEventListener("click", () => {
  filterButtons.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
  btn.classList.add("is-active"); btn.setAttribute("aria-selected", "true");
  const f = btn.dataset.filter;
  cards.forEach((card) => {
    const show = f === "all" || card.dataset.tags.split(" ").includes(f);
    card.hidden = !show;
    if (show) { card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop"); }
  });
}));

// 3D tilt on project cards (responds to the pointer)
if (!reduceMotion && matchMedia("(hover: hover)").matches) {
  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-3px)`;
      card.style.setProperty("--mx", (x + 0.5) * 100 + "%");
      card.style.setProperty("--my", (y + 0.5) * 100 + "%");
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// Copy email
const copyBtn = $("#copy-email"), copyFeedback = $("#copy-feedback");
if (copyBtn && copyFeedback) {
  const originalCopyText = copyFeedback.textContent;
  copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(EMAIL); copyFeedback.textContent = "Copied!"; }
    catch { copyFeedback.textContent = EMAIL; }
    setTimeout(() => { copyFeedback.textContent = originalCopyText; }, 1800);
  });
}

// upgrade.js — load AFTER js/script.js
(() => {
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const icon = (d) =>
    `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    net: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v5M12 12l-6 5M12 12l6 5"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    term: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 10l3 2-3 2M13 15h4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    git: '<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 8v8M18 11c0 4-6 3-12 5"/>',
    cap: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  };

  // Icons
  const skillIcons = [I.net, I.code, I.shield, I.term];
  $$(".skill-group h3").forEach((h, i) => h.insertAdjacentHTML("afterbegin", icon(skillIcons[i % 4])));
  $$(".contact-row .contact-label").forEach((l, i) => l.insertAdjacentHTML("afterbegin", icon(i ? I.git : I.mail)));
  $$(".timeline-body h3").forEach((h) => h.insertAdjacentHTML("afterbegin", icon(I.cap)));

  // Scroll reveal
  if (!rm && "IntersectionObserver" in window) {
    const targets = $$(".section-title, .about-text, .skill-group, .project-card, .timeline-item, .contact-row, .contact-form");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.classList.add("in");
        setTimeout(() => e.target.classList.remove("reveal", "in"), 1200);
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.matches(".skill-group, .project-card, .timeline-item, .contact-row, .about-text"));
      el.style.setProperty("--d", Math.min(sibs.indexOf(el), 4) * 0.1 + "s");
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // Back to top
  const top = document.createElement("button");
  top.className = "to-top";
  top.setAttribute("aria-label", "Back to top");
  top.innerHTML = icon(I.up);
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: rm ? "auto" : "smooth" }));
  document.body.appendChild(top);
  addEventListener("scroll", () => top.classList.toggle("show", scrollY > 600), { passive: true });
})();

// about.js — load AFTER script.js
(() => {
  const term = document.querySelector(".term");
  if (!term) return;
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (rm || !("IntersectionObserver" in window)) { term.classList.add("is-live"); return; }
  const io = new IntersectionObserver((e) => {
    if (e[0].isIntersecting) { term.classList.add("is-live"); io.disconnect(); }
  }, { threshold: 0.35 });
  io.observe(term);
})();