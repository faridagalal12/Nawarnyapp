import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditProfileScreen({ navigation }) {
  const BIO_MAX_LEN = 240;
  const BIO_MIN_HEIGHT = 110;
  const BIO_MAX_HEIGHT = 180;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [bioHeight, setBioHeight] = useState(BIO_MIN_HEIGHT);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLocalUri, setAvatarLocalUri] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const getAvatarMimeType = (uri) => {
    const lower = (uri || "").toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".heic")) return "image/heic";
    return "image/jpeg";
  };

  const createAvatarFormData = (uri, extraFields) => {
    const type = getAvatarMimeType(uri);
    const ext = type.split("/")[1] || "jpg";
    const name = `avatar.${ext}`;

    const formData = new FormData();
    const file = { uri, name, type };

    // Try common field names to maximize backend compatibility.
    formData.append("avatar", file);
    formData.append("file", file);
    formData.append("image", file);

    if (extraFields && typeof extraFields === "object") {
      Object.entries(extraFields).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        formData.append(key, String(value));
      });
    }
    return formData;
  };

  const extractAvatarUrl = (payload) => {
    const direct =
      payload?.avatarUrl ??
      payload?.url ??
      payload?.data?.avatarUrl ??
      payload?.data?.url ??
      payload?.user?.avatarUrl ??
      payload?.data?.user?.avatarUrl;

    return typeof direct === "string" && direct.length ? direct : "";
  };

  const uploadAvatarIfNeeded = async () => {
    if (!avatarLocalUri) return avatarUrl;

    const headers = { "Content-Type": "multipart/form-data" };
    const endpoints = [
      { method: "post", url: "/users/profile/avatar" },
      { method: "patch", url: "/users/profile/avatar" },
      { method: "put", url: "/users/profile/avatar" },
      { method: "patch", url: "/users/profile" },
      { method: "put", url: "/users/profile" },
    ];

    let lastErr;
    for (const ep of endpoints) {
      try {
        const isProfileEndpoint = ep.url === "/users/profile";
        const res = await api.request({
          method: ep.method,
          url: ep.url,
          data: createAvatarFormData(
            avatarLocalUri,
            isProfileEndpoint ? { name, username, email, bio } : undefined
          ),
          headers,
        });
        const maybeUrl = extractAvatarUrl(res?.data);
        if (maybeUrl) return maybeUrl;

        // Some APIs just return the full profile.
        if (res?.data?.profile?.avatarUrl) return res.data.profile.avatarUrl;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        // If it's not an endpoint/content-type mismatch, don't keep trying.
        if (status && ![404, 405, 415].includes(status)) break;
      }
    }

    throw lastErr ?? new Error("Avatar upload failed");
  };

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to pick an avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (result.canceled) return;
    const picked = result.assets?.[0];
    if (!picked?.uri) return;
    setAvatarLocalUri(picked.uri);
  };

  const handleBioFocus = () => {
    // Ensure the bio input scrolls above the keyboard.
    setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 50);
  };

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const response = await api.get("/users/profile/editable");
          const data = response?.data ?? {};
          setName(data.name ?? "");
          setUsername(data.username ?? "");
          setEmail(data.email ?? "");
          setBio(data.bio ?? "");
          setBioHeight(BIO_MIN_HEIGHT);
          setAvatarUrl(data.avatarUrl ?? "");
          setAvatarLocalUri("");
        } catch (err) {
          Alert.alert("Error", "Failed to load profile");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const handleSave = async () => {
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      let nextAvatarUrl = avatarUrl;
      try {
        nextAvatarUrl = await uploadAvatarIfNeeded();
      } catch (err) {
        console.log("Avatar upload error:", err?.response?.data ?? err?.message);
        Alert.alert(
          "Avatar upload failed",
          "We couldn't upload your photo right now. Your other profile changes will still be saved."
        );
      }

      const response = await api.put("/users/profile", {
        name,
        username,
        email,
        bio,
        avatarUrl: nextAvatarUrl,
      });
      console.log("Save response:", JSON.stringify(response?.data));
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

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving}>
        <Text style={[styles.topBarText, saving && styles.topBarTextDisabled]}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSave} disabled={saving}>
        <Text style={[styles.topBarText, styles.topBarPrimary]}>
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBody = () => (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.uploadCard}>
        <View style={styles.uploadAvatarCircle}>
          {avatarLocalUri || avatarUrl ? (
            <Image
              source={{ uri: avatarLocalUri || avatarUrl }}
              style={styles.uploadAvatarImage}
            />
          ) : (
            <Ionicons name="person" size={30} color="#2F54EB" />
          )}
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickAvatar}
          disabled={saving}
        >
          <Text style={styles.uploadButtonText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Edit details</Text>

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

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Your email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.counter}>
            {bio.length}/{BIO_MAX_LEN}
          </Text>
        </View>
        <TextInput
          style={[styles.input, styles.bioInput, { height: bioHeight }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about you"
          multiline
          textAlignVertical="top"
          onFocus={handleBioFocus}
          maxLength={BIO_MAX_LEN}
          scrollEnabled
          onContentSizeChange={(e) => {
            const next = Math.max(
              BIO_MIN_HEIGHT,
              Math.min(BIO_MAX_HEIGHT, e?.nativeEvent?.contentSize?.height ?? BIO_MIN_HEIGHT)
            );
            setBioHeight(next);
          }}
        />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={0}
        >
          {renderTopBar()}
          {renderBody()}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>
          {renderTopBar()}
          {renderBody()}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
  },
  topBarText: { fontSize: 16, color: "#6b7280", fontWeight: "600" },
  topBarTextDisabled: { opacity: 0.6 },
  topBarPrimary: { color: "#2F54EB" },
  uploadCard: {
    marginTop: 10,
    marginHorizontal: 18,
    backgroundColor: "#2F54EB",
    borderRadius: 14,
    paddingVertical: 22,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  uploadAvatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  uploadAvatarImage: { width: 54, height: 54 },
  uploadButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  uploadButtonText: { color: "#2F54EB", fontSize: 14, fontWeight: "700" },
  formCard: {
    marginTop: 18,
    marginHorizontal: 18,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eef2f7",
    shadowColor: "#0b1220",
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  sectionTitle: { fontSize: 14, color: "#111827", fontWeight: "700" },
  label: { fontSize: 13, color: "#6b7280", marginBottom: 6, marginTop: 14 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counter: { fontSize: 12, color: "#9ca3af", marginTop: 14, marginBottom: 6, fontWeight: "700" },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bioInput: { minHeight: 110 },
});