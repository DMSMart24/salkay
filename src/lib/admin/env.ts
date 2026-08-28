export function readEnvValue(name: string) {
  const raw = process.env[name];
  if (raw == null) {
    return null;
  }

  let value = raw.replace(/^\uFEFF/, "").replace(/\r?\n$/, "");
  const quoted =
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2);
  if (quoted) {
    value = value.slice(1, -1);
  }

  if (!value || value === "[SENSITIVE]" || value === "[sensitive]") {
    return null;
  }

  return value;
}

export const MIN_ADMIN_PASSWORD_LENGTH = 8;
