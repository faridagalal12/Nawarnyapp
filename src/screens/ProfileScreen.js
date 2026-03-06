import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProfileScreen({ navigation }) {
  const user = {
    name: "Laila Assem",
    username: "@LailaAssem",
    avatar: null,
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "My Learning Profile",
      subtitle: "Make changes to your account",
      onPress: () => navigation?.navigate?.("LearningProfile"),
    },
    {
      icon: "bookmark-outline",
      title: "Saved Courses",
      subtitle: "Manage saved courses",
      onPress: () => navigation?.navigate?.("SavedCourses"),
    },
    {
      icon: "lock-closed-outline",
      title: "Subscription",
      subtitle: "Manage your plan",
      onPress: () => navigation?.navigate?.("Subscription"),
    },
    {
      icon: "shield-checkmark-outline",
      title: "Learning Badges Completed",
      subtitle: "Review your completed streaks and badges",
      onPress: () => navigation?.navigate?.("Badges"),
    },
    {
      icon: "log-out-outline",
      title: "Log out",
      subtitle: "Further secure your account for safety",
      onPress: () => {
        alert("Logging out...");
      },
      danger: true,
    },
  ];

  const moreItems = [
    { icon: "notifications-outline", title: "Help & Support", onPress: () => {} },
    { icon: "heart-outline", title: "About App", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color="#FFFFFF" />
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.username}>{user.username}</Text>
          </View>

          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, item.danger && styles.lastItem]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon} size={18} color="#3D4FD6" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, item.danger && styles.dangerTitle]}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>More</Text>

        <View style={styles.section}>
          {moreItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index === moreItems.length - 1 && styles.lastItem]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconCircle}>
                <Ionicons name={item.icon} size={18} color="#3D4FD6" />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 12,
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: "#3B4FD0",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  username: {
    fontSize: 18,
    color: "#E6EBFF",
    marginTop: 2,
  },
  editButton: {
    padding: 8,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    color: "#444A55",
    marginTop: 18,
    marginBottom: 2,
    marginLeft: 8,
    fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E6E6E6",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F1FB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    color: "#20242C",
    fontWeight: "500",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#9BA0AA",
    marginTop: 2,
  },
  dangerTitle: {
    color: "#2A2D33",
  },
});
