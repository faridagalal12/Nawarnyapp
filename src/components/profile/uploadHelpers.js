import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../../services/api";
import { uploadVideoToSupabase, uploadCourseToSupabase } from "../../services/supabase";

// ── Upload Video ──────────────────────────────────────────────────────────────
export async function pickAndUploadVideo(onSuccess, onError) {
  try {
    // Step 1 — pick video from gallery
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your media library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
const rawName = asset.fileName ?? `video_${Date.now()}.mp4`;
const fileName = rawName.replace(/\.(mov|MOV|m4v|M4V)$/, ".mp4");
    Alert.alert("Upload video", `Ready to upload "${fileName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Upload",
        onPress: async () => {
          try {
            // Step 2 — upload file to Supabase storage
console.log("Uploading to Supabase:", asset.uri, fileName);
const videoUrl = await uploadVideoToSupabase(asset.uri, fileName);
console.log("Supabase URL:", videoUrl);
            // Step 3 — save metadata to MongoDB
            await api.post("/videos/upload", {
              title: fileName.replace(/\.[^/.]+$/, ""),
              description: "",
              videoUrl,
              thumbnail: null,
              category: "General",
            });

            onSuccess?.("Video uploaded successfully! 🎉");
          } catch (err) {
            console.log("Video upload error:", err?.message);
            onError?.(err?.message ?? "Upload failed. Please try again.");
          }
        },
      },
    ]);
  } catch (err) {
    console.log("pickAndUploadVideo error:", err?.message);
    onError?.("Could not open media library.");
  }
}

// ── Upload Course ─────────────────────────────────────────────────────────────
export async function pickAndUploadCourse(onSuccess, onError) {
  try {
    // Step 1 — pick any file
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;
    const file = result.assets[0];

    Alert.alert("Upload course", `Ready to upload "${file.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Upload",
        onPress: async () => {
          try {
            // Step 2 — upload file to Supabase storage (courses/ folder)
            const courseUrl = await uploadCourseToSupabase(file.uri, file.name);

            // Step 3 — save course metadata to MongoDB
            await api.post("/creator/course", {
              title: file.name.replace(/\.[^/.]+$/, ""),
              description: "",
              thumbnail: null,
              category: "General",
              price: 0,
              fileUrl: courseUrl,
            });

            onSuccess?.("Course uploaded successfully! 🎉");
          } catch (err) {
            console.log("Course upload error:", err?.message);
            onError?.(err?.message ?? "Upload failed. Please try again.");
          }
        },
      },
    ]);
  } catch (err) {
    console.log("pickAndUploadCourse error:", err?.message);
    onError?.("Could not open file picker.");
  }
}