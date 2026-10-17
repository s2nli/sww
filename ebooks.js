/* CODEX STUDYS E-Books: Project Gutenberg library via the Gutendex API (https://gutendex.com/books).
   Self-contained overlay page. Only links returned by the API are shown. Nothing else on the site is touched. */
(() => {
const API = "https://gutendex.com/books";
const API_ORIGIN = "https://gutendex.com";
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const LANGS = [["", "All languages"], ["en", "English"], ["hi", "Hindi"], ["sa", "Sanskrit"], ["bn", "Bengali"], ["ur", "Urdu"], ["ta", "Tamil"], ["fr", "French"], ["de", "German"], ["es", "Spanish"], ["it", "Italian"], ["pt", "Portuguese"], ["la", "Latin"], ["zh", "Chinese"]];
const LANG_NAME = {}; LANGS.forEach((l) => { if (l[0]) LANG_NAME[l[0]] = l[1]; });

const css = `#cxEb{position:fixed;inset:0;z-index:119;background:var(--bg,#080a0f);color:var(--text,#f4f6fb);overflow-y:auto;display:none;padding:0 0 100px;-webkit-overflow-scrolling:touch;font-family:"DM Sans",system-ui,sans-serif}#cxEb.open{display:block}
#cxEb *{box-sizing:border-box}.eb-wrap{width:min(100% - 24px,1100px);margin:0 auto}
.eb-top{position:sticky;top:0;z-index:3;background:rgba(8,10,15,.9);background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(14px);padding:12px 0;border-bottom:1px solid var(--line)}
.eb-row{display:flex;align-items:center;gap:12px}.eb-title{font:700 18px "Space Grotesk",sans-serif;letter-spacing:-.01em}.eb-title span{color:var(--brand-bright)}
.eb-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 14px;border:1px solid var(--line-strong);border-radius:11px;background:rgba(255,255,255,.045);color:var(--muted-bright);font:600 12px "DM Sans",sans-serif;cursor:pointer;text-decoration:none;transition:.2s}
.eb-btn:hover{color:var(--text);background:rgba(255,255,255,.09)}.eb-btn:disabled{opacity:.4;cursor:not-allowed}
.eb-btn.pri{color:#fff;border-color:transparent;background:linear-gradient(135deg,#9487ff,#6c5bed);box-shadow:0 8px 20px rgba(109,91,237,.24)}
.eb-controls{display:flex;gap:10px;margin:18px 0 12px;flex-wrap:wrap}
.eb-search{flex:1;min-width:200px;display:flex;align-items:center;gap:10px;padding:4px 6px 4px 13px;border:1px solid var(--line-strong);border-radius:12px;background:rgba(255,255,255,.045)}
.eb-search svg{width:17px;height:17px;color:var(--muted);flex:none}.eb-search input{flex:1;min-width:0;padding:11px 0;outline:0;border:0;color:var(--text);background:transparent;font:inherit;font-size:14px}
.eb-search input::placeholder{color:var(--muted)}.eb-search:focus-within{border-color:var(--brand-bright)}
.eb-select{padding:10px 12px;border:1px solid var(--line-strong);border-radius:12px;background:var(--panel-solid,#11151f);color:var(--muted-bright);font:600 12px "DM Sans",sans-serif;cursor:pointer;min-width:150px}.eb-select:focus{outline:0;border-color:var(--brand-bright)}
.eb-note{margin:0 0 16px;color:var(--muted);font-size:11px;line-height:1.55}.eb-note a{color:var(--brand-bright);font-weight:700}
.eb-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}
.eb-card{min-width:0;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line);border-radius:16px;background:var(--panel);transition:transform .3s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s;animation:ebIn .38s cubic-bezier(.16,1,.3,1) both}
.eb-card:hover{transform:translateY(-4px);border-color:rgba(166,156,255,.42);box-shadow:0 18px 36px rgba(0,0,0,.25)}
@keyframes ebIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.eb-cover{position:relative;aspect-ratio:3/4;overflow:hidden;background:linear-gradient(135deg,#28234b,#152b31)}
.eb-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s}.eb-cover img.ok{opacity:1}
.eb-fb{position:absolute;inset:0;display:grid;place-items:center;color:rgba(255,255,255,.74);font:700 38px "Space Grotesk",sans-serif}
.eb-body{display:flex;flex-direction:column;gap:6px;padding:12px 14px 14px;flex:1}
.eb-name{margin:0;font:700 14px/1.3 "Space Grotesk",sans-serif;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.eb-author{margin:0;color:var(--muted-bright);font-size:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.eb-lang{align-self:flex-start;padding:3px 8px;border-radius:999px;color:#d8d3ff;background:rgba(139,124,255,.16);font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.eb-acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto;padding-top:8px}.eb-acts .eb-btn{padding:7px 10px;font-size:11px;flex:1 1 auto;min-width:0}
.eb-state{grid-column:1/-1;padding:45px 20px;border:1px dashed var(--line-strong);border-radius:16px;color:var(--muted);text-align:center;font-size:14px}
.eb-state .eb-btn{margin-top:14px}.eb-spin{width:30px;height:30px;margin:0 auto 12px;border:3px solid rgba(255,255,255,.12);border-top-color:var(--brand-bright);border-radius:50%;animation:ebSp .8s linear infinite}
@keyframes ebSp{to{transform:rotate(360deg)}}
.eb-pager{display:flex;align-items:center;justify-content:center;gap:12px;margin:24px 0 6px;flex-wrap:wrap}.eb-pager .info{color:var(--muted);font-size:12px}
#cxEbRd{position:fixed;inset:0;z-index:124;display:none;flex-direction:column;background:var(--bg,#080a0f)}#cxEbRd.open{display:flex}
#cxEbRd .rd-bar{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);background:var(--panel-solid,#11151f)}
#cxEbRd .rd-t{flex:1;min-width:0;font:700 13px "Space Grotesk",sans-serif;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cxEbRd .rd-hint{padding:6px 12px;color:var(--muted);font-size:11px;background:var(--bg-raised,#0d1017);border-bottom:1px solid var(--line)}
#cxEbRd iframe{flex:1;width:100%;border:0;background:#fff}
@media(max-width:1000px){.eb-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:700px){.eb-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.eb-select{flex:1}.eb-body{padding:10px 11px 12px}.eb-name{font-size:13px}}`;
const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

const root = document.createElement("div"); root.id = "cxEb"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "E-Books");
root.innerHTML = `<div class="eb-top"><div class="eb-wrap eb-row"><button class="eb-btn" id="ebClose" type="button">← Back</button><div class="eb-title">E-<span>Books</span></div></div></div>
<div class="eb-wrap">
  <div class="eb-controls">
    <div class="eb-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input id="ebQ" type="search" placeholder="Search by title or author…" autocomplete="off" aria-label="Search e-books by title or author"></div>
    <select id="ebLang" class="eb-select" aria-label="Filter by language">${LANGS.map((l) => `<option value="${l[0]}">${l[1]}</option>`).join("")}</select>
  </div>
  <p class="eb-note">Free e-books from <a href="https://www.gutenberg.org/" target="_blank" rel="noopener noreferrer">Project Gutenberg</a>. Copyright status can differ from country to country — please check the rules in your own country before downloading or sharing.</p>
  <div class="eb-grid" id="ebGrid" aria-live="polite"></div>
  <div class="eb-pager" id="ebPager" style="display:none"></div>
</div>`;
document.body.appendChild(root);

const rd = document.createElement("div"); rd.id = "cxEbRd"; rd.setAttribute("role", "dialog"); rd.setAttribute("aria-label", "E-book reader");
rd.innerHTML = `<div class="rd-bar"><button class="eb-btn" id="rdClose" type="button">← Library</button><div class="rd-t" id="rdT"></div><a class="eb-btn" id="rdOpen" target="_blank" rel="noopener noreferrer">Open in new tab ↗</a></div><div class="rd-hint">Reading inside the app. If the page does not appear, use “Open in new tab”.</div><iframe id="rdFrame" title="E-book reader" referrerpolicy="no-referrer" sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"></iframe>`;
document.body.appendChild(rd);

const grid = $("#ebGrid", root), pager = $("#ebPager", root), qEl = $("#ebQ", root), langEl = $("#ebLang", root);
let ctl = null, timer = null, page = 1, nextUrl = null, prevUrl = null, total = 0, lastUrl = "", started = false;

const safeUrl = (u) => { try { const x = new URL(u); return (x.protocol === "https:" || x.protocol === "http:") ? x.href : ""; } catch (e) { return ""; } };
const nameFix = (n) => { n = String(n || "").trim(); const p = n.split(","); return p.length === 2 ? (p[1].trim() + " " + p[0].trim()).trim() : n; };
const initials = (t) => (String(t).match(/[A-Za-z0-9\u0900-\u097F]/g) || ["B"]).slice(0, 2).join("").toUpperCase();

function linksOf(book) {
  const f = (book && book.formats) || {}, out = [], seen = new Set();
  const find = (test) => { const k = Object.keys(f).find((m) => test(m.toLowerCase()) && safeUrl(f[m])); return k ? safeUrl(f[k]) : ""; };
  const add = (label, url, kind) => { if (url && !seen.has(url)) { seen.add(url); out.push({ label, url, kind }); } };
  add("Read", find((m) => m.startsWith("text/html")), "read");
  add("EPUB", find((m) => m.startsWith("application/epub")), "dl");
  add("Kindle", find((m) => m.startsWith("application/x-mobipocket")), "dl");
  add("PDF", find((m) => m.startsWith("application/pdf")), "dl");
  add("Text", find((m) => m.startsWith("text/plain")), "dl");
  return out;
}

function card(b, i) {
  const title = b.title || "Untitled";
  const authors = (b.authors || []).map((a) => nameFix(a.name)).filter(Boolean).join(", ");
  const langs = (b.languages || []).map((l) => LANG_NAME[l] || String(l).toUpperCase());
  const cover = safeUrl((b.formats || {})["image/jpeg"]);
  const links = linksOf(b);
  const acts = links.map((l) => l.kind === "read"
    ? `<button type="button" class="eb-btn pri" data-read="${esc(l.url)}" data-title="${esc(title)}">Read</button>`
    : `<a class="eb-btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" download>${esc(l.label)}</a>`).join("");
  return `<article class="eb-card" style="animation-delay:${Math.min(i, 11) * 30}ms">
    <div class="eb-cover"><div class="eb-fb">${esc(initials(title))}</div>${cover ? `<img src="${esc(cover)}" alt="Cover of ${esc(title)}" loading="lazy" referrerpolicy="no-referrer" onload="this.classList.add('ok')" onerror="this.remove()">` : ""}</div>
    <div class="eb-body"><h3 class="eb-name">${esc(title)}</h3>${authors ? `<p class="eb-author">${esc(authors)}</p>` : ""}${langs.length ? `<span class="eb-lang">${esc(langs.join(" · "))}</span>` : ""}${acts ? `<div class="eb-acts">${acts}</div>` : ""}</div></article>`;
}

function showLoading() { grid.innerHTML = '<div class="eb-state"><div class="eb-spin"></div>Loading e-books…</div>'; pager.style.display = "none"; }
function showError() { grid.innerHTML = '<div class="eb-state">Could not load e-books. Please check your internet connection and try again.<br><button type="button" class="eb-btn pri" id="ebRetry">Try again</button></div>'; pager.style.display = "none"; }

function buildUrl() {
  const p = new URLSearchParams(); const q = qEl.value.trim(), l = langEl.value;
  if (q) p.set("search", q); if (l) p.set("languages", l);
  const s = p.toString(); return s ? `${API}?${s}` : API;
}

async function load(url, pg) {
  if (ctl) ctl.abort(); ctl = new AbortController(); const my = ctl;
  lastUrl = url; showLoading();
  try {
    const r = await fetch(url, { signal: my.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    if (my !== ctl) return;
    const list = Array.isArray(d.results) ? d.results : [];
    page = pg; total = d.count || 0;
    const ok = (u) => { try { return new URL(u).origin === API_ORIGIN ? u : null; } catch (e) { return null; } };
    nextUrl = d.next ? ok(d.next) : null; prevUrl = d.previous ? ok(d.previous) : null;
    if (!list.length) { grid.innerHTML = '<div class="eb-state">No e-books found. Try a different title, author or language.</div>'; pager.style.display = "none"; return; }
    grid.innerHTML = list.map(card).join("");
    pager.innerHTML = `<button type="button" class="eb-btn" id="ebPrev" ${prevUrl ? "" : "disabled"}>← Previous</button><span class="info">Page ${page} · ${total.toLocaleString()} books</span><button type="button" class="eb-btn pri" id="ebNext" ${nextUrl ? "" : "disabled"}>Next →</button>`;
    pager.style.display = "flex";
  } catch (e) { if (e && e.name === "AbortError") return; if (my === ctl) showError(); }
}

const search = () => load(buildUrl(), 1);
qEl.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(search, 450); });
qEl.addEventListener("keydown", (e) => { if (e.key === "Enter") { clearTimeout(timer); search(); } });
langEl.addEventListener("change", search);
root.addEventListener("click", (e) => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "ebClose") return close();
  if (t.id === "ebRetry") return load(lastUrl || buildUrl(), page);
  if (t.id === "ebNext" && nextUrl) { load(nextUrl, page + 1); root.scrollTo({ top: 0, behavior: "smooth" }); return; }
  if (t.id === "ebPrev" && prevUrl) { load(prevUrl, Math.max(1, page - 1)); root.scrollTo({ top: 0, behavior: "smooth" }); return; }
  if (t.dataset.read) openReader(t.dataset.read, t.dataset.title);
});

