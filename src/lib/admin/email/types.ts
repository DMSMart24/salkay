export type EmailSendInput = {
  to: string;
  cc?: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  from?: string;
  fromName?: string;
};

export type EmailSendResult =
  | { ok: true; providerMessageId: string; threadId?: string }
  | { ok: false; error: string; configured: boolean };

export type InboxSyncResult =
  | { ok: true; imported: number }
  | { ok: false; error: string; configured: boolean };

export interface EmailProvider {
  readonly id: string;
  readonly configured: boolean;
  readonly supportsInboxSync: boolean;
  sendEmail(input: EmailSendInput): Promise<EmailSendResult>;
  syncInbox(): Promise<InboxSyncResult>;
  getThread(threadId: string): Promise<unknown | null>;
  getMessage(messageId: string): Promise<unknown | null>;
}
