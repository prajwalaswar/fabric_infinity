type UploadUrlResponse = {
  uploadURL: string;
  objectPath: string;
};

export async function uploadAdminImage(file: File): Promise<string> {
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
  if (!response.ok || !data.uploadURL || !data.objectPath) {
    throw new Error(data.error || "Failed to prepare image upload");
  }

  const uploadResponse = await fetch(data.uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error("Failed to upload image to persistent storage");
  }

  return `/api/storage${data.objectPath}`;
}