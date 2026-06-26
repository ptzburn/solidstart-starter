import { action } from "@solidjs/router";
import { orpcClient } from "~/api/lib/orpc-client.ts";

export const uploadImageAction = action(async (formData: FormData) => {
  "use server";
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No image file was provided.");
  }
  return await orpcClient.avatars.upload({ file });
}, "uploadImage");
