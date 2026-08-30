import { z } from "zod";
import {
  CONTACT_PROJECT_TYPES,
  type ContactProjectType,
} from "@/lib/contact/types";

export { CONTACT_PROJECT_TYPES, type ContactProjectType };

export const CONTACT_MAX_BODY_BYTES = 16_384;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const contactInquirySchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    company: optionalText(160),
    phone: optionalText(40),
    service: z.string().trim().max(80).optional(),
    projectType: z.string().trim().max(80).optional(),
    message: z.string().trim().min(10).max(4000),
    website: optionalText(200),
  })
  .strict()
  .superRefine((value, ctx) => {
    const projectType = value.service || value.projectType || "";
    if (
      projectType &&
      !CONTACT_PROJECT_TYPES.includes(projectType as ContactProjectType)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["service"],
        message: "invalid_project_type",
      });
    }
  })
  .transform((value) => ({
    name: value.name,
    email: value.email,
    company: value.company,
    phone: value.phone,
    service: (value.service || value.projectType || undefined) as
      | ContactProjectType
      | undefined,
    message: value.message,
    website: value.website,
  }));

export type ContactInquiry = z.infer<typeof contactInquirySchema>;
