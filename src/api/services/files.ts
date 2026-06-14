import type { _Object } from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { PhotonImage, resize, SamplingFilter } from "@cf-wasm/photon/node";
import { ORPCError } from "@orpc/server";
import env from "~/env.ts";

const MAX_AVATAR_WIDTH = 400;

function toWebpAvatar(bytes: Uint8Array): Uint8Array {
  let image: PhotonImage | undefined;
  let resized: PhotonImage | undefined;
  try {
    image = PhotonImage.new_from_byteslice(bytes);
    const width = image.get_width();
    if (width <= MAX_AVATAR_WIDTH) {
      return image.get_bytes_webp();
    }
    const height = image.get_height();
    const targetHeight = Math.round((MAX_AVATAR_WIDTH / width) * height);
    resized = resize(
      image,
      MAX_AVATAR_WIDTH,
      targetHeight,
      SamplingFilter.Lanczos3,
    );
    return resized.get_bytes_webp();
  } catch {
    throw new ORPCError("BAD_REQUEST", {
      message: "Invalid or unsupported image file.",
    });
  } finally {
    image?.free();
    resized?.free();
  }
}

const client = new S3Client({
  region: env.S3_REGION,
  forcePathStyle: true,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_ACCESS_SECRET,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export async function uploadUserAvatar(
  file: File,
  userId: string,
): Promise<string> {
  await removeUserAvatar(userId);

  const uniqueId = crypto.randomUUID();
  const fileKey = `users/${userId}/avatar/${uniqueId}.webp`;

  const buffer = await file.arrayBuffer();
  const webp = toWebpAvatar(new Uint8Array(buffer));

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: fileKey,
    Body: webp,
    ContentType: "image/webp",
  });

  const result = await client.send(command);

  if (result.$metadata.httpStatusCode !== 200) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to upload avatar",
    });
  }

  return fileKey;
}

export async function removeUserAvatar(userId: string): Promise<void> {
  const prefix = `users/${userId}/avatar/`;

  const listCommand = new ListObjectsCommand({
    Bucket: env.S3_BUCKET,
    Prefix: prefix,
  });

  const { Contents } = await client.send(listCommand);

  if (!Contents || Contents.length === 0) {
    return;
  }

  await Promise.all(
    Contents.map((object) => {
      if (!object.Key) return Promise.resolve();

      const deleteCommand = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: object.Key,
      });

      return client.send(deleteCommand);
    }),
  );
}
