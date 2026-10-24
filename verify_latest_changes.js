import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function verifyLatest() {
  const browser = await chromium.launch({ headless: true });
  
  // 1. Mobile viewport (matching pic 2)
  const pageM = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });

  const errors = [];
  pageM.on("pageerror", err => errors.push(err.message));
  pageM.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await pageM.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await pageM.waitForTimeout(600);

  // Capture envelope closed showing updated title "ចុចលើ Logo ដើម្បីបើកធៀប"
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_envelope_hint.png" });

  // Open envelope
  const seal = pageM.locator("#seal");
  await seal.click({ force: true });
  await pageM.waitForTimeout(5500);

  // Scroll to countdown
  const countdown = pageM.locator("#countdown");
  await countdown.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(700);
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_countdown_slow.png" });

  // Scroll to finale & end of page
  const finale = pageM.locator("#finale");
  await finale.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(700);
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_finale_end.png" });

  // 2. Desktop viewport
  const pageD = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2
  });
  await pageD.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await pageD.waitForTimeout(600);
  await pageD.screenshot({ path: "./qc_screenshots/desktop_verified_envelope_hint.png" });

  const sealD = pageD.locator("#seal");
  await sealD.click({ force: true });
  await pageD.waitForTimeout(5000);

  const finaleD = pageD.locator("#finale");
  await finaleD.scrollIntoViewIfNeeded();
  await pageD.waitForTimeout(700);
  await pageD.screenshot({ path: "./qc_screenshots/desktop_verified_finale_end.png" });

  await browser.close();
  console.log("Screenshots captured successfully. Console errors:", errors.length);
}

verifyLatest().catch(console.error);
