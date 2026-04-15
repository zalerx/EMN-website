import { createHmac } from "crypto";

// Derive a purpose-specific key from NEXTAUTH_SECRET so we don't
// reuse the same key material for session signing and QR signing.
function getKey() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return `qr-verify:${secret}`;
}

/** Sign a student ID → hex HMAC string. */
export function signStudentId(studentId: number): string {
  return createHmac("sha256", getKey())
    .update(String(studentId))
    .digest("hex");
}

/** Verify that a signature matches a student ID. */
export function verifyStudentId(studentId: number, sig: string): boolean {
  const expected = signStudentId(studentId);
  // Constant-time comparison to prevent timing attacks.
  if (expected.length !== sig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return mismatch === 0;
}
