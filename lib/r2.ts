import "server-only";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type R2Config = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucketName: string;
  publicUrl: string;
};

let s3Client: S3Client | undefined;

function requireEnv(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getR2Config(): R2Config {
  return {
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    endpoint: requireEnv("R2_ENDPOINT"),
    bucketName: requireEnv("R2_BUCKET_NAME"),
    publicUrl: requireEnv("R2_PUBLIC_URL").replace(/\/+$/, ""),
  };
}

function getS3Client(config: R2Config): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

function normalizeObjectKey(fileName: string): string {
  const key = fileName.trim().replace(/^\/+/, "");
  const segments = key.split("/");

  if (
    !key ||
    segments.some(
      (segment) => !segment || segment === "." || segment === "..",
    )
  ) {
    throw new Error("Invalid R2 object file name");
  }

  return key;
}

/**
 * Uploads a server-side buffer to Cloudflare R2 and returns its public URL.
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<string> {
  if (!contentType.trim()) {
    throw new Error("A content type is required for R2 uploads");
  }

  const config = getR2Config();
  const key = normalizeObjectKey(fileName);

  await getS3Client(config).send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    }),
  );

  const publicPath = key.split("/").map(encodeURIComponent).join("/");
  return `${config.publicUrl}/${publicPath}`;
}
