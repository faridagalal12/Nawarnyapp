import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert, Image
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const response = await api.get("/users/profile/editable");
          const data = response?.data ?? {};
          setName(data.name ?? "");
          setUsername(data.username ?? "");
          setAvatarUrl(data.avatarUrl ?? "");
        } catch (err) {
          Alert.alert("Error", "Failed to load profile");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.1,
      base64: true,
      exif: false,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatarUrl(base64Image);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/users/profile", { name, username, avatarUrl });
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.error?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={styles.save}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Avatar Picker */}
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={30} color="#999" />
              <Text style={styles.avatarText}>Upload Photo</Text>
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Your username"
          autoCapitalize="none"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 17, fontWeight: "600" },
  cancel: { fontSize: 16, color: "#666" },
  save: { fontSize: 16, color: "#0066FF", fontWeight: "600" },
  form: { padding: 16, alignItems: "center" },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
    marginBottom: 24,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 12, color: "#999", marginTop: 4 },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0066FF",
    borderRadius: 12,
    padding: 4,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    marginTop: 16,
    alignSelf: "flex-start",
    width: "100%",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
    width: "100%",
  },
});