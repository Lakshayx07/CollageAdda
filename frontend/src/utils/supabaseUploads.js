import { supabase } from "./supabase";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const requireSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check the public URL and anon key.");
  }
  return supabase;
};

const safeExtension = (file) => {
  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;
  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
};

const resizeImageFile = async (file) => {
  if (!IMAGE_TYPES.has(file.type) || file.type === "image/gif") return file;
  if (typeof window === "undefined" || !window.createImageBitmap) return file;

  const bitmap = await createImageBitmap(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1 && file.size < 900 * 1024) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.82);
  });
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
};

export const uploadPublicImage = async ({ bucket, file, userId }) => {
  const client = requireSupabase();
  if (!file || !IMAGE_TYPES.has(file.type)) {
    throw new Error("Please choose a JPG, PNG, WEBP, or GIF image.");
  }
  if (!userId) throw new Error("You must be logged in to upload an image.");

  const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${safeExtension(file)}`;
  const path = `${String(userId)}/${uniqueName}`;
  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error(`Could not create a public URL for ${bucket}/${path}.`);

  return { path, publicUrl: data.publicUrl };
};

export const uploadAvatar = (file, userId) => (
  uploadPublicImage({ bucket: "avatars", file, userId })
);

export const uploadPostImage = (file, userId) => (
  uploadPublicImage({ bucket: "posts", file, userId })
);

export const uploadPublicMedia = async ({ bucket, file, userId, kind }) => {
  const client = requireSupabase();
  const validTypes = kind === "video" ? VIDEO_TYPES : IMAGE_TYPES;
  const label = kind === "video" ? "MP4, WEBM, or MOV video" : "JPG, PNG, WEBP, or GIF image";
  if (!file || !validTypes.has(file.type)) {
    throw new Error(`Please choose a ${label}.`);
  }
  if (!userId) throw new Error("You must be logged in to upload media.");

  const uploadFile = kind === "video" ? file : await resizeImageFile(file);
  const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${safeExtension(uploadFile)}`;
  const path = `${String(userId)}/${uniqueName}`;
  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(path, uploadFile, {
      cacheControl: "3600",
      contentType: uploadFile.type,
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error(`Could not create a public URL for ${bucket}/${path}.`);

  return { path, publicUrl: data.publicUrl };
};

const toUUID = (id) => {
  if (!id) return null;
  const hex = String(id).replace(/-/g, '').padEnd(32, '0');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
};

export const saveProfileAvatarUrl = async ({ userId, avatarUrl, name, university }) => {
  const client = requireSupabase();
  const { error } = await client
    .from("profiles")
    .upsert({
      user_id: toUUID(userId),
      avatar_url: avatarUrl,
      full_name: name || null,
      university: university || null,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });

  if (error) console.warn("Supabase profiles sync error:", error);
};

export const savePostImageRecord = async ({
  postId,
  userId,
  caption,
  imageUrl,
  university,
  createdAt
}) => {
  const client = requireSupabase();
  const { error } = await client
    .from("posts")
    .upsert({
      id: toUUID(postId),
      user_id: toUUID(userId),
      caption: caption || "",
      image_url: imageUrl,
      media_type: "image",
      university: university || null,
      created_at: createdAt || new Date().toISOString()
    }, { onConflict: "id" });

  if (error) console.warn("Supabase posts sync error:", error);
};

export const removeUploadedImage = async (bucket, path) => {
  const client = requireSupabase();
  if (!path) return;
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) console.error(`Could not remove ${bucket}/${path}:`, error);
};
