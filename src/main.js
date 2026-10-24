import gsap from "gsap";
import Lenis from "lenis";
import { weddingData } from "./data/wedding.js";
import { i18n, toKhmerDigits } from "./data/i18n.js";
import { renderDivider, renderNameLockup } from "./assets/ornaments.js";
import { createEnvelope } from "./envelope.js";
import { renderCover } from "./cover.js";
import { setMusicActive, getMusicActive, playWaterDropSound } from "./audio.js";

let currentLang = "km";
let lenis = null;

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Decorative Dividers
  const divElements = [
    "words-div",
    "couple-div",
    "prog-div",
    "story-div",
    "venue-div",
    "gift-div"
  ];
  divElements.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = renderDivider();
  });

  // 2. Render Finale Name Logo
  const finaleLogo = document.getElementById("finale-logo");
  if (finaleLogo) {
    finaleLogo.innerHTML = renderNameLockup(
      weddingData.couple.groom.shortKm,
      weddingData.couple.bride.shortKm,
      "lk-finale",
      true
    );
  }

  // 3. Render Programme Timeline
  renderProgramme();

  // 4. Render Love Story
  renderStory();

  // 5. Mount 3D Envelope
  const envMount = document.getElementById("env-mount");
  if (envMount) {
    createEnvelope(envMount, weddingData, onEnvelopeOpened);
  }

  // 6. Setup Audio & Language Toggles
  setupHudControls();

  // 7. Start Live Countdown
  startCountdown();

  // 8. Setup Interactive Pond Canvas
  setupPondCanvas();

  // 9. Setup Action Buttons (Calendar .ics, Copy Account, Share)
  setupActionButtons();

  // 10. Apply Guest Personalization from URL
  applyGuestPersonalization();

  // 11. Setup Visual Editor Modal
  setupEditorModal();

  // 12. Update Initial Translations
  updateTranslations();
});

// Callback when Envelope finishes opening
function onEnvelopeOpened() {
  document.body.classList.remove("is-locked");
  const hud = document.getElementById("hud");
  if (hud) hud.classList.add("is-visible");

  // Mount & Animate Cover
  const coverMount = document.getElementById("cover-mount");
  if (coverMount) {
    renderCover(coverMount, weddingData);
  }

  // Init Lenis smooth scroll on non-reduced motion devices
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Scroll detection for HUD background
  window.addEventListener("scroll", () => {
    if (hud) {
      if (window.scrollY > 80) {
        hud.classList.add("is-scrolled");
      } else {
        hud.classList.remove("is-scrolled");
      }
    }
  });
}

// Render Programme Timeline Items
function renderProgramme() {
  const container = document.getElementById("programme-list");
  if (!container) return;

  const prog = weddingData.programme[0];
  const itemsHtml = prog.rows.map((item, idx) => `
    <div class="programme-item" data-idx="${idx}">
      <div class="programme-node">${idx + 1}</div>
      <div class="programme-content">
        <div class="programme-time">
          <span>${item.t}</span>
          <span style="font-size:0.85em; opacity:0.85;">${currentLang === "km" ? item.pkm : item.pen}</span>
        </div>
        <div class="programme-desc">
          ${currentLang === "km" ? item.km : item.en}
        </div>
      </div>
    </div>
  `).join("");

  // Keep thread markup, append items
  const thread = container.querySelector(".programme-thread");
  container.innerHTML = "";
  if (thread) container.appendChild(thread);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = itemsHtml;
  while (wrapper.firstChild) {
    container.appendChild(wrapper.firstChild);
  }
}

// Render Story Strip
function renderStory() {
  const container = document.getElementById("story-strip");
  if (!container) return;

  container.innerHTML = weddingData.story.map((item) => `
    <div class="story-card">
      <div class="story-date">
        ${currentLang === "km" ? item.dateKm || "២០២៧" : item.dateEn || "2027"}
      </div>
      <h3 class="story-title">
        ${currentLang === "km" ? item.tKm : item.tEn}
      </h3>
      <p class="story-caption">
        ${currentLang === "km" ? item.captionKm : item.captionEn}
      </p>
    </div>
  `).join("");
}

