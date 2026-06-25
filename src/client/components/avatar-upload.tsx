import { revalidate, useSubmission } from "@solidjs/router";
import { uploadImageAction } from "~/client/actions/files.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/client/components/ui/avatar.tsx";
import { Spinner } from "~/client/components/ui/spinner.tsx";
import { getFileUrl, getInitials } from "~/client/lib/utils.ts";
import { getSessionQuery } from "~/client/queries/auth.ts";
import { createEffect, type JSX, Show } from "solid-js";
import { toast } from "solid-sonner";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

type AvatarUploadProps = {
  imageUrl: string | null | undefined;
  userName: string;
};

export function AvatarUpload(props: AvatarUploadProps): JSX.Element {
  const submission = useSubmission(uploadImageAction);

  createEffect(() => {
    if (submission.result && "fileKey" in submission.result) {
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

  const onFilePicked = (
    event: Event & { currentTarget: HTMLInputElement },
  ): void => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image must be 10MB or smaller.");
      input.value = "";
      return;
    }
    // The browser serializes the form synchronously here, so resetting the
    // input afterwards is safe and lets the same file be re-picked on retry.
    input.form?.requestSubmit();
    input.value = "";
  };

  return (
    <form
      method="post"
      action={uploadImageAction}
      enctype="multipart/form-data"
    >
      <label class="group relative inline-flex shrink-0 cursor-pointer rounded-full outline-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring has-[:disabled]:pointer-events-none has-[:disabled]:opacity-80">
        <Avatar size="lg">
          <AvatarImage
            src={getFileUrl(props.imageUrl) ?? undefined}
            alt={`${props.userName}'s avatar`}
          />
          <AvatarFallback>
            {getInitials(props.userName)}
          </AvatarFallback>
        </Avatar>
        <Show when={submission.pending}>
          <div class="absolute inset-0 flex items-center justify-center rounded-full bg-background/80">
            <Spinner class="size-4" />
          </div>
        </Show>
        <input
          type="file"
          name="file"
          accept="image/*"
          aria-label="Change profile picture"
          class="sr-only"
          disabled={submission.pending}
          onChange={onFilePicked}
        />
      </label>
    </form>
  );
}
