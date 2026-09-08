import Link from "next/link";
import { CopyTextButton } from "@/components/admin/CopyTextButton";
import type { RestaurantSalesEmail } from "@/lib/admin/restaurant-sales-email";
import { nextSalesEmailVariant } from "@/lib/admin/restaurant-sales-email";

export function RestaurantSalesEmailStudio({
  draft,
  regenerateHref,
}: {
  draft: RestaurantSalesEmail;
  regenerateHref: string;
}) {
  const recipient = draft.recipient;

  return (
    <section className="admin-panel" id="sales-email-draft">
      <h2>Satış e-postası</h2>
      <p className="admin-help">
        Gönderilmez. Tracking yok. Taslak yalnızca doğrulanmış CRM alanlarından üretilir; sahte e-posta
        üretilmez.
      </p>
      <dl className="admin-dl">
        <div>
          <dt>Email Type</dt>
          <dd>
            <code>{draft.emailType}</code>
          </dd>
        </div>
        <div>
          <dt>Recipient</dt>
          <dd>
            {recipient ? (
              <a href={`mailto:${recipient}`}>{recipient}</a>
            ) : (
              "Boş — public email yok, sahte adres yok"
            )}
          </dd>
        </div>
        <div>
          <dt>Önerilen kanal</dt>
          <dd>
            <strong>{draft.recommendedChannel.label}</strong>
            {draft.recommendedChannel.value ? ` · ${draft.recommendedChannel.value}` : null}
          </dd>
        </div>
        <div>
          <dt>Kişiselleştirme</dt>
          <dd>
            {draft.personalization.venueKind}
            {draft.personalization.district ? ` · ${draft.personalization.district}` : ""}
            {draft.personalization.googleProof ? ` · ${draft.personalization.googleProof}` : ""}
            {draft.personalization.instagram ? " · Instagram" : ""}
            {draft.personalization.website ? ` · ${draft.personalization.website}` : ""}
            {draft.personalization.problemsUsed.length
              ? ` · ${draft.personalization.problemsUsed.length} doğrulanmış problem`
              : ""}
          </dd>
        </div>
        <div>
          <dt>CTA</dt>
          <dd>{draft.cta}</dd>
        </div>
        <div>
          <dt>Taslak</dt>
          <dd>
            {draft.variant + 1} / 3
          </dd>
        </div>
      </dl>
      <div className="admin-rl-draft-actions">
        <CopyTextButton text={draft.subject} label="Copy Subject" />
        <CopyTextButton text={draft.plainText} label="Copy Email" />
        <CopyTextButton text={draft.html} label="Copy HTML" className="admin-btn ghost" />
        <Link href={regenerateHref} className="admin-btn ghost">
          Regenerate Draft
        </Link>
      </div>
      <label className="admin-rl-draft-field">
        Subject
        <input readOnly value={draft.subject} />
      </label>
      <div className="admin-rl-email-previews">
        <label className="admin-rl-draft-field">
          HTML Preview
          <iframe
            className="admin-rl-html-preview"
            title="HTML e-posta önizleme"
            sandbox=""
            srcDoc={draft.html}
          />
        </label>
        <label className="admin-rl-draft-field">
          Plain Text Preview
          <textarea readOnly rows={16} value={draft.plainText} />
        </label>
      </div>
    </section>
  );
}

export function restaurantSalesRegenerateHref(leadId: string, variant: number) {
  const next = nextSalesEmailVariant(variant);
  return `/admin/restaurant-leads/${leadId}?draft=${next}#sales-email-draft`;
}
