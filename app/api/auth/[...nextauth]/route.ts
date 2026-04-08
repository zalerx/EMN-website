import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/app/lib/supabase-server";

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
      // Gate magic-link delivery on membership.
      // Throwing here causes NextAuth to surface an EmailSignin error
      // on /membership, which the UI uses to show the "Join via UMSU" CTA.
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
    // Attach the student ID and name from public.members onto the session
    // so Phase 2's card page can render them directly.
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

function renderEmail({ url, name }: { url: string; name: string | null }) {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f1f1;font-family:'Schibsted Grotesk',Helvetica,Arial,sans-serif;color:#231f20;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f1;padding:40px 16px;">
      <tr><td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border:2px solid #000;border-radius:24px;padding:32px;">
          <tr><td>
            <h1 style="margin:0 0 16px;font-size:24px;">EMN Membership</h1>
            <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">${greeting}</p>
            <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">Click the button below to open your digital membership card.</p>
            <p style="margin:0 0 24px;">
              <a href="${url}" style="display:inline-block;background:#6ebf46;color:#000;text-decoration:none;font-weight:600;padding:12px 24px;border:2px solid #000;border-radius:9999px;">Open my card</a>
            </p>
            <p style="margin:0;font-size:13px;color:#555;line-height:1.5;">This link expires in 24 hours. If you didn't request it, you can safely ignore this email.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
