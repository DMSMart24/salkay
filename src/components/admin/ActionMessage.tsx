import type { FormState } from "@/lib/admin/validation";

export function ActionMessage({ state }: { state?: FormState }) {
  if (!state?.error && !state?.success && !state?.warnings?.length) {
    return null;
  }

  return (
    <div className="admin-messages" role="status">
      {state.error ? <p className="admin-error">{state.error}</p> : null}
      {state.success ? <p className="admin-success">{state.success}</p> : null}
      {state.warnings?.map((warning) => (
        <p key={warning} className="admin-warning">
          {warning}
        </p>
      ))}
    </div>
  );
}