function openReader(url, title) {
  $("#rdT", rd).textContent = title || "E-book"; $("#rdOpen", rd).href = url;
  $("#rdFrame", rd).src = url; rd.classList.add("open");
}
function closeReader() { rd.classList.remove("open"); $("#rdFrame", rd).src = "about:blank"; }
rd.addEventListener("click", (e) => { if (e.target.closest("#rdClose")) closeReader(); });

function setNav(on) {
  document.body.classList.toggle("cx-eb-open", on);
  const l = document.querySelector('#navLinks a[href="#ebooks"]'); if (l) l.classList.toggle("active", on);
  try { window.CXProfile && window.CXProfile.navUpdate && window.CXProfile.navUpdate(); } catch (e) {}
}
function open() {
  try { window.CXProfile && window.CXProfile.close && window.CXProfile.close(); } catch (e) {}
  root.classList.add("open"); document.body.style.overflow = "hidden"; setNav(true);
  try { history.replaceState(null, "", "#ebooks"); } catch (e) {}
  if (!started) { started = true; load(buildUrl(), 1); }
}
function close() {
  closeReader(); root.classList.remove("open"); document.body.style.overflow = ""; setNav(false);
  if (location.hash === "#ebooks") { try { history.replaceState(null, "", "#home"); } catch (e) {} }
}
window.addEventListener("keydown", (e) => { if (e.key !== "Escape") return; if (rd.classList.contains("open")) closeReader(); else if (root.classList.contains("open")) close(); });
window.addEventListener("hashchange", () => { if (location.hash === "#ebooks") open(); });

/* Top navigation link (added next to the existing links) */
const navL = document.getElementById("navLinks");
if (navL && !navL.querySelector('a[href="#ebooks"]')) {
  const a = document.createElement("a"); a.className = "nav-link"; a.href = "#ebooks"; a.textContent = "E-Books";
  a.addEventListener("click", (e) => { e.preventDefault(); navL.classList.remove("open"); const mb = document.getElementById("menuBtn"); if (mb) mb.setAttribute("aria-expanded", "false"); open(); });
  const pl = navL.querySelector('a[href="#profile"]'); navL.insertBefore(a, pl || null);
}

window.CXEbooks = { open, close, isOpen: () => root.classList.contains("open") };
if (location.hash === "#ebooks") open();
})();
