"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Theme (remembered, falls back to system preference) */
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
root.dataset.theme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
$("[data-theme-toggle]").addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

/* Mobile menu */
const nav = $("[data-nav]");
$("[data-menu]").addEventListener("click", () => nav.classList.toggle("open"));
nav.addEventListener("click", e => { if (e.target.closest("a")) nav.classList.remove("open"); });

/* Scroll progress */
const bar = $("[data-progress]");
addEventListener("scroll", () => {
  const h = root.scrollHeight - innerHeight;
  bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
}, { passive: true });

/* Scrollspy */
const links = $$("a", nav);
const spy = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => spy.observe(s));

/* Reveal on scroll + counters */
function count(el) {
  const target = +el.dataset.count, suffix = el.dataset.suffix || "";
  if (reduced) { el.textContent = target.toLocaleString() + suffix; return; }
  const t0 = performance.now(), dur = 1400;
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in");
    $$("[data-count]", en.target).forEach(count);
    io.unobserve(en.target);
  });
}, { threshold: .15 });
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });

/* Typewriter */
const phrases = ["scale to 45,000 people.", "automate the boring work.", "blend AI with real operations.", "people actually enjoy using."];
const typeEl = $("[data-type]");
if (reduced) typeEl.textContent = phrases[0];
else {
  let p = 0, c = 0, del = false;
  (function loop() {
    const word = phrases[p];
    typeEl.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(loop, 1700); }
    if (del && c === 0) { del = false; p = (p + 1) % phrases.length; }
    c += del ? -1 : 1;
    setTimeout(loop, del ? 28 : 55);
  })();
}

/* Card spotlight */
$$(".card").forEach(card => card.addEventListener("pointermove", e => {
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", e.clientX - r.left + "px");
  card.style.setProperty("--my", e.clientY - r.top + "px");
}));

/* Copy email */
$$("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
  const label = $("span", btn), old = label.textContent;
  try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = "Copied!"; }
  catch (e) { label.textContent = btn.dataset.copy; }
  setTimeout(() => (label.textContent = old), 1800);
}));

$("[data-year]").textContent = new Date().getFullYear();
