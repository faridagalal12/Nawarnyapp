import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, Image, ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";

export default function PublicProfileScreen({ route }) {
  const { userId } = route.params; // comes from home screen tap
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${userId}/profile`);
        setProfile(res.data);
      } catch (err) {
        console.log("Error fetching public profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2F54EB" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          {profile.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={34} color="#2F54EB" />
          )}
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        {profile.username && (
          <Text style={styles.username}>@{profile.username}</Text>
        )}
        {profile.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.completedCoursesCount}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile.xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#e8eeff",
    justifyContent: "center", alignItems: "center",
    marginBottom: 12, overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80 },
  name: { fontSize: 20, fontWeight: "700", color: "#000" },
  username: { fontSize: 14, color: "#666", marginTop: 4 },
  bio: { fontSize: 13, color: "#555", marginTop: 8, textAlign: "center", lineHeight: 18 },
  statsRow: {
    flexDirection: "row", marginTop: 24,
    justifyContent: "space-around", width: "100%",
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#2F54EB" },
  statLabel: { fontSize: 12, color: "#999", marginTop: 2 },
});