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
import { authClient } from "~/client/lib/auth-client.ts";
import Mail from "~icons/lucide/mail";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

const DELETE_ACCOUNT_DIALOG_ID = "delete-account-dialog";

function AccountDataPage(): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  const [isAccountDeleting, setIsAccountDeleting] = createSignal(false);

  const handleAccountDelete = async () => {
    setIsAccountDeleting(true);
    await authClient.deleteUser({}, {
      onSuccess: () => {
        dialogRef.close();
      },
      onError: (error) => {
        toast.error(error.error.message || "Failed to delete account");
      },
    });
    setIsAccountDeleting(false);
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
              disabled={isAccountDeleting()}
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
        isPending={isAccountDeleting()}
        onConfirm={handleAccountDelete}
      />
    </div>
  );
}

export default AccountDataPage;
