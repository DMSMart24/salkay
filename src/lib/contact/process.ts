import {
  contactInquirySchema,
  type ContactInquiry,
} from "@/lib/contact/schema";
import { sendContactInquiry } from "@/lib/contact/mail";

export type ContactProcessResult =
  | { ok: true }
  | { ok: false; status: 400 | 500 };

type SendFn = (inquiry: ContactInquiry) => Promise<{ ok: boolean }>;

export async function processContactInquiry(
  input: unknown,
  send: SendFn = sendContactInquiry,
): Promise<ContactProcessResult> {
  const parsed = contactInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, status: 400 };
  }

  if (parsed.data.website) {
    return { ok: true };
  }

  const sent = await send(parsed.data);
  if (!sent.ok) {
    return { ok: false, status: 500 };
  }

  return { ok: true };
}
