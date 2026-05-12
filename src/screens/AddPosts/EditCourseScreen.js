import React, { useState } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../../services/api";
import { uploadCourseToSupabase } from "../../services/supabase";

const CATEGORIES = ["Education", "Technology", "Business", "Health", "Arts", "Science", "Language", "Other"];

export default function EditCourseScreen({ route, navigation }) {
  const { course } = route.params;

  const [title, setTitle]           = useState(course.title ?? "");
  const [description, setDescription] = useState(course.description ?? "");
  const [category, setCategory]     = useState(course.category ?? "");
  const [price, setPrice]           = useState(String(course.price ?? "0"));
  const [videos, setVideos]         = useState(course.videos ?? []);
  const [files, setFiles]           = useState(course.files ?? []);
  const [saving, setSaving]         = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingFile, setUploadingFile]   = useState(false);

  const addVideo = async () => {
    try {
      setUploadingVideo(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["videos"],
        allowsEditing: false,
        quality: 1,
      });
      if (result.canceled) { setUploadingVideo(false); return; }
      const asset = result.assets[0];
      const videoTitle = asset.fileName?.replace(/\.[^/.]+$/, "") ?? `Video ${videos.length + 1}`;

      const formData = new FormData();
      formData.append("file", { uri: asset.uri, name: asset.fileName ?? "video.mp4", type: "video/quicktime" });
      const uploadRes = await api.post("/videos/upload-file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      const url = uploadRes.data.url;

      setVideos(prev => [...prev, { title: videoTitle, videoUrl: url, order: prev.length + 1 }]);
      Alert.alert("Success", "Video added!");
    } catch (err) {
      Alert.alert("Error", "Could not upload video.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const addFile = async () => {
    try {
      setUploadingFile(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (result.canceled) { setUploadingFile(false); return; }
      const file = result.assets[0];

      const url = await uploadCourseToSupabase(file.uri, file.name);
      setFiles(prev => [...prev, { name: file.name, fileUrl: url, type: file.mimeType ?? "document" }]);
      Alert.alert("Success", "File added!");
    } catch (err) {
      Alert.alert("Error", "Could not upload file.");
    } finally {
      setUploadingFile(false);
    }
  };

  const removeVideo = (index) => {
    Alert.alert("Remove Video", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        setVideos(prev => prev.filter((_, i) => i !== index));
      }},
    ]);
  };

  const removeFile = (index) => {
    Alert.alert("Remove File", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        setFiles(prev => prev.filter((_, i) => i !== index));
      }},
    ]);
  };

  const handleSave = async () => {
    if (!title.trim() || !category) {
      Alert.alert("Missing Fields", "Please fill in title and category.");
      return;
    }
    setSaving(true);
    try {
      await api.put(`/creator/course/${course.id}`, {
        title: title.trim(),
        description: description.trim(),
        category,
        price: parseFloat(price) || 0,
        videos,
        files,
      });
      Alert.alert("Saved!", "Your course has been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.error ?? "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Course</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveBtn}>
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveBtnText}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.label}>Course Title <Text style={styles.required}>*</Text></Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Course title" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="What will students learn?"
          multiline
          maxLength={500}
        />

        <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.categoryChip, category === c && styles.categoryChipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Price (USD)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0 for free" keyboardType="decimal-pad" />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Videos ({videos.length})</Text>
          <TouchableOpacity style={[styles.addBtn, uploadingVideo && { opacity: 0.6 }]} onPress={addVideo} disabled={uploadingVideo}>
            {uploadingVideo
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add Video</Text></>
            }
          </TouchableOpacity>
        </View>

        {videos.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="videocam-outline" size={28} color="#ccc" />
            <Text style={styles.emptySectionText}>No videos yet</Text>
          </View>
        ) : (
          videos.map((v, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemIcon}><Ionicons name="videocam-outline" size={20} color="#4F8EF7" /></View>
              <Text style={styles.itemTitle} numberOfLines={1}>{v.title || `Video ${i + 1}`}</Text>
              <TouchableOpacity onPress={() => removeVideo(i)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Files ({files.length})</Text>
          <TouchableOpacity style={[styles.addBtn, uploadingFile && { opacity: 0.6 }]} onPress={addFile} disabled={uploadingFile}>
            {uploadingFile
              ? <ActivityIndicator size="small" color="#fff" />
              : <><Ionicons name="add" size={16} color="#fff" /><Text style={styles.addBtnText}>Add File</Text></>
            }
          </TouchableOpacity>
        </View>

        {files.length === 0 ? (
          <View style={styles.emptySection}>
            <Ionicons name="document-outline" size={28} color="#ccc" />
            <Text style={styles.emptySectionText}>No files yet</Text>
          </View>
        ) : (
          files.map((f, i) => (
            <View key={i} style={styles.itemRow}>
              <View style={styles.itemIcon}><Ionicons name="document-outline" size={20} color="#4F8EF7" /></View>
              <Text style={styles.itemTitle} numberOfLines={1}>{f.name || `File ${i + 1}`}</Text>
              <TouchableOpacity onPress={() => removeFile(i)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#F8FAFF" },
  scroll:     { padding: 20 },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 8, paddingVertical: 12, backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee",
  },
  backBtn:  { padding: 8 },
  navTitle: { fontSize: 17, fontWeight: "700", color: "#000" },
  saveBtn:  { backgroundColor: "#0066FF", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  label:    { fontSize: 14, fontWeight: "600", color: "#1E293B", marginTop: 16, marginBottom: 6 },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 1.5,
    borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#1E293B",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0" },
  categoryChipActive:     { backgroundColor: "#0066FF", borderColor: "#0066FF" },
  categoryChipText:       { fontSize: 13, color: "#64748B", fontWeight: "500" },
  categoryChipTextActive: { color: "#fff", fontWeight: "700" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#0066FF", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptySection: { alignItems: "center", padding: 20, backgroundColor: "#fff", borderRadius: 12, gap: 8, borderWidth: 1, borderColor: "#E2E8F0", borderStyle: "dashed" },
  emptySectionText: { fontSize: 13, color: "#94A3B8" },
  itemRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  itemIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: "#EEF4FF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  itemTitle:  { flex: 1, fontSize: 13, fontWeight: "600", color: "#1E293B" },
  removeBtn:  { padding: 6 },
});