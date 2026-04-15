export function renderEmail({
  url,
  name,
}: {
  url: string;
  name: string | null;
}) {
  // Name is stored as "Lastname, FirstName" in Supabase
  const firstName = name
    ? name.includes(",") ? name.split(",")[1].trim() : name.split(" ")[0]
    : null;
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f1f1;font-family:'Schibsted Grotesk',Helvetica,Arial,sans-serif;color:#221f20;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1f1;padding:40px 16px;">
      <tr><td align="center">
        <table width="100%" style="max-width:520px;" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0 0 24px;">
            <h1 style="margin:0;font-family:'Candu';font-size:32px;font-weight:900;color:#221f20;text-transform:uppercase;">EMN MEMBERSHIP</h1>
          </td></tr>
          <tr><td style="background:#ffffff;border-radius:16px;padding:32px;">
            <p style="margin:0 0 12px;font-size:16px;line-height:1.5;font-weight:600;color:#221f20;">${greeting}</p>
            <p style="margin:0 0 28px;font-size:16px;line-height:1.5;font-weight:600;color:rgba(34,31,32,0.7);">Click the button below to open your digital membership card.</p>
            <p style="margin:0 0 28px;text-align:center;">
              <a href="${url}" style="display:inline-block;background:#221f20;color:#ffffff;text-decoration:none;font-weight:900;padding:14px 28px;border-radius:28px;font-size:16px;">Open my card</a>
            </p>
            <p style="margin:0;font-size:13px;font-weight:600;color:rgba(34,31,32,0.4);line-height:1.5;">This link expires in 24 hours. If you didn't request it, you can safely ignore this email.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
