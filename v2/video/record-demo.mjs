/**
 * Record the V2 demo with a standalone Playwright browser.
 *
 *   node video/record-demo.mjs           record every segment
 *   node video/record-demo.mjs 3 5       record only 3 and 5
 *
 * This launches its own Chromium and uses Playwright's built-in video capture.
 * No browser extension is attached, so the "started debugging this browser"
 * banner cannot appear. It is not a screen recording either, so nothing else on
 * the desktop can leak into a frame.
 *
 * Each segment is pinned to the length of its narration take, and each beat
 * shows exactly what that take describes.
 */

import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SEGMENTS = join(HERE, 'segments');
const RAW = join(HERE, '.rawvideo');
const VO = join(HERE, 'vo');
const BASE = process.env.BASE ?? 'https://golden-hour-rust-mu.vercel.app';

const W = 1920;
const H = 1080;

function takeLength(n) {
  const f = join(VO, `take${n}.wav`);
  if (!existsSync(f)) throw new Error(`missing narration: take${n}.wav`);
  return parseFloat(
    execSync(`ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "${f}"`)
      .toString()
      .trim()
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A case in localStorage, so the app pages have something real to render. */
function seedCase({ elapsedMin = 35, done = [], ackNumber = null, narrative = '' } = {}) {
  return {
    id: 'GH-2026-7561',
    amount: 50000,
    route: 'upi',
    consent: 'deceived',
    incidentAt: Date.now() - elapsedMin * 60000,
    openedAt: Date.now(),
    narrative,
    state: '',
    done,
    ackNumber,
    demoOffsetMin: 0,
  };
}

/** Eased scroll, so movement reads as deliberate rather than a jump. */
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

/** The dismissible prototype banner eats vertical space in a 1080 frame. */
async function dropBanner(page) {
  await page.evaluate(() => {
    try { sessionStorage.setItem('gh-banner', 'hidden'); } catch {}
  });
}


/** Walk the freeze questionnaire through to the verdict. */
async function runFreeze(page) {
  await page.selectOption('#state', 'Maharashtra');
  await page.fill('#days', '45');
  await page.getByRole('button', { name: /^Continue/ }).click();
  await sleep(300);
  await page.fill('#balance', '1860000');
  await page.fill('#disputed', '175');
  await page.getByRole('button', { name: /^Continue/ }).click();
  await sleep(280);
  await page.getByRole('button', { name: /They did not tell me/ }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await sleep(280);
  await page.getByRole('button', { name: /My entire account/ }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await sleep(280);
  await page.getByRole('button', { name: /Nobody has said either way/ }).click();
  await page.getByRole('button', { name: /No, nothing in writing/ }).click();
  await sleep(280);
  await page.getByRole('button', { name: /Get my position/ }).click();
  await sleep(1100);
}

const BEATS = {
  // "every cyber fraud has two victims"
  1: async (page, secs) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await dropBanner(page);
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(3400);                 // hold on "Every fraud has two victims."
    await glide(page, 260, 3000);
    await sleep(secs * 1000 - 6400);
  },

  // "not a complainant, not an accused, no door at all"
  2: async (page, secs) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await dropBanner(page);
    await page.reload({ waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const h = [...document.querySelectorAll('h2')].find((e) => /One door/i.test(e.textContent || ''));
      if (h) h.scrollIntoView({ block: 'center' });
    });
    await sleep(3600);                 // the frozen card now leads the three
    await sleep(secs * 1000 - 3600);
  },

  // "Golden Hour gives them one. A few questions about the freeze."
  3: async (page, secs) => {
    await page.goto(`${BASE}/action-room/frozen`, { waitUntil: 'networkidle' });
    await dropBanner(page);
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(900);
    await page.selectOption('#state', 'Maharashtra');
    await sleep(500);
    await page.fill('#days', '45');
    await sleep(700);
    await page.getByRole('button', { name: /^Continue/ }).click();
    await sleep(secs * 1000 - 3100);
  },

  // "eighteen lakh sixty thousand held, one seventy five disputed"
  4: async (page, secs) => {
    await page.goto(`${BASE}/action-room/frozen`, { waitUntil: 'networkidle' });
    await dropBanner(page);
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(400);
    await page.selectOption('#state', 'Maharashtra');
    await page.fill('#days', '45');
    await page.getByRole('button', { name: /^Continue/ }).click();
    await sleep(400);
    await page.fill('#balance', '1860000');
    await sleep(600);
    await page.fill('#disputed', '175');
    await sleep(1600);                 // the mismatch is the point, hold on it
    await page.getByRole('button', { name: /^Continue/ }).click();
    await sleep(secs * 1000 - 4200);
  },

  // "the law disagrees with itself. the advice changes with the state."
  5: async (page, secs) => {
    await page.goto(`${BASE}/action-room/frozen`, { waitUntil: 'networkidle' });
    await dropBanner(page);
    await page.reload({ waitUntil: 'networkidle' });
    await runFreeze(page);
    await sleep(1200);                 // the ratio lands first
    await page.evaluate(() => {
      const el = [...document.querySelectorAll('*')].find((e) =>
        /High Court/i.test(e.textContent || '') && e.children.length === 0
      );
      el?.scrollIntoView({ block: 'center' });
    });
    await sleep(secs * 1000 - 2400);
  },

  // "drafts the letter and the ten rupee RTI, unlocks by day"
  6: async (page, secs) => {
    await page.goto(`${BASE}/action-room/frozen`, { waitUntil: 'networkidle' });
    await dropBanner(page);
    await page.reload({ waitUntil: 'networkidle' });
    await runFreeze(page);
    await sleep(700);
    await page.evaluate(() => {
      const h = [...document.querySelectorAll('h2')].find((e) => /What to do, in order/i.test(e.textContent || ''));
      if (h) h.scrollIntoView({ block: 'start' });
    });
    await sleep(2200);                 // the gated ladder
    await glide(page, 1500, 2600);
    await sleep(secs * 1000 - 5900);
  },

  // "the first victim still gets the first hour, and the model does one job"
  7: async (page, secs) => {
    await page.goto(`${BASE}/action-room/case`, { waitUntil: 'networkidle' });
    await sleep(2600);                 // the clock and the percentage
    await glide(page, 420, 2600);
    await sleep(secs * 1000 - 5600);
  },

  // "on the build: the model does one job, everything else deterministic"
  8: async (page, secs) => {
    await page.goto(`${BASE}/action-room/complaint`, { waitUntil: 'networkidle' });
    await sleep(800);
    await page.locator('#narrative').fill(
      'A man called saying he was from the electricity board and my connection would be cut in one hour. He sent a link to pay 10 rupees to verify. After I paid, 50000 went out in three transfers.'
    );
    await sleep(700);
    await page.getByRole('button', { name: /Write my complaint|Rewrite/ }).click();
    await page.waitForSelector('text=Written by an OpenAI model', { timeout: 30000 }).catch(() => {});
    await sleep(900);
    await page.evaluate(() => {
      const ta = [...document.querySelectorAll('textarea')].find((t) =>
        t.getAttribute('aria-label')?.includes('complaint draft')
      );
      ta?.scrollIntoView({ block: 'center' });
    });
    await sleep(secs * 1000 - 5000);
  },

  // "four fields, none of them need a new system. all synthetic."
  9: async (page, secs) => {
    await page.goto(`${BASE}/proposal`, { waitUntil: 'networkidle' });
    await sleep(2600);
    await glide(page, 700, 3000);
    await sleep(1600);
    await glide(page, 1600, 2800);
    await sleep(secs * 1000 - 10600);
  },
};

/** Walk the freeze intake to the verdict, which several beats need. */
async function seedFreeze(page) {
  await page.goto(`${BASE}/action-room/frozen`, { waitUntil: 'networkidle' });
  await dropBanner(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.selectOption('#state', 'Maharashtra');
  await page.fill('#days', '45');
  await page.getByRole('button', { name: /^Continue/ }).click();
  await page.fill('#balance', '1860000');
  await page.fill('#disputed', '175');
  await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: /They did not tell me/ }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: /My entire account/ }).click();
  await page.getByRole('button', { name: /^Continue/ }).click();
  await page.getByRole('button', { name: /Nobody has said either way/ }).click();
  await page.getByRole('button', { name: /No, nothing in writing/ }).click();
  await page.getByRole('button', { name: /Get my position/ }).click();
  await sleep(1400);
}

async function main() {
  const wanted = process.argv.slice(2).map(Number).filter(Boolean);
  const list = wanted.length ? wanted : [1, 2, 3, 4, 5, 6, 7, 8, 9];

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
      reducedMotion: 'no-preference',
      recordVideo: { dir, size: { width: W, height: H } },
      storageState: {
        cookies: [],
        origins: [
          {
            origin: BASE,
            localStorage: [
              { name: 'gh-case-v1', value: JSON.stringify(seedCase({ elapsedMin: 35, done: n >= 4 ? ['call1930'] : [] })) },
            ],
          },
        ],
      },
    });

    const page = await ctx.newPage();
    await page.addStyleTag({ content: '*{caret-color:transparent!important}' }).catch(() => {});

    const t0 = Date.now();
    try {
      await BEATS[n](page, secs);
    } catch (e) {
      console.log(`  segment ${n}: beat error -> ${e.message}`);
    }
    const held = (Date.now() - t0) / 1000;
    if (held < secs + 0.4) await sleep((secs + 0.4 - held) * 1000);

    await ctx.close();
    const webm = readdirSync(dir).find((f) => f.endsWith('.webm'));
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
  console.log('done');
}

main().catch((e) => { console.error(e); process.exit(1); });
