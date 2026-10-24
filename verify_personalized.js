import { chromium } from "playwright";

async function verifyAll() {
  console.log("Launching headless browser for verification...");
  const browser = await chromium.launch({ channel: "msedge", headless: true });

  // 1. Test Personalized Guest on Mobile
  const pageM = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });

  const guestName = "ឯកឧត្តម ជា សុខា";
  const url = `http://localhost:4173/?to=${encodeURIComponent(guestName)}`;
  console.log("Navigating to:", url);

  const errors = [];
  pageM.on("pageerror", err => errors.push(err.message));
  pageM.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await pageM.goto(url, { waitUntil: "networkidle" });
  await pageM.waitForTimeout(600);

  // Take screenshot of Envelope Gate with personalized guest name
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_personalized_gate.png" });
  console.log("Captured personalized gate screenshot.");

  // Open envelope
  const seal = pageM.locator("#seal");
  await seal.click({ force: true });
  await pageM.waitForTimeout(5500);

  // Scroll to Words chapter (showing personalized guest badge)
  const words = pageM.locator("#words");
  await words.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(600);
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_personalized_words.png" });
  console.log("Captured personalized words chapter screenshot.");

  // Scroll to Gift chapter (showing ABA QR slip & dual KHR/USD copy buttons)
  const gift = pageM.locator("#gift");
  await gift.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(600);
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_gift_aba.png" });
  console.log("Captured ABA QR gift chapter screenshot.");

  // 2. Test Guest Links Tool
  const pageTool = await browser.newPage({
    viewport: { width: 1040, height: 800 },
    deviceScaleFactor: 2
  });
  await pageTool.goto("http://localhost:4173/guest-links.html", { waitUntil: "networkidle" });
  await pageTool.waitForTimeout(500);
  await pageTool.screenshot({ path: "./qc_screenshots/desktop_guest_links_tool.png" });
  console.log("Captured guest links generator screenshot.");

  await browser.close();
  console.log("All verifications completed! Total errors:", errors.length);
}

verifyAll().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
