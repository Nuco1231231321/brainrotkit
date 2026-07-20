import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

const supabaseStorageHostSuffix = ".supabase.co";
export const maxGeneratedMediaBytes = 80 * 1024 * 1024;

export type StorageConfiguration = {
  baseUrl: string;
  bucket: string;
  serviceRoleKey: string;
};

type StorageEnvironment = CloudflareEnv & {
  SUPABASE_URL?: string;
  SUPABASE_STORAGE_BUCKET?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

async function getStorageEnvironment() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as StorageEnvironment;
  } catch {
    return {} as StorageEnvironment;
  }
}

export async function getStorageConfiguration(): Promise<StorageConfiguration> {
  const environment = await getStorageEnvironment();
  const baseUrl = environment.SUPABASE_URL ?? process.env.SUPABASE_URL;
  const bucket = environment.SUPABASE_STORAGE_BUCKET ?? process.env.SUPABASE_STORAGE_BUCKET;
  const serviceRoleKey = environment.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !bucket || !serviceRoleKey) {
    throw new Error("Supabase Storage environment variables are not configured.");
  }

  const parsedUrl = new URL(baseUrl);
  if (parsedUrl.protocol !== "https:" || !parsedUrl.hostname.endsWith(supabaseStorageHostSuffix)) {
    throw new Error("SUPABASE_URL must be an HTTPS Supabase project URL.");
  }
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(bucket)) {
    throw new Error("SUPABASE_STORAGE_BUCKET is invalid.");
  }

  return {
    baseUrl: parsedUrl.origin,
    bucket,
    serviceRoleKey,
  };
}

function storageHeaders(storage: StorageConfiguration) {
  return {
    apikey: storage.serviceRoleKey,
    Authorization: `Bearer ${storage.serviceRoleKey}`,
  };
}

function validateStoragePath(storagePath: string) {
  if (!/^[a-zA-Z0-9/_-]+\.[a-zA-Z0-9]{2,8}$/.test(storagePath) || storagePath.includes("..")) {
    throw new Error("The storage object path is invalid.");
  }
  return storagePath;
}

export async function verifyStorageBucket() {
  const storage = await getStorageConfiguration();
  const response = await fetch(
    `${storage.baseUrl}/storage/v1/bucket/${encodeURIComponent(storage.bucket)}`,
    { headers: storageHeaders(storage) },
  );

  if (!response.ok) {
    throw new Error(`Supabase Storage bucket check failed with status ${response.status}.`);
  }

  const bucket = await response.json() as { id?: unknown; public?: unknown };
  if (bucket.id !== storage.bucket || bucket.public !== false) {
    throw new Error("Supabase Storage bucket is missing or is not private.");
  }

  return { bucket: storage.bucket, private: true as const };
}

function extensionForContentType(contentType: string, sourceUrl?: URL) {
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  const supportedTypes = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "video/mp4": "mp4",
    "video/webm": "webm",
  } as const;
  const directExtension = supportedTypes[normalized as keyof typeof supportedTypes];
  if (directExtension) return { contentType: normalized, extension: directExtension };

  const pathExtension = sourceUrl?.pathname.toLowerCase().match(/\.([a-z0-9]{2,5})$/)?.[1] ?? "";
  const fallbackType = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    mp4: "video/mp4",
    webm: "video/webm",
  }[pathExtension];
  if (fallbackType) return { contentType: fallbackType, extension: pathExtension === "jpeg" ? "jpg" : pathExtension };
  throw new Error(`Generated media type ${normalized || "unknown"} is not supported.`);
}

export async function uploadGeneratedMedia(input: {
  sourceUrl: string;
  objectPrefix: string;
  upsert?: boolean;
}) {
  const sourceUrl = new URL(input.sourceUrl);
  if (sourceUrl.protocol !== "https:") throw new Error("Generated media must use HTTPS.");

  const sourceResponse = await fetch(sourceUrl, { redirect: "follow" });
  if (!sourceResponse.ok) {
    throw new Error(`Generated media download failed with status ${sourceResponse.status}.`);
  }
  const declaredLength = Number(sourceResponse.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > maxGeneratedMediaBytes) {
    throw new Error("Generated media exceeds the storage size limit.");
  }

  const bytes = await sourceResponse.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > maxGeneratedMediaBytes) {
    throw new Error("Generated media is empty or exceeds the storage size limit.");
  }
  const mediaType = extensionForContentType(sourceResponse.headers.get("content-type") ?? "", sourceUrl);
  return uploadGeneratedBytes({
    bytes,
    contentType: mediaType.contentType,
    objectPrefix: input.objectPrefix,
    upsert: input.upsert,
  });
}

export async function uploadGeneratedBytes(input: {
  bytes: ArrayBuffer;
  contentType: string;
  objectPrefix: string;
  upsert?: boolean;
}) {
  if (!input.bytes.byteLength || input.bytes.byteLength > maxGeneratedMediaBytes) {
    throw new Error("Generated media is empty or exceeds the storage size limit.");
  }
  const mediaType = extensionForContentType(input.contentType);
  const storagePath = validateStoragePath(`${input.objectPrefix}.${mediaType.extension}`);
  const storage = await getStorageConfiguration();
  const uploadResponse = await fetch(
    `${storage.baseUrl}/storage/v1/object/${encodeURIComponent(storage.bucket)}/${storagePath.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        ...storageHeaders(storage),
        "Content-Type": mediaType.contentType,
        "x-upsert": input.upsert === false ? "false" : "true",
      },
      body: input.bytes,
    },
  );
  if (!uploadResponse.ok) {
    throw new Error(`Supabase media upload failed with status ${uploadResponse.status}.`);
  }

  return {
    storagePath,
    contentType: mediaType.contentType,
    byteSize: input.bytes.byteLength,
  };
}

export async function createSignedMediaUrl(storagePath: string, expiresInSeconds = 3_600) {
  validateStoragePath(storagePath);
  const expiresIn = Math.max(60, Math.min(86_400, Math.floor(expiresInSeconds)));
  const storage = await getStorageConfiguration();
  const response = await fetch(
    `${storage.baseUrl}/storage/v1/object/sign/${encodeURIComponent(storage.bucket)}/${storagePath.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        ...storageHeaders(storage),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn }),
    },
  );
  if (!response.ok) throw new Error(`Supabase signed URL creation failed with status ${response.status}.`);
  const payload = await response.json() as { signedURL?: unknown; signedUrl?: unknown };
  const signedPath = typeof payload.signedURL === "string"
    ? payload.signedURL
    : typeof payload.signedUrl === "string"
      ? payload.signedUrl
      : "";
  if (!signedPath) throw new Error("Supabase did not return a signed media URL.");
  if (signedPath.startsWith("http")) return signedPath;
  const storageApiPath = signedPath.startsWith("/storage/v1/")
    ? signedPath
    : signedPath.startsWith("/object/")
      ? `/storage/v1${signedPath}`
      : `/storage/v1/${signedPath.replace(/^\/+/, "")}`;
  return new URL(storageApiPath, storage.baseUrl).toString();
}

export async function deleteStoredMedia(storagePaths: string[]) {
  if (!storagePaths.length) return;
  const storage = await getStorageConfiguration();
  const paths = storagePaths.map(validateStoragePath);
  const response = await fetch(
    `${storage.baseUrl}/storage/v1/object/${encodeURIComponent(storage.bucket)}`,
    {
      method: "DELETE",
      headers: {
        ...storageHeaders(storage),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: paths }),
    },
  );
  if (!response.ok) throw new Error(`Supabase media deletion failed with status ${response.status}.`);
}
