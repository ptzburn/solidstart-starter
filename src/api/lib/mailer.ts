import env from "~/env.ts";
import nodemailer, { type Transporter } from "nodemailer";

import { Resend } from "resend";

type SendMailParams = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

let smtpTransporter: Transporter | undefined;
let resendClient: Resend | undefined;

function getSmtpTransporter(): Transporter {
  if (smtpTransporter) return smtpTransporter;
  smtpTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    ignoreTLS: true,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS ?? "" }
      : undefined,
  });
  return smtpTransporter;
}

function getResendClient(): Resend {
  if (resendClient) return resendClient;
  resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

export async function sendMail(params: SendMailParams): Promise<void> {
  if (env.MAIL_TRANSPORT === "smtp") {
    await getSmtpTransporter().sendMail(params);
    return;
  }
  const { error } = await getResendClient().emails.send(params);
  if (error) throw new Error(error.message);
}
