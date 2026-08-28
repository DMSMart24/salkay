import { ensureInitialAdmin } from "../src/lib/admin/bootstrap";

async function main() {
  const result = await ensureInitialAdmin();
  if (result.status === "created") {
    console.log(`Initial admin created: ${result.email} (${result.role})`);
    return;
  }
  if (result.status === "exists") {
    console.log(`Admin already exists: ${result.email} (${result.role})`);
    return;
  }
  console.log(`Admin seed skipped: ${result.reason}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.name : "Seed failed");
  process.exit(1);
});
