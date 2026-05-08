import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../../services/api";
import { uploadVideoToSupabase } from "../../services/supabase";
import { uploadCourseToSupabase } from "../../services/supabase";   

export async function pickAndUploadVideo(onSuccess, onError) {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your media library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false, quality: 1,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    Alert.alert("Upload video", `Ready to upload "${asset.fileName ?? "video"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Upload", onPress: async () => {
          try {
            const formData = new FormData();
            formData.append("video", { uri: asset.uri, name: asset.fileName ?? "upload.mp4", type: asset.mimeType ?? "video/mp4" });
            await api.post("/creators/videos/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            onSuccess?.("Video uploaded successfully! 🎉");
          } catch { onError?.("Upload failed. Please try again."); }
        },
      },
    ]);
  } catch { onError?.("Could not open media library."); }
}

export async function pickAndUploadCourse(onSuccess, onError) {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/zip", "video/*", "*/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    Alert.alert("Upload course", `Ready to upload "${file.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Upload", onPress: async () => {
          try {
            const formData = new FormData();
            formData.append("course", { uri: file.uri, name: file.name, type: file.mimeType ?? "application/octet-stream" });
            await api.post("/creators/courses/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            onSuccess?.("Course uploaded successfully! 🎉");
          } catch { onError?.("Upload failed. Please try again."); }
        },
      },
    ]);
  } catch { onError?.("Could not open file picker."); }
}