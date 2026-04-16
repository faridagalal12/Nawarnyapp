// src/screens/ProfileScreen.js

import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";

export default function ProfileScreen({ signOut, navigation }) {
  const [userName, setUserName] = useState("--------");
  const [username, setUsername] = useState("@---------");
  const [bio, setBio] = useState("");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const comingSoon = title => {
    Alert.alert("Coming soon", `${title} is not available yet.`);
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "My Learning Profile",
      subtitle: "Monitor your progress",
      onPress: () => comingSoon("My Learning Profile"),
    },
    {
      icon: "bookmark-outline",
      title: "Saved Courses",
      subtitle: "Manage saved courses",
      onPress: () => comingSoon("Saved Courses"),
    },
    {
      icon: "lock-closed-outline",
      title: "Subscription",
      subtitle: "Manage your plan",
      onPress: () => comingSoon("Subscription"),
    },
    {
      icon: "shield-checkmark-outline",
      title: "Learning Badges Completed",
      subtitle: "Review your completed streaks and badges",
      onPress: () => comingSoon("Learning Badges Completed"),
    },
    {
      icon: "log-out-outline",
      title: "Log out",
      subtitle: "Further secure your account for safety",
      onPress: handleLogout,
      danger: true,
    },
  ];

  const moreItems = [
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      onPress: () => navigation.navigate("ContactSupport"),
    },
    {
      icon: "heart-outline",
      title: "About App",
      onPress: () => comingSoon("About App"),
    },
  ];

  async function handleLogout() {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => signOut() },
    ]);
  }

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(k => k + 1);
      setLoading(true);
      const fetchProfile = async () => {
        try {
          const res = await api.get("/users/profile/editable");
          console.log("Profile fetch:", JSON.stringify(res?.data));
          const profile = res?.data ?? {};
          setUserName(profile.name ?? "");
          setUsername(profile.username ? `@${profile.username}` : profile.email ?? "");
          setBio(profile.bio ?? "");
          setBioExpanded(false);
          setAvatar(profile.avatarUrl ?? null);
        } catch (err) {
          // silently keep placeholders
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.blueFrameCard}>
          <View style={styles.avatarCircle}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={34} color="#2F54EB" />
            )}
          </View>

          <View style={styles.userInfo}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.name} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                  {username}
                </Text>
                {!!bio && (
                  <>
                    <Text style={styles.bio} numberOfLines={bioExpanded ? undefined : 2}>
                      {bio}
                    </Text>
                    {bio.length > 90 && (
                      <TouchableOpacity
                        onPress={() => setBioExpanded(v => !v)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.bioToggle}>
                          {bioExpanded ? "Show less" : "Show more"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.editPill}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="pencil" size={18} color="#2F54EB" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, item.danger && styles.dangerItem]}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={item.danger ? "#FF3B30" : "#333"}
              style={styles.menuIcon}
            />
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, item.danger && { color: "#FF3B30" }]}>
                {item.title}
              </Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>More</Text>

      <View style={styles.section}>
        {moreItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color="#333"
              style={styles.menuIcon}
            />
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// styles stay exactly the same — no changes needed
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  blueFrameCard: {
    backgroundColor: "#2F54EB",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
    overflow: "hidden",
  },
  avatarImage: { width: 54, height: 54 },
  userInfo: { flex: 1, minWidth: 0 },
  name: { fontSize: 18, fontWeight: "700", color: "#ffffff" },
  username: { fontSize: 14, color: "#e7ecff", marginTop: 2, fontWeight: "600" },
  bio: { fontSize: 12, color: "#d6ddff", marginTop: 6, lineHeight: 16 },
  bioToggle: { fontSize: 12, color: "#ffffff", marginTop: 6, fontWeight: "700" },
  editPill: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 12,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  section: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 20,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  menuIcon: { marginRight: 16, width: 24, textAlign: "center" },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, color: "#000", fontWeight: "500" },
  menuSubtitle: { fontSize: 13, color: "#777", marginTop: 3 },
  dangerItem: { borderBottomWidth: 0 },
});
