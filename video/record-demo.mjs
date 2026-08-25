/**
 * Record the Golden Hour demo with a standalone Playwright browser.
 *
 *   node record-demo.mjs            record every segment
 *   node record-demo.mjs 3 5        record only segments 3 and 5
 *
 * This drives its own Chromium and uses Playwright's built-in video capture, so
 * there is no browser extension attached, no "started debugging this browser"
 * banner, no window management and no screen recording. The output is the page
 * itself at a fixed 1920x1080, which is far cleaner than filming a desktop.
 *
 * Each segment's duration is pinned to the length of its narration take so the
 * picture and the voiceover stay locked without hand-syncing.
 */

import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SEGMENTS = join(HERE, "segments");
const RAW = join(HERE, ".rawvideo");
const VO = join(HERE, "vo");
const URL_BASE = "https://golden-hour-rust-mu.vercel.app";

const W = 1920;
const H = 1080;

/** Length of each narration take, in seconds. Read off the wav files. */
function takeLength(n) {
  const f = join(VO, `take${n}.wav`);
  if (!existsSync(f)) throw new Error(`missing narration: take${n}.wav`);
  const out = execSync(
    `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${f}"`
  ).toString().trim();
  return parseFloat(out);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Case state matching the app's localStorage shape. */
function seedCase({ elapsedMin = 35, done = [], ackNumber = null, narrative = "" } = {}) {
  return {
    id: "GH-2026-7561",
    amount: 50000,
    route: "upi",
    consent: "deceived",
    incidentAt: Date.now() - elapsedMin * 60000,
    openedAt: Date.now(),
    narrative,
    state: "",
    done,
    ackNumber,
    demoOffsetMin: 0,
  };
}

/** Smooth scroll inside the page, eased, so the motion reads as deliberate. */
async function glide(page, to, ms) {
  await page.evaluate(
    ([to, ms]) =>
      new Promise((done) => {
        const from = window.scrollY;
        const t0 = performance.now();
        const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        function step(now) {
          const k = Math.min(1, (now - t0) / ms);
          window.scrollTo(0, from + (to - from) * ease(k));
          if (k < 1) requestAnimationFrame(step);
          else done();
        }
        requestAnimationFrame(step);
      }),
    [to, ms]
  );
}

/** Hide the dismissible prototype banner so it does not eat vertical space. */
async function dropBanner(page) {
  await page.evaluate(() => {
    try { sessionStorage.setItem("gh-banner", "hidden"); } catch {}
  });
}

/* ------------------------------------------------------------------ */
/* The eight beats                                                     */
/* ------------------------------------------------------------------ */

const BEATS = {
  // "the outcome is decided in the first hour ... 60% ... 5% ... nothing tells you that"
  1: async (page, secs) => {
    await page.goto(`${URL_BASE}/`, { waitUntil: "networkidle" });
    await dropBanner(page);
    await page.reload({ waitUntil: "networkidle" });
    await sleep(2600);                 // hold on headline + the three figures
    await glide(page, 240, 4200);      // drift so the stat card sits centre frame
    await sleep(1800);
    await glide(page, 700, 3000);      // reveal the 23 lakh / 14% line
    await sleep(secs * 1000 - 11600);
  },

  // "asks four questions ... did you approve the payment? that decides which law protects you"
  2: async (page, secs) => {
    await page.goto(`${URL_BASE}/act`, { waitUntil: "networkidle" });
    await dropBanner(page);
    await page.reload({ waitUntil: "networkidle" });
    await sleep(1100);
    await page.getByRole("button", { name: "₹50,000" }).click();
    await sleep(700);
    await page.getByRole("button", { name: "Continue" }).click();
    await sleep(900);
    await page.getByRole("button", { name: "UPI", exact: false }).first().click();
    await sleep(650);
    await page.getByRole("button", { name: "Continue" }).click();
    await sleep(900);
    await page.getByRole("button", { name: /Under an hour ago/ }).click();
    await sleep(650);
    await page.getByRole("button", { name: "Continue" }).click();
    await sleep(2400);                 // let "Did you approve the payment?" land
    await page.getByRole("button", { name: /I sent it, because I was misled/ }).click();
    await sleep(secs * 1000 - 9950);
  },

  // "the clock is running, 57%, falling 1.3 points ... this is where your money actually is"
  3: async (page, secs) => {
    await page.goto(`${URL_BASE}/case`, { waitUntil: "networkidle" });
    await sleep(2000);                 // the clock, the percentage, the decay curve
    await glide(page, 330, 2600);
    await sleep(1500);
    await glide(page, 780, 3000);      // down onto the layer map
    await sleep(secs * 1000 - 9100);
  },

  // "the official flow opens with a form ... call 1930 first, with a script, in Hindi or English"
  4: async (page, secs) => {
    await page.goto(`${URL_BASE}/case`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const el = document.querySelector('[aria-labelledby="do-heading"]');
      if (el) el.scrollIntoView({ block: "start" });
      window.scrollBy(0, -70);
    });
    await sleep(2600);                 // the ordered action list
    await page.getByRole("button", { name: /हिंदी/ }).click();
    await sleep(3200);                 // the Hindi script, on screen, readable
    await page.getByRole("button", { name: "English" }).click();
    await sleep(secs * 1000 - 7200);
  },

  // "six hours later, odds fallen to 41%, scattered across 43 accounts"
  5: async (page, secs) => {
    await page.goto(`${URL_BASE}/case`, { waitUntil: "networkidle" });
    await glide(page, 620, 900);       // clock and layer map both in frame
    await sleep(1300);
    await page.getByRole("button", { name: /\+6 hours/ }).click();
    await sleep(2600);                 // watch it drop
    await glide(page, 180, 1400);      // back up to the big number
    await sleep(secs * 1000 - 7000);
  },

  // "your own account frozen ... 175 disputed, 18 lakh held ... we test it against real law"
  6: async (page, secs) => {
    await page.goto(`${URL_BASE}/frozen`, { waitUntil: "networkidle" });
    await dropBanner(page);
    await page.reload({ waitUntil: "networkidle" });
    await sleep(600);
    await page.selectOption("#state", "Maharashtra");
    await page.fill("#days", "45");
    await sleep(500);
    await page.getByRole("button", { name: "Continue" }).click();
    await sleep(500);
    await page.fill("#balance", "1860000");
    await page.fill("#disputed", "175");
    await sleep(900);                  // the mismatch is the whole point, hold on it
    await page.getByRole("button", { name: "Continue" }).click();
    await sleep(400);
    await page.getByRole("button", { name: /They did not tell me/ }).click();
    await sleep(300);
    await page.getByRole("button", { name: "Continue" }).click();
    await sleep(400);
    await page.getByRole("button", { name: /My entire account/ }).click();
    await sleep(300);
    await page.getByRole("button", { name: "Continue" }).click();
    await sleep(400);
    await page.getByRole("button", { name: /Nobody has said either way/ }).click();
    await page.getByRole("button", { name: /No, nothing in writing/ }).click();
    await sleep(400);
    await page.getByRole("button", { name: /Get my position/ }).click();
    await sleep(2600);                 // verdict + the 18,59,825 figure
    await page.getByRole("tab", { name: "Letter to the bank" }).click();
    await sleep(secs * 1000 - 9700);
  },

  // "an OpenAI model does exactly one job here ... turns the story into a chronology"
  7: async (page, secs) => {
    await page.goto(`${URL_BASE}/case`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /File the freeze request/ }).click();
    await page.evaluate(() => {
      document.querySelector("#narrative")?.scrollIntoView({ block: "center" });
    });
    await sleep(900);
    await page.locator("#narrative").fill(
      "A man called saying he was from the electricity board and my connection would be cut in one hour. He sent a link to pay 10 rupees to verify. After I paid, 50000 went out in three transfers."
    );
    await sleep(900);
    await page.getByRole("button", { name: /Write my complaint/ }).click();
    // wait for the real model round trip, then hold on the result
    await page.waitForSelector("text=Written by an OpenAI model", { timeout: 25000 }).catch(() => {});
    await sleep(1200);
    await page.evaluate(() => {
      const ta = [...document.querySelectorAll("textarea")].find((t) =>
        t.getAttribute("aria-label")?.includes("complaint draft")
      );
      ta?.scrollIntoView({ block: "center" });
    });
    await sleep(3000);
  },

  // "every figure carries its source, every mock is listed ... the write into CFCFRMS"
  8: async (page, secs) => {
    await page.goto(`${URL_BASE}/how-it-works`, { waitUntil: "networkidle" });
    await dropBanner(page);
    await page.reload({ waitUntil: "networkidle" });
    await sleep(1800);                 // real vs mocked, side by side
    await glide(page, 520, 3200);      // into the sourced figures
    await sleep(2200);
    await glide(page, 1250, 3200);     // "what a real version would need"
    await sleep(secs * 1000 - 10400);
  },
};