// Live Countdown Timer
function startCountdown() {
  const targetDate = new Date(weddingData.date).getTime();

  function update() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      document.getElementById("c-days").textContent = currentLang === "km" ? "០" : "0";
      document.getElementById("c-hours").textContent = currentLang === "km" ? "០" : "0";
      document.getElementById("c-mins").textContent = currentLang === "km" ? "០" : "0";
      document.getElementById("c-secs").textContent = currentLang === "km" ? "០" : "0";
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const formatVal = (v) => currentLang === "km" ? toKhmerDigits(v) : String(v);

    const elD = document.getElementById("c-days");
    const elH = document.getElementById("c-hours");
    const elM = document.getElementById("c-mins");
    const elS = document.getElementById("c-secs");

    if (elD) elD.textContent = formatVal(d);
    if (elH) elH.textContent = formatVal(h);
    if (elM) elM.textContent = formatVal(m);
    if (elS) elS.textContent = formatVal(s);
  }

  update();
  setInterval(update, 1000);
}

// Interactive Water Ripple & Lotus Pond Canvas
function setupPondCanvas() {
  const card = document.getElementById("pond-card");
  const canvas = document.getElementById("pond-canvas");
  if (!card || !canvas) return;

  const ctx = canvas.getContext("2d");
  let ripples = [];
  let lotuses = [];

  function resize() {
    canvas.width = card.offsetWidth;
    canvas.height = card.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function addRipple(x, y) {
    ripples.push({ x, y, r: 5, maxR: Math.max(canvas.width, canvas.height) * 0.45, opacity: 0.85 });
    // Add floating lotus lantern
    lotuses.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.35 - Math.random() * 0.25,
      scale: 0.2,
      targetScale: 0.85 + Math.random() * 0.3,
      alpha: 0,
      glow: 0.9
    });
    playWaterDropSound();
  }

  card.addEventListener("pointerdown", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addRipple(x, y);
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.r += 2.5;
      rip.opacity *= 0.965;

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 241, 198, ${rip.opacity})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      if (rip.opacity < 0.01 || rip.r >= rip.maxR) {
        ripples.splice(i, 1);
      }
    }

    // Update floating lotuses
    for (let i = lotuses.length - 1; i >= 0; i--) {
      const lot = lotuses[i];
      lot.x += lot.vx;
      lot.y += lot.vy;
      lot.scale += (lot.targetScale - lot.scale) * 0.08;
      if (lot.alpha < 1) lot.alpha += 0.05;

      ctx.save();
      ctx.translate(lot.x, lot.y);
      ctx.scale(lot.scale, lot.scale);
      ctx.globalAlpha = lot.alpha;

      // Lotus candle glow
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 36);
      grad.addColorStop(0, "rgba(255, 220, 120, 0.95)");
      grad.addColorStop(0.4, "rgba(255, 160, 40, 0.45)");
      grad.addColorStop(1, "rgba(255, 120, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();

      // Golden candle flame
      ctx.fillStyle = "#fff5e0";
      ctx.beginPath();
      ctx.ellipse(0, -2, 3.5, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lotus petals
      ctx.strokeStyle = "rgba(217, 177, 90, 0.85)";
      ctx.lineWidth = 1.4;
      for (let p = 0; p < 8; p++) {
        const ang = (p / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(Math.cos(ang) * 11, Math.sin(ang) * 7 + 4, 4, 7, ang, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      if (lot.y < -50) {
        lotuses.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// Setup Top HUD Controls (Language & Music)
function setupHudControls() {
  const langBtn = document.getElementById("lang-toggle");
  const musicBtn = document.getElementById("music-toggle");

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      currentLang = currentLang === "km" ? "en" : "km";
      document.body.dataset.lang = currentLang;
      updateTranslations();
      renderProgramme();
      renderStory();
    });
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", async () => {
      const active = !getMusicActive();
      await setMusicActive(active, weddingData.music);
      musicBtn.classList.toggle("is-playing", active);
      musicBtn.setAttribute("aria-pressed", String(active));
    });
  }
}

// Translate all [data-t] elements
function updateTranslations() {
  const dict = i18n[currentLang] || i18n.km;
  document.querySelectorAll("[data-t]").forEach((el) => {
    const key = el.dataset.t;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  const langLabel = document.querySelector(".lang-label");
  if (langLabel) {
    langLabel.textContent = currentLang === "km" ? "ខ្មែរ / EN" : "EN / ខ្មែរ";
  }
}

// Action Buttons: Toast, Copy Account, Save Calendar .ics, Share
function setupActionButtons() {
  const khrBtn = document.getElementById("copy-khr-btn");
  if (khrBtn) {
    khrBtn.addEventListener("click", () => {
      const acc = weddingData.gift.accounts[0].khrAccount.replace(/\s+/g, "");
      navigator.clipboard.writeText(acc).then(() => {
        showToast(currentLang === "km" ? `បានចម្លងលេខគណនី KHR (${weddingData.gift.accounts[0].khrAccount})!` : `KHR account copied (${acc})!`);
      });
    });
  }

  const usdBtn = document.getElementById("copy-usd-btn");
  if (usdBtn) {
    usdBtn.addEventListener("click", () => {
      const acc = weddingData.gift.accounts[0].usdAccount.replace(/\s+/g, "");
      navigator.clipboard.writeText(acc).then(() => {
        showToast(currentLang === "km" ? `បានចម្លងលេខគណនី USD (${weddingData.gift.accounts[0].usdAccount})!` : `USD account copied (${acc})!`);
      });
    });
  }

  const icsBtn = document.getElementById("ics-btn");
  if (icsBtn) {
    icsBtn.addEventListener("click", downloadIcsFile);
  }

  // Social sharing links
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(
    currentLang === "km"
      ? "សិរីសួស្តីអាពាហ៍ពិពាហ៍ · ហុង សុគន្ធនរៈ & ឈុយ សុគន្ធមិនា"
      : "Wedding Invitation · Hong Sokunnorak & Chhuy Sokunminea"
  );

  const tgBtn = document.getElementById("share-tg");
  if (tgBtn) tgBtn.href = `https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`;

  const msBtn = document.getElementById("share-ms");
  if (msBtn) msBtn.href = `fb-messenger://share/?link=${shareUrl}`;

  const fbBtn = document.getElementById("share-fb");
  if (fbBtn) fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;

  const copyLinkBtn = document.getElementById("share-copy");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast(currentLang === "km" ? "បានចម្លងតំណភ្ជាប់ធៀបរួចរាល់!" : "Invitation link copied!");
      });
    });
  }
}

// --------------------------------------------------------------------------
// Guest Personalization via URL query params (?to=... or ?guest=...)
// --------------------------------------------------------------------------
let personalizedGuest = "";

function applyGuestPersonalization() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("to") || params.get("guest") || params.get("name") || params.get("n");

  if (raw) {
    try {
      personalizedGuest = decodeURIComponent(raw.replace(/\+/g, " ")).trim();
    } catch {
      personalizedGuest = raw.trim();
    }
  }

  const fallback = currentLang === "km" ? "ភ្ញៀវកិត្តិយសដ៏ខ្ពង់ខ្ពស់" : "Our Honoured Guests";
  const displayGuest = personalizedGuest || fallback;

  // 1. Envelope Gate
  const gateGuestEl = document.getElementById("guest-name-gate");
  if (gateGuestEl) {
    gateGuestEl.textContent = displayGuest;
  }

  // 2. Envelope Card
  const cardGuestEl = document.getElementById("card-guest-name");
  if (cardGuestEl) {
    cardGuestEl.textContent = displayGuest;
  }

  // 3. Words Chapter
  const wordsGuestEl = document.getElementById("guest-name-words");
  if (wordsGuestEl) {
    wordsGuestEl.textContent = displayGuest;
  }

  // 4. Update Document Title
  if (personalizedGuest) {
    document.title = `សិរីសួស្តីអាពាហ៍ពិពាហ៍ · ហុង សុគន្ធនរៈ & ឈុយ សុគន្ធមិនា (ជូនចំពោះ ${personalizedGuest})`;
  }
}

