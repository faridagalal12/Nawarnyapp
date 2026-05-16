import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jqcchypwglzsfmuavtvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxY2NoeXB3Z2x6c2ZtdWF2dHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzc5MjQsImV4cCI6MjA5MTkxMzkyNH0.1kJpJHi9T4ALkdcHsUkri6BkjXQFPwvLLXqv5Sjx_Q0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadVideoToSupabase(fileUri, fileName) {
  try {
    console.log("Starting upload for:", fileUri);

    const filePath = `${Date.now()}_${fileName}`;
    const mimeType = fileName.endsWith(".mp4") ? "video/mp4" : "video/quicktime";

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    });

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/videos/${filePath}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "x-upsert": "true",
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log("Upload failed:", errText);
      throw new Error("Upload failed: " + errText);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/videos/${filePath}`;
    console.log("Upload success, URL:", publicUrl);
    return publicUrl;

  } catch (err) {
    console.log("uploadVideoToSupabase error:", err?.message);
    throw err;
  }
}

export async function uploadCourseToSupabase(fileUri, fileName) {
  try {
    console.log("Starting course file upload for:", fileUri);

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error("Failed to read file"));
      xhr.responseType = "blob";
      xhr.open("GET", fileUri, true);
      xhr.send(null);
    });

    console.log("Course file blob size:", blob.size);
    if (!blob || blob.size === 0) {
      throw new Error("File is empty or could not be read");
    }

    const filePath = `courses/${Date.now()}_${fileName}`;
    const mimeType = blob.type || "application/octet-stream";

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, blob, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.log("Supabase course upload error:", JSON.stringify(error));
      throw new Error(error.message);
    }

    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    console.log("Course upload success, URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (err) {
    console.log("uploadCourseToSupabase error:", err?.message);
    throw err;
  }
}