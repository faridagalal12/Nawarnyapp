import React, { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Image, Alert, ActivityIndicator, ScrollView,
  Animated, Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";
import HamburgerMenu from "../components/profile/HamburgerMenu";
import UploadFeedback from "../components/profile/UploadFeedback";
import CreatorCourseCard from "../components/profile/CreatorCourseCard";
import { pickAndUploadVideo, pickAndUploadCourse } from "../components/profile/uploadHelpers";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = (SCREEN_WIDTH - 32) / 2;

export default function ProfileScreen({ signOut, navigation }) {
  const [userName, setUserName]       = useState("");
  const [username, setUsername]       = useState("");
  const [bio, setBio]                 = useState("");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [avatar, setAvatar]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [isCreator, setIsCreator]     = useState(false);
  const [appStatus, setAppStatus]     = useState("none");
  const [level, setLevel]             = useState(1);
  const [isAdmin, setIsAdmin]         = useState(false);

  const [activeTab, setActiveTab]     = useState(0);
  const tabIndicatorX                 = useRef(new Animated.Value(0)).current;
  const [menuVisible, setMenuVisible] = useState(false);
  const [toastMsg, setToastMsg]       = useState(null);
  const [uploading, setUploading]     = useState(false);

  const [downloadedVideos, setDownloadedVideos] = useState([]);
  const [savedCourses, setSavedCourses]         = useState([]);
  const [creatorCourses, setCreatorCourses]     = useState([]);

  const TAB_LABELS = isCreator ? ["Videos", "Courses"] : ["Downloaded", "Saved"];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const switchTab = (i) => {
    setActiveTab(i);
    Animated.spring(tabIndicatorX, {
      toValue: i * TAB_WIDTH,
      useNativeDriver: true, tension: 80, friction: 10,
    }).start();
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const fetchAll = async () => {
        try {
          const [profileRes, creatorRes, downloadsRes] = await Promise.all([
            api.get("/users/profile/editable"),
            api.get("/creator/status"),
            api.get("/downloads/videos"),
          ]);

          const profile = profileRes?.data ?? {};
          setUserName(profile.name ?? "");
          setUsername(profile.username ? `@${profile.username}` : profile.email ?? "");
          setBio(profile.bio ?? "");
          setBioExpanded(false);
          setAvatar(profile.avatarUrl ?? null);

          const creatorData = creatorRes?.data;
          const creatorApproved = creatorData?.role === "creator";
          setIsCreator(creatorApproved);
          setAppStatus(creatorData?.application?.status ?? "none");
          setIsAdmin(creatorData?.role === "admin");
          setDownloadedVideos(downloadsRes?.data ?? []);

          if (creatorApproved) {
            const coursesRes = await api.get("/creator/my-courses");
            setCreatorCourses(coursesRes?.data ?? []);
          }

          const statsRes = await api.get("/learning-profile/stats");
          setLevel(statsRes?.data?.level ?? 1);

        } catch (err) {
          console.log("Profile fetch error:", err?.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleUploadVideo = async () => {
    setUploading(true);
    await pickAndUploadVideo(
      (msg) => { setUploading(false); showToast(msg); },
      (msg) => { setUploading(false); Alert.alert("Error", msg); }
    );
    setUploading(false);
  };

  const handleUploadCourse = async () => {
    setUploading(true);
    await pickAndUploadCourse(
      (msg) => { setUploading(false); showToast(msg); },
      (msg) => { setUploading(false); Alert.alert("Error", msg); }
    );
    setUploading(false);
  };

  const renderTabContent = () => {
    if (!isCreator) {
      if (activeTab === 0) {
        return downloadedVideos.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="download-outline" size={26} color="#2F54EB" />
            </View>
            <Text style={styles.emptyTitle}>No uploaded videos yet</Text>
            <Text style={styles.emptySubtitle}>Videos you download from the feed will appear here.</Text>
          </View>
        ) : (
          <View>
            {downloadedVideos.map((v, i) => (
              <View key={i} style={styles.videoCard}>
                <View style={styles.videoIconBox}>
                  <Ionicons name="videocam-outline" size={22} color="#2F54EB" />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={1}>{v.title}</Text>
                  <Text style={styles.courseMeta}>
                    {new Date(v.downloadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>
                <Ionicons name="play-circle-outline" size={24} color="#2F54EB" />
              </View>
            ))}
          </View>
        );
      }

      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="bookmark-outline" size={26} color="#2F54EB" />
          </View>
          <Text style={styles.emptyTitle}>No saved courses yet</Text>
          <Text style={styles.emptySubtitle}>Courses you save will appear here.</Text>
        </View>
      );
    }

    if (activeTab === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="cloud-upload-outline" size={26} color="#2F54EB" />
          </View>
          <Text style={styles.emptyTitle}>No videos uploaded yet</Text>
          <Text style={styles.emptySubtitle}>Upload your first short educational video.</Text>
          <TouchableOpacity
            style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
            onPress={handleUploadVideo}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="add" size={16} color="#fff" />}
            <Text style={styles.uploadBtnText}>{uploading ? "Uploading…" : "Upload video"}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.publicBanner}>
          <Ionicons name="earth-outline" size={13} color="#0C5A8C" />
          <Text style={styles.publicBannerText}>Your uploaded courses — visible to everyone</Text>
        </View>
        {creatorCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="book-outline" size={26} color="#2F54EB" />
            </View>
            <Text style={styles.emptyTitle}>No courses yet</Text>
            <Text style={styles.emptySubtitle}>Upload your first course below.</Text>
          </View>
        ) : (
          creatorCourses.map(item => <CreatorCourseCard key={item.id} item={item} />)
        )}
        <TouchableOpacity
          style={[styles.uploadBtn, { alignSelf: "center", marginTop: 6 }, uploading && { opacity: 0.6 }]}
          onPress={handleUploadCourse}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="add" size={16} color="#fff" />}
          <Text style={styles.uploadBtnText}>{uploading ? "Uploading…" : "Upload new course"}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6fb" />

      <View style={styles.topBar}>
        <Text style={styles.topBarLogo}>nawarny</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.hamburgerBtn}>
          <View style={styles.hamburgerLine} />
          <View style={[styles.hamburgerLine, { width: 18 }]} />
          <View style={[styles.hamburgerLine, { width: 22 }]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.heroCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                {avatar
                  ? <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  : <Ionicons name="person" size={38} color="#2F54EB" />}
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.{level}</Text>
            </View>
          </View>

          {loading
            ? <ActivityIndicator size="small" color="#2F54EB" style={{ marginTop: 14 }} />
            : (
              <>
                <Text style={styles.heroName}>{userName}</Text>
                <Text style={styles.heroUsername}>{username}</Text>
                {isCreator && (
                  <View style={styles.creatorBadge}>
                    <View style={styles.verifiedDot}>
                      <Ionicons name="checkmark" size={8} color="#fff" />
                    </View>
                    <Text style={styles.creatorBadgeText}>Verified Creator</Text>
                  </View>
                )}
                {!!bio && (
                  <>
                    <Text style={styles.heroBio} numberOfLines={bioExpanded ? undefined : 2}>{bio}</Text>
                    {bio.length > 80 && (
                      <TouchableOpacity onPress={() => setBioExpanded(v => !v)}>
                        <Text style={styles.bioToggle}>{bioExpanded ? "Show less" : "Show more"}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("EditProfile")}>
            <Ionicons name="pencil-outline" size={14} color="#2F54EB" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{downloadedVideos.length}</Text>
            <Text style={styles.statLabel}>Downloaded</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{savedCourses.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{isCreator ? creatorCourses.length : "0"}</Text>
            <Text style={styles.statLabel}>{isCreator ? "Courses" : "Views"}</Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          {TAB_LABELS.map((label, i) => (
            <TouchableOpacity key={i} style={styles.tabBtn} onPress={() => switchTab(i)}>
              <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[styles.tabIndicator, { width: TAB_WIDTH - 24, transform: [{ translateX: tabIndicatorX }] }]}
          />
        </View>

        <View style={styles.tabContent}>{renderTabContent()}</View>

      </ScrollView>

      <UploadFeedback message={toastMsg} onClose={() => setToastMsg(null)} />

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        onLogout={handleLogout}
        isCreator={isCreator}
        isAdmin={isAdmin}
        appStatus={appStatus}
        userName={userName}
        username={username}
        bio={bio}
        avatar={avatar}
        drawerLoading={loading}
        onUploadVideo={handleUploadVideo}
        onUploadCourse={handleUploadCourse}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb" },
  scrollContent: { paddingBottom: 40 },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
  },
  topBarLogo: { fontSize: 22, fontWeight: "800", color: "#2F54EB", letterSpacing: -0.5 },
  hamburgerBtn: { padding: 8, alignItems: "flex-end", justifyContent: "center" },
  hamburgerLine: { height: 2.5, width: 22, backgroundColor: "#222", borderRadius: 2, marginVertical: 2 },
  heroCard: {
    backgroundColor: "#fff", marginHorizontal: 16, marginTop: 6,
    borderRadius: 20, alignItems: "center",
    paddingTop: 28, paddingBottom: 20, paddingHorizontal: 20,
    shadowColor: "#2F54EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 3,
  },
  avatarWrapper: { alignItems: "center", marginBottom: 12, position: "relative" },
  avatarRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2.5, borderColor: "#2F54EB",
    justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80 },
  levelBadge: {
    position: "absolute", bottom: -4, right: -4,
    backgroundColor: "#2F54EB", borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, borderWidth: 2, borderColor: "#fff",
  },
  levelBadgeText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  heroName: { fontSize: 20, fontWeight: "800", color: "#111", letterSpacing: -0.3 },
  heroUsername: { fontSize: 13, color: "#888", marginTop: 2, fontWeight: "500" },
  creatorBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#EEF2FF", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6,
  },
  verifiedDot: {
    width: 14, height: 14, borderRadius: 7, backgroundColor: "#2F54EB",
    justifyContent: "center", alignItems: "center",
  },
  creatorBadgeText: { fontSize: 11, color: "#185FA5", fontWeight: "700" },
  heroBio: { fontSize: 13, color: "#555", textAlign: "center", marginTop: 8, lineHeight: 19, paddingHorizontal: 8 },
  bioToggle: { fontSize: 12, color: "#2F54EB", marginTop: 4, fontWeight: "700" },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16,
    borderWidth: 1.5, borderColor: "#2F54EB", borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 8, backgroundColor: "#EEF2FF",
  },
  editBtnText: { fontSize: 13, color: "#2F54EB", fontWeight: "700" },
  statsRow: {
    flexDirection: "row", backgroundColor: "#fff",
    marginHorizontal: 16, marginTop: 12, borderRadius: 16, paddingVertical: 14, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#111" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 1, fontWeight: "500" },
  statDivider: { width: 1, height: 34, backgroundColor: "#eee" },
  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 14,
    backgroundColor: "#fff", borderRadius: 14, paddingTop: 4,
    position: "relative", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabLabel: { fontSize: 13, fontWeight: "600", color: "#999" },
  tabLabelActive: { color: "#2F54EB" },
  tabIndicator: {
    position: "absolute", bottom: 0, left: 12, height: 3, backgroundColor: "#2F54EB", borderRadius: 3,
  },
  tabContent: { marginHorizontal: 16, marginTop: 12 },
  emptyState: {
    backgroundColor: "#fff", borderRadius: 16, padding: 36, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  emptyIconBox: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  emptyTitle: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 6 },
  emptySubtitle: { fontSize: 12, color: "#888", textAlign: "center", lineHeight: 18 },
  uploadBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#2F54EB", borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 16,
  },
  uploadBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },
  publicBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F0F9FF", borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7, marginBottom: 10,
    borderWidth: 0.5, borderColor: "#BAE0FF",
  },
  publicBannerText: { fontSize: 11, color: "#0C5A8C", fontWeight: "500" },
  videoCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, padding: 12, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  videoIconBox: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: "#eaf0ff",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 6 },
  courseMeta: { fontSize: 11, color: "#999", fontWeight: "500" },
});