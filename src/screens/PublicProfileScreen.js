import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";

const { width } = Dimensions.get("window");
const THUMB_SIZE = (width - 48) / 3;

// ── Video thumbnail ───────────────────────────────────────────────────────────
function VideoThumb({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.thumb} onPress={() => onPress(item)}>
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.thumbImg} />
      ) : (
        <View style={[styles.thumbImg, styles.thumbPlaceholder]}>
          <Ionicons name="videocam" size={24} color="#94A3B8" />
          <Text style={styles.thumbTitle} numberOfLines={2}>{item.title}</Text>
        </View>
      )}
      <View style={styles.thumbOverlay}>
        <Ionicons name="play-circle" size={18} color="#fff" />
        <Text style={styles.thumbViews}>{item.views ?? 0}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Locked course card ────────────────────────────────────────────────────────
function CourseCard({ item }) {
  return (
    <View style={styles.courseCard}>
      <View style={styles.courseIconBox}>
        <Ionicons name="book-outline" size={22} color="#2F54EB" />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.courseMeta}>
          {item.videosCount > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="videocam-outline" size={11} color="#888" />
              <Text style={styles.metaText}>{item.videosCount} videos</Text>
            </View>
          )}
          {item.filesCount > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="document-outline" size={11} color="#888" />
              <Text style={styles.metaText}>{item.filesCount} files</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.lockBadge}>
        <Ionicons name="lock-closed" size={14} color="#fff" />
        <Text style={styles.lockText}>
          {item.price === 0 ? "Free" : `$${item.price}`}
        </Text>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PublicProfileScreen({ route, navigation }) {
  const { creatorId } = route.params;

  const [profile, setProfile]  = useState(null);
  const [videos,  setVideos]   = useState([]);
  const [courses, setCourses]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, videosRes, coursesRes] = await Promise.all([
          api.get(`/users/${creatorId}/profile`),
          api.get(`/creator/${creatorId}/videos`),
          api.get(`/creator/${creatorId}/courses`),
        ]);
        setProfile(profileRes?.data);
        setVideos(videosRes?.data ?? []);
        setCourses(coursesRes?.data ?? []);
      } catch (err) {
        console.log("Failed to load public profile:", err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [creatorId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066FF" />

      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {profile?.name ?? "Creator"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={36} color="#0066FF" />
            )}
          </View>
          <Text style={styles.name}>{profile?.name ?? "—"}</Text>
          {!!profile?.username && (
            <Text style={styles.username}>@{profile.username}</Text>
          )}
          {!!profile?.bio && (
            <Text style={styles.bio}>{profile.bio}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Text style={styles.statNum}>{videos.length}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statNum}>
                {videos.reduce((sum, v) => sum + (v.views ?? 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Text style={styles.statNum}>{courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 0 && styles.tabBtnActive]}
            onPress={() => setActiveTab(0)}
          >
            <Ionicons name="videocam-outline" size={16} color={activeTab === 0 ? "#2F54EB" : "#888"} />
            <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>
              Videos ({videos.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 1 && styles.tabBtnActive]}
            onPress={() => setActiveTab(1)}
          >
            <Ionicons name="book-outline" size={16} color={activeTab === 1 ? "#2F54EB" : "#888"} />
            <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>
              Courses ({courses.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Videos tab */}
        {activeTab === 0 && (
          <View style={styles.tabContent}>
            {videos.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="videocam-off-outline" size={40} color="#CBD5E1" />
                <Text style={styles.emptyText}>No videos yet</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {videos.map((item, i) => (
                  <VideoThumb
                    key={item.id ?? i}
                    item={item}
                    onPress={(video) => navigation.navigate("VideoPlayer", { video })}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Courses tab */}
        {activeTab === 1 && (
          <View style={styles.tabContent}>
            {courses.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="book-outline" size={40} color="#CBD5E1" />
                <Text style={styles.emptyText}>No courses yet</Text>
              </View>
            ) : (
              courses.map((item, i) => (
                <CourseCard key={item.id ?? i} item={item} />
              ))
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },
  scroll:    { paddingBottom: 40 },

  navBar: {
    backgroundColor: "#0066FF",
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8, paddingVertical: 12,
  },
  backBtn:  { padding: 8 },
  navTitle: { color: "#fff", fontSize: 17, fontWeight: "700", flex: 1, textAlign: "center" },

  profileHeader: { alignItems: "center", paddingTop: 24, paddingBottom: 8 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: "#EEF4FF", alignItems: "center",
    justifyContent: "center", marginBottom: 12,
    borderWidth: 3, borderColor: "#0066FF",
  },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  name:     { fontSize: 20, fontWeight: "800", color: "#1E293B" },
  username: { fontSize: 14, color: "#64748B", marginTop: 2 },
  bio: {
    fontSize: 13, color: "#64748B", textAlign: "center",
    marginTop: 8, marginHorizontal: 32, lineHeight: 18,
  },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 16, margin: 20,
    padding: 16, width: width - 48,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statCell:    { flex: 1, alignItems: "center" },
  statNum:     { fontSize: 18, fontWeight: "800", color: "#0066FF" },
  statLabel:   { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: "#E2E8F0" },

  tabBar: {
    flexDirection: "row", marginHorizontal: 16,
    backgroundColor: "#fff", borderRadius: 12, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  tabBtn: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 6,
    paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabBtnActive:  { borderBottomColor: "#2F54EB" },
  tabLabel:      { fontSize: 13, fontWeight: "600", color: "#888" },
  tabLabelActive:{ color: "#2F54EB" },

  tabContent: { marginHorizontal: 16, marginTop: 14 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumb: {
    width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: 10, overflow: "hidden", backgroundColor: "#E2E8F0",
  },
  thumbImg:         { width: "100%", height: "100%" },
  thumbPlaceholder: { alignItems: "center", justifyContent: "center", padding: 6, gap: 4 },
  thumbTitle:       { fontSize: 10, color: "#64748B", textAlign: "center", fontWeight: "600" },
  thumbOverlay: {
    position: "absolute", bottom: 4, left: 4,
    flexDirection: "row", alignItems: "center", gap: 3,
  },
  thumbViews: { color: "#fff", fontSize: 11, fontWeight: "600" },

  courseCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  courseIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  courseInfo:  { flex: 1 },
  courseTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  courseMeta:  { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  metaItem:    { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText:    { fontSize: 11, color: "#888" },
  lockBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#2F54EB", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  lockText: { fontSize: 11, color: "#fff", fontWeight: "700" },

  empty:     { alignItems: "center", marginTop: 40, gap: 10, paddingBottom: 20 },
  emptyText: { color: "#94A3B8", fontSize: 14 },
});