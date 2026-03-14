// src/screens/ProfileScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text, // ← keep Text here
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
// ... rest of your code

import api from "../services/api";

export default function ProfileScreen({ signOut }) {
  // You can later connect this to real user data (context, redux, firebase, etc.)
  const [userName, setUserName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const comingSoon = title => {
    Alert.alert("Coming soon", `${title} is not available yet.`);
  };
  const user = {
    name: "Laila Assem",
    username: "@LailaAssem",
    avatar: null, // can be url or require('./assets/avatar.jpg')
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "My Learning Profile",
      subtitle: "Make changes to your account",
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
      onPress: () => {
        handleLogout();
      },
      danger: true,
    },
  ];

  const moreItems = [
    { icon: "help-circle-outline", title: "Help & Support", onPress: () => {} },
    { icon: "heart-outline", title: "About App", onPress: () => {} },
  ];
  const handleLogout = async () => {
    signOut();
  };

  useEffect(() => {
    const getUserData = async () => {
      await api
        .get("/auth/profile")
        .then(response => {
          console.log("Profile data:", response.data);
          const profile = response?.data?.data ?? response?.data ?? {};
          setEmail(profile.email || "");
          setUserName(profile.name || "");
        })
        .catch(error => {
          console.error("Failed to fetch profile data:", error);
        });
    };
    getUserData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color="#fff" />
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.username}>{email}</Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#0066FF" />
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
              <Text
                style={[styles.menuTitle, item.danger && { color: "#FF3B30" }]}
              >
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#0066FF",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  username: {
    fontSize: 15,
    color: "#666",
    marginTop: 2,
  },
  editButton: {
    padding: 8,
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
  menuIcon: {
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
});