// --------------------------------------------------------------------------
// Visual Text Editor & Tweaks Modal
// --------------------------------------------------------------------------
function setupEditorModal() {
  const openBtn = document.getElementById("open-editor-btn");
  const params = new URLSearchParams(window.location.search);
  const autoOpen = params.get("edit") === "1" || params.get("editor") === "true";

  // Create Editor Modal DOM
  const modal = document.createElement("div");
  modal.id = "editor-modal";
  modal.className = "editor-modal";
  modal.innerHTML = `
    <div class="editor-backdrop"></div>
    <div class="editor-panel" role="dialog" aria-labelledby="editor-title">
      <div class="editor-header">
        <h3 id="editor-title">🛠️ កែសម្រួលអត្ថបទ & ព័ត៌មានធៀប (Live Editor)</h3>
        <button class="editor-close" type="button" aria-label="Close Editor">&times;</button>
      </div>
      <p class="editor-hint">
        អ្នកអាចសាកល្បងកែប្រែព័ត៌មានខាងក្រោមដើម្បីមើលការផ្លាស់ប្តូរផ្ទាល់លើអេក្រង់។ ដើម្បីរក្សាទុកជាអចិន្ត្រៃយ៍ សូមចុចប៊ូតុង "ចម្លងកូដ wedding.js" រួច Paste ចូលក្នុងឯកសារ <code>src/data/wedding.js</code>។
      </p>

      <form id="editor-form" class="editor-form">
        <div class="editor-section">
          <h4>👤 ព័ត៌មានកូនកំលោះ & កូនក្រមុំ</h4>
          <div class="ed-grid">
            <label>
              <span>ឈ្មោះកូនកំលោះ (ខ្មែរ)</span>
              <input type="text" id="ed-groom-km" value="${weddingData.couple.groom.km}" />
            </label>
            <label>
              <span>Groom Name (English)</span>
              <input type="text" id="ed-groom-en" value="${weddingData.couple.groom.en}" />
            </label>
            <label>
              <span>ឈ្មោះកូនក្រមុំ (ខ្មែរ)</span>
              <input type="text" id="ed-bride-km" value="${weddingData.couple.bride.km}" />
            </label>
            <label>
              <span>Bride Name (English)</span>
              <input type="text" id="ed-bride-en" value="${weddingData.couple.bride.en}" />
            </label>
          </div>
        </div>

        <div class="editor-section">
          <h4>👨‍👩‍👧‍👦 មាតាបិតាទាំងសងខាង</h4>
          <div class="ed-grid">
            <label>
              <span>ឪពុកកូនកំលោះ</span>
              <input type="text" id="ed-gf" value="${weddingData.families.groom.father.km}" />
            </label>
            <label>
              <span>ម្តាយកូនកំលោះ</span>
              <input type="text" id="ed-gm" value="${weddingData.families.groom.mother.km}" />
            </label>
            <label>
              <span>ឪពុកកូនក្រមុំ</span>
              <input type="text" id="ed-bf" value="${weddingData.families.bride.father.km}" />
            </label>
            <label>
              <span>ម្តាយកូនក្រមុំ</span>
              <input type="text" id="ed-bm" value="${weddingData.families.bride.mother.km}" />
            </label>
          </div>
        </div>

        <div class="editor-section">
          <h4>📅 កាលបរិច្ឆេទ & ទីតាំង</h4>
          <div class="ed-grid">
            <label style="grid-column: 1 / -1;">
              <span>កាលបរិច្ឆេទពុទ្ធសករាជ (Lunar)</span>
              <input type="text" id="ed-lunar" value="${weddingData.lunar.km}" />
            </label>
            <label>
              <span>កាលបរិច្ឆេទសូរិយគតិ (Solar)</span>
              <input type="text" id="ed-solar" value="${weddingData.solarDate.km}" />
            </label>
            <label>
              <span>ឈ្មោះទីតាំង / អាគារ</span>
              <input type="text" id="ed-venue" value="${weddingData.venue.name.km}" />
            </label>
          </div>
        </div>

        <div class="editor-section">
          <h4>💳 គណនី ABA KHQR</h4>
          <div class="ed-grid">
            <label>
              <span>ឈ្មោះម្ចាស់គណនី</span>
              <input type="text" id="ed-acc-name" value="${weddingData.gift.accounts[0].name}" />
            </label>
            <label>
              <span>លេខគណនី KHR (៛)</span>
              <input type="text" id="ed-khr" value="${weddingData.gift.accounts[0].khrAccount}" />
            </label>
            <label>
              <span>លេខគណនី USD ($)</span>
              <input type="text" id="ed-usd" value="${weddingData.gift.accounts[0].usdAccount}" />
            </label>
          </div>
        </div>

        <div class="editor-actions">
          <button type="submit" class="btn btn--primary">
            ✨ មើលការផ្លាស់ប្តូរភ្លាមៗ (Apply Live)
          </button>
          <button type="button" id="copy-config-btn" class="btn btn--secondary">
            📋 ចម្លងកូដ wedding.js (Copy Config)
          </button>
          <a href="/guest-links.html" class="btn btn--secondary" target="_blank">
            📑 បើកទំព័រគ្រប់គ្រងបញ្ជីភ្ញៀវ (Guest Links)
          </a>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const toggleModal = (show) => {
    modal.classList.toggle("is-open", show);
  };

  window.toggleEditorPanel = () => toggleModal(true);

  if (openBtn) openBtn.addEventListener("click", () => toggleModal(true));
  modal.querySelector(".editor-close").addEventListener("click", () => toggleModal(false));
  modal.querySelector(".editor-backdrop").addEventListener("click", () => toggleModal(false));

  if (autoOpen) toggleModal(true);

  // Handle Form Submit
  const form = document.getElementById("editor-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    weddingData.couple.groom.km = document.getElementById("ed-groom-km").value;
    weddingData.couple.groom.en = document.getElementById("ed-groom-en").value;
    weddingData.couple.bride.km = document.getElementById("ed-bride-km").value;
    weddingData.couple.bride.en = document.getElementById("ed-bride-en").value;

    weddingData.families.groom.father.km = document.getElementById("ed-gf").value;
    weddingData.families.groom.mother.km = document.getElementById("ed-gm").value;
    weddingData.families.bride.father.km = document.getElementById("ed-bf").value;
    weddingData.families.bride.mother.km = document.getElementById("ed-bm").value;

    weddingData.lunar.km = document.getElementById("ed-lunar").value;
    weddingData.solarDate.km = document.getElementById("ed-solar").value;
    weddingData.venue.name.km = document.getElementById("ed-venue").value;

    weddingData.gift.accounts[0].name = document.getElementById("ed-acc-name").value;
    weddingData.gift.accounts[0].khrAccount = document.getElementById("ed-khr").value;
    weddingData.gift.accounts[0].usdAccount = document.getElementById("ed-usd").value;

    // Refresh views
    updateTranslations();
    renderCover(document.getElementById("cover-mount"), weddingData);
    showToast("បានអនុវត្តការកែប្រែដោយជោគជ័យ!");
    toggleModal(false);
  });

  // Handle Copy Config Button
  const copyConfigBtn = document.getElementById("copy-config-btn");
  if (copyConfigBtn) {
    copyConfigBtn.addEventListener("click", () => {
      const code = `export const weddingData = ${JSON.stringify(weddingData, null, 2)};\n`;
      navigator.clipboard.writeText(code).then(() => {
        showToast("បានចម្លងកូដរួចរាល់! សូម Paste ចូលក្នុង src/data/wedding.js");
      });
    });
  }
}

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

// Save to Calendar .ics generator
function downloadIcsFile() {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Khmer Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "SUMMARY:អាពាហ៍ពិពាហ៍ ហុង សុគន្ធនរៈ & ឈុយ សុគន្ធមិនា (Wedding of Hong Sokunnorak & Chhuy Sokunminea)",
    "DESCRIPTION:សូមគោរពអញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍ ហុង សុគន្ធនរៈ & ឈុយ សុគន្ធមិនា",
    `LOCATION:${weddingData.venue.name.km} (${weddingData.venue.name.en})`,
    "DTSTART:20270317T063000",
    "DTEND:20270317T210000",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "Wedding-Hong-Sokunnorak-Chhuy-Sokunminea.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(currentLang === "km" ? "បានទាញយកកាលវិភាគប្រតិទិន (.ics)!" : "Calendar invitation downloaded!");
}
