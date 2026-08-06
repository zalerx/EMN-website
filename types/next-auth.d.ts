import type { DefaultSession } from "next-auth";
import type { MemberRole } from "./article";

declare module "next-auth" {
  interface Session {
    user: {
      studentId?: number;
      role?: MemberRole;
    } & DefaultSession["user"];
  }
}
