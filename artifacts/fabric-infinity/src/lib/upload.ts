type UploadUrlResponse = {
  uploadURL: string;
  objectPath: string;
};

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected image"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a product image from the owner dashboard.
 *
 * 1. First tries Replit's persistent Object Storage (survives restarts and is
 *    served to every visitor of the published site).
 * 2. If that is unavailable (e.g. running outside Replit), falls back to the
 *    server's local uploads directory so the app still works end-to-end.
 */
export async function uploadAdminImage(file: File): Promise<string> {
  // 1) Replit Object Storage
  try {
    const response = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        contentType: file.type,
      }),
    });

    const data = (await response.json().catch(() => ({}))) as Partial<
      UploadUrlResponse
    > & { error?: string };
    if (response.ok && data.uploadURL && data.objectPath) {
      const uploadResponse = await fetch(data.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (uploadResponse.ok) {
        return `/api/storage${data.objectPath}`;
      }
      throw new Error("Failed to upload image to persistent storage");
    }
    // Object storage not available — fall through to the local upload below.
  } catch {
    // fall through to the local upload below.
  }

  // 2) Fallback: local server uploads directory
  const formData = new FormData();
  formData.append("file", file);
  const fallbackResponse = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const fallbackData = (await fallbackResponse.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!fallbackResponse.ok || !fallbackData.url) {
    throw new Error(fallbackData.error || "Failed to upload image");
  }
  return fallbackData.url;
}

export { readImageAsDataUrl };
