function getRequiredEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: getRequiredEnv(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}

export function getR2ServerEnv() {
  return {
    accountId: getRequiredEnv("R2_ACCOUNT_ID", process.env.R2_ACCOUNT_ID),
    accessKeyId: getRequiredEnv("R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: getRequiredEnv(
      "R2_SECRET_ACCESS_KEY",
      process.env.R2_SECRET_ACCESS_KEY,
    ),
    bucketName: getRequiredEnv("R2_BUCKET_NAME", process.env.R2_BUCKET_NAME),
    publicUrlBase: getRequiredEnv("R2_PUBLIC_URL_BASE", process.env.R2_PUBLIC_URL_BASE).replace(
      /\/$/,
      "",
    ),
    maxUploadSizeMb: Number.parseInt(process.env.R2_MAX_UPLOAD_SIZE_MB ?? "5", 10),
  };
}
