import { revalidate, useSubmission } from "@solidjs/router";
import { uploadImageAction } from "~/client/actions/files.ts";
import { ResponsiveDialog } from "~/client/components/responsive-dialog.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/client/components/ui/avatar.tsx";
import { Button } from "~/client/components/ui/button.tsx";
import { getFileUrl, getInitials } from "~/client/lib/utils.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import Pencil from "~icons/lucide/pencil";
import { createEffect, createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";

type AvatarUploadProps = {
  imageUrl: string | null | undefined;
  userName: string;
};

const FORM_ID = "edit-avatar-form";

export function AvatarUpload(props: AvatarUploadProps): JSX.Element {
  const [open, setOpen] = createSignal(false);
  const submission = useSubmission(uploadImageAction);

  createEffect(() => {
    if (submission.result && "fileKey" in submission.result) {
      setOpen(false);
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
    <ResponsiveDialog
      open={open()}
      onOpenChange={setOpen}
      triggerVariant="ghost"
      triggerSize="icon"
      triggerClass="group relative shrink-0 rounded-lg p-0"
      trigger={
        <>
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
        </>
      }
      title="Update profile picture"
      description="Choose an image (max 10MB). It will be resized and optimized automatically."
      footer={
        <Button type="submit" form={FORM_ID} disabled={submission.pending}>
          Save
        </Button>
      }
    >
      <form
        id={FORM_ID}
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
      </form>
    </ResponsiveDialog>
  );
}
