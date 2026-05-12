import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";

const CATEGORIES = ["Education", "Technology", "Business", "Health", "Arts", "Science", "Language", "Other"];

export default function CreatorApplicationScreen({ navigation }) {
  const [status, setStatus]         = useState(null); // null = loading
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullName,     setFullName]     = useState("");
  const [channelName,  setChannelName]  = useState("");
  const [category,     setCategory]     = useState("");
  const [bio,          setBio]          = useState("");
  const [socialLink,   setSocialLink]   = useState("");

  useEffect(() => {
    api.get("/creator/status").then(res => {
      setStatus(res?.data);
    }).catch(() => {
      setStatus({ role: "user", application: { status: "none" } });
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!fullName.trim() || !channelName.trim() || !category || !bio.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/creator/apply", { fullName, channelName, category, bio, socialLink });
      Alert.alert("Application Submitted!", "We'll review your application and notify you soon.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.error ?? "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const appStatus = status?.application?.status ?? "none";
  const isCreator = status?.role === "creator";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Become a Creator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Already a creator */}
        {isCreator && (
          <View style={styles.statusCard}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.statusTitle}>You're a Creator!</Text>
            <Text style={styles.statusSub}>You already have full creator access.</Text>
          </View>
        )}

        {/* Pending */}
        {!isCreator && appStatus === "pending" && (
          <View style={styles.statusCard}>
            <Ionicons name="time" size={48} color="#F59E0B" />
            <Text style={styles.statusTitle}>Application Pending</Text>
            <Text style={styles.statusSub}>Your application is under review. We'll notify you once it's approved.</Text>
          </View>
        )}

        {/* Rejected */}
        {!isCreator && appStatus === "rejected" && (
          <View style={[styles.statusCard, { borderColor: "#FCA5A5" }]}>
            <Ionicons name="close-circle" size={48} color="#EF4444" />
            <Text style={styles.statusTitle}>Application Rejected</Text>
            <Text style={styles.statusSub}>
              {status?.application?.rejectionReason
                ? `Reason: ${status.application.rejectionReason}`
                : "Your application was not approved. You can apply again below."}
            </Text>
          </View>
        )}

        {/* Form — show if none or rejected */}
        {!isCreator && (appStatus === "none" || appStatus === "rejected") && (
          <View style={styles.form}>
            <View style={styles.heroBanner}>
              <Ionicons name="videocam" size={32} color="#0066FF" />
              <Text style={styles.heroTitle}>Apply to be a Content Creator</Text>
              <Text style={styles.heroSub}>Share your knowledge with thousands of learners</Text>
            </View>

            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.label}>Channel Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Your channel or brand name"
              value={channelName}
              onChangeText={setChannelName}
            />

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

            <Text style={styles.label}>About You <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about yourself and what you plan to teach..."
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={500}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>

            <Text style={styles.label}>Social / Portfolio Link</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={socialLink}
              onChangeText={setSocialLink}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>Submit Application</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: "#F8FAFF" },
  scroll:     { paddingBottom: 40 },
  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 8, paddingVertical: 12, backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee",
  },
  backBtn:  { padding: 8 },
  navTitle: { fontSize: 17, fontWeight: "700", color: "#000" },

  statusCard: {
    margin: 24, padding: 28, backgroundColor: "#fff", borderRadius: 20,
    alignItems: "center", gap: 12, borderWidth: 1.5, borderColor: "#E2E8F0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statusTitle: { fontSize: 20, fontWeight: "800", color: "#1E293B", textAlign: "center" },
  statusSub:   { fontSize: 14, color: "#64748B", textAlign: "center", lineHeight: 20 },

  form:      { padding: 20, gap: 6 },
  heroBanner: {
    backgroundColor: "#EEF4FF", borderRadius: 16, padding: 20,
    alignItems: "center", gap: 8, marginBottom: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#0066FF", textAlign: "center" },
  heroSub:   { fontSize: 13, color: "#64748B", textAlign: "center" },

  label:    { fontSize: 14, fontWeight: "600", color: "#1E293B", marginTop: 14, marginBottom: 6 },
  required: { color: "#EF4444" },
  input: {
    backgroundColor: "#fff", borderRadius: 12, borderWidth: 1.5,
    borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: "#1E293B",
  },
  textArea:   { height: 110, textAlignVertical: "top" },
  charCount:  { fontSize: 11, color: "#94A3B8", textAlign: "right", marginTop: 4 },

  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
    backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0",
  },
  categoryChipActive:     { backgroundColor: "#0066FF", borderColor: "#0066FF" },
  categoryChipText:       { fontSize: 13, color: "#64748B", fontWeight: "500" },
  categoryChipTextActive: { color: "#fff", fontWeight: "700" },

  submitBtn: {
    backgroundColor: "#0066FF", borderRadius: 14, padding: 16,
    alignItems: "center", marginTop: 24,
  },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});