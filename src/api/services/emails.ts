import env from "~/env.ts";

import { deleteAccountTemplate } from "../emails/templates/delete-account.ts";
import { emailChangeTemplate } from "../emails/templates/email-change.ts";
import { resetPasswordTemplate } from "../emails/templates/reset-password.ts";
import { signUpAttemptTemplate } from "../emails/templates/sign-up-attempt.ts";
import { verifyEmailTemplate } from "../emails/templates/verify-email.ts";
import { sendMail } from "../lib/mailer.ts";

const domain = env.VITE_HOST_URL;
const fromAddress = `Solid Starter Template <${env.RESEND_EMAIL}>`;

function send(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<void> {
  return sendMail({ from: fromAddress, ...params });
}

type SendEmailVerificationParams = {
  email: string;
  otp: string;
};

export function sendEmailVerification(
  { email, otp }: SendEmailVerificationParams,
): Promise<void> {
  return send({
    to: email,
    subject: "Verify your email address",
    html: verifyEmailTemplate({ otp }),
  });
}

type SendSignUpAttemptWarningParams = {
  email: string;
  userName: string;
};

export function sendSignUpAttemptWarning(
  { email, userName }: SendSignUpAttemptWarningParams,
): Promise<void> {
  return send({
    to: email,
    subject: "Sign up attempt for Solid Starter Template",
    html: signUpAttemptTemplate({
      userName,
      signInUrl: `${domain}/auth/sign-in`,
    }),
  });
}

type SendResetPasswordParams = {
  email: string;
  userName: string;
  url: string;
};

export function sendResetPassword(
  { email, userName, url }: SendResetPasswordParams,
): Promise<void> {
  return send({
    to: email,
    subject: "Reset your password",
    html: resetPasswordTemplate({
      userName,
      resetPasswordUrl: url,
    }),
  });
}

type SendDeleteAccountVerificationEmailParams = {
  email: string;
  userName: string;
  url: string;
};

export function sendDeleteAccountVerificationEmail(
  { email, userName, url }: SendDeleteAccountVerificationEmailParams,
): Promise<void> {
  return send({
    to: email,
    subject: "Confirm account deletion",
    html: deleteAccountTemplate({
      userName,
      accountDeletionUrl: url,
    }),
  });
}

type SendEmailChangeParams = {
  email: string;
  userName: string;
  newEmail: string;
  verificationUrl: string;
};

export function sendEmailChangeConfirmation(
  { email, userName, newEmail, verificationUrl }: SendEmailChangeParams,
): Promise<void> {
  return send({
    to: email,
    subject: "Confirm your email address change",
    html: emailChangeTemplate({
      userName,
      newEmail,
      emailChangeUrl: verificationUrl,
    }),
  });
}
