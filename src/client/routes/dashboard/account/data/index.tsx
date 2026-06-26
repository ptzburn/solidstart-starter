import { useSubmission } from "@solidjs/router";
import { deleteAccount } from "~/client/actions/auth.ts";
import { ConfirmDialog } from "~/client/components/confirm-dialog.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import { Typography } from "~/client/components/ui/typography.tsx";
import Mail from "~icons/lucide/mail";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

function AccountDataPage(): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const submission = useSubmission(deleteAccount);

  createEffect(() => {
    if (submission.result && "ok" in submission.result) {
      setOpen(false);
      toast.success("Deletion link sent to your email");
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(submission.error.message || "Failed to delete account");
      submission.clear();
    }
  });

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div>
        <Typography variant="h2">Data</Typography>
        <p class="text-muted-foreground">
          Manage your account data.
        </p>
      </div>
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
              triggerSize="sm"
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
