import {
  emailButton,
  emailFooter,
  emailHeading,
  emailParagraph,
} from "~/api/emails/utils/components.ts";
import { emailLayout } from "~/api/emails/utils/layout.ts";
import { DIVIDER } from "~/api/emails/utils/styles.ts";

type EmailChangeVars = {
  userName: string;
  newEmail: string;
  emailChangeUrl: string;
};

export function emailChangeTemplate(
  { userName, newEmail, emailChangeUrl }: EmailChangeVars,
): string {
  return emailLayout({
    previewText: "Email change",
    body: `${
      emailHeading(`<span
                                        >Confirm email address change for </span
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
                                        >You have requested to change your email
                                        address.</span
                                      >`)
    }
${
      emailParagraph(`<span
                                        >Your new email address will be:</span
                                      >`)
    }
                                    <table
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="padding:10px 20px 10px 20px;box-sizing:border-box">
                                      <tbody>
                                        <tr>
                                          <td>
                                            <p
                                              style="margin:0;padding:20px;font-size:20px;padding-top:0.5em;padding-bottom:0.5em;background-color:#f6f6f6;border-radius:8px;text-align:center">
                                              ${newEmail}
                                            </p>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
${emailParagraph("<br />")}
${emailButton({ url: emailChangeUrl, text: "Confirm email change" })}
${emailParagraph("<br />")}
${DIVIDER}
${
      emailFooter(`If you didn&#x27;t request to change
                                        your email address, please ignore this
                                        message. Be cautious of phishing
                                        attempts and always verify the sender
                                        and domain (`)
    }
${emailParagraph("<br />")}`,
  });
}
