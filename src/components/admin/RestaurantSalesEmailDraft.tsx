import { CopyTextButton } from "@/components/admin/CopyTextButton";
import type { RestaurantSalesDraft } from "@/lib/admin/restaurant-no-website";

const HEADINGS: Record<RestaurantSalesDraft["salesType"], string> = {
  NO_WEBSITE_EMAIL: "NO_WEBSITE — Email Draft",
  WEBSITE_PROBLEM_EMAIL: "WEBSITE_PROBLEM — Email Draft",
};

export function RestaurantSalesEmailDraft({
  opportunity,
  help,
}: {
  opportunity: RestaurantSalesDraft;
  help: string;
}) {
  return (
    <section className="admin-panel" id="sales-email-draft">
      <h2>{HEADINGS[opportunity.salesType]}</h2>
      <p className="admin-help">{help}</p>
      <dl className="admin-dl">
        <div>
          <dt>Satış tipi</dt>
          <dd>
            <code>{opportunity.salesType}</code>
          </dd>
        </div>
        <div>
          <dt>Önerilen kanal</dt>
          <dd>
            <strong>{opportunity.recommendedChannel.label}</strong>
            {opportunity.recommendedChannel.href && opportunity.recommendedChannel.value ? (
              <>
                {" · "}
                <a href={opportunity.recommendedChannel.href} target="_blank" rel="noreferrer">
                  {opportunity.recommendedChannel.value}
                </a>
              </>
            ) : opportunity.recommendedChannel.value ? (
              <> · {opportunity.recommendedChannel.value}</>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Public email</dt>
          <dd>
            {opportunity.publicEmail ? (
              <a href={`mailto:${opportunity.publicEmail}`}>{opportunity.publicEmail}</a>
            ) : (
              "Yok — sahte e-posta yok"
            )}
          </dd>
        </div>
        <div>
          <dt>Özel e-posta yaklaşımı</dt>
          <dd>{opportunity.emailApproach}</dd>
        </div>
      </dl>
      <div className="admin-rl-draft-actions">
        <CopyTextButton text={opportunity.copyText} label="Copy Email" />
        <CopyTextButton text={opportunity.emailSubject} label="Copy subject" className="admin-btn ghost" />
        <CopyTextButton text={opportunity.emailBody} label="Copy body" className="admin-btn ghost" />
      </div>
      <label className="admin-rl-draft-field">
        Konu
        <input readOnly value={opportunity.emailSubject} />
      </label>
      <label className="admin-rl-draft-field">
        Taslak
        <textarea readOnly rows={18} value={opportunity.emailBody} />
      </label>
    </section>
  );
}
