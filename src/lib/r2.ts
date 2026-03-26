import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getR2ServerEnv } from "@/lib/env";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getR2Client() {
  const env = getR2ServerEnv();

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.accessKeyId,
      secretAccessKey: env.secretAccessKey,
    },
  });
}

export function validateImageFile(file: File) {
  const env = getR2ServerEnv();
  const maxBytes = env.maxUploadSizeMb * 1024 * 1024;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only image uploads are allowed (jpg, png, webp, gif).");
  }

  if (file.size > maxBytes) {
    throw new Error(`Image must be smaller than ${env.maxUploadSizeMb}MB.`);
  }
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadReceiptImage(params: {
  file: File;
  userId: string;
}) {
  const env = getR2ServerEnv();
  const client = getR2Client();

  const safeName = sanitizeFileName(params.file.name || "receipt-image");
  const key = `receipts/${params.userId}/${Date.now()}-${randomUUID()}-${safeName}`;

  const body = Buffer.from(await params.file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: env.bucketName,
      Key: key,
      Body: body,
      ContentType: params.file.type,
    }),
  );

  return {
    key,
    imageUrl: `${env.publicUrlBase}/${key}`,
  };
}

export async function deleteReceiptImageByUrl(imageUrl: string) {
  const env = getR2ServerEnv();

  if (!imageUrl.startsWith(`${env.publicUrlBase}/`)) {
    return;
  }

  const key = imageUrl.slice(`${env.publicUrlBase}/`.length);

  if (!key) {
    return;
  }

  const client = getR2Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: env.bucketName,
      Key: key,
    }),
  );
}
