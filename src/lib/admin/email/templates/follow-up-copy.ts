import type { PremiumEmailKind } from "@/lib/admin/email/templates/premium-kind";

export type FollowUpStepNumber = 1 | 2;

export type FollowUpCopySpec = {
  preheader: string;
  eyebrow: string;
  body: readonly string[];
  offer?: string;
  ctaLabel: string;
  ctaStyle: "button" | "link";
};

const FOLLOW_UP_1_CTA = "Ücretsiz örneği görmek istiyorum";
const FOLLOW_UP_2_CTA = "İletişime geçmek istiyorum";

const HOOK: Record<Exclude<PremiumEmailKind, "custom">, { one: string; two: string }> = {
  restaurant: {
    one: "Özellikle rezervasyon ve mobil deneyim tarafında kısa bir örnek paylaşabilirim.",
    two: "İleride menü, rezervasyon veya mobil görünürlük tarafında destek gerekirse memnuniyetle yardımcı oluruz.",
  },
  bar: {
    one: "Özellikle etkinlik görünürlüğü ve rezervasyon yolu için kısa bir örnek paylaşabilirim.",
    two: "İleride gece programı veya rezervasyon tarafında destek gerekirse memnuniyetle yardımcı oluruz.",
  },
  construction: {
    one: "Özellikle proje ve referans sunumu için kısa bir örnek paylaşabilirim.",
    two: "İleride projelerinizin dijital sunumunda destek gerekirse memnuniyetle yardımcı oluruz.",
  },
  architecture: {
    one: "Özellikle portföy ve proje sunumu için kısa bir örnek paylaşabilirim.",
    two: "İleride ofis portföyünüzün sunumunda destek gerekirse memnuniyetle yardımcı oluruz.",
  },
  realEstate: {
    one: "Özellikle ilan sunumu ve mobil iletişim için kısa bir örnek paylaşabilirim.",
    two: "İleride ilan veya lead akışında destek gerekirse memnuniyetle yardımcı oluruz.",
  },
  hotel: {
    one: "Özellikle oda sunumu ve rezervasyon yolu için kısa bir örnek paylaşabilirim.",
    two: "İleride misafir deneyimi veya rezervasyon tarafında destek gerekirse memnuniyetle yardımcı oluruz.",
  },
  automotive: {
    one: "Özellikle araç sunumu, WhatsApp ve randevu yolu için kısa bir örnek paylaşabilirim.",
    two: "İleride showroom veya randevu akışında destek gerekirse memnuniyetle yardımcı oluruz.",
  },
};

const GENERIC = {
  one: "İsterseniz size özel düşündüğümüz kısa örneği ücretsiz paylaşabilirim.",
  two: "İleride web sitesi veya dijital görünürlük tarafında destek gerekirse memnuniyetle yardımcı oluruz.",
};

export function followUpCopy(
  kind: PremiumEmailKind,
  step: FollowUpStepNumber,
): FollowUpCopySpec {
  const hook = kind === "custom" ? GENERIC : HOOK[kind];
  if (step === 1) {
    return {
      preheader: "Kısa bir hatırlatma ve ücretsiz örnek.",
      eyebrow: "KISA BİR NOT",
      body: [
        "Geçtiğimiz günlerde dijital görünümünüzle ilgili kısa bir öneri paylaşmıştım.",
        "Mesajım gözden kaçmış olabilir diye tekrar iletmek istedim.",
        ...(kind === "custom" ? [] : [hook.one]),
      ],
      offer: GENERIC.one,
      ctaLabel: FOLLOW_UP_1_CTA,
      ctaStyle: "button",
    };
  }
  return {
    preheader: "Kısa bir kapanış notu. Acele yok.",
    eyebrow: "KISA BİR NOT",
    body: [
      "Kısa bir kez daha yazmak istedim.",
      "Şu an gündeminizde değilse sorun değil.",
      hook.two,
    ],
    ctaLabel: FOLLOW_UP_2_CTA,
    ctaStyle: "link",
  };
}

export function followUpWhatsAppMessage(companyName: string, step: FollowUpStepNumber) {
  const name = companyName.trim() || "işletmeniz";
  if (step === 1) {
    return `Merhaba Salih Bey, ${name} için gönderdiğiniz öneriyi inceledim. Ücretsiz örneği görmek isterim.`;
  }
  return `Merhaba Salih Bey, ${name} için yazdığınız son notu gördüm. İletişime geçmek isterim.`;
}
