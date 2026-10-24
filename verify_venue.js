import { chromium } from "playwright";

async function verifyVenue() {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile viewport
  const pageM = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });

  await pageM.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await pageM.waitForTimeout(500);

  // Open envelope
  const seal = pageM.locator("#seal");
  await seal.click({ force: true });
  await pageM.waitForTimeout(5500);

  // Capture Hero Cover (showing venue title)
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_cover_venue.png" });

  // Scroll to Venue section
  const venue = pageM.locator("#venue");
  await venue.scrollIntoViewIfNeeded();
  await pageM.waitForTimeout(600);
  await pageM.screenshot({ path: "./qc_screenshots/mobile_verified_venue_chapter.png" });

  // Desktop viewport
  const pageD = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2
  });
  await pageD.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await pageD.waitForTimeout(500);

  const sealD = pageD.locator("#seal");
  await sealD.click({ force: true });
  await pageD.waitForTimeout(5500);

  const venueD = pageD.locator("#venue");
  await venueD.scrollIntoViewIfNeeded();
  await pageD.waitForTimeout(800);
  await pageD.screenshot({ path: "./qc_screenshots/desktop_verified_venue_chapter.png" });

  await browser.close();
  console.log("Venue verification screenshots captured.");
}

verifyVenue().catch(console.error);
