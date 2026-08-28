import Link from "next/link";
import { updateTaskStatusAction } from "@/app/admin/actions/comms";
import { formatDateTime } from "@/lib/admin/format";
import { taskStatusLabels, taskTypeLabels } from "@/lib/admin/labels";
import { getPrisma } from "@/lib/admin/prisma";

export const dynamic = "force-dynamic";

type Search = { view?: string };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { view = "today" } = await searchParams;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const where = (() => {
    switch (view) {
      case "overdue":
        return { status: "OPEN" as const, dueAt: { lt: start } };
      case "upcoming":
        return { status: "OPEN" as const, dueAt: { gt: end } };
      case "completed":
        return { status: "COMPLETED" as const };
      default:
        return { status: "OPEN" as const, dueAt: { gte: start, lte: end } };
    }
  })();

  const tasks = await getPrisma().task.findMany({
    where,
    orderBy: { dueAt: "asc" },
    include: { company: { select: { id: true, companyName: true } } },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="admin-kicker">Aufgaben</p>
          <h1>Görevler</h1>
        </div>
      </header>
      <nav className="admin-tabs">
        {[
          ["today", "TODAY"],
          ["overdue", "OVERDUE"],
          ["upcoming", "UPCOMING"],
          ["completed", "COMPLETED"],
        ].map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/tasks?view=${value}`}
            className={view === value ? "is-active" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Görev</th>
              <th>Firma</th>
              <th>Tür</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>
                  <Link href={`/admin/companies/${task.company.id}`}>
                    {task.company.companyName}
                  </Link>
                </td>
                <td>{taskTypeLabels[task.type]}</td>
                <td>{taskStatusLabels[task.status]}</td>
                <td>{formatDateTime(task.dueAt)}</td>
                <td>
                  {task.status === "OPEN" ? (
                    <form action={updateTaskStatusAction}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="status" value="COMPLETED" />
                      <button className="admin-btn ghost">Tamamla</button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
