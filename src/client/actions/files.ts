import { action } from "@solidjs/router";
import { orpcClient } from "~/shared/orpc-client.ts";

export const uploadImageAction = action(async (formData: FormData) => {
  "use server";
  const file = formData.get("file") as File;
  return await orpcClient.avatars.upload({ file });
}, "uploadImage");
