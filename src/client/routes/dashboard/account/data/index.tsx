import { useAction, useSubmission } from "@solidjs/router";
import { deleteAccount } from "~/client/actions/auth.ts";
import { ConfirmDialog } from "~/client/components/confirm-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "~/client/components/ui/item.tsx";
import Mail from "~icons/lucide/mail";
import type { JSX } from "solid-js";
import { toast } from "solid-sonner";

const DELETE_ACCOUNT_DIALOG_ID = "delete-account-dialog";

function AccountDataPage(): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  const triggerDelete = useAction(deleteAccount);
  const submission = useSubmission(deleteAccount);

  const handleAccountDelete = async () => {
    try {
      const result = await triggerDelete();
      if (result && "ok" in result) {
        dialogRef.close();
        toast.success("Deletion link sent to your email");
      }
    } catch (error) {
      toast.error(
        Error.isError(error) ? error.message : "Failed to delete account",
      );
    }
  };

  return (
    <div class="flex flex-1 flex-col gap-10">
      <div>
        <h2>Data</h2>
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
            <Button
              variant="outline"
              size="sm"
              command="show-modal"
              commandfor={DELETE_ACCOUNT_DIALOG_ID}
              disabled={submission.pending}
            >
              Delete account
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>

      <ConfirmDialog
        id={DELETE_ACCOUNT_DIALOG_ID}
        ref={(el) => dialogRef = el}
        variant="destructive"
        title="Delete account"
        description="We will send you an email with a link to delete your account. Clicking the link will permanently delete your account and all associated data. This action cannot be undone."
        confirmText="Send deletion link"
        icon={<Mail />}
        isPending={submission.pending}
        onConfirm={handleAccountDelete}
      />
    </div>
  );
}

export default AccountDataPage;
