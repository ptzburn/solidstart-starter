import {
  emailButton,
  emailFooter,
  emailHeading,
  emailParagraph,
} from "~/api/emails/utils/components.ts";
import { emailLayout } from "~/api/emails/utils/layout.ts";
import { DIVIDER } from "~/api/emails/utils/styles.ts";

type DeleteAccountVars = {
  userName: string;
  accountDeletionUrl: string;
};

export function deleteAccountTemplate(
  { userName, accountDeletionUrl }: DeleteAccountVars,
): string {
  return emailLayout({
    previewText: "Delete my account",
    body: `${
      emailHeading(`<span>Confirm deleting your </span
                                      ><span><strong>TaskApp</strong></span
                                      ><span> account</span>`)
    }
${emailParagraph("<br />")}
${
      emailParagraph(`<span>Hi </span>${userName}<span
                                        >,</span
                                      >`)
    }
${
      emailParagraph(`<span
                                        >We have received a request to
                                        permanently delete your account. Proceed
                                        by clicking the button below:</span
                                      >`)
    }
${emailParagraph("<br />")}
${
      emailButton({
        url: accountDeletionUrl,
        text: "Delete my account",
        color: "#f80000",
      })
    }
${emailParagraph("<br />")}
${
      emailParagraph(`<span
                                        >This action is permanent and cannot be
                                        undone. Your account will be deleted.
                                        Your information cannot be
                                        restored.</span
                                      >`)
    }
${DIVIDER}
${
      emailFooter(`If you didn&#x27;t request to delete
                                        your account, please ignore this
                                        message. Be cautious of phishing
                                        attempts and always verify the sender
                                        and domain (`)
    }
${emailParagraph("<br />")}`,
  });
}
