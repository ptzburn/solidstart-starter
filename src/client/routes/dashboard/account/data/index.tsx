import { useSubmission } from "@solidjs/router";
import { deleteAccount } from "~/client/actions/auth.ts";
import { ConfirmDialog } from "~/client/components/confirm-dialog.tsx";
import { PageHeader } from "~/client/components/page-header.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import {
  useSubmissionError,
  useSubmissionSuccess,
} from "~/client/hooks/use-submission.ts";
import Mail from "~icons/ri/mail-line";
import { createSignal, type JSX } from "solid-js";

function AccountDataPage(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const submission = useSubmission(deleteAccount);

  useSubmissionSuccess(submission, {
    successMessage: "Deletion link sent to your email",
    onSuccess: () => setOpen(false),
  });
  useSubmissionError(submission, "Failed to delete account");

  return (
    <div class="flex flex-1 flex-col gap-10">
      <PageHeader title="Data" description="Manage your account data." />
      <ItemGroup class="rounded-lg border bg-card">
        <Item>
          <ItemContent>
            <ItemTitle>Delete account</ItemTitle>
            <ItemDescription>
              Permanently delete your account and all associated data.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <ConfirmDialog
              open={open()}
              onOpenChange={setOpen}
              trigger="Delete account"
              triggerVariant="outline"
              triggerSize="default"
              triggerDisabled={submission.pending}
              variant="destructive"
              title="Delete account"
              description="We will send you an email with a link to delete your account. Clicking the link will permanently delete your account and all associated data. This action cannot be undone."
              confirmText="Send deletion link"
              icon={<Mail />}
              isPending={submission.pending}
              action={deleteAccount}
            />
          </ItemActions>
        </Item>
      </ItemGroup>
    </div>
  );
}

export default AccountDataPage;
