import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jqcchypwglzsfmuavtvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxY2NoeXB3Z2x6c2ZtdWF2dHZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMzc5MjQsImV4cCI6MjA5MTkxMzkyNH0.1kJpJHi9T4ALkdcHsUkri6BkjXQFPwvLLXqv5Sjx_Q0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadVideoToSupabase(fileUri, fileName) {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const filePath = `${Date.now()}_${fileName}`;

  const { data, error } = await supabase.storage
    .from("videos")
    .upload(filePath, blob, {
      contentType: "video/mp4",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("videos")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}