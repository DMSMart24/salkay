import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

function loadDotEnv() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), name);
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index < 1) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadDotEnv();

function socialProof(instagram: string | null, maps: string | null, phone: string | null, whatsapp: string | null) {
  const channels = [instagram ? "Instagram" : null, maps ? "Google işletme profili" : null].filter(Boolean);
  if (channels.length) {
    return `Bağımsız website bulunamadı; müşteri yalnızca ${channels.join(" ve ")} üzerinden görünüyor.`;
  }
  if (phone || whatsapp) {
    return "Bağımsız website bulunamadı; kayıtta Instagram/Google URL’si yok, müşteri telefona yönleniyor.";
  }
  return "Bağımsız website bulunamadı; kayıtta site, Instagram ve Google URL’si yok.";
}

async function main() {
  const prisma = new PrismaClient();
  const before = await prisma.restaurantLead.count();
  if (before !== 239) throw new Error(`expected 239, got ${before}`);

  const leads = await prisma.restaurantLead.findMany({
    where: { websiteStatus: "NO_WEBSITE" },
  });

  let updated = 0;
  await prisma.$transaction(async (tx) => {
    for (const lead of leads) {
      const analysis = lead.websiteAnalysis ?? "";
      const generated =
        analysis.includes("kaydında bağımsız website URL") ||
        analysis.includes("NOT_VERIFIED bırakılmıştı ancak website URL");
      if (!generated) continue;
      const next = `${lead.restaurantName} (${lead.district}): ${socialProof(
        lead.instagram,
        lead.googleMapsUrl,
        lead.phone,
        lead.whatsapp,
      )}`;
      if (next === analysis) continue;
      const problem2 = lead.instagram || lead.googleMapsUrl
        ? "Müşteri Instagram veya Google profiline yönleniyor."
        : lead.phone || lead.whatsapp
          ? "Dijital vitrin yok; mevcut kanal telefon."
          : "Dijital vitrin yok.";
      await tx.restaurantLead.update({
        where: { id: lead.id },
        data: {
          websiteAnalysis: next,
          problem1: lead.problem1?.includes("websitesi yok") || lead.problem1?.includes("URL yok")
            ? "Bağımsız restoran websitesi yok."
            : lead.problem1,
          problem2,
        },
      });
      updated += 1;
    }
    if ((await tx.restaurantLead.count()) !== 239) throw new Error("count drifted");
  });

  console.log({ updated, count: await prisma.restaurantLead.count() });
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