/* ------------------------------------------------------------------ */

async function main() {
  const wanted = process.argv.slice(2).map(Number).filter(Boolean);
  const list = wanted.length ? wanted : [1, 2, 3, 4, 5, 6, 7, 8];

  mkdirSync(SEGMENTS, { recursive: true });
  rmSync(RAW, { recursive: true, force: true });
  mkdirSync(RAW, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  for (const n of list) {
    const secs = takeLength(n);
    const dir = join(RAW, `s${n}`);
    mkdirSync(dir, { recursive: true });

    const ctx = await browser.newContext({
      viewport: { width: W, height: H },
      deviceScaleFactor: 1,
      colorScheme: "dark",
      reducedMotion: "no-preference",
      recordVideo: { dir, size: { width: W, height: H } },
      storageState: {
        cookies: [],
        origins: [
          {
            origin: URL_BASE,
            localStorage: [
              {
                name: "gh-case-v1",
                value: JSON.stringify(
                  n === 7
                    ? seedCase({ elapsedMin: 35, done: ["call1930"] })
                    : n === 5
                      ? seedCase({ elapsedMin: 35 })
                      : seedCase({ elapsedMin: 35, done: n >= 4 ? ["call1930"] : [] })
                ),
              },
            ],
          },
        ],
      },
    });

    const page = await ctx.newPage();
    // Kill the caret blink and any stray focus ring so frames are clean.
    await page.addStyleTag({ content: "*{caret-color:transparent!important}" }).catch(() => {});

    const t0 = Date.now();
    try {
      await BEATS[n](page, secs);
    } catch (e) {
      console.log(`  segment ${n}: beat error -> ${e.message}`);
    }
    const held = (Date.now() - t0) / 1000;
    // Never end early. Pad to the narration length plus a breath.
    if (held < secs + 0.4) await sleep((secs + 0.4 - held) * 1000);

    await ctx.close(); // flushes the video file
    const webm = readdirSync(dir).find((f) => f.endsWith(".webm"));
    if (!webm) { console.log(`  segment ${n}: NO VIDEO PRODUCED`); continue; }

    const out = join(SEGMENTS, `seg${n}.mp4`);
    execSync(
      `ffmpeg -hide_banner -loglevel error -y -i "${join(dir, webm)}" ` +
        `-vf "scale=${W}:${H},setsar=1,format=yuv420p" -r 30 ` +
        `-c:v libx264 -preset veryfast -crf 20 -movflags +faststart "${out}"`
    );
    const dur = execSync(
      `ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${out}"`
    ).toString().trim();
    console.log(`  seg${n}.mp4  ${parseFloat(dur).toFixed(1)}s   (narration ${secs.toFixed(1)}s)`);
  }

  await browser.close();
  rmSync(RAW, { recursive: true, force: true });
  console.log("done");
}

main().catch((e) => { console.error(e); process.exit(1); });
