import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.TEST_BASE_URL || "http://127.0.0.1:3010";
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outputDir = path.resolve("../v2-design/qa/browser");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: chromePath });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const failures = [];
const consoleErrors = [];

page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

async function step(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    console.log(`FAIL ${name}`);
  }
}

await step("public landing", async () => {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await assert.doesNotReject(() => page.getByRole("heading", { name: "Know what to do next." }).waitFor());
  assert.equal(await page.locator("img").first().getAttribute("alt"), "Abstract clock, evidence, and interrupted transaction-path materials in ivory, graphite, and amber");
  await page.screenshot({ path: path.join(outputDir, "desktop-landing.png"), fullPage: true });
});

await step("action room navigation", async () => {
  await page.goto(`${baseURL}/action-room`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Action Room" }).waitFor();
  await page.getByRole("link", { name: /Start triage/ }).first().waitFor();
  await page.screenshot({ path: path.join(outputDir, "desktop-action-room.png"), fullPage: true });
});

await step("four-question triage creates local case", async () => {
  await page.goto(`${baseURL}/action-room/intake`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "₹50,000" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "UPI" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Under an hour ago/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /I sent it, because I was misled/ }).click();
  await page.getByRole("button", { name: /Open my action room/ }).click();
  await page.waitForURL("**/action-room/case");
  await page.getByRole("heading", { name: "Your action room" }).waitFor();
  const stored = await page.evaluate(() => localStorage.getItem("gh-case-v1"));
  assert.ok(stored?.includes('"amount":50000'));
});

await step("case actions and Hindi call script", async () => {
  await page.getByRole("button", { name: "हिंदी" }).click();
  await page.getByText(/Mujhe aaj hue/).waitFor();
  await page.getByRole("button", { name: "I have done this" }).click();
  await page.waitForFunction(() => localStorage.getItem("gh-case-v1")?.includes('"call1930"'));
  await page.screenshot({ path: path.join(outputDir, "desktop-case.png"), fullPage: true });
});

await step("evidence checklist", async () => {
  await page.goto(`${baseURL}/action-room/evidence`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Transaction reference or UTR/ }).click();
  await page.getByText("1 of 6 saved").waitFor();
});

await step("OpenAI complaint draft", async () => {
  await page.goto(`${baseURL}/action-room/complaint`, { waitUntil: "networkidle" });
  await page.getByLabel("Tell us what happened, in any order").fill(
    "At around 10:20 AM I received a call claiming to be from a courier company. I was told to send fifty thousand rupees by UPI to cancel a false parcel case. I made the transfer and then realised the claim was fraudulent."
  );
  await page.getByRole("button", { name: "Write my complaint" }).click();
  await page.getByLabel("Your complaint draft, editable").waitFor({ timeout: 30000 });
  const sourceLabel = await page.locator("text=/Written by an OpenAI model|Built-in template/").first().innerText();
  assert.ok(sourceLabel === "Written by an OpenAI model" || sourceLabel === "Built-in template");
  console.log(`DRAFT_SOURCE ${sourceLabel}`);
});

await step("recovery tracker", async () => {
  await page.goto(`${baseURL}/action-room/recovery`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Recovery tracker" }).waitFor();
  await page.getByText(/1 \/ 5/).waitFor();
});

await step("frozen-account diagnostic and outputs", async () => {
  await page.goto(`${baseURL}/action-room/frozen`, { waitUntil: "networkidle" });
  await page.getByLabel("Your state").selectOption("Delhi");
  await page.getByLabel("Days since the account was frozen").fill("45");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Total balance frozen").fill("485000");
  await page.getByLabel("Amount the complaint is actually about").fill("25000");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Section 106 BNSS/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /My entire account/ }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Nobody has said either way/ }).click();
  await page.getByRole("button", { name: /No, nothing in writing/ }).click();
  await page.getByRole("button", { name: "Get my position" }).click();
  await page.getByRole("tab", { name: "Your position" }).waitFor();
  await page.getByRole("tab", { name: "Letter to the bank" }).click();
  await page.getByText(/Branch Manager/).waitFor();
  await page.getByRole("tab", { name: "RTI application" }).click();
  await page.getByText(/Right to Information/).waitFor();
});

await step("legacy route compatibility", async () => {
  await page.goto(`${baseURL}/act`, { waitUntil: "networkidle" });
  assert.ok(page.url().endsWith("/action-room/intake"));
  await page.goto(`${baseURL}/how-it-works`, { waitUntil: "networkidle" });
  assert.ok(page.url().endsWith("/methodology"));
});

await step("mobile layout", async () => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Know what to do next." }).waitFor();
  await page.screenshot({ path: path.join(outputDir, "mobile-landing.png"), fullPage: true });
  await page.goto(`${baseURL}/action-room`, { waitUntil: "networkidle" });
  await page.getByRole("navigation", { name: "Mobile Action Room navigation" }).waitFor();
  await page.screenshot({ path: path.join(outputDir, "mobile-action-room.png"), fullPage: true });
});

if (consoleErrors.length) failures.push(...consoleErrors.map((error) => `console: ${error}`));
await browser.close();

if (failures.length) {
  console.error("\nSMOKE FAILURES");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("SMOKE_OK");
