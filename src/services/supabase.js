import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zseuwwznpffwlwuvdgeq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZXV3d3pucGZmd2x3dXZkZ2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5Mjc1ODQsImV4cCI6MjA5NDUwMzU4NH0.-60_IP-0XyzF-RBLaOZge1BdaEUS1NDBoKcUoPgmeHc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadVideoToSupabase(fileUri, fileName) {
  try {
    console.log("Starting upload for:", fileUri);

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const filePath = `${uniqueId}.mp4`;

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: filePath,
      type: "video/mp4",
    });

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/videos/${filePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: formData,
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.log("Upload error:", result);
      throw new Error(result.message || "Upload failed");
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/videos/${filePath}`;
    console.log("Upload success:", publicUrl);
    return publicUrl;
  } catch (err) {
    console.log("uploadVideoToSupabase error:", err?.message);
    throw err;
  }
}

export async function uploadCourseToSupabase(fileUri, fileName) {
  try {
    console.log("Starting course upload for:", fileUri);

    const filePath = `courses/${Date.now()}_${fileName}`;

    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: "application/octet-stream",
    });

    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/courses/${filePath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: formData,
      }
    );

    const result = await response.json();
    if (!response.ok) {
      console.log("Course upload error:", result);
      throw new Error(result.message || "Course upload failed");
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/courses/${filePath}`;
    console.log("Course upload success:", publicUrl);
    return publicUrl;
  } catch (err) {
    console.log("uploadCourseToSupabase error:", err?.message);
    throw err;
  }
}