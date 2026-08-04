import { useSubmission } from "@solidjs/router";
import type { SelectUser } from "~/api/types/auth.ts";
import { impersonateUser, removeUser } from "~/client/actions/auth.ts";
import { ConfirmDialog } from "~/client/components/confirm-dialog.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/client/components/ui/card.tsx";
import { useSubmissionError } from "~/client/hooks/use-submission.ts";
import Trash2 from "~icons/ri/delete-bin-6-line";
import LoaderCircle from "~icons/ri/loader-4-line";
import Spy from "~icons/ri/spy-line";
import { type JSX, Show } from "solid-js";
import type { Accessor } from "solid-js";

type ImpersonateSectionProps = {
  user: Accessor<SelectUser>;
};

export function ActionSection(props: ImpersonateSectionProps): JSX.Element {
  const impersonateSubmission = useSubmission(
    impersonateUser,
    ([formData]) => formData.get("userId") === props.user().id,
  );
  const removeSubmission = useSubmission(removeUser);

  useSubmissionError(impersonateSubmission, "Failed to impersonate user");
  useSubmissionError(removeSubmission, "Failed to delete user");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
        <CardDescription>
          Manage user
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <form method="post" action={impersonateUser}>
          <input type="hidden" name="userId" value={props.user().id} />
          <Button
            type="submit"
            disabled={impersonateSubmission.pending ||
              (props.user().banned ?? false)}
            class="w-full"
            variant="outline"
          >
            <Spy class="mr-2 size-4" />
            <Show
              when={impersonateSubmission.pending}
              fallback="Impersonate user"
            >
              <LoaderCircle class="size-4 animate-spin" />
            </Show>
          </Button>
        </form>

        <ConfirmDialog
          trigger={
            <>
              <Trash2 class="mr-2 size-4" />
              <Show when={removeSubmission.pending} fallback="Delete user">
                <LoaderCircle class="size-4 animate-spin" />
              </Show>
            </>
          }
          triggerVariant="destructive"
          triggerClass="w-full cursor-pointer"
          triggerDisabled={removeSubmission.pending}
          variant="destructive"
          title="Delete user"
          description={`Are you sure you want to delete ${props.user().name}?`}
          confirmText="Delete user"
          icon={<Trash2 />}
          isPending={removeSubmission.pending}
          action={removeUser}
          hiddenFields={{ userId: props.user().id }}
        />
      </CardContent>
    </Card>
  );
}
