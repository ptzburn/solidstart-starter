import {
  emailButton,
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

type SignUpAttemptVars = {
  userName: string;
  signInUrl: string;
};

export function signUpAttemptTemplate(
  { userName, signInUrl }: SignUpAttemptVars,
): string {
  return emailLayout({
    previewText: "Sign up attempt",
    body: `${
      emailHeading(
        `<span>Sign up attempt for </span
                                      ><span><strong>TaskApp</strong></span>`,
        `${HEADING_STYLE};text-align:center`,
      )
    }
${emailParagraph("<br />")}
${
      emailParagraph(`<span>Hi </span>${userName}<span
                                        >,</span
                                      >`)
    }
${
      emailParagraph(`<span
                                        >Someone tried to create an account
                                        using your email address.</span
                                      >`)
    }
${
      emailParagraph(`<span
                                        >If this was you, try signing in
                                        instead:</span
                                      >`)
    }
${emailParagraph("<br />")}
${emailButton({ url: signInUrl, text: "Sign In" })}
${emailParagraph("<br />", `${PARAGRAPH_STYLE};text-align:left`)}
${DIVIDER}
${
      emailFooter(`If you didn&#x27;t attempt to sign up
                                        again, please ignore this message. Be
                                        cautious of phishing attempts and always
                                        verify the sender and domain (`)
    }`,
  });
}
