import { createClient } from "@supabase/supabase-js";
import api from "./api";

const SUPABASE_URL = "https://jqcchypwglzsfmuavtvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxY2NoeXB3Z2x6c2ZtdWF2dHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzc5MjQsImV4cCI6MjA5MTkxMzkyNH0.1kJpJHi9T4ALkdcHsUkri6BkjXQFPwvLLXqv5Sjx_Q0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadVideoToSupabase(fileUri, fileName) {
  try {
    console.log("Starting upload for:", fileUri);

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: fileName.endsWith(".mp4") ? "video/mp4" : "video/quicktime",
    });
    formData.append("category", "General");

    const response = await api.post("/videos/upload-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });

    console.log("Upload success, URL:", response.data.videoUrl);
    return response.data.videoUrl;
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