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
  Keyboard,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import api from "../services/api";
import { uploadAvatarToSupabase } from "../services/supabase";
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

  // Refs for each input — used to scroll the exact field into view
  const nameRef    = useRef(null);
  const usernameRef = useRef(null);
  const emailRef   = useRef(null);
  const bioRef     = useRef(null);
  const bioInputLayout = useRef({ y: 0, height: 0 });

  const getAvatarMimeType = (uri) => {
    const lower = (uri || "").toLowerCase();
    if (lower.endsWith(".png"))  return "image/png";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".heic")) return "image/heic";
    return "image/jpeg";
  };

  const uploadAvatarIfNeeded = async () => {
    if (!avatarLocalUri) return avatarUrl;
    const mimeType = getAvatarMimeType(avatarLocalUri);
    const ext = mimeType.split("/")[1] || "jpg";
    return uploadAvatarToSupabase(avatarLocalUri, `avatar.${ext}`, mimeType);
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

  // Scroll a specific y-offset into view above the keyboard
  const scrollFieldIntoView = (fieldY, fieldHeight) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, fieldY - 24),
        animated: true,
      });
    }, 100);
  };

  // Called when bio layout is measured — stores its position
  const handleBioLayout = (e) => {
    bioInputLayout.current = {
      y: e.nativeEvent.layout.y,
      height: e.nativeEvent.layout.height,
    };
  };

  const handleBioFocus = () => {
    scrollFieldIntoView(
      bioInputLayout.current.y,
      bioInputLayout.current.height
    );
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
        } catch {
          Alert.alert("Error", "Failed to load profile");
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  const handleSave = async () => {
    Keyboard.dismiss();

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

      const payload = {
        name: name.trim(),
        avatarUrl: nextAvatarUrl || null,
        bio: bio.trim() || null,
      };
      const trimmedUsername = username.trim();
      if (trimmedUsername) payload.username = trimmedUsername;

      const response = await api.put("/users/profile", payload);
      console.log("Save response:", JSON.stringify(response?.data));
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      const serverError =
        err?.response?.data?.error?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.message;
      Alert.alert("Error", serverError || "Failed to update profile");
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
        <Text style={[styles.topBarText, saving && styles.topBarTextDisabled]}>
          Cancel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSave} disabled={saving}>
        <Text style={[styles.topBarText, styles.topBarPrimary]}>
          {saving ? "Saving…" : "Save"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBody = () => (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"   // ← swipe down dismisses keyboard
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      {/* Avatar upload card */}
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

      {/* Form card */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Edit details</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          ref={nameRef}
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          returnKeyType="next"
          onSubmitEditing={() => usernameRef.current?.focus()}
          blurOnSubmit={false}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          ref={usernameRef}
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Your username"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          ref={emailRef}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Your email"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => bioRef.current?.focus()}
          blurOnSubmit={false}
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Bio</Text>
          <Text style={styles.counter}>
            {bio.length}/{BIO_MAX_LEN}
          </Text>
        </View>
        <TextInput
          ref={bioRef}
          style={[styles.input, styles.bioInput, { height: bioHeight }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about you"
          multiline
          textAlignVertical="top"
          maxLength={BIO_MAX_LEN}
          returnKeyType="done"
          onFocus={handleBioFocus}
          onLayout={handleBioLayout}
          scrollEnabled={false}           // ← let parent ScrollView handle scrolling
          onContentSizeChange={(e) => {
            const next = Math.max(
              BIO_MIN_HEIGHT,
              Math.min(
                BIO_MAX_HEIGHT,
                e?.nativeEvent?.contentSize?.height ?? BIO_MIN_HEIGHT
              )
            );
            setBioHeight(next);
          }}
        />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // On iOS, offset = 0 is fine inside SafeAreaView.
        // On Android, "height" shrinks the view so the ScrollView
        // naturally scrolls the focused field into view.
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {renderTopBar()}
        {renderBody()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: "#ffffff" },
  flex:                 { flex: 1 },
  centered:             { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
  },
  topBarText:          { fontSize: 16, color: "#6b7280", fontWeight: "600" },
  topBarTextDisabled:  { opacity: 0.6 },
  topBarPrimary:       { color: "#2F54EB" },
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
  uploadAvatarImage:   { width: 54, height: 54 },
  uploadButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  uploadButtonText:    { color: "#2F54EB", fontSize: 14, fontWeight: "700" },
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
  sectionTitle:        { fontSize: 14, color: "#111827", fontWeight: "700" },
  label:               { fontSize: 13, color: "#6b7280", marginBottom: 6, marginTop: 14 },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counter:             { fontSize: 12, color: "#9ca3af", marginTop: 14, marginBottom: 6, fontWeight: "700" },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  bioInput:            { minHeight: 110 },
});