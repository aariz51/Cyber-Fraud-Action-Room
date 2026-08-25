/**
 * Full functional audit.
 *
 * Drives every route and every interactive control the way a reviewer would,
 * and fails loudly rather than reporting a green tick it did not earn.
 *
 *   node tests/audit.mjs            against localhost:4320
 *   BASE=https://... node tests/audit.mjs
 */

import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:4320';
const results = [];
let failures = 0;

const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  if (!ok) failures += 1;
};

const ROUTES = [
  '/',
  '/methodology',
  '/action-room',
  '/action-room/intake',
  '/action-room/what-to-do',
  '/action-room/money-trail',
  '/action-room/evidence',
  '/action-room/complaint',
  '/action-room/recovery',
  '/action-room/frozen',
  '/action-room/case',
];

/** Contrast audit against the actually painted background. */
function contrastAudit() {
  const parse = (s) => {
    if (!s) return null;
    if (s.startsWith('color(')) {
      const m = s.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/);
      return m ? [+m[1] * 255, +m[2] * 255, +m[3] * 255] : null;
    }
    const m = s.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : null;
  };
  const isT = (s) => !s || /rgba\(0, 0, 0, 0\)|^transparent$/.test(s) || /\/ 0\)$/.test(s);
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = (r) => 0.2126 * lin(r[0]) + 0.7152 * lin(r[1]) + 0.0722 * lin(r[2]);
  const cr = (a, b) => { const l1 = L(a), l2 = L(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return (hi + 0.05) / (lo + 0.05); };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (!isT(bg)) { const pp = parse(bg); if (pp) return pp; }
      n = n.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor);
  };
  const fails = [];
  document.querySelectorAll('p,li,span,dt,dd,h1,h2,h3,h4,td,th,a,label,legend,button,pre,strong,small').forEach((el) => {
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    if (!own) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    let op = 1, n = el;
    while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
    if (op < 0.6) return;
    const fg = parse(cs.color), bg = bgOf(el);
    if (!fg || !bg) return;
    const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const need = large ? 3 : 4.5;
    const ratio = cr(fg, bg);
    if (ratio < need - 0.05) fails.push(ratio.toFixed(2) + '<' + need + ' ' + Math.round(size) + 'px "' + own.slice(0, 40) + '"');
  });
  return fails;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  ctx.on('weberror', (e) => consoleErrors.push(e.error().message));

  /* ---- 1. every route loads without a page error ---- */
  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    const res = await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    check(`route ${route}`, res.status() === 200 && errs.length === 0,
      `status ${res.status()}${errs.length ? ' | ' + errs[0].slice(0, 90) : ''}`);

    const contrast = (await page.evaluate(contrastAudit)) ?? [];
    check(`contrast ${route}`, contrast.length === 0,
      contrast.length ? `${contrast.length} fail: ${contrast.slice(0, 2).join(' ; ')}` : 'all AA');
    await page.close();
  }

  /* ---- 2. the victim journey, end to end ---- */
  const p = await ctx.newPage();
  const jErrs = [];
  p.on('pageerror', (e) => jErrs.push(e.message));

  await p.goto(`${BASE}/action-room/intake`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(600);

  // Q1 amount
  await p.getByRole('button', { name: /50,000/ }).first().click();
  await p.waitForTimeout(300);
  await p.getByRole('button', { name: /^Continue/ }).click();
  await p.waitForTimeout(500);
  // Q2 route
  await p.getByRole('button', { name: /UPI/ }).first().click();
  await p.waitForTimeout(250);
  await p.getByRole('button', { name: /^Continue/ }).click();
  await p.waitForTimeout(500);
  // Q3 when
  await p.getByRole('button', { name: /Under an hour ago/ }).click();
  await p.waitForTimeout(250);
  await p.getByRole('button', { name: /^Continue/ }).click();
  await p.waitForTimeout(500);
  // Q4 consent
  await p.getByRole('button', { name: /misled/i }).click();
  await p.waitForTimeout(250);
  const finish = p.getByRole('button', { name: /action room|Open|Finish/i }).first();
  await finish.click();
  await p.waitForTimeout(1800);

  check('intake completes and routes onward', !/intake$/.test(new URL(p.url()).pathname),
    `landed on ${new URL(p.url()).pathname}`);

  // the case must now exist in storage
  const stored = await p.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('gh-case-v1') || 'null'); } catch { return null; }
  });
  check('case persisted to localStorage', !!stored && stored.amount === 50000,
    stored ? `id ${stored.id}, amount ${stored.amount}, consent ${stored.consent}` : 'nothing stored');

  /* ---- 3. the clock is live and falling ---- */
  await p.goto(`${BASE}/action-room/case`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const clock = await p.evaluate(() => {
    const t = document.body.innerText;
    return {
      pct: t.match(/(\d+)%/)?.[1] ?? null,
      elapsed: /minute|hour/.test(t),
      layers: /Layer 1/.test(t),
    };
  });
  check('recovery clock renders a percentage', clock.pct !== null, `showing ${clock.pct}%`);
  check('elapsed time renders', clock.elapsed);

  /* ---- 4. money trail reflects the case ---- */
  await p.goto(`${BASE}/action-room/money-trail`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  const trail = await p.evaluate(() => ({
    layers: [...document.querySelectorAll('body *')].some((e) => /Layer 1/.test(e.textContent || '')),
    caseModel: /CASE MODEL/.test(document.body.innerText),
  }));
  check('money trail shows layers', trail.layers);
  check('money trail picks up the live case', trail.caseModel, trail.caseModel ? 'CASE MODEL' : 'still DEMO MODEL');

  /* ---- 5. evidence checklist is interactive ---- */
  await p.goto(`${BASE}/action-room/evidence`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(700);
  const boxes = p.locator('button[aria-pressed]');
  const boxCount = await boxes.count();
  if (boxCount >= 2) {
    await boxes.nth(0).click();
    await boxes.nth(1).click();
    await p.waitForTimeout(400);
  }
  const evText = await p.evaluate(() => document.body.innerText);
  check('evidence checklist toggles', /\b2 of \d+ saved/.test(evText),
    evText.match(/\d+ of \d+ saved/)?.[0] ?? 'no counter found');

  /* ---- 6. complaint draft calls the model ---- */
  await p.goto(`${BASE}/action-room/complaint`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const ta = p.locator('#narrative');
  check('complaint narrative field present', (await ta.count()) > 0);
  if ((await ta.count()) > 0) {
    await ta.fill('A man called saying he was from the electricity board and my connection would be cut in one hour. He sent a link to pay 10 rupees. After that 50000 went out in three transfers.');
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: /Write my complaint|Rewrite/ }).click();
    await p.waitForSelector('textarea[aria-label*="complaint draft"]', { timeout: 45000 }).catch(() => {});
    await p.waitForTimeout(1200);
    const draft = await p.evaluate(() => {
      const el = [...document.querySelectorAll('textarea')].find((t) => t.getAttribute('aria-label')?.includes('complaint draft'));
      const chip = [...document.querySelectorAll('*')].find((e) => /OpenAI model|Built-in template/.test(e.textContent || '') && e.children.length === 0);
      return { len: el?.value.length ?? 0, chip: chip?.textContent?.trim() ?? null };
    });
    check('complaint draft generated', draft.len > 200, `${draft.len} chars`);
    check('draft source is labelled', !!draft.chip, draft.chip ?? 'no label');
    check('draft used the real model', /OpenAI model/.test(draft.chip ?? ''), draft.chip ?? '');
  }

  /* ---- 7. recovery tracker responds to the case ---- */
  await p.goto(`${BASE}/action-room/recovery`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const rec = await p.evaluate(() => document.body.innerText);
  check('recovery tracker shows the case, not the empty state',
    !/No local case to track/.test(rec) && /GH-/.test(rec),
    rec.match(/GH-[\w-]+/)?.[0] ?? 'no case id');

  /* ---- 8. frozen journey ---- */
  await p.goto(`${BASE}/action-room/frozen`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const sel = p.locator('#state');
  if ((await sel.count()) > 0) {
    await sel.selectOption('Maharashtra');
    await p.locator('#days').fill('45');
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: /^Continue/ }).click();
    await p.waitForTimeout(400);
    await p.locator('#balance').fill('1860000');
    await p.locator('#disputed').fill('175');
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: /^Continue/ }).click();
    await p.waitForTimeout(400);
    await p.getByRole('button', { name: /They did not tell me/ }).click();
    await p.waitForTimeout(250);
    await p.getByRole('button', { name: /^Continue/ }).click();
    await p.waitForTimeout(400);
    await p.getByRole('button', { name: /My entire account/ }).click();
    await p.waitForTimeout(250);
    await p.getByRole('button', { name: /^Continue/ }).click();
    await p.waitForTimeout(400);
    await p.getByRole('button', { name: /Nobody has said either way/ }).click();
    await p.getByRole('button', { name: /No, nothing in writing/ }).click();
    await p.waitForTimeout(300);
    await p.getByRole('button', { name: /Get my position/ }).click();
    await p.waitForTimeout(1800);

    const frozen = await p.evaluate(() => document.body.innerText);
    check('frozen verdict renders', /legally vulnerable|Strong grounds|contested/i.test(frozen));
    check('frozen computes the disproportionate amount', /18,59,825/.test(frozen),
      frozen.match(/₹[\d,]{6,}/)?.[0] ?? 'not found');
    check('frozen cites the jurisdiction', /Bombay High Court/.test(frozen));
  } else {
    check('frozen journey reachable', false, '#state select not found');
  }

  check('no page errors across the journey', jErrs.length === 0, jErrs[0]?.slice(0, 120) ?? '');

  await browser.close();

  /* ---- report ---- */
  console.log('\n════════ AUDIT ════════');
  for (const r of results) {
    console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(46)} ${r.detail}`);
  }
  console.log(`\n  ${results.length - failures}/${results.length} passed`);
  if (failures) {
    console.log(`  ${failures} FAILING`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
