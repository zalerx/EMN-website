import "server-only";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// The single authority on who counts as committee. Admin pages call
// getCommitteeSession() and redirect on null; every mutating server action
// calls requireCommittee() and lets the throw abort the mutation. Middleware
// (if ever added) is a UX convenience only — this is the security boundary.
export async function getCommitteeSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user?.email) return null;
  if (role !== "committee" && role !== "admin") return null;
  return session;
}

export async function requireCommittee(): Promise<Session> {
  const session = await getCommitteeSession();
  if (!session) {
    throw new Error("Unauthorized: committee access required");
  }
  return session;
}
