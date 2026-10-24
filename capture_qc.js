import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "./qc_screenshots";
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function runQC() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: "mobile_390x844", width: 390, height: 844 },
    { name: "desktop_1280x800", width: 1280, height: 800 },
    { name: "small_320x568", width: 320, height: 568 },
    { name: "landscape_740x360", width: 740, height: 360 }
  ];

  console.log("Starting Quality Check & Screenshots...");

  for (const vp of viewports) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2
    });

    await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 1. Capture Closed Envelope
    await page.screenshot({ path: path.join(outDir, `${vp.name}_01_envelope_closed.png`) });
    console.log(`Captured ${vp.name} envelope closed`);

    if (vp.name === "mobile_390x844") {
      const seal = page.locator("#seal");
      await seal.click({ force: true });

      // Frame 1: seal lifted (350ms)
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(outDir, `seq_01_seal_lifted.png`) });

      // Frame 2: flap unfolding in 3D (650ms further -> 1000ms total)
      await page.waitForTimeout(650);
      await page.screenshot({ path: path.join(outDir, `seq_02_flap_unfolding_3d.png`) });

      // Frame 3: card drawn out (800ms further -> 1800ms total)
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(outDir, `seq_03_card_drawn.png`) });

      // Frame 4: card zooming forward (1200ms further -> 3000ms total)
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(outDir, `seq_04_card_zoom.png`) });

      // Frame 5: Cover revealed (2200ms further -> 5200ms total)
      await page.waitForTimeout(2200);
      await page.screenshot({ path: path.join(outDir, `${vp.name}_02_cover_revealed.png`) });
      console.log(`Captured ${vp.name} cover revealed`);

      // Scroll and capture chapters
      const chapters = ["words", "couple", "countdown", "programme", "story", "pond", "venue", "gift", "finale"];
      for (const ch of chapters) {
        const el = page.locator(`#${ch}`);
        if (await el.count()) {
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(400);
          await page.screenshot({ path: path.join(outDir, `${vp.name}_chapter_${ch}.png`) });
        }
      }
    } else {
      const seal = page.locator("#seal");
      await seal.click({ force: true });
      await page.waitForTimeout(5500);
      await page.screenshot({ path: path.join(outDir, `${vp.name}_02_cover.png`) });
      console.log(`Captured ${vp.name} cover`);
    }

    await page.close();
  }

  await browser.close();
  console.log("All QC screenshots completed successfully!");
}

runQC().catch((err) => {
  console.error("QC failed:", err);
  process.exit(1);
});
