import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = "http://127.0.0.1:3456";
const viewports = [
  { name: "375", width: 375, height: 812 },
  { name: "390", width: 390, height: 844 },
  { name: "430", width: 430, height: 932 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "1920", width: 1920, height: 1080 },
];

const routes = ["/", "/hizmetler", "/projeler", "/hakkimizda", "/blog", "/iletisim"];

await mkdir("tmp/ui-verify", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const issues = [];

for (const route of routes) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  if (!response || response.status() >= 400) {
    issues.push(`${route} returned ${response?.status()}`);
  }
}

for (const viewport of viewports) {
  await page.setViewportSize(viewport);
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    };
  });
  if (overflow.scrollWidth > overflow.clientWidth + 1) {
    issues.push(
      `Homepage overflow at ${viewport.name}: ${overflow.scrollWidth} > ${overflow.clientWidth}`,
    );
  }
  await page.screenshot({
    path: path.join("tmp/ui-verify", `home-${viewport.name}.png`),
    fullPage: false,
  });
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /menüyü aç/i }).click();
await page.getByRole("link", { name: "İletişim" }).last().click();
await page.waitForURL("**/iletisim");
await page.getByLabel("Adınız").fill("Deneme");
await page.getByLabel("E-posta").fill("deneme@example.com");
await page.getByLabel("Projeniz").fill("Kurumsal web sitesi yenilemek istiyoruz.");
await page.getByRole("button", { name: "Gönderin" }).click();
const unwired = await page.getByRole("status").textContent();
if (!unwired?.includes("henüz iletime açık değil")) {
  issues.push(`Contact form status missing or unexpected: ${unwired}`);
}

await page.screenshot({
  path: path.join("tmp/ui-verify", "contact-390.png"),
  fullPage: true,
});

await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.screenshot({
  path: path.join("tmp/ui-verify", "home-1440-full.png"),
  fullPage: true,
});

await browser.close();

if (issues.length) {
  console.error("UI verification failed:");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}

console.log("UI verification passed.");
console.log(`Checked routes: ${routes.join(", ")}`);
console.log(`Checked viewports: ${viewports.map((item) => item.name).join(", ")}`);
