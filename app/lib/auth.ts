import { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { renderEmail } from "@/app/lib/email-template";

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  session: { strategy: "database" },
  pages: {
    signIn: "/membership",
    error: "/membership",
  },
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER!,
      from: process.env.EMAIL_FROM!,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { data: member, error } = await supabaseAdmin
          .from("members")
          .select("id, name")
          .eq("email", email.toLowerCase())
          .maybeSingle();

        if (error) {
          console.error("[auth] members lookup failed:", error);
          throw new Error("MEMBERS_LOOKUP_FAILED");
        }
        if (!member) {
          throw new Error("NOT_A_MEMBER");
        }

        const transport = nodemailer.createTransport(provider.server);
        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: "Your EMN membership sign-in link",
          text: `Sign in to your EMN membership card:\n${url}\n\nThis link expires in 24 hours. If you didn't request it, ignore this email.`,
          html: renderEmail({ url, name: member.name }),
        });
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (!session.user?.email) return session;
      const { data: member } = await supabaseAdmin
        .from("members")
        .select("id, name")
        .eq("email", session.user.email.toLowerCase())
        .maybeSingle();
      if (member) {
        session.user.studentId = Number(member.id);
        session.user.name = member.name;
      }
      return session;
    },
  },
};
