import {
  emailButton,
  emailFooter,
  emailHeading,
  emailParagraph,
} from "~/api/emails/utils/components.ts";
import { emailLayout } from "~/api/emails/utils/layout.ts";
import { DIVIDER, PARAGRAPH_STYLE } from "~/api/emails/utils/styles.ts";

type ResetPasswordVars = {
  userName: string;
  resetPasswordUrl: string;
};

export function resetPasswordTemplate(
  { userName, resetPasswordUrl }: ResetPasswordVars,
): string {
  return emailLayout({
    previewText: "Reset password",
    body: `${
      emailHeading(`<span>Reset you password for </span
                                      ><span><strong>TaskApp</strong></span>`)
    }
${emailParagraph("<br />")}
${
      emailParagraph(`<span>Hi </span>${userName}<span
                                        >,</span
                                      >`)
    }
${
      emailParagraph(`<span
                                        >Reset your password by clicking the
                                        button below:</span
                                      >`)
    }
${emailParagraph("<br />")}
${emailButton({ url: resetPasswordUrl, text: "Reset Password" })}
${emailParagraph("<br />", `${PARAGRAPH_STYLE};text-align:center`)}
${DIVIDER}
${
      emailFooter(`If you didn&#x27;t attempt to reset
                                        your password, please ignore this
                                        message. Be cautious of phishing
                                        attempts and always verify the sender
                                        and domain (`)
    }`,
  });
}
