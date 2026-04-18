import React, { useRef, useState, useEffect } from "react";
import {
  View, FlatList, Dimensions, StyleSheet,
  TouchableOpacity, Text, ActivityIndicator,
  StatusBar, Image, Platform,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import api from "../services/api";

const { height, width } = Dimensions.get("window");
const BLUE = "#0066FF";
const TAB_BAR_HEIGHT = 80;
const PANEL_HEIGHT = 220;

const levelColors = {
  Beginner: "#22C55E",
  Intermediate: "#F59E0B",
  Advanced: "#EF4444",
};

function VideoItem({ item, isActive, navigation }) {
  const [liked, setLiked] = useState(item.isLiked ?? false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(item.likesCount ?? 0);
  const [paused, setPaused] = useState(false);

  const player = useVideoPlayer(item.videoUrl, p => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive && !paused) player.play();
    else player.pause();
  }, [isActive, paused]);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
      await api.post(`/videos/${item.id}/like`);
    } catch {
      setLiked(liked);
      setLikes(likes);
    }
  };

  const hasProgress = item.watchedPercent != null && item.watchedPercent > 0;
  const levelColor = levelColors[item.level] ?? BLUE;

  return (
    <View style={styles.videoContainer}>
      <StatusBar barStyle="light-content" />

      {/* FULL SCREEN VIDEO */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        onPress={() => setPaused(!paused)}
        activeOpacity={1}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </TouchableOpacity>

      {/* PAUSE OVERLAY */}
      {paused && (
        <View style={styles.pauseOverlay} pointerEvents="none">
          <View style={styles.pauseCircle}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
        </View>
      )}

      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        {/* Nawarny Logo */}
        <View style={styles.logoWrap}>
          <Text style={styles.logoText}>Nawarny</Text>
          <View style={styles.logoDot} />
        </View>

        {/* Level + Duration */}
        <View style={styles.topBadges}>
          {item.level && (
            <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
          )}
          {item.duration && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color="#fff" />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── SIDE ACTIONS (minimal) ── */}
      <View style={styles.sideActions}>
        {/* Instructor avatar */}
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => navigation.navigate("InstructorProfile", {
            instructorId: item.instructorId,
          })}
        >
          {item.instructorAvatar ? (
            <Image source={{ uri: item.instructorAvatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
          )}
          <View style={styles.plusDot}>
            <Ionicons name="add" size={9} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLike} style={styles.sideBtn}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={26}
            color={liked ? "#FF4D6D" : "#fff"}
          />
          <Text style={styles.sideBtnLabel}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
          <Text style={styles.sideBtnLabel}>{item.commentsCount ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtn} onPress={() => setSaved(!saved)}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={26}
            color={saved ? "#FFD60A" : "#fff"}
          />
          <Text style={styles.sideBtnLabel}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtn}>
          <Ionicons name="paper-plane-outline" size={26} color="#fff" />
          <Text style={styles.sideBtnLabel}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM FROSTED PANEL ── */}
      <View style={styles.panel}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Blue top accent line */}
        <View style={styles.panelAccent} />

        <View style={styles.panelContent}>
          {/* Row 1: Category + Lessons count */}
          <View style={styles.panelRow}>
            {item.category && (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{item.category}</Text>
              </View>
            )}
            {item.lessonsCount && (
              <View style={styles.lessonsChip}>
                <Ionicons name="layers-outline" size={13} color={BLUE} />
                <Text style={styles.lessonsChipText}>{item.lessonsCount} lessons</Text>
              </View>
            )}
          </View>

          {/* Row 2: Title */}
          <Text style={styles.panelTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Row 3: Instructor */}
          {(item.instructor || item.username) && (
            <View style={styles.instructorRow}>
              {item.instructorAvatar ? (
                <Image source={{ uri: item.instructorAvatar }} style={styles.instructorAvatar} />
              ) : (
                <View style={styles.instructorAvatarPlaceholder}>
                  <Ionicons name="person" size={11} color="#fff" />
                </View>
              )}
              <View>
                {item.instructor && (
                  <Text style={styles.instructorName}>{item.instructor}</Text>
                )}
                {item.username && (
                  <Text style={styles.instructorUsername}>@{item.username}</Text>
                )}
              </View>
            </View>
          )}

          {/* Row 4: Progress + Continue (conditional) */}
          {hasProgress ? (
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.watchedPercent}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.continueBtn}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("CourseDetail", {
                  courseId: item.courseId,
                  courseTitle: item.courseTitle ?? item.title,
                })}
              >
                <Ionicons name="play" size={14} color="#fff" />
                <Text style={styles.continueBtnText}>Continue Learning</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.startBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate("CourseDetail", {
                courseId: item.courseId,
                courseTitle: item.courseTitle ?? item.title,
              })}
            >
              <Ionicons name="rocket-outline" size={14} color={BLUE} />
              <Text style={styles.startBtnText}>Start Course</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function Reels({ navigation }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.get("/videos/feed");
        setVideos(response?.data?.videos ?? []);
      } catch (err) {
        console.log("Failed to load videos:", err?.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 80 });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingLogo}>
          <Text style={styles.loadingLogoText}>Nawarny</Text>
        </View>
        <ActivityIndicator size="large" color={BLUE} style={{ marginTop: 24 }} />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={item => item.id}
      pagingEnabled
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      renderItem={({ item, index }) => (
        <VideoItem item={item} isActive={index === activeIndex} navigation={navigation} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
  },
  loadingLogo: {
    backgroundColor: BLUE, paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 20,
  },
  loadingLogoText: { fontSize: 22, fontWeight: "900", color: "#fff", letterSpacing: 1 },
  loadingText: { color: "#aaa", fontSize: 14, marginTop: 12 },

  videoContainer: { height, width, backgroundColor: "#000" },

  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center",
  },
  pauseCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center",
  },

  // TOP BAR
  topBar: {
    position: "absolute", top: 52, left: 16, right: 16,
    flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
  },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  logoText: {
    fontSize: 18, fontWeight: "900", color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  logoDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: BLUE, marginBottom: 8,
  },
  topBadges: { flexDirection: "row", gap: 8, alignItems: "center" },
  levelBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  levelText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  durationBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  durationText: { fontSize: 11, color: "#fff", fontWeight: "600" },

  // SIDE ACTIONS
  sideActions: {
    position: "absolute",
    right: 12, bottom: TAB_BAR_HEIGHT + PANEL_HEIGHT + 12,
    alignItems: "center", gap: 20,
  },
  avatarWrap: { alignItems: "center", marginBottom: 4 },
  avatarImg: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: BLUE,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  plusDot: {
    position: "absolute", bottom: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: BLUE,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, borderColor: "#fff",
  },
  sideBtn: { alignItems: "center", gap: 4 },
  sideBtnLabel: { fontSize: 11, color: "#fff", fontWeight: "600" },

  // FROSTED BOTTOM PANEL
  panel: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT,
    left: 0, right: 0,
    height: PANEL_HEIGHT,
    overflow: "hidden",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  panelAccent: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 3, backgroundColor: BLUE, zIndex: 2,
  },
  panelContent: { padding: 16, paddingTop: 18, zIndex: 1 },

  panelRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  categoryChip: {
    backgroundColor: BLUE,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  categoryChipText: { fontSize: 12, color: "#fff", fontWeight: "700" },
  lessonsChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
  },
  lessonsChipText: { fontSize: 12, color: "#fff", fontWeight: "600" },

  panelTitle: {
    fontSize: 17, fontWeight: "800",
    color: "#fff", lineHeight: 24, marginBottom: 8,
  },

  instructorRow: {
    flexDirection: "row", alignItems: "center",
    gap: 8, marginBottom: 12,
  },
  instructorAvatar: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 1.5, borderColor: "#fff",
  },
  instructorAvatarPlaceholder: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: BLUE,
    justifyContent: "center", alignItems: "center",
  },
  instructorName: { fontSize: 13, color: "#fff", fontWeight: "600" },
  instructorUsername: { fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 1 },

  progressSection: { gap: 10 },
  progressTrack: {
    height: 3, backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
  },
  progressFill: { height: 3, backgroundColor: BLUE, borderRadius: 2 },
  continueBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: BLUE, alignSelf: "flex-start",
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
  },
  continueBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },

  startBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.3)",
  },
  startBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
});