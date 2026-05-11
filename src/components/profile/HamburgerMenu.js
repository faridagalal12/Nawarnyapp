import React, { useRef } from "react";
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, Image, ActivityIndicator, ScrollView,
  Animated, Dimensions, Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HamburgerMenu({
  visible, onClose, navigation,
  onLogout, isCreator, isAdmin, appStatus,
  userName, username, bio, avatar, drawerLoading,
  onUploadVideo, onUploadCourse,
}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_WIDTH,
      useNativeDriver: true, tension: 65, friction: 11,
    }).start();
  }, [visible]);

  const go = (screen) => {
    onClose();
    setTimeout(() => navigation.navigate(screen), 250);
  };

  const menuItems = [
    { icon: "person-outline", title: "My Learning Profile", subtitle: "Monitor your progress", onPress: () => go("LearningProfile") },
    { icon: "lock-closed-outline", title: "Subscription", subtitle: "Manage your plan", onPress: () => go("Subscription") },
    ...(isAdmin ? [{ icon: "shield-checkmark-outline", title: "Admin Panel", subtitle: "Review creator applications", onPress: () => go("Admin") }] : []),
  ];

  const creatorDashboardItems = [
    { icon: "grid-outline", title: "Creator Dashboard", subtitle: "View your stats & analytics", onPress: () => { onClose(); setTimeout(() => navigation.navigate("CreatorDashboard"), 300); } },
    { icon: "book-outline", title: "Upload Course", subtitle: "Publish a new course", onPress: () => { onClose(); setTimeout(() => navigation.navigate("UploadCourse"), 300); } },
  ];

  const moreItems = [
    { icon: "help-circle-outline", title: "Help & Support", onPress: () => go("ContactSupport") },
    { icon: "heart-outline", title: "About App", onPress: () => go("AboutApp") },
  ];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          <View style={styles.closeRow}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Blue profile card */}
          <View style={styles.blueCard}>
            <View style={styles.blueAvatarCircle}>
              {avatar
                ? <Image source={{ uri: avatar }} style={styles.blueAvatarImage} />
                : <Ionicons name="person" size={28} color="#2F54EB" />}
            </View>
            <View style={styles.blueUserInfo}>
              {drawerLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : (
                  <>
                    <Text style={styles.blueName} numberOfLines={1}>{userName}</Text>
                    <Text style={styles.blueUsername} numberOfLines={1}>{username}</Text>
                    {!!bio && <Text style={styles.blueBio} numberOfLines={2}>{bio}</Text>}
                  </>
                )}
            </View>
            <TouchableOpacity style={styles.blueEditPill} onPress={() => go("EditProfile")}>
              <Ionicons name="pencil" size={16} color="#2F54EB" />
            </TouchableOpacity>
          </View>

          {/* Main menu */}
          <View style={styles.section}>
            {menuItems.map((item, i) => (
              <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={22} color="#333" style={styles.menuIcon} />
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  {!!item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Creator Dashboard */}
          {isCreator && (
            <>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.creatorDashBadge}>
                  <Ionicons name="videocam" size={12} color="#fff" />
                  <Text style={styles.creatorDashBadgeText}>Creator Dashboard</Text>
                </View>
              </View>
              <View style={styles.section}>
                {creatorDashboardItems.map((item, i) => (
                  <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
                    <Ionicons name={item.icon} size={22} color="#2F54EB" style={styles.menuIcon} />
                    <View style={styles.menuTextWrap}>
                      <Text style={[styles.menuTitle, { color: "#185FA5" }]}>{item.title}</Text>
                      {!!item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#bbb" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Become a Creator */}
          {!isCreator && (
            <TouchableOpacity
              style={[styles.becomeCreatorBtn, appStatus === "pending" && { backgroundColor: "#F59E0B" }]}
              onPress={() => { onClose(); setTimeout(() => navigation.navigate("CreatorApplication"), 250); }}
            >
              <Ionicons name={appStatus === "pending" ? "time-outline" : "videocam-outline"} size={20} color="#fff" />
              <Text style={styles.becomeCreatorText}>
                {appStatus === "pending" ? "Application Pending" : "Become a Creator"}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.section}>
            {moreItems.map((item, i) => (
              <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={22} color="#333" style={styles.menuIcon} />
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.section, { marginTop: 8 }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => { onClose(); setTimeout(onLogout, 250); }}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={styles.menuIcon} />
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuTitle, { color: "#FF3B30" }]}>Log out</Text>
                <Text style={styles.menuSubtitle}>Further secure your account for safety</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  drawer: {
    position: "absolute", top: 0, right: 0, bottom: 0,
    width: SCREEN_WIDTH * 0.82, backgroundColor: "#f8f9fa",
    shadowColor: "#000", shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.14, shadowRadius: 20, elevation: 18,
  },
  closeRow: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 8, alignItems: "flex-end" },
  closeBtn: {
    padding: 6, backgroundColor: "#fff", borderRadius: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  blueCard: {
    backgroundColor: "#2F54EB", borderRadius: 14,
    flexDirection: "row", alignItems: "flex-start",
    paddingVertical: 18, paddingHorizontal: 16,
    marginHorizontal: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 4,
  },
  blueAvatarCircle: {
    width: 54, height: 54, borderRadius: 27, backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center", marginRight: 14, marginTop: 2, overflow: "hidden",
  },
  blueAvatarImage: { width: 54, height: 54 },
  blueUserInfo: { flex: 1, minWidth: 0 },
  blueName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  blueUsername: { fontSize: 13, color: "#e7ecff", marginTop: 2, fontWeight: "600" },
  blueBio: { fontSize: 11, color: "#d6ddff", marginTop: 5, lineHeight: 15 },
  blueEditPill: {
    backgroundColor: "#fff", borderRadius: 10,
    paddingHorizontal: 11, paddingVertical: 9, marginLeft: 10, alignSelf: "flex-start", marginTop: 2,
  },
  section: {
    backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 12, overflow: "hidden", marginBottom: 4,
  },
  sectionTitle: { fontSize: 12, color: "#666", marginTop: 18, marginBottom: 6, marginLeft: 20, fontWeight: "500" },
  menuItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee",
  },
  menuIcon: { marginRight: 14, width: 22, textAlign: "center" },
  menuTextWrap: { flex: 1 },
  menuTitle: { fontSize: 14, color: "#000", fontWeight: "500" },
  menuSubtitle: { fontSize: 11, color: "#777", marginTop: 2 },
  sectionHeaderRow: { marginHorizontal: 16, marginTop: 18, marginBottom: 8 },
  creatorDashBadge: {
    flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
    backgroundColor: "#2F54EB", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  creatorDashBadgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  becomeCreatorBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#2F54EB", marginHorizontal: 16, marginTop: 16, marginBottom: 4,
    borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16,
  },
  becomeCreatorText: { flex: 1, fontSize: 14, color: "#fff", fontWeight: "700" },
});