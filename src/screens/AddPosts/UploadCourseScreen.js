import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useNavigation } from "@react-navigation/native";
import { uploadVideoToSupabase, uploadCourseToSupabase } from "../../services/supabase";
import api from "../../services/api";

const CATEGORIES = [
  "Science", "Technology", "Business", "Mathematics",
  "History", "Personal Development", "Physics", "Chemistry", "Design",
];

export default function UploadCourseScreen() {
  const navigation = useNavigation();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [category,    setCategory]    = useState("");
  const [price,       setPrice]       = useState("0");
  const [videos,      setVideos]      = useState([]); // [{title, videoUrl, order}]
  const [files,       setFiles]       = useState([]); // [{name, fileUrl, type}]
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState("");

  // ── Pick and upload a video ────────────────────────────────────────────────
  const pickVideo = async () => {
    try {
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
      const fileName = asset.fileName ?? `video_${Date.now()}.mp4`;

      setUploading(true);
      setProgress(`Uploading video "${fileName}"...`);
      const videoUrl = await uploadVideoToSupabase(asset.uri, fileName);

      setVideos(prev => [
        ...prev,
        { title: fileName.replace(/\.[^/.]+$/, ""), videoUrl, order: prev.length + 1 },
      ]);
      setProgress("");
      setUploading(false);
    } catch (err) {
      setUploading(false);
      setProgress("");
      Alert.alert("Error", err?.message ?? "Could not upload video.");
    }
  };

  // ── Pick and upload a file (PDF, doc, etc) ────────────────────────────────
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];

      setUploading(true);
      setProgress(`Uploading file "${file.name}"...`);
      const fileUrl = await uploadCourseToSupabase(file.uri, file.name);

      setFiles(prev => [
        ...prev,
        { name: file.name, fileUrl, type: file.mimeType ?? "document" },
      ]);
      setProgress("");
      setUploading(false);
    } catch (err) {
      setUploading(false);
      setProgress("");
      Alert.alert("Error", err?.message ?? "Could not upload file.");
    }
  };

  // ── Remove video ──────────────────────────────────────────────────────────
  const removeVideo = (index) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  // ── Remove file ───────────────────────────────────────────────────────────
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ── Submit course ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim())  { Alert.alert("Missing title", "Please enter a course title."); return; }
    if (!category)      { Alert.alert("Missing category", "Please select a category."); return; }
    if (videos.length === 0 && files.length === 0) {
      Alert.alert("No content", "Please add at least one video or file.");
      return;
    }

    setUploading(true);
    setProgress("Creating course...");
    try {
      await api.post("/creator/course", {
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price) || 0,
        videos,
        files,
      });

      Alert.alert("Success! 🎉", "Your course has been published and will appear in the Courses screen.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.log("Course submit error:", err?.message);
      Alert.alert("Error", err?.message ?? "Could not create course.");
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Nav bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create Course</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Title */}
        <Text style={styles.label}>Course Title <Text style={styles.required}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Introduction to Physics"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What will students learn in this course?"
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={500}
        />

        {/* Category */}
        <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.categoryChip, category === c && styles.categoryChipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price */}
        <Text style={styles.label}>Price (0 = Free)</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          maxLength={6}
        />

        {/* Videos section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Videos ({videos.length})</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={pickVideo}
            disabled={uploading}
          >
            <Ionicons name="add" size={18} color="#2F54EB" />
            <Text style={styles.addBtnText}>Add Video</Text>
          </TouchableOpacity>
        </View>

        {videos.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="videocam-outline" size={28} color="#ccc" />
            <Text style={styles.emptySectionText}>No videos added yet</Text>
          </View>
        ) : (
          videos.map((v, i) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.itemIconBox}>
                <Ionicons name="videocam-outline" size={20} color="#2F54EB" />
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{v.title}</Text>
              <TouchableOpacity onPress={() => removeVideo(i)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color="#ff4d4f" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Files section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Files ({files.length})</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={pickFile}
            disabled={uploading}
          >
            <Ionicons name="add" size={18} color="#2F54EB" />
            <Text style={styles.addBtnText}>Add File</Text>
          </TouchableOpacity>
        </View>

        {files.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="document-outline" size={28} color="#ccc" />
            <Text style={styles.emptySectionText}>No files added yet</Text>
          </View>
        ) : (
          files.map((f, i) => (
            <View key={i} style={styles.itemCard}>
              <View style={styles.itemIconBox}>
                <Ionicons name="document-outline" size={20} color="#2F54EB" />
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{f.name}</Text>
              <TouchableOpacity onPress={() => removeFile(i)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color="#ff4d4f" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Upload progress */}
        {uploading && (
          <View style={styles.progressRow}>
            <ActivityIndicator color="#2F54EB" />
            <Text style={styles.progressText}>{progress}</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, uploading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Publish Course</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#F8FAFF" },
  scroll:     { padding: 20, paddingBottom: 60 },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 8, paddingVertical: 12, backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee",
  },
  backBtn:  { padding: 8 },
  navTitle: { fontSize: 17, fontWeight: "700", color: "#000" },

  label:    { fontSize: 14, fontWeight: "600", color: "#1E293B", marginBottom: 8 },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 1.5,
    borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#1E293B", marginBottom: 20,
  },
  textArea: { height: 100, textAlignVertical: "top" },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0",
  },
  categoryChipActive:     { backgroundColor: "#2F54EB", borderColor: "#2F54EB" },
  categoryChipText:       { fontSize: 13, color: "#64748B", fontWeight: "500" },
  categoryChipTextActive: { color: "#fff", fontWeight: "700" },

  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 10, marginTop: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#EEF2FF", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  addBtnText: { fontSize: 13, color: "#2F54EB", fontWeight: "600" },

  emptySection: {
    alignItems: "center", paddingVertical: 20, gap: 6,
    backgroundColor: "#fff", borderRadius: 12, marginBottom: 16,
    borderWidth: 1.5, borderColor: "#E2E8F0", borderStyle: "dashed",
  },
  emptySectionText: { fontSize: 13, color: "#aaa" },

  itemCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 12,
    padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  itemIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  itemName:  { flex: 1, fontSize: 13, fontWeight: "600", color: "#1E293B" },
  removeBtn: { padding: 6 },

  progressRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#EEF2FF", borderRadius: 12,
    padding: 14, marginVertical: 12,
  },
  progressText: { fontSize: 13, color: "#2F54EB", fontWeight: "500", flex: 1 },

  submitBtn: {
    backgroundColor: "#2F54EB", borderRadius: 14,
    padding: 16, alignItems: "center", marginTop: 20,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});