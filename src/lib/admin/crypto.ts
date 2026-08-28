import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken() {
  return randomBytes(32).toString("base64url");
}

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }
  return secret;
}

export function signSessionToken(token: string, secret: string) {
  const hmac = createHmac("sha256", secret).update(token).digest("base64url");
  return `${token}.${hmac}`;
}

export function verifySessionCookie(value: string, secret: string) {
  const [token, hmac] = value.split(".");
  if (!token || !hmac) {
    return null;
  }

  const expected = createHmac("sha256", secret).update(token).digest("base64url");
  const left = Buffer.from(hmac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  return token;
}
