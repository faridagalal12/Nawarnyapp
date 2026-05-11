import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jqcchypwglzsfmuavtvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxY2NoeXB3Z2x6c2ZtdWF2dHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzc5MjQsImV4cCI6MjA5MTkxMzkyNH0.1kJpJHi9T4ALkdcHsUkri6BkjXQFPwvLLXqv5Sjx_Q0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadVideoToSupabase(fileUri, fileName) {
  try {
    console.log("Starting upload for:", fileUri);

    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error("Failed to read file"));
      xhr.responseType = "blob";
      xhr.open("GET", fileUri, true);
      xhr.send(null);
    });

    console.log("Blob size:", blob.size, "type:", blob.type);
    if (!blob || blob.size === 0) {
      throw new Error("File is empty or could not be read");
    }

    // Force .mp4 extension regardless of original file name
    const safeName = fileName.replace(/\.(mov|MOV|m4v|M4V|quicktime)$/, ".mp4");
    const filePath = `${Date.now()}_${safeName}`;

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(filePath, blob, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (error) {
      console.log("Supabase upload error:", JSON.stringify(error));
      throw new Error(error.message);
    }

    const { data: urlData } = supabase.storage
      .from("videos")
      .getPublicUrl(filePath);

    console.log("Upload success, URL:", urlData.publicUrl);
    return urlData.publicUrl;
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