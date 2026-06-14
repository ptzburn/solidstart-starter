import { revalidate, useSubmission } from "@solidjs/router";
import { uploadImageAction } from "~/client/actions/files.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/client/components/ui/avatar.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { ResponsiveDialog } from "~/client/components/ui/dialog.tsx";
import { getFileUrl, getInitials } from "~/client/lib/utils.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import Pencil from "~icons/lucide/pencil";
import { createEffect, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type AvatarUploadProps = {
  imageUrl: string | null | undefined;
  userName: string;
};

const DIALOG_ID = "edit-avatar-dialog";

export function AvatarUpload(props: AvatarUploadProps): JSX.Element {
  let dialogRef!: HTMLDialogElement;
  const submission = useSubmission(uploadImageAction);

  createEffect(() => {
    if (submission.result && "fileKey" in submission.result) {
      dialogRef.close();
      toast.success("Profile picture updated");
      revalidate(getSessionQuery.key);
      submission.clear();
    }
  });

  createEffect(() => {
    if (submission.error) {
      toast.error(
        submission.error.message || "Failed to update profile picture",
      );
      submission.clear();
    }
  });

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        command="show-modal"
        commandfor={DIALOG_ID}
        class="group relative shrink-0 rounded-lg p-0"
      >
        <Avatar class="h-full w-full rounded-full">
          <AvatarImage
            src={getFileUrl(props.imageUrl) ?? undefined}
            alt={`${props.userName}'s avatar`}
            class="object-cover"
          />
          <AvatarFallback class="bg-primary/10 font-bold text-primary">
            {getInitials(props.userName)}
          </AvatarFallback>
        </Avatar>
        <div class="pointer-events-none absolute right-1 bottom-1 flex scale-90 items-center justify-center rounded-full bg-background/90 text-muted-foreground opacity-0 shadow-sm transition-all duration-200 ease-out group-hover:scale-110 group-hover:opacity-100">
          <Pencil class="size-4" />
        </div>
      </Button>

      <ResponsiveDialog
        id={DIALOG_ID}
        ref={(el) => dialogRef = el}
        title="Update profile picture"
        description="Choose an image (max 10MB). It will be resized and optimized automatically."
      >
        <form
          method="post"
          action={uploadImageAction}
          enctype="multipart/form-data"
          class="space-y-4"
        >
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            disabled={submission.pending}
            class="block w-full cursor-pointer rounded-md border bg-background text-foreground text-sm file:mr-4 file:border-0 file:bg-muted file:px-4 file:py-2 file:font-medium file:text-foreground file:text-sm hover:file:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            type="submit"
            class="w-full"
            disabled={submission.pending}
          >
            Save
          </Button>
        </form>
      </ResponsiveDialog>
    </>
  );
}
