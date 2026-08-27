/**
 * The statutory clock and the status decoder.
 * Run: node tests/statutory.test.mjs
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

// The lib is TypeScript; parse the exported data out of it rather than
// standing up a transpiler for three pure-data structures.
const src =
  readFileSync(new URL('../src/lib/case.ts', import.meta.url), 'utf8') +
  readFileSync(new URL('../src/lib/legality.ts', import.meta.url), 'utf8');

test('every statutory deadline cites an authority with a section or circular', () => {
  const auths = [...src.matchAll(/authority:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(auths.length >= 3, `expected 3+ authorities, got ${auths.length}`);
  for (const a of auths) {
    assert.match(a, /Section|section|circular|Scheme|BNSS|RBI/, `vague authority: ${a}`);
  }
});

test('the three deadlines are 3, 14 and 30 days and are ordered', () => {
  const days = [...src.matchAll(/^\s{4}day:\s*(\d+),/gm)].map((m) => Number(m[1]));
  assert.deepEqual(days, [3, 14, 30]);
});

test('Lalita Kumari and BNSS 173(3) are both cited on the FIR deadline', () => {
  assert.match(src, /Lalita Kumari/);
  assert.match(src, /Section 173\(3\) BNSS/);
});

test('the evidence checklist requires a section 63 certificate', () => {
  assert.match(src, /Bharatiya Sakshya Adhiniyam/);
  assert.match(src, /section 63/i);
});

test('Disposed is decoded as not-resolved and flagged not-good', () => {
  const i = src.indexOf('label: "Disposed"');
  assert.ok(i > 0, 'Disposed entry missing');
  const block = src.slice(i, i + 700);
  assert.match(block, /closed its own tracking entry|forwarded/);
  assert.match(block, /good:\s*false/);
});

test('a status that is genuinely progress is not scare-flagged', () => {
  const i = src.indexOf('label: "Lien marked on beneficiary account"');
  assert.ok(i > 0);
  assert.match(src.slice(i, i + 700), /good:\s*true/);
});

test('every decoded status tells the reader what to do next', () => {
  const doNows = [...src.matchAll(/doNow:\s*\n?\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(doNows.length >= 5, `expected 5+ doNow entries, got ${doNows.length}`);
  for (const d of doNows) assert.ok(d.length > 25, `too thin: ${d}`);
});

test('no generated legal text contains an em dash', () => {
  const i = src.indexOf('export const STATUTORY');
  assert.ok(!src.slice(i).includes('—'), 'em dash found in statutory block');
});

test('the legal rule set is versioned and dated', () => {
  assert.match(src, /LEGAL_RULESET_VERSION = "v\d{4}\.\d{2}\.\d+"/);
  assert.match(src, /LEGAL_RULESET_REVIEWED = "\d{4}-\d{2}-\d{2}"/);
});

test('Karnataka is told NOT to lead with the no-power argument', () => {
  const i = src.indexOf('function redHerringFor');
  assert.ok(i > 0, 'redHerringFor missing');
  const block = src.slice(i, i + 1400);
  assert.match(block, /karnataka/);
  assert.match(block, /had no power to freeze at all/);
  assert.match(block, /Lead with proportionality/);
});

test('the red herring covers the disputed-scope and s.107 cases too', () => {
  const i = src.indexOf('function redHerringFor');
  const block = src.slice(i, i + 1800);
  assert.match(block, /scope === "disputed"/);
  assert.match(block, /section === "107"/);
});
