import { NextResponse } from "next/server";
import { processContactInquiry } from "@/lib/contact/process";
import { CONTACT_MAX_BODY_BYTES } from "@/lib/contact/schema";

export const runtime = "nodejs";

function safeError(status: 400 | 500) {
  return NextResponse.json(
    { ok: false, error: status === 400 ? "invalid" : "failed" },
    { status },
  );
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || "0");
  if (length > CONTACT_MAX_BODY_BYTES) {
    return safeError(400);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return safeError(400);
  }

  const serialized = JSON.stringify(payload);
  if (serialized.length > CONTACT_MAX_BODY_BYTES) {
    return safeError(400);
  }

  const result = await processContactInquiry(payload);
  if (!result.ok) {
    return safeError(result.status);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
