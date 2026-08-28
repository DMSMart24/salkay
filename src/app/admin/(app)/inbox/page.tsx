import Link from "next/link";
import { assignMessageForm, syncInboxForm } from "@/app/admin/actions/comms";
import { describeEmailProvider } from "@/lib/admin/email/provider";
import { formatDateTime } from "@/lib/admin/format";
import { directionLabels } from "@/lib/admin/labels";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

type Search = { filter?: string; thread?: string };

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const prisma = getPrisma();
  const filter = params.filter ?? "all";
  const provider = describeEmailProvider();

  const where = (() => {
    switch (filter) {
      case "replies":
        return { direction: "INBOUND" as const };
      case "unread":
        return { unread: true };
      case "sent":
        return { direction: "OUTBOUND" as const };
      case "unassigned":
        return { companyId: null };
      case "all":
        return {};
      default:
        return {};
    }
  })();

  const [messages, companies, selected] = await Promise.all([
    prisma.emailMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        company: {
          select: { id: true, companyName: true, group: { select: { name: true } } },
        },
        contact: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.company.findMany({
      where: { archivedAt: null },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
      take: 200,
    }),
    params.thread
      ? prisma.emailMessage.findMany({
          where: { threadId: params.thread },
          orderBy: { createdAt: "asc" },
          include: { company: { select: { companyName: true, group: { select: { name: true } } } } },
        })
      : Promise.resolve([]),
  ]);

  const lastOutbound = selected.filter((item) => item.direction === "OUTBOUND").at(-1);

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Inbox</p>
          <h1>Yanıtlar</h1>
        </div>
        <form action={syncInboxForm}>
          <button className="admin-btn ghost">Sync inbox</button>
        </form>
      </header>
      {!provider.supportsInboxSync ? (
        <p className="admin-warning">Gelen e-posta senkronizasyonu henüz bağlı değil.</p>
      ) : null}
      <nav className="admin-tabs">
        {[
          ["all", "Tümü"],
          ["replies", "Yeni Yanıtlar"],
          ["unread", "Okunmamış"],
          ["sent", "Gönderilen"],
          ["unassigned", "Atanmamış"],
        ].map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/inbox?filter=${value}`}
            className={filter === value ? "is-active" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="admin-inbox">
        <ul className="admin-list">
          {messages.map((message) => (
            <li key={message.id}>
              <Link href={`/admin/inbox?filter=${filter}&thread=${message.threadId}`}>
                {message.subject}
              </Link>
              <span>
                {message.company?.companyName ?? "Atanmamış"}
                {message.company?.group?.name ? ` · ${message.company.group.name}` : ""} ·{" "}
                {directionLabels[message.direction]} · {formatDateTime(message.sentAt ?? message.receivedAt)}
              </span>
            </li>
          ))}
        </ul>
        <section className="admin-panel">
          {selected.length === 0 ? (
            <p className="admin-help">Bir ileti seçin.</p>
          ) : (
            <>
              {lastOutbound ? (
                <p className="admin-help">Son giden: {lastOutbound.subject}</p>
              ) : null}
              {selected.map((message) => (
                <article key={message.id} className="admin-msg">
                  <p>
                    <strong>{directionLabels[message.direction]}</strong> · {message.fromAddress} →{" "}
                    {message.toAddress}
                    {message.company?.group?.name ? ` · ${message.company.group.name}` : ""}
                  </p>
                  <pre>{message.bodyText}</pre>
                  {!message.companyId ? (
                    <form action={assignMessageForm} className="admin-form">
                      <input type="hidden" name="messageId" value={message.id} />
                      <label>
                        Firmaya bağla
                        <select name="companyId" required defaultValue="">
                          <option value="" disabled>
                            Seç
                          </option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.companyName}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button className="admin-btn">Eşleştir</button>
                    </form>
                  ) : (
                    <Link href={`/admin/companies/${message.companyId}`}>Firmayı aç</Link>
                  )}
                </article>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
