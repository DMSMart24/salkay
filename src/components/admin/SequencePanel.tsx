import {
  markCompanyRepliedForm,
  stopFollowUpSequenceForm,
} from "@/app/admin/actions/outreach";
import { formatDateTime } from "@/lib/admin/format";
import type { CompanySequenceView } from "@/lib/admin/email/sequence";

type SequencePanelProps = {
  companyId: string;
  sequence: CompanySequenceView;
  stopped: boolean;
};

function statusLabel(status: CompanySequenceView["initial"]["status"]) {
  switch (status) {
    case "PENDING":
      return "PENDING";
    case "READY":
      return "READY";
    case "SENT":
      return "SENT";
    case "SKIPPED":
      return "SKIPPED";
    case "STOPPED":
      return "STOPPED";
    default: {
      const _never: never = status;
      return _never;
    }
  }
}

export function SequencePanel({ companyId, sequence, stopped }: SequencePanelProps) {
  const steps = [sequence.initial, sequence.followUp1, sequence.followUp2];
  return (
    <section className="admin-panel">
      <h2>Outreach sequence</h2>
      <ol className="admin-list">
        {steps.map((step) => (
          <li key={step.step}>
            <strong>
              {step.label} · {statusLabel(step.status)}
            </strong>
            <span>
              {step.sentAt
                ? `Gönderildi ${formatDateTime(step.sentAt)}`
                : step.readyAt
                  ? `Hazır ${formatDateTime(step.readyAt)}`
                  : step.reason || "—"}
            </span>
          </li>
        ))}
      </ol>
      {sequence.nextFollowUp ? (
        <p className="admin-help">
          Next follow-up: Follow-up {sequence.nextFollowUp.step} ·{" "}
          {formatDateTime(sequence.nextFollowUp.readyAt)}
        </p>
      ) : sequence.complete ? (
        <p className="admin-help">Sequence tamamlandı.</p>
      ) : null}
      <p className="admin-help">{sequence.replyDetectionNote}</p>
      <div className="admin-actions">
        <form action={markCompanyRepliedForm}>
          <input type="hidden" name="companyId" value={companyId} />
          <button className="admin-btn ghost">Yanıtlandı olarak işaretle</button>
        </form>
        {stopped ? (
          <p className="admin-help">Follow-up manuel durduruldu.</p>
        ) : (
          <form action={stopFollowUpSequenceForm}>
            <input type="hidden" name="companyId" value={companyId} />
            <button className="admin-btn ghost">Follow-up durdur</button>
          </form>
        )}
      </div>
    </section>
  );
}
