import {
  CampaignStatus,
  CompanyPriority,
  CompanyStatus,
  OutreachStatus,
  SuppressionReason,
  TaskStatus,
  TaskType,
  WebsiteStatus,
} from "@prisma/client";
import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı."),
});

export const companySchema = z.object({
  companyName: z.string().trim().min(2, "Firma adı gerekli."),
  website: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/i.test(value) || /^[\w.-]+\.[a-z]{2,}/i.test(value), {
      message: "Geçerli bir website girin.",
    }),
  domain: optionalText,
  industry: optionalText,
  city: optionalText,
  district: optionalText,
  country: optionalText,
  address: optionalText,
  phone: optionalText,
  generalEmail: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin.")
    .optional()
    .or(z.literal("")),
  source: optionalText,
  notes: optionalText,
  status: z.nativeEnum(CompanyStatus),
  outreachStatus: z.nativeEnum(OutreachStatus).optional(),
  websiteScore: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(10).optional(),
  ),
  websiteStatus: z.nativeEnum(WebsiteStatus).optional(),
  websiteIssues: optionalText,
  recommendedServices: optionalText,
  researchSource: optionalText,
  groupId: optionalText,
  priority: z.nativeEnum(CompanyPriority),
  tags: optionalText,
  assignedToId: optionalText,
  confirmDuplicate: z.boolean().optional(),
});

export const contactSchema = z.object({
  companyId: z.string().min(1),
  firstName: z.string().trim().min(1, "Ad gerekli."),
  lastName: z.string().trim().min(1, "Soyad gerekli."),
  role: optionalText,
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin.")
    .optional()
    .or(z.literal("")),
  phone: optionalText,
  linkedin: optionalText,
  isPrimary: z.boolean().optional(),
  notes: optionalText,
});

export const noteSchema = z.object({
  companyId: z.string().min(1),
  contactId: optionalText,
  body: z.string().trim().min(2, "Not boş olamaz."),
});

export const statusSchema = z.object({
  companyId: z.string().min(1),
  status: z.nativeEnum(CompanyStatus),
});

export const taskSchema = z.object({
  companyId: z.string().min(1),
  contactId: optionalText,
  title: z.string().trim().min(2, "Görev başlığı gerekli."),
  dueAt: z.string().min(1, "Tarih gerekli."),
  type: z.nativeEnum(TaskType),
  notes: optionalText,
});

export const taskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
});

export const templateSchema = z.object({
  name: z.string().trim().min(2, "Şablon adı gerekli."),
  category: z.string().trim().min(2),
  subject: z.string().trim().min(2, "Konu gerekli."),
  body: z.string().trim().min(2, "İçerik gerekli."),
  language: z.string().trim().min(2).max(8),
  active: z.boolean().optional(),
});

export const sendTestEmailSchema = z.object({
  companyId: z.string().min(1, "Firma gerekli."),
  templateId: z.string().min(1, "Şablon seçin."),
  testEmail: z
    .string()
    .trim()
    .email("Geçerli bir test e-posta adresi girin.")
    .refine((value) => !value.includes(","), { message: "Test gönderimi yalnızca bir adrese yapılır." }),
});

export const composeSchema = z.object({
  companyId: z.string().min(1),
  contactId: optionalText,
  to: z.string().trim().email("Alıcı e-posta gerekli."),
  cc: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) =>
        !value ||
        value
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
          .every((part) => z.string().email().safeParse(part).success),
      { message: "CC alanındaki e-postalar geçersiz." },
    ),
  subject: z.string().trim().min(2, "Konu gerekli."),
  body: z.string().trim().min(2, "Mesaj gerekli."),
  templateId: optionalText,
  saveDraft: z.boolean().optional(),
});

export const campaignSchema = z.object({
  name: z.string().trim().min(2, "Kampanya adı gerekli."),
  description: optionalText,
  templateId: optionalText,
  status: z.nativeEnum(CampaignStatus).optional(),
  industry: optionalText,
  city: optionalText,
  country: optionalText,
  statusFilter: z.nativeEnum(CompanyStatus).optional(),
});

export const assignMessageSchema = z.object({
  messageId: z.string().min(1),
  companyId: z.string().min(1),
  contactId: optionalText,
});

export const suppressionSchema = z.object({
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  domain: optionalText,
  reason: z.nativeEnum(SuppressionReason),
  companyId: optionalText,
  contactId: optionalText,
  notes: optionalText,
  source: optionalText,
}).refine((value) => Boolean(value.email || value.domain), {
  message: "E-posta veya domain gerekli.",
});

export const bulkStatusSchema = z.object({
  companyIds: z.array(z.string().min(1)).min(1),
  status: z.nativeEnum(CompanyStatus),
});

export const groupSchema = z.object({
  name: z.string().trim().min(2, "Grup adı gerekli."),
  description: optionalText,
  industry: optionalText,
  city: optionalText,
  country: optionalText,
});

export const outreachStatusSchema = z.object({
  companyId: z.string().min(1),
  outreachStatus: z.nativeEnum(OutreachStatus),
});

export const bulkOutreachSchema = z.object({
  companyIds: z.array(z.string().min(1)).min(1),
  outreachStatus: z.nativeEnum(OutreachStatus),
});

export const moveToGroupSchema = z.object({
  companyIds: z.array(z.string().min(1)).min(1),
  groupId: z.string().min(1),
});

export const bulkSendSchema = z.object({
  groupId: optionalText,
  companyIds: z.array(z.string().min(1)).optional(),
  recipientMode: z.enum(["unsent", "selected", "score", "valid_email"]),
  websiteScoreMin: z.coerce.number().int().min(1).max(10).optional(),
  templateId: z.string().min(1, "Şablon seçin."),
  allowResend: z.boolean().optional(),
  confirm: z.boolean().optional(),
  batchSize: z.coerce.number().int().min(1).max(50).optional(),
});

export type FormState = {
  error?: string;
  success?: string;
  warnings?: string[];
};
