import { applyMerge } from "@/lib/admin/email/html";

export const MERGE_KEYS = [
  "companyName",
  "contactName",
  "firstName",
  "companyEmail",
  "website",
  "district",
  "city",
  "industry",
  "score",
  "issue_1",
  "issue_2",
  "issue_3",
  "issue_4",
  "recommendedServices",
  "companyPhone",
  "unsubscribeUrl",
  "salkayPhone",
  "salkayEmail",
  "salkayWebsite",
  "ctaUrl",
] as const;

export type MergeKey = (typeof MERGE_KEYS)[number];

export type MergeVars = Partial<Record<MergeKey, string>>;

export const mergeVariableHelp: Array<{ key: MergeKey; label: string }> = [
  { key: "companyName", label: "Firma adı" },
  { key: "contactName", label: "Kişi adı" },
  { key: "firstName", label: "Ad" },
  { key: "companyEmail", label: "Firma e-posta" },
  { key: "website", label: "Website" },
  { key: "district", label: "İlçe" },
  { key: "city", label: "Şehir" },
  { key: "industry", label: "Sektör" },
  { key: "score", label: "Website skoru" },
  { key: "issue_1", label: "Geliştirme 1" },
  { key: "issue_2", label: "Geliştirme 2" },
  { key: "issue_3", label: "Geliştirme 3" },
  { key: "issue_4", label: "Geliştirme 4" },
  { key: "recommendedServices", label: "Önerilen hizmetler" },
  { key: "companyPhone", label: "Firma telefon" },
  { key: "unsubscribeUrl", label: "Abonelikten çık" },
  { key: "salkayPhone", label: "SALKAY telefon" },
  { key: "salkayEmail", label: "SALKAY e-posta" },
  { key: "salkayWebsite", label: "SALKAY website" },
  { key: "ctaUrl", label: "CTA URL" },
];

export function mergeTemplate(source: string, vars: MergeVars) {
  const filled: Record<string, string> = {};
  for (const key of MERGE_KEYS) {
    filled[key] = vars[key] ?? "";
  }
  return applyMerge(source, filled, false);
}
