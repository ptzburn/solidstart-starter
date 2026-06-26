import {
  emailFooter,
  emailHeading,
  emailParagraph,
} from "~/api/emails/utils/components.ts";
import { emailLayout } from "~/api/emails/utils/layout.ts";
import {
  DIVIDER,
  HEADING_STYLE,
  PARAGRAPH_STYLE,
} from "~/api/emails/utils/styles.ts";

type VerifyEmailVars = { otp: string };

export function verifyEmailTemplate({ otp }: VerifyEmailVars): string {
  return emailLayout({
    previewText: "Verify your email address",
    body: `${
      emailHeading(
        `<span>Verify your email address for </span
                                      ><span><strong>TaskApp</strong></span>`,
        `${HEADING_STYLE};text-align:center`,
      )
    }
${emailParagraph("<br />", `${PARAGRAPH_STYLE};text-align:center`)}
${emailParagraph("<span>Hi,</span>")}
${
      emailParagraph(`<span
                                        >Complete your registration by entering
                                        the 6-digit code in the original
                                        window:</span
                                      >`)
    }
${emailParagraph("<br />")}
${
      emailParagraph(
        `${otp}<span> </span>`,
        "margin:0;padding:0;font-size:32px;padding-top:0.5em;padding-bottom:0.5em;background-color:#f8f9fa;border-radius:2px;font-weight:700;text-align:center",
      )
    }
${
      emailParagraph(`<span
                                        >This code expires in 10 minutes.</span
                                      >`)
    }
${emailParagraph("<br />")}
${DIVIDER}
${
      emailFooter(`If you didn&#x27;t attempt to register,
                                        please ignore this message. Be cautious
                                        of phishing attempts and always verify
                                        the sender and domain (`)
    }`,
  });
}
