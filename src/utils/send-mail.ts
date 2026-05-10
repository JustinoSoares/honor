import { transporter } from "../lib/mailer";
import { env } from "../env";

export async function sendVerificationEmail(email: string, code: string) {
  await transporter.sendMail({
    from: `"Honor" <${env.SMTP_USER}>`,
    to: email,
    subject: "Honor - Código de verificação",
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Seu código de verificação</h2>
        <p>Use o código abaixo para confirmar seu email:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
          ${code}
        </div>
        <p style="color: #888; font-size: 12px;">Expira em 10 minutos.</p>
      </div>
    `,
  });
}
