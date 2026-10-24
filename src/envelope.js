import gsap from "gsap";
import {
  generateScallopPath,
  generateScallopFoilPath,
  renderCorner,
  renderFlapBorder,
  renderCrest,
  renderMedallion,
  renderWaxSeal,
  renderNameLockup
} from "./assets/ornaments.js";
import { playPaperSound, playChimeSound, setMusicActive } from "./audio.js";

export const createEnvelope = (mountEl, weddingData, onOpenCallback) => {
  const groomShort = weddingData.couple.groom.shortKm;
  const brideShort = weddingData.couple.bride.shortKm;
  const dateShort = weddingData.solarDate.km;

  mountEl.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <clipPath id="clip-flap" clipPathUnits="objectBoundingBox">
          <path d="${generateScallopPath(9, 0.028)}" />
        </clipPath>
      </defs>
    </svg>
    <div class="e2" id="env">
      <div class="e2__ground" aria-hidden="true"></div>
      <div class="e2__stage" id="env-tilt">
        <!-- Back Panel -->
        <div class="e2__part e2__back"></div>

        <!-- Inside Card -->
        <div class="e2__card" id="env-card">
          <div class="e2__card-frame"></div>
          <div class="e2__card-corners">
            ${['tl', 'tr', 'bl', 'br'].map(pos => renderCorner(pos)).join('')}
          </div>
          <div class="e2__card-inner">
            <div class="e2__card-kicker" data-t="kicker">សិរីសួស្តីអាពាហ៍ពិពាហ៍</div>
            ${renderNameLockup(groomShort, brideShort, "lk-card", false)}
            <div class="e2__card-invite">
              <span data-t="inviteTo">សូមគោរពអញ្ជើញ</span>
              <div class="e2__card-guest" id="card-guest-name"></div>
            </div>
            <div class="e2__card-date">${dateShort}</div>
          </div>
        </div>

        <!-- Front Pocket -->
        <div class="e2__part e2__pocket">
          <div class="e2__pocket-l"></div>
          <div class="e2__pocket-r"></div>
          <div class="e2__pocket-b"></div>
          <div class="e2__emboss">
            ${renderCorner('bl')}${renderCorner('br')}
          </div>
          <div class="e2__date">${dateShort}</div>
        </div>

        <!-- Flap Shadow -->
        <div class="e2__part e2__flapshadow" id="flap-shadow"></div>

        <!-- 3D Folding Flap -->
        <div class="e2__part e2__flap" id="env-flap">
          <div class="e2__flap-front">
            <svg class="e2__flap-foil" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="${generateScallopFoilPath()}" transform="translate(50 2.5) scale(.93) translate(-50 0)" />
            </svg>
            <div class="e2__flap-border">${renderFlapBorder()}</div>
            <div class="e2__flap-logo">
              ${renderNameLockup(groomShort, brideShort, "lk-env", true)}
            </div>
          </div>
          <div class="e2__flap-back">
            <div class="e2__flap-crest">${renderCrest()}</div>
          </div>
        </div>

        <!-- Wax Seal Button -->
        <button class="e2__seal" id="seal" type="button" aria-label="Open the invitation / បើកធៀប">
          ${renderWaxSeal()}
        </button>
      </div>
    </div>
  `;

  // Attach interactive opening kinematics
  setupEnvelopeInteractions(mountEl, onOpenCallback, weddingData);
};

const setupEnvelopeInteractions = (mountEl, onOpenCallback, weddingData) => {
  const gateEl = document.getElementById("gate");
  const envEl = mountEl.querySelector("#env");
  const stageEl = mountEl.querySelector("#env-tilt");
  const sealBtn = mountEl.querySelector("#seal");
  const flapEl = mountEl.querySelector("#env-flap");
  const flapShadow = mountEl.querySelector("#flap-shadow");
  const cardEl = mountEl.querySelector("#env-card");
  const envParts = mountEl.querySelectorAll(".e2__part");

  // Initial Entrance Animation
  gsap.from(".gate__invite > *", {
    y: 20,
    opacity: 0,
    duration: 1.2,
    ease: "power2.out",
    stagger: 0.12,
    delay: 0.1
  });

  gsap.from(envEl, {
    y: 70,
    rotateX: 20,
    opacity: 0,
    duration: 1.5,
    ease: "power3.out",
    delay: 0.15
  });

  gsap.from(sealBtn, {
    scale: 1.3,
    opacity: 0,
    duration: 0.9,
    ease: "back.out(2)",
    delay: 0.9
  });

  gsap.from(".gate__hint", {
    opacity: 0,
    duration: 1,
    delay: 1.4
  });

  // Idle subtle float oscillation
  const idleTween = gsap.to(stageEl, {
    y: -6,
    duration: 2.6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });

  // Tilt handling with mouse / touch
  const applyTilt = (xNorm, yNorm) => {
    gsap.to(stageEl, {
      rotateY: xNorm * 9,
      rotateX: 6 - yNorm * 7,
      duration: 0.8,
      ease: "power3.out",
      overwrite: "auto"
    });
  };

  const onPointerMove = (e) => {
    const xNorm = e.clientX / window.innerWidth - 0.5;
    const yNorm = e.clientY / window.innerHeight - 0.5;
    applyTilt(xNorm, yNorm);
  };

  gateEl.addEventListener("pointermove", onPointerMove);
  gsap.set(stageEl, { rotateX: 6 });

  // Opening sequence
  let isOpening = false;
  const triggerOpen = () => {
    if (isOpening) return;
    isOpening = true;

    gateEl.removeEventListener("pointermove", onPointerMove);
    idleTween.kill();
    gateEl.classList.add("is-opening");

    // Play tactile sound effects & start music
    playPaperSound();
    setTimeout(() => playChimeSound(), 900);
    setMusicActive(true, weddingData.music);
    if (navigator.vibrate) navigator.vibrate(12);

    let finished = false;
    const completeOpening = () => {
      if (finished) return;
      finished = true;
      if (onOpenCallback) onOpenCallback();
      gsap.to(gateEl, {
        opacity: 0,
        duration: 1.1,
        ease: "power1.inOut",
        onComplete: () => gateEl.remove()
      });
    };

    // Responsive card scale helper
    const getCardScale = (multiplier = 1) => {
      const cardWidth = cardEl.offsetWidth || 300;
      const cardHeight = cardEl.offsetHeight || 420;
      return Math.min(
        1.35,
        (window.innerWidth * 0.92) / (cardWidth * multiplier),
        (window.innerHeight * 0.8) / cardHeight
      );
    };

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });

    // 1. Stage resets tilt to flat upright
    tl.to(stageEl, { rotateX: 4, rotateY: 0, y: 0, duration: 0.6 }, 0)
      .to(".gate__invite, .gate__hint", { opacity: 0, y: -14, duration: 0.7 }, 0)

      // 2. Wax seal pressed, unsealed with growing shadow, and set aside
      .to(sealBtn, { scale: 0.93, duration: 0.18, ease: "power2.in" }, 0)
      .to(sealBtn, { scale: 1.12, y: -18, rotate: -8, duration: 0.55, ease: "power2.out" }, 0.18)
      .to(sealBtn, { "--seal-shadow": 1, duration: 0.55 }, 0.18)
      .to(sealBtn, { x: "42vw", y: "65vh", rotate: 75, scale: 0.85, opacity: 0, duration: 0.95, ease: "power2.in" }, 0.75)

      // 3. Flap folds back 180 degrees in 3D
      .to(flapEl, {
        rotateX: -180,
        duration: 1.25,
        ease: "power2.inOut",
        onUpdate: function () {
          const rx = gsap.getProperty(flapEl, "rotateX");
          if (rx < -90) {
            flapEl.style.zIndex = "1";
          } else {
            flapEl.style.zIndex = "8";
          }
        }
      }, 0.45)
      .to(flapShadow, { opacity: 0, duration: 0.6 }, 0.5)

      // 4. Card drawn out of pocket at subtle angle
      .set(cardEl, { zIndex: 6 }, 0.7)
      .call(() => cardEl.classList.add("is-3d"), null, 0.7)
      .to(envParts, { y: 40, opacity: 0.3, duration: 0.9, ease: "power2.in" }, 0.8)
      .to(".e2__ground", { opacity: 0, duration: 0.6 }, 0.8)
      .fromTo(cardEl,
        { yPercent: 0, rotate: 0, scale: 1 },
        { yPercent: -45, rotate: -2.5, scale: 1.05, duration: 1.2, ease: "power2.out" },
        0.85
      )

      // 5. Envelope drops out of frame, card smoothly approaches camera
      .to(envEl, { y: "45vh", opacity: 0, duration: 0.9, ease: "power2.in" }, 1.8)
      .to(cardEl, {
        yPercent: -10,
        rotate: 0,
        scale: () => getCardScale(1) * 1.15,
        duration: 1.4,
        ease: "power2.inOut"
      }, 1.9)

      // 6. Dim veil fades in, card expands through into cover
      .to(".gate__dim", { opacity: 1, duration: 0.95, ease: "power1.in" }, 3.8)
      .to(cardEl, {
        scale: () => getCardScale(1) * 2.2,
        opacity: 0,
        duration: 1.1,
        ease: "power2.in"
      }, 3.8)

      // Complete opening
      .add(completeOpening, 4.9);

    // Safeguard timeout
    setTimeout(completeOpening, 7000);
  };

  sealBtn.addEventListener("click", triggerOpen);
  envEl.addEventListener("click", (e) => {
    if (!sealBtn.contains(e.target)) triggerOpen();
  });

  // Swipe up gesture support
  let startY = null;
  envEl.addEventListener("pointerdown", (e) => (startY = e.clientY));
  window.addEventListener("pointerup", (e) => {
    if (startY !== null && startY - e.clientY > 45) {
      triggerOpen();
    }
    startY = null;
  });
};
