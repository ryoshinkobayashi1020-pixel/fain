import { prisma } from "@/lib/prisma";

type SendEmailInput = {
  to: string;
  subject: string;
  body: string;
};

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
  );
}

async function sendViaSmtp({ to, subject, body }: SendEmailInput) {
  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text: body,
  });
}

/**
 * SMTP env vars (SMTP_HOST/PORT/USER/PASS, EMAIL_FROM) are unset in local dev,
 * so this falls back to logging the email to EmailLog instead of failing loudly.
 */
export async function sendEmail({ to, subject, body }: SendEmailInput) {
  const smtpReady = isSmtpConfigured();

  if (smtpReady) {
    try {
      await sendViaSmtp({ to, subject, body });
    } catch (error) {
      console.error("メール送信に失敗しました:", error);
      await prisma.emailLog.create({ data: { to, subject, body, delivered: false } });
      return;
    }
  } else {
    console.log(`[メール送信(未設定のためログのみ)] To: ${to} / Subject: ${subject}\n${body}`);
  }

  await prisma.emailLog.create({ data: { to, subject, body, delivered: smtpReady } });
}
