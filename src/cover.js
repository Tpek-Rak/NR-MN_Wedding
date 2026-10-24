import gsap from "gsap";
import { renderCorner, renderCrest, renderNameLockup } from "./assets/ornaments.js";

export const renderCover = (containerEl, weddingData) => {
  const groomKm = weddingData.couple.groom.km;
  const brideKm = weddingData.couple.bride.km;
  const groomShort = weddingData.couple.groom.shortKm;
  const brideShort = weddingData.couple.bride.shortKm;
  const groomEn = weddingData.couple.groom.en;
  const brideEn = weddingData.couple.bride.en;

  containerEl.innerHTML = `
    <!-- Full-screen Hero Cover Merged -->
    <div class="cover" id="cover">
      <!-- Background Picture -->
      <picture class="cover__bg" aria-hidden="true">
        <source media="(max-aspect-ratio: 1/1)" srcset="/img/hero-m-640.webp 640w, /img/hero-m-1280.webp 1280w" sizes="100vw" />
        <img src="/img/hero-1280.webp" srcset="/img/hero-1280.webp 1280w" sizes="100vw" alt="${groomKm} & ${brideKm}" />
      </picture>
      <div class="cover__shade" aria-hidden="true"></div>

      <!-- Corner Ornaments (Mirrored internally inside SVG <g>) -->
      <div class="cover__corners" aria-hidden="true">
        ${renderCorner('tl')}
        ${renderCorner('tr')}
        ${renderCorner('bl')}
        ${renderCorner('br')}
      </div>

      <!-- Cover Content (Fits 1 screen on desktop) -->
      <div class="cover__stage">
        <!-- Top Ceremonial Crest -->
        <div class="cover__crest" aria-hidden="true">
          ${renderCrest()}
        </div>

        <!-- Kicker Heading -->
        <div class="cover__kicker foil" data-t="kicker">
          សិរីសួស្តីអាពាហ៍ពិពាហ៍
        </div>

        <!-- Animated Name Logo Lockup -->
        <div class="cover__logo">
          ${renderNameLockup(groomShort, brideShort, "lk-hero", false)}
        </div>

        <!-- English Names -->
        <div class="cover__latin">
          <span>${groomEn}</span>
          <span class="cover__amp">&amp;</span>
          <span>${brideEn}</span>
        </div>

        <!-- Invitation Tagline -->
        <div class="cover__invite-badge">
          <span data-t="inviteTo">សូមគោរពអញ្ជើញ</span>
        </div>

        <!-- Date Row (Day | Date | Month | Year) -->
        <div class="cover__date-grid">
          <div class="cdg-item">
            <span class="cdg-label" data-t="dayLabel">ថ្ងៃ</span>
            <span class="cdg-val">ពុធ</span>
          </div>
          <div class="cdg-sep">·</div>
          <div class="cdg-item">
            <span class="cdg-label" data-t="dateLabel">ទី</span>
            <span class="cdg-val">១៧</span>
          </div>
          <div class="cdg-sep">·</div>
          <div class="cdg-item">
            <span class="cdg-label" data-t="monthLabel">ខែ</span>
            <span class="cdg-val">មីនា</span>
          </div>
          <div class="cdg-sep">·</div>
          <div class="cdg-item">
            <span class="cdg-label" data-t="yearLabel">ឆ្នាំ</span>
            <span class="cdg-val">២០២៧</span>
          </div>
        </div>

        <!-- Lunar Date & Venue -->
        <div class="cover__lunar">
          ${weddingData.lunar.km}
        </div>
        <div class="cover__venue">
          <i class="venue-icon" aria-hidden="true">🏛️</i>
          <span class="venue-title" data-t="venueName">${weddingData.venue.name.km}</span>
        </div>

        <!-- Scroll Down Cue -->
        <a href="#words" class="cover__scroll-cue" aria-label="Scroll to formal invitation">
          <span class="scroll-txt" data-t="scrollOpen">រំកិលចុះក្រោមដើម្បីទស្សនាធៀប</span>
          <svg class="scroll-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  `;

  setupCoverAnimations(containerEl);
};

export const setupCoverAnimations = (containerEl) => {
  const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power3.out" } });

  tl.from(".cover__bg", { scale: 1.08, duration: 2.2, ease: "power2.out" }, 0)
    .from(".cover__crest", { y: -20, opacity: 0, duration: 1.1 }, 0.2)
    .from(".cover__kicker", { y: -15, opacity: 0, duration: 1 }, 0.35)
    .from(".cover__logo .lk-name", {
      opacity: 0,
      y: 20,
      stagger: 0.2,
      duration: 1.2,
      ease: "power2.out"
    }, 0.5)
    .from(".cover__logo .lk-swash", {
      strokeDashoffset: 600,
      opacity: 0,
      duration: 1.6,
      ease: "power2.inOut"
    }, 0.6)
    .from(".cover__logo .lk-heart", {
      scale: 0,
      transformOrigin: "center center",
      duration: 0.7,
      ease: "back.out(2)"
    }, 1.2)
    .from(".cover__logo .lk-butterfly", {
      x: -30,
      y: 20,
      scale: 0,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    }, 1.3)
    .from(".cover__latin", { opacity: 0, y: 12, duration: 0.9 }, 1.4)
    .from(".cover__date-grid", { opacity: 0, y: 15, duration: 0.9 }, 1.55)
    .from(".cover__lunar, .cover__venue", { opacity: 0, y: 12, duration: 0.8, stagger: 0.1 }, 1.7)
    .from(".cover__scroll-cue", { opacity: 0, y: 10, duration: 1 }, 2.0);
};
