// src/screens/ProfileScreen.js
// Nawarny — Educational Learning Platform
//
// Student:  Videos (empty) | Saved (empty)
// Creator:  Videos (empty + upload) | Courses (list + upload)
// Hamburger:
//   - Blue frame card
//   - My Learning Profile, Subscription
//   - [CREATOR ONLY] Creator Dashboard, Upload Video, Manage Courses
//   - Become a Creator (student only)
//   - More: Help & Support, About App
//   - Log out

import React, { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import api from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = (SCREEN_WIDTH - 32) / 2;

// ─────────────────────────────────────────────────────────────────────────────
// Creator data (replace with real API)
// ─────────────────────────────────────────────────────────────────────────────
const CREATOR_COURSES = [
  { id: "1", title: "Intro to Aerodynamics", students: 342, color: "#4F8EF7", bg: "#eaf0ff", icon: "airplane-outline" },
  { id: "2", title: "CFD for Beginners",     students: 189, color: "#AF52DE", bg: "#f5eeff", icon: "desktop-outline"  },
  { id: "3", title: "Propulsion Systems",    students: 97,  color: "#FF9500", bg: "#fff5e6", icon: "settings-outline" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Upload helpers
// ─────────────────────────────────────────────────────────────────────────────
async function pickAndUploadVideo(onSuccess, onError) {
  try {
    // Ask for media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your media library to upload videos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    Alert.alert(
      "Upload video",
      `Ready to upload "${asset.fileName ?? "video"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upload",
          onPress: async () => {
            try {
              const formData = new FormData();
              formData.append("video", {
                uri: asset.uri,
                name: asset.fileName ?? "upload.mp4",
                type: asset.mimeType ?? "video/mp4",
              });
              await api.post("/creators/videos/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              onSuccess?.("Video uploaded successfully! 🎉");
            } catch (err) {
              onError?.("Upload failed. Please try again.");
            }
          },
        },
      ]
    );
  } catch (err) {
    onError?.("Could not open media library.");
  }
}

async function pickAndUploadCourse(onSuccess, onError) {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/zip", "video/*", "*/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const file = result.assets[0];
    Alert.alert(
      "Upload course",
      `Ready to upload "${file.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upload",
          onPress: async () => {
            try {
              const formData = new FormData();
              formData.append("course", {
                uri: file.uri,
                name: file.name,
                type: file.mimeType ?? "application/octet-stream",
              });
              await api.post("/creators/courses/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              onSuccess?.("Course uploaded successfully! 🎉");
            } catch (err) {
              onError?.("Upload failed. Please try again.");
            }
          },
        },
      ]
    );
  } catch (err) {
    onError?.("Could not open file picker.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload Progress Modal
// ─────────────────────────────────────────────────────────────────────────────
function UploadFeedback({ message, onClose }) {
  if (!message) return null;
  return (
    <View style={uploadStyles.toast}>
      <Ionicons name="checkmark-circle" size={18} color="#34C759" />
      <Text style={uploadStyles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={16} color="#888" />
      </TouchableOpacity>
    </View>
  );
}

const uploadStyles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  toastText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#111" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Hamburger Drawer
// ─────────────────────────────────────────────────────────────────────────────
function HamburgerMenu({
  visible, onClose, navigation,
  onLogout, onBecomeCreator, isCreator,
  userName, username, bio, avatar, drawerLoading,
  onUploadVideo, onUploadCourse,
}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  const go = (screen) => {
    onClose();
    setTimeout(() => navigation.navigate(screen), 250);
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "My Learning Profile",
      subtitle: "Monitor your progress",
      onPress: () => go("LearningProfileScreen"),
    },
    {
      icon: "lock-closed-outline",
      title: "Subscription",
      subtitle: "Manage your plan",
      onPress: () => go("Subscription"),
    },
  ];

  const creatorDashboardItems = [
    {
      icon: "grid-outline",
      title: "Dashboard",
      subtitle: "Full analytics & channel overview",
      onPress: () => go("CreatorDashboard"),
    },
    {
      icon: "cloud-upload-outline",
      title: "Upload Video",
      subtitle: "Share a new short lesson",
      onPress: () => { onClose(); setTimeout(onUploadVideo, 300); },
    },
    {
      icon: "book-outline",
      title: "Manage Courses",
      subtitle: "Edit and publish your courses",
      onPress: () => go("ManageCourses"),
    },
  ];

  const moreItems = [
    { icon: "help-circle-outline", title: "Help & Support", onPress: () => go("ContactSupport") },
    { icon: "heart-outline",       title: "About App",      onPress: () => go("AboutApp")        },
  ];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={drawerStyles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[drawerStyles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Close */}
          <View style={drawerStyles.closeRow}>
            <TouchableOpacity onPress={onClose} style={drawerStyles.closeBtn}>
              <Ionicons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* ── Blue frame profile card ── */}
          <View style={drawerStyles.blueCard}>
            <View style={drawerStyles.blueAvatarCircle}>
              {avatar
                ? <Image source={{ uri: avatar }} style={drawerStyles.blueAvatarImage} />
                : <Ionicons name="person" size={28} color="#2F54EB" />
              }
            </View>
            <View style={drawerStyles.blueUserInfo}>
              {drawerLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : (
                  <>
                    <Text style={drawerStyles.blueName} numberOfLines={1}>{userName}</Text>
                    <Text style={drawerStyles.blueUsername} numberOfLines={1}>{username}</Text>
                    {!!bio && <Text style={drawerStyles.blueBio} numberOfLines={2}>{bio}</Text>}
                  </>
                )
              }
            </View>
            <TouchableOpacity style={drawerStyles.blueEditPill} onPress={() => go("EditProfile")}>
              <Ionicons name="pencil" size={16} color="#2F54EB" />
            </TouchableOpacity>
          </View>

          {/* ── Main menu ── */}
          <View style={drawerStyles.section}>
            {menuItems.map((item, i) => (
              <TouchableOpacity key={i} style={drawerStyles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={22} color="#333" style={drawerStyles.menuIcon} />
                <View style={drawerStyles.menuTextWrap}>
                  <Text style={drawerStyles.menuTitle}>{item.title}</Text>
                  {!!item.subtitle && <Text style={drawerStyles.menuSubtitle}>{item.subtitle}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Creator Dashboard — ONLY visible to creators ── */}
          {isCreator && (
            <>
              <View style={drawerStyles.sectionHeaderRow}>
                <View style={drawerStyles.creatorDashBadge}>
                  <Ionicons name="videocam" size={12} color="#fff" />
                  <Text style={drawerStyles.creatorDashBadgeText}>Creator Dashboard</Text>
                </View>
              </View>
              <View style={drawerStyles.section}>
                {creatorDashboardItems.map((item, i) => (
                  <TouchableOpacity key={i} style={drawerStyles.menuItem} onPress={item.onPress}>
                    <Ionicons name={item.icon} size={22} color="#2F54EB" style={drawerStyles.menuIcon} />
                    <View style={drawerStyles.menuTextWrap}>
                      <Text style={[drawerStyles.menuTitle, { color: "#185FA5" }]}>{item.title}</Text>
                      {!!item.subtitle && <Text style={drawerStyles.menuSubtitle}>{item.subtitle}</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#bbb" />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ── Become a Creator (students only) ── */}
          {!isCreator && (
            <TouchableOpacity
              style={drawerStyles.becomeCreatorBtn}
              onPress={() => { onClose(); setTimeout(onBecomeCreator, 250); }}
            >
              <Ionicons name="videocam-outline" size={20} color="#fff" />
              <Text style={drawerStyles.becomeCreatorText}>Become a Creator</Text>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}

          {/* ── More ── */}
          <Text style={drawerStyles.sectionTitle}>More</Text>
          <View style={drawerStyles.section}>
            {moreItems.map((item, i) => (
              <TouchableOpacity key={i} style={drawerStyles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={22} color="#333" style={drawerStyles.menuIcon} />
                <Text style={drawerStyles.menuTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={18} color="#bbb" />
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Log out ── */}
          <View style={[drawerStyles.section, { marginTop: 8 }]}>
            <TouchableOpacity
              style={[drawerStyles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => { onClose(); setTimeout(onLogout, 250); }}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" style={drawerStyles.menuIcon} />
              <View style={drawerStyles.menuTextWrap}>
                <Text style={[drawerStyles.menuTitle, { color: "#FF3B30" }]}>Log out</Text>
                <Text style={drawerStyles.menuSubtitle}>Further secure your account for safety</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#bbb" />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Creator Application Form
// ─────────────────────────────────────────────────────────────────────────────
const SUBJECTS = [
  "Mathematics", "Physics", "Engineering",
  "Biology", "Chemistry", "History",
  "Computer Science", "Literature",
];

function CreatorFormScreen({ onBack, onSubmit }) {
  const [selected, setSelected] = useState(["Mathematics", "Engineering"]);
  const toggle = (s) => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <SafeAreaView style={formStyles.container}>
      <View style={formStyles.header}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color="#2F54EB" />
        </TouchableOpacity>
        <Text style={formStyles.title}>Become a Creator</Text>
      </View>

      <ScrollView contentContainerStyle={formStyles.body} showsVerticalScrollIndicator={false}>
        {[
          { label: "Display name", value: "Jana Al-Sayed" },
          { label: "Channel tagline", placeholder: "e.g. Making maths click for everyone" },
        ].map(({ label, value, placeholder }) => (
          <View key={label} style={formStyles.field}>
            <Text style={formStyles.label}>{label}</Text>
            <View style={formStyles.input}>
              <Text style={[formStyles.inputText, !value && { color: "#bbb" }]}>
                {value ?? placeholder}
              </Text>
            </View>
          </View>
        ))}

        <View style={formStyles.field}>
          <Text style={formStyles.label}>Subject focus</Text>
          <View style={formStyles.chipGrid}>
            {SUBJECTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[formStyles.chip, selected.includes(s) && formStyles.chipSel]}
                onPress={() => toggle(s)}
              >
                <Text style={[formStyles.chipText, selected.includes(s) && formStyles.chipTextSel]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={formStyles.field}>
          <Text style={formStyles.label}>Teaching experience</Text>
          <View style={[formStyles.input, { flexDirection: "row", justifyContent: "space-between" }]}>
            <Text style={formStyles.inputText}>University student</Text>
            <Ionicons name="chevron-down" size={16} color="#aaa" />
          </View>
        </View>

        <View style={formStyles.field}>
          <Text style={formStyles.label}>Why do you want to teach?</Text>
          <View style={[formStyles.input, { height: 80, alignItems: "flex-start" }]}>
            <Text style={formStyles.inputText}>
              Aerospace engineering student who loves breaking down complex topics into short, visual videos.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={formStyles.submitBtn} onPress={onSubmit}>
          <Text style={formStyles.submitText}>Apply to become a creator →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Creator Success Screen
// ─────────────────────────────────────────────────────────────────────────────
function CreatorSuccessScreen({ onConfirm }) {
  return (
    <SafeAreaView style={[formStyles.container, { justifyContent: "center", alignItems: "center", padding: 32 }]}>
      <View style={mainStyles.successIcon}>
        <Text style={{ fontSize: 32 }}>🎉</Text>
      </View>
      <Text style={mainStyles.successTitle}>You're a creator now!</Text>
      <Text style={mainStyles.successSubtitle}>
        Your creator profile is live. Start uploading short educational videos and grow your audience.
      </Text>
      <TouchableOpacity style={[formStyles.submitBtn, { width: "100%" }]} onPress={onConfirm}>
        <Text style={formStyles.submitText}>Go to my creator profile →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Creator Course Card
// ─────────────────────────────────────────────────────────────────────────────
function CreatorCourseCard({ item }) {
  return (
    <View style={mainStyles.courseCard}>
      <View style={[mainStyles.courseIconBox, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <View style={mainStyles.courseInfo}>
        <Text style={mainStyles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <View style={mainStyles.progressTrack}>
          <View style={[mainStyles.progressFill, { width: "80%", backgroundColor: item.color }]} />
        </View>
        <Text style={mainStyles.courseMeta}>{item.students} students enrolled</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProfileScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ signOut, navigation }) {
  const [userName, setUserName]       = useState("Jana Al-Sayed");
  const [username, setUsername]       = useState("@jana.learns");
  const [bio, setBio]                 = useState("Aerospace engineering student ✈️ · Making science accessible for everyone 🌍");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [avatar, setAvatar]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [isCreator, setIsCreator]     = useState(false);

  const [activeTab, setActiveTab]     = useState(0);
  const tabIndicatorX                 = useRef(new Animated.Value(0)).current;

  const [menuVisible, setMenuVisible] = useState(false);
  const [screen, setScreen]           = useState("profile"); // "profile"|"form"|"success"
  const [toastMsg, setToastMsg]       = useState(null);
  const [uploading, setUploading]     = useState(false);

  const [stats, setStats] = useState({
    s1: { value: "0",  label: "Videos" },
    s2: { value: "34", label: "Saved"  },
    s3: { value: "0",  label: "Views"  },
  });

  const TAB_LABELS = isCreator ? ["Videos", "Courses"] : ["Videos", "Saved"];

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const switchTab = (i) => {
    setActiveTab(i);
    Animated.spring(tabIndicatorX, {
      toValue: i * TAB_WIDTH,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const fetchProfile = async () => {
        try {
          const res     = await api.get("/users/profile/editable");
          const profile = res?.data ?? {};
          setUserName(profile.name ?? "Jana Al-Sayed");
          setUsername(profile.username ? `@${profile.username}` : profile.email ?? "");
          setBio(profile.bio ?? "");
          setBioExpanded(false);
          setAvatar(profile.avatarUrl ?? null);
        } catch { /* keep defaults */ }
        finally { setLoading(false); }
      };
      fetchProfile();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const activateCreator = () => {
    setIsCreator(true);
    setBio("Aerospace engineer ✈ · Short educational videos on propulsion, CFD & flight dynamics");
    setStats({
      s1: { value: "0",    label: "Videos"    },
      s2: { value: "1.2K", label: "Followers" },
      s3: { value: "0",    label: "Views"     },
    });
    setScreen("profile");
    setActiveTab(0);
    Animated.spring(tabIndicatorX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
  };

  // ── Upload handlers ──
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

  // ── Tab content ──
  const renderTabContent = () => {
    if (!isCreator) {
      return (
        <View style={mainStyles.emptyState}>
          <View style={mainStyles.emptyIconBox}>
            <Ionicons
              name={activeTab === 0 ? "videocam-outline" : "bookmark-outline"}
              size={26}
              color="#2F54EB"
            />
          </View>
          <Text style={mainStyles.emptyTitle}>
            {activeTab === 0 ? "No videos yet" : "No saved videos yet"}
          </Text>
          <Text style={mainStyles.emptySubtitle}>
            {activeTab === 0
              ? "Videos you watch and interact with will appear here."
              : "Save videos from the feed and they'll show up here."}
          </Text>
        </View>
      );
    }

    // CREATOR — Videos tab
    if (activeTab === 0) {
      return (
        <View style={mainStyles.emptyState}>
          <View style={mainStyles.emptyIconBox}>
            <Ionicons name="cloud-upload-outline" size={26} color="#2F54EB" />
          </View>
          <Text style={mainStyles.emptyTitle}>No videos uploaded yet</Text>
          <Text style={mainStyles.emptySubtitle}>
            Upload your first short educational video and start growing your audience.
          </Text>
          <TouchableOpacity
            style={[mainStyles.uploadBtn, uploading && { opacity: 0.6 }]}
            onPress={handleUploadVideo}
            disabled={uploading}
          >
            {uploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="add" size={16} color="#fff" />
            }
            <Text style={mainStyles.uploadBtnText}>
              {uploading ? "Uploading…" : "Upload video"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // CREATOR — Courses tab
    return (
      <View>
        <View style={mainStyles.publicBanner}>
          <Ionicons name="earth-outline" size={13} color="#0C5A8C" />
          <Text style={mainStyles.publicBannerText}>Your uploaded courses — visible to everyone</Text>
        </View>
        {CREATOR_COURSES.map(item => <CreatorCourseCard key={item.id} item={item} />)}
        <TouchableOpacity
          style={[mainStyles.uploadBtn, { alignSelf: "center", marginTop: 6 }, uploading && { opacity: 0.6 }]}
          onPress={handleUploadCourse}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="add" size={16} color="#fff" />
          }
          <Text style={mainStyles.uploadBtnText}>
            {uploading ? "Uploading…" : "Upload new course"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (screen === "form")    return <CreatorFormScreen onBack={() => setScreen("profile")} onSubmit={() => setScreen("success")} />;
  if (screen === "success") return <CreatorSuccessScreen onConfirm={activateCreator} />;

  return (
    <SafeAreaView style={mainStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6fb" />

      {/* Top Bar */}
      <View style={mainStyles.topBar}>
        <Text style={mainStyles.topBarLogo}>nawarny</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={mainStyles.hamburgerBtn}>
          <View style={mainStyles.hamburgerLine} />
          <View style={[mainStyles.hamburgerLine, { width: 18 }]} />
          <View style={[mainStyles.hamburgerLine, { width: 22 }]} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={mainStyles.scrollContent}>

        {/* Hero Card */}
        <View style={mainStyles.heroCard}>
          <View style={mainStyles.avatarWrapper}>
            <View style={mainStyles.avatarRing}>
              <View style={mainStyles.avatarCircle}>
                {avatar
                  ? <Image source={{ uri: avatar }} style={mainStyles.avatarImage} />
                  : <Ionicons name="person" size={38} color="#2F54EB" />
                }
              </View>
            </View>
            {!isCreator && (
              <View style={mainStyles.levelBadge}>
                <Text style={mainStyles.levelBadgeText}>Lv.5</Text>
              </View>
            )}
          </View>

          {loading
            ? <ActivityIndicator size="small" color="#2F54EB" style={{ marginTop: 14 }} />
            : (
              <>
                <Text style={mainStyles.heroName}>{userName}</Text>
                <Text style={mainStyles.heroUsername}>{username}</Text>
                {isCreator && (
                  <View style={mainStyles.creatorBadge}>
                    <View style={mainStyles.verifiedDot}>
                      <Ionicons name="checkmark" size={8} color="#fff" />
                    </View>
                    <Text style={mainStyles.creatorBadgeText}>Verified Creator</Text>
                  </View>
                )}
                {!!bio && (
                  <>
                    <Text style={mainStyles.heroBio} numberOfLines={bioExpanded ? undefined : 2}>{bio}</Text>
                    {bio.length > 80 && (
                      <TouchableOpacity onPress={() => setBioExpanded(v => !v)}>
                        <Text style={mainStyles.bioToggle}>{bioExpanded ? "Show less" : "Show more"}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )
          }

          <TouchableOpacity style={mainStyles.editBtn} onPress={() => navigation.navigate("EditProfile")}>
            <Ionicons name="pencil-outline" size={14} color="#2F54EB" />
            <Text style={mainStyles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={mainStyles.statsRow}>
          {[stats.s1, stats.s2, stats.s3].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={mainStyles.statDivider} />}
              <View style={mainStyles.statItem}>
                <Text style={mainStyles.statValue}>{s.value}</Text>
                <Text style={mainStyles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Tabs */}
        <View style={mainStyles.tabBar}>
          {TAB_LABELS.map((label, i) => (
            <TouchableOpacity key={i} style={mainStyles.tabBtn} onPress={() => switchTab(i)}>
              <Text style={[mainStyles.tabLabel, activeTab === i && mainStyles.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[mainStyles.tabIndicator, { width: TAB_WIDTH - 24, transform: [{ translateX: tabIndicatorX }] }]}
          />
        </View>

        <View style={mainStyles.tabContent}>{renderTabContent()}</View>

      </ScrollView>

      {/* Toast notification */}
      <UploadFeedback message={toastMsg} onClose={() => setToastMsg(null)} />

      {/* Hamburger Drawer */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigation={navigation}
        onLogout={handleLogout}
        onBecomeCreator={() => setScreen("form")}
        isCreator={isCreator}
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

// ─────────────────────────────────────────────────────────────────────────────
// Drawer Styles
// ─────────────────────────────────────────────────────────────────────────────
const drawerStyles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  drawer: {
    position: "absolute",
    top: 0, right: 0, bottom: 0,
    width: SCREEN_WIDTH * 0.82,
    backgroundColor: "#f8f9fa",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 18,
  },
  closeRow: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 8, alignItems: "flex-end" },
  closeBtn: {
    padding: 6, backgroundColor: "#fff", borderRadius: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  blueCard: {
    backgroundColor: "#2F54EB",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  blueAvatarCircle: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
    marginRight: 14, marginTop: 2, overflow: "hidden",
  },
  blueAvatarImage: { width: 54, height: 54 },
  blueUserInfo: { flex: 1, minWidth: 0 },
  blueName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  blueUsername: { fontSize: 13, color: "#e7ecff", marginTop: 2, fontWeight: "600" },
  blueBio: { fontSize: 11, color: "#d6ddff", marginTop: 5, lineHeight: 15 },
  blueEditPill: {
    backgroundColor: "#fff", borderRadius: 10,
    paddingHorizontal: 11, paddingVertical: 9,
    marginLeft: 10, alignSelf: "flex-start", marginTop: 2,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12, color: "#666",
    marginTop: 18, marginBottom: 6,
    marginLeft: 20, fontWeight: "500",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  menuIcon: { marginRight: 14, width: 22, textAlign: "center" },
  menuTextWrap: { flex: 1 },
  menuTitle: { fontSize: 14, color: "#000", fontWeight: "500" },
  menuSubtitle: { fontSize: 11, color: "#777", marginTop: 2 },
  sectionHeaderRow: { marginHorizontal: 16, marginTop: 18, marginBottom: 8 },
  creatorDashBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#2F54EB",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  creatorDashBadgeText: { fontSize: 11, color: "#fff", fontWeight: "700" },
  becomeCreatorBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2F54EB",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  becomeCreatorText: { flex: 1, fontSize: 14, color: "#fff", fontWeight: "700" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Form Styles
// ─────────────────────────────────────────────────────────────────────────────
const formStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee",
  },
  title: { fontSize: 16, fontWeight: "800", color: "#111" },
  body: { padding: 16, paddingBottom: 40 },
  field: { marginBottom: 14 },
  label: { fontSize: 11, fontWeight: "600", color: "#888", marginBottom: 5 },
  input: {
    backgroundColor: "#f4f6fb", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 0.5, borderColor: "#e0e0e0",
    justifyContent: "center", minHeight: 42,
  },
  inputText: { fontSize: 13, color: "#222" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: "#ddd", backgroundColor: "#f4f6fb",
  },
  chipSel: { backgroundColor: "#EEF2FF", borderColor: "#2F54EB" },
  chipText: { fontSize: 12, color: "#888", fontWeight: "500" },
  chipTextSel: { color: "#185FA5", fontWeight: "700" },
  submitBtn: {
    backgroundColor: "#2F54EB", borderRadius: 14,
    paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  submitText: { fontSize: 14, color: "#fff", fontWeight: "700" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen Styles
// ─────────────────────────────────────────────────────────────────────────────
const mainStyles = StyleSheet.create({
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
    shadowColor: "#2F54EB", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 3,
  },
  avatarWrapper: { alignItems: "center", marginBottom: 12, position: "relative" },
  avatarRing: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2.5, borderColor: "#2F54EB",
    justifyContent: "center", alignItems: "center", backgroundColor: "#fff",
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80 },
  levelBadge: {
    position: "absolute", bottom: -4, right: -4,
    backgroundColor: "#2F54EB", borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 2, borderColor: "#fff",
  },
  levelBadgeText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  heroName: { fontSize: 20, fontWeight: "800", color: "#111", letterSpacing: -0.3 },
  heroUsername: { fontSize: 13, color: "#888", marginTop: 2, fontWeight: "500" },
  creatorBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#EEF2FF", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3, marginTop: 6,
  },
  verifiedDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#2F54EB", justifyContent: "center", alignItems: "center",
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
    marginHorizontal: 16, marginTop: 12, borderRadius: 16,
    paddingVertical: 14, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#111" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 1, fontWeight: "500" },
  statDivider: { width: 1, height: 34, backgroundColor: "#eee" },
  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 14,
    backgroundColor: "#fff", borderRadius: 14, paddingTop: 4,
    position: "relative", overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabLabel: { fontSize: 13, fontWeight: "600", color: "#999" },
  tabLabelActive: { color: "#2F54EB" },
  tabIndicator: {
    position: "absolute", bottom: 0, left: 12,
    height: 3, backgroundColor: "#2F54EB", borderRadius: 3,
  },
  tabContent: { marginHorizontal: 16, marginTop: 12 },
  emptyState: {
    backgroundColor: "#fff", borderRadius: 16, padding: 36, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
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
  courseCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, padding: 12, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  courseIconBox: { width: 46, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 6 },
  progressTrack: { height: 4, backgroundColor: "#eee", borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 4, borderRadius: 3 },
  courseMeta: { fontSize: 11, color: "#999", fontWeight: "500" },
  successIcon: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },
  successTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 8, textAlign: "center" },
  successSubtitle: { fontSize: 13, color: "#666", textAlign: "center", lineHeight: 20, marginBottom: 24 },
});