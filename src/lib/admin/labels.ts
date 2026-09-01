import type {
  ActivityType,
  CampaignStatus,
  CompanyPriority,
  CompanyStatus,
  EmailDirection,
  EmailMessageStatus,
  OutreachStatus,
  SuppressionReason,
  TaskStatus,
  TaskType,
  UserRole,
  WebsiteStatus,
} from "@prisma/client";

export const companyStatusLabels: Record<CompanyStatus, string> = {
  NEW: "Yeni",
  RESEARCHED: "Araştırıldı",
  CONTACTED: "İletişime geçildi",
  FOLLOW_UP: "Takip",
  REPLIED: "Yanıtlandı",
  MEETING: "Toplantı",
  OFFER_SENT: "Teklif gönderildi",
  WON: "Kazanıldı",
  LOST: "Kaybedildi",
  DO_NOT_CONTACT: "İletişim kurulmasın",
};

export const priorityLabels: Record<CompanyPriority, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

export const taskTypeLabels: Record<TaskType, string> = {
  EMAIL: "E-posta",
  CALL: "Arama",
  MEETING: "Toplantı",
  FOLLOW_UP: "Takip",
  OTHER: "Diğer",
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  OPEN: "Açık",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
};

export const campaignStatusLabels: Record<CampaignStatus, string> = {
  DRAFT: "Taslak",
  READY: "Hazır",
  SENDING: "Gönderiliyor",
  PAUSED: "Duraklatıldı",
  COMPLETED: "Tamamlandı",
};

export const suppressionLabels: Record<SuppressionReason, string> = {
  DO_NOT_CONTACT: "İletişim kurulmasın",
  UNSUBSCRIBE: "Abonelikten çıktı",
  BOUNCED: "Geri döndü",
  INVALID: "Geçersiz e-posta",
  MANUAL: "Manuel engel",
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  SALES: "Satış",
  VIEWER: "İzleyici",
};

export const activityLabels: Record<ActivityType, string> = {
  COMPANY_CREATED: "Firma oluşturuldu",
  COMPANY_UPDATED: "Firma güncellendi",
  CONTACT_ADDED: "Kişi eklendi",
  CONTACT_UPDATED: "Kişi güncellendi",
  EMAIL_SENT: "E-posta gönderildi",
  EMAIL_DRAFTED: "Taslak kaydedildi",
  REPLY_RECEIVED: "Yanıt alındı",
  STATUS_CHANGED: "Durum değişti",
  FOLLOW_UP_SCHEDULED: "Takip planlandı",
  NOTE_CREATED: "Not eklendi",
  MEETING_ADDED: "Toplantı eklendi",
  MARKED_DO_NOT_CONTACT: "İletişim yasağı",
  TASK_CREATED: "Görev oluşturuldu",
  TASK_COMPLETED: "Görev tamamlandı",
  TEMPLATE_CREATED: "Şablon oluşturuldu",
  CAMPAIGN_CREATED: "Kampanya oluşturuldu",
  MESSAGE_ASSIGNED: "Mesaj eşleştirildi",
  GROUP_CREATED: "Grup oluşturuldu",
  COMPANIES_IMPORTED: "Firmalar içe aktarıldı",
  EMAIL_QUEUED: "E-posta kuyruğa alındı",
};

export const emailStatusLabels: Record<EmailMessageStatus, string> = {
  DRAFT: "Taslak",
  QUEUED: "Kuyrukta",
  SENDING: "Gönderiliyor",
  SENT: "Gönderildi",
  FAILED: "Başarısız",
  BOUNCED: "Geri döndü",
  DELIVERED: "Teslim edildi",
  RECEIVED: "Alındı",
  REPLIED: "Yanıtlandı",
};

export const outreachStatusLabels: Record<OutreachStatus, string> = {
  NEW: "Yeni",
  READY: "Hazır",
  SENT: "Gönderildi",
  REPLIED: "Yanıt geldi",
  FAILED: "Başarısız",
  DO_NOT_CONTACT: "İletişim kurma",
};

export const websiteStatusLabels: Record<WebsiteStatus, string> = {
  GOOD: "İyi",
  AVERAGE: "Orta",
  NEEDS_UPGRADE: "Güncellenmeli",
  UNKNOWN: "Henüz İncelenmedi",
  NO_WEBSITE: "Web sitesi bulunamadı",
  VERY_WEAK: "Çok Zayıf",
  WEAK: "Zayıf",
  IMPROVABLE: "Geliştirilebilir",
  VERY_GOOD: "Çok İyi",
  NOT_VERIFIED: "Henüz İncelenmedi",
};

export const suppressionSourceLabels: Record<string, string> = {
  unsubscribe: "Unsubscribe",
  bounce: "Bounce",
  invalid: "Invalid",
  manual: "Manual",
  import: "Import",
  "do-not-contact": "Do Not Contact",
};

export const directionLabels: Record<EmailDirection, string> = {
  INBOUND: "Gelen",
  OUTBOUND: "Giden",
};

export const templateCategories = [
  "RESTORAN",
  "BAR",
  "İNŞAAT",
  "MİMARLIK",
  "GAYRİMENKUL",
  "OTEL",
  "OTOMOTİV",
  "GENEL",
  "FOLLOW_UP",
] as const;

export const pipelineStages = [
  { key: "neu", label: "Neu", statuses: ["NEW", "RESEARCHED"] as CompanyStatus[] },
  { key: "kontaktiert", label: "Kontaktiert", statuses: ["CONTACTED"] as CompanyStatus[] },
  { key: "followup", label: "Follow-up", statuses: ["FOLLOW_UP"] as CompanyStatus[] },
  { key: "antwort", label: "Antwort", statuses: ["REPLIED"] as CompanyStatus[] },
  { key: "termin", label: "Termin", statuses: ["MEETING"] as CompanyStatus[] },
  { key: "offerte", label: "Offerte", statuses: ["OFFER_SENT"] as CompanyStatus[] },
  { key: "kunde", label: "Kunde", statuses: ["WON"] as CompanyStatus[] },
] as const;

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}
