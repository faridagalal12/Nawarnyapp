import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { uploadVideoToSupabase } from "../../services/supabase";
import api from "../../services/api";

const CATEGORIES = ["Science", "Technology", "Business", "Mathematics", "History", "Personal Development", "Physics", "Chemistry", "Design"];

export default function UploadVideoScreen() {
  const navigation = useNavigation();
  const [videoUri,    setVideoUri]    = useState(null);
  const [videoName,   setVideoName]   = useState(null);
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("");
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState("");

  const pickVideo = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your media library.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: true,
        videoExportPreset: 6,
        quality: 1,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setVideoName(asset.fileName ?? `video_${Date.now()}.mp4`);
      if (!title) setTitle(asset.fileName?.replace(/\.[^/.]+$/, "") ?? "");
    } catch (err) {
      Alert.alert("Error", "Could not pick video.");
    }
  };

  const handleUpload = async () => {
    if (!videoUri)     { Alert.alert("No video", "Please pick a video first."); return; }
    if (!title.trim()) { Alert.alert("Missing title", "Please enter a title."); return; }
    if (!category)     { Alert.alert("Missing category", "Please select a category."); return; }

    setUploading(true);
    try {
      setProgress("Uploading video to storage...");
      const videoUrl = await uploadVideoToSupabase(videoUri, videoName);

      setProgress("Saving to database...");
      await api.post("/videos/upload", {
        title: title.trim(),
        description: description.trim(),
        videoUrl,
        thumbnail: null,
        category,
      });

      Alert.alert("Success! 🎉", "Your video has been uploaded and will appear in the feed.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log("Upload error:", err?.message);
      Alert.alert("Upload failed", err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Upload Video</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
          {videoUri ? (
            <View style={styles.videoSelected}>
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
              <Text style={styles.videoSelectedText} numberOfLines={1}>{videoName}</Text>
              <Text style={styles.videoChangeTap}>Tap to change</Text>
            </View>
          ) : (
            <View style={styles.videoEmpty}>
              <Ionicons name="cloud-upload-outline" size={48} color="#2F54EB" />
              <Text style={styles.videoEmptyTitle}>Pick a video</Text>
              <Text style={styles.videoEmptySubtitle}>Select from your gallery</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Enter video title..." value={title} onChangeText={setTitle} maxLength={100} />
        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="What is this video about?" value={description} onChangeText={setDescription} multiline maxLength={500} />
        <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} style={[styles.categoryChip, category === c && styles.categoryChipActive]} onPress={() => setCategory(c)}>
              <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.uploadBtn, (!videoUri || uploading) && { opacity: 0.6 }]} onPress={handleUpload} disabled={!videoUri || uploading}>
          {uploading ? (
            <View style={styles.uploadingRow}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.uploadBtnText}>{progress}</Text>
            </View>
          ) : (
            <Text style={styles.uploadBtnText}>Upload Video</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#F8FAFF" },
  scroll:     { padding: 20, paddingBottom: 40 },
  navBar:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee" },
  backBtn:    { padding: 8 },
  navTitle:   { fontSize: 17, fontWeight: "700", color: "#000" },
  videoPicker: { height: 180, backgroundColor: "#EEF4FF", borderRadius: 16, borderWidth: 2, borderColor: "#2F54EB", borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginBottom: 24 },
  videoEmpty:         { alignItems: "center", gap: 8 },
  videoEmptyTitle:    { fontSize: 16, fontWeight: "700", color: "#2F54EB" },
  videoEmptySubtitle: { fontSize: 13, color: "#64748B" },
  videoSelected:      { alignItems: "center", gap: 6, paddingHorizontal: 20 },
  videoSelectedText:  { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  videoChangeTap:     { fontSize: 11, color: "#64748B" },
  label:    { fontSize: 14, fontWeight: "600", color: "#1E293B", marginBottom: 8 },
  required: { color: "#EF4444" },
  input:    { backgroundColor: "#fff", borderRadius: 12, borderWidth: 1.5, borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#1E293B", marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  categoryChip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0" },
  categoryChipActive:     { backgroundColor: "#2F54EB", borderColor: "#2F54EB" },
  categoryChipText:       { fontSize: 13, color: "#64748B", fontWeight: "500" },
  categoryChipTextActive: { color: "#fff", fontWeight: "700" },
  uploadBtn:     { backgroundColor: "#2F54EB", borderRadius: 14, padding: 16, alignItems: "center" },
  uploadingRow:  { flexDirection: "row", alignItems: "center", gap: 10 },
  uploadBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});