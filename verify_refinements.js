import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function verify() {
  const browser = await chromium.launch({ headless: true });
  
  // Desktop view matching user's browser aspect ratio
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2
  });

  const errors = [];
  page.on("pageerror", err => errors.push(err.message));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // Open envelope
  const seal = page.locator("#seal");
  await seal.click({ force: true });
  await page.waitForTimeout(3500);

  // Scroll to couple section
  const couple = page.locator("#couple");
  await couple.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "./qc_screenshots/desktop_verified_couple.png" });

  // Scroll to countdown section
  const countdown = page.locator("#countdown");
  await countdown.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: "./qc_screenshots/desktop_verified_countdown.png" });

  // Combined view showing both couple and countdown like user's screenshot
  await page.evaluate(() => {
    const coupleEl = document.getElementById("couple");
    if (coupleEl) {
      window.scrollTo({ top: coupleEl.offsetTop + 180, behavior: 'instant' });
    }
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "./qc_screenshots/desktop_verified_combo.png" });

  // Also mobile 390x844
  const pageM = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });
  await pageM.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  const sealM = pageM.locator("#seal");
  await sealM.click({ force: true });
  await pageM.waitForTimeout(5500);

  const coupleM = pageM.locator("#couple");
  await coupleM.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(700);
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_couple.png" });

  const countdownM = pageM.locator("#countdown");
  await countdownM.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(700);
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_countdown.png" });

  await browser.close();

  console.log("Screenshots captured successfully. Console errors:", errors.length);
}

verify().catch(console.error);
