import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { VideoView, useVideoPlayer } from "expo-video";
import api from "../services/api";

const { width } = Dimensions.get("window");
const THUMB_SIZE = (width - 48) / 3;

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

export default function PublicProfileScreen({ route, navigation }) {
  const { creatorId } = route.params;

  const [profile,  setProfile]  = useState(null);
  const [videos,   setVideos]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, videosRes] = await Promise.all([
          api.get(`/users/${creatorId}/public-profile`),
          api.get(`/creator/${creatorId}/videos`),
        ]);
        setProfile(profileRes?.data);
        setVideos(videosRes?.data ?? []);
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

      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        numColumns={3}
        ListHeaderComponent={() => (
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarCircle}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
              ) : (
                <Ionicons name="person" size={36} color="#0066FF" />
              )}
            </View>

            {/* Name & username */}
            <Text style={styles.name}>{profile?.name ?? "—"}</Text>
            <Text style={styles.username}>
              {profile?.username ? `@${profile.username}` : ""}
            </Text>

            {/* Bio */}
            {!!profile?.bio && (
              <Text style={styles.bio}>{profile.bio}</Text>
            )}

            {/* Stats row */}
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
                <Text style={styles.statNum}>
                  {videos.reduce((sum, v) => sum + (v.likesCount ?? 0), 0)}
                </Text>
                <Text style={styles.statLabel}>Total Likes</Text>
              </View>
            </View>

            <Text style={styles.videosHeading}>Videos</Text>
          </View>
        )}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
       renderItem={({ item }) => (
          <VideoThumb item={item} onPress={(video) => navigation.navigate("VideoPlayer", { video })} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="videocam-off-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No videos yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },

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

  videosHeading: {
    alignSelf: "flex-start", marginLeft: 16,
    fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 8,
  },

  grid: { paddingHorizontal: 16, paddingBottom: 32 },
  row:  { gap: 8, marginBottom: 8 },

  thumb:        { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 10, overflow: "hidden", backgroundColor: "#E2E8F0" },
  thumbImg:     { width: "100%", height: "100%" },
thumbPlaceholder: { alignItems: "center", justifyContent: "center", padding: 6, gap: 4 },
  thumbTitle: { fontSize: 10, color: "#64748B", textAlign: "center", fontWeight: "600" },  thumbOverlay: {
    position: "absolute", bottom: 4, left: 4,
    flexDirection: "row", alignItems: "center", gap: 3,
  },
  thumbViews: { color: "#fff", fontSize: 11, fontWeight: "600" },

  empty:     { alignItems: "center", marginTop: 40, gap: 10 },
  emptyText: { color: "#94A3B8", fontSize: 14 },
});