import { ORPCError } from "@orpc/server";
import { authProcedure } from "~/api/router/builder.ts";
import * as filesService from "~/api/services/files.ts";
import { auth } from "~/shared/auth.ts";
import { z } from "zod";

const ImageFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.type.startsWith("image/"), {
      message: "Invalid file type. Only images are allowed.",
    })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File too large. Maximum size is 10MB.",
    }),
});

const upload = authProcedure
  .route({
    method: "POST",
    path: "/avatars",
    tags: ["Files"],
    summary: "Upload user avatar",
  })
  .input(ImageFileSchema)
  .output(z.object({ fileKey: z.string() }))
  .handler(async ({ input, context }) => {
    const fileKey = await filesService.uploadUserAvatar(
      input.file,
      context.user.id,
    );

    await auth.api.updateUser({
      body: { image: fileKey },
      headers: context.headers,
    });

    return { fileKey };
  });

const remove = authProcedure
  .route({
    method: "DELETE",
    path: "/avatars",
    tags: ["Files"],
    summary: "Delete user avatar",
    successStatus: 204,
  })
  .handler(async ({ context }) => {
    if (!context.user.image) {
      throw new ORPCError("NOT_FOUND", { message: "No avatar to remove" });
    }

    await filesService.removeUserAvatar(context.user.id);

    await auth.api.updateUser({
      body: { image: undefined },
      headers: context.headers,
    });
  });

export const avatarsRouter = {
  upload,
  remove,
};
