import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  ActivityIndicator,
  StatusBar,
  Image,
  Animated,
  Easing,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import api from "../services/api";

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get("window");
const TAB_BAR_H = 80;

const PALETTE = {
  bg:           "#080A0F",
  surfaceLight: "rgba(255,255,255,0.06)",
  border:       "rgba(255,255,255,0.1)",
  textPrimary:  "#F0F2F8",
  textMuted:    "rgba(240,242,248,0.45)",
  blue:         "#2F7EFF",
  blueGlow:     "rgba(47,126,255,0.25)",
};

const CATEGORY_ACCENT = {
  Programming: "#2F7EFF",
  Design:      "#A855F7",
  Business:    "#F59E0B",
  Science:     "#10B981",
  Language:    "#EC4899",
  Mathematics: "#06B6D4",
  default:     "#2F7EFF",
};

const LEVEL_COLORS = {
  Beginner:     "#22C55E",
  Intermediate: "#F59E0B",
  Advanced:     "#EF4444",
};

// ─────────────────────────────────────────────
//  CHAPTER DOTS  (vertical strip, left side)
// ─────────────────────────────────────────────
function ChapterDots({ total = 1, current = 0, accent }) {
  if (total <= 1) return null;
  const visible = Math.min(total, 9);
  return (
    <View style={styles.chapterDots}>
      {Array.from({ length: visible }).map((_, i) => {
        const isCurrent = i === current;
        const isPast    = i < current;
        return (
          <View
            key={i}
            style={[
              styles.chapterDot,
              isCurrent && { backgroundColor: accent, height: 20, borderRadius: 3 },
              isPast    && { backgroundColor: accent + "66" },
            ]}
          />
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────
//  MAIN VIDEO ITEM
// ─────────────────────────────────────────────
function VideoItem({ item, isActive, navigation }) {
  const accent     = CATEGORY_ACCENT[item.category] ?? CATEGORY_ACCENT.default;
  const levelColor = LEVEL_COLORS[item.level] ?? accent;

  const [liked,  setLiked]  = useState(item.isLiked ?? false);
  const [saved,  setSaved]  = useState(false);
  const [likes,  setLikes]  = useState(item.likesCount ?? 0);
  const [paused, setPaused] = useState(false);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const pauseScale     = useRef(new Animated.Value(0)).current;
  const bookmarkBurst  = useRef(new Animated.Value(0)).current;
  const lastTap        = useRef(0);

  const player = useVideoPlayer(item.videoUrl, p => {
    p.loop  = true;
    p.muted = false;
  });

  useEffect(() => {
    if (isActive && !paused) {
      player.play();
      Animated.timing(overlayOpacity, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      player.pause();
    }
  }, [isActive, paused]);

  useEffect(() => {
    if (paused) {
      Animated.sequence([
        Animated.spring(pauseScale, { toValue: 1, useNativeDriver: true }),
        Animated.delay(800),
        Animated.timing(pauseScale, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [paused]);

  // Double-tap → bookmark  /  single tap → pause/play
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!saved) {
        setSaved(true);
        Animated.sequence([
          Animated.timing(bookmarkBurst, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(bookmarkBurst, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
      }
    } else {
      setPaused(p => !p);
    }
    lastTap.current = now;
  }, [saved]);

  const handleLike = async () => {
    try {
      setLiked(l => !l);
      setLikes(n => liked ? n - 1 : n + 1);
      await api.post(`/videos/${item.id}/like`);
    } catch {
      setLiked(liked);
      setLikes(likes);
    }
  };

  const lessonIndex  = item.lessonIndex  ?? 0;
  const totalLessons = item.lessonsCount ?? 1;
  const tags         = item.tags         ?? [];

  const bookmarkScale = bookmarkBurst.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [0, 1.4,  0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── VIDEO ── */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={StyleSheet.absoluteFill}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
          <View style={styles.vignetteTop}    pointerEvents="none" />
          <View style={styles.vignetteBottom} pointerEvents="none" />
        </View>
      </TouchableWithoutFeedback>

      {/* BOOKMARK BURST */}
      <Animated.View
        pointerEvents="none"
        style={[styles.bookmarkBurst, {
          transform: [{ scale: bookmarkScale }],
          opacity: bookmarkBurst,
        }]}
      >
        <Ionicons name="bookmark" size={72} color="#FFD60A" />
      </Animated.View>

      {/* PAUSE ICON */}
      <Animated.View
        pointerEvents="none"
        style={[styles.pauseOverlay, { transform: [{ scale: pauseScale }] }]}
      >
        <View style={[styles.pauseCircle, { borderColor: accent + "99" }]}>
          <Ionicons name={paused ? "play" : "pause"} size={30} color="#fff" />
        </View>
      </Animated.View>

      {/* ── TOP BAR ── */}
      <Animated.View style={[styles.topBar, { opacity: overlayOpacity }]}>
        <View style={[styles.categoryChip, { backgroundColor: accent + "22", borderColor: accent + "55" }]}>
          <View style={[styles.categoryDot, { backgroundColor: accent }]} />
          <Text style={[styles.categoryChipText, { color: accent }]}>
            {item.category ?? "Course"}
          </Text>
        </View>

        <View style={styles.topRight}>
          {item.level && (
            <View style={[styles.levelPill, { backgroundColor: levelColor + "22", borderColor: levelColor + "66" }]}>
              <Text style={[styles.levelPillText, { color: levelColor }]}>{item.level}</Text>
            </View>
          )}
          <View style={styles.lessonCounter}>
            <Text style={styles.lessonCounterCurrent}>{lessonIndex + 1}</Text>
            <Text style={styles.lessonCounterSep}>/</Text>
            <Text style={styles.lessonCounterTotal}>{totalLessons}</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── CHAPTER DOTS (left side) ── */}
      <Animated.View style={[styles.chapterDotsWrap, { opacity: overlayOpacity }]}>
        <ChapterDots total={totalLessons} current={lessonIndex} accent={accent} />
      </Animated.View>

      {/* ── ACTION RAIL — Like / Comments / Save / Share ── */}
      <Animated.View style={[styles.actionRail, { opacity: overlayOpacity }]}>

        <TouchableOpacity onPress={handleLike} style={styles.railBtn}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={28}
            color={liked ? "#FF4D6D" : "#fff"} />
          <Text style={styles.railLabel}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.railBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
          <Text style={styles.railLabel}>{item.commentsCount ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.railBtn} onPress={() => setSaved(s => !s)}>
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={26}
            color={saved ? "#FFD60A" : "#fff"} />
          <Text style={styles.railLabel}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.railBtn}>
          <Ionicons name="paper-plane-outline" size={26} color="#fff" />
          <Text style={styles.railLabel}>Share</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── BOTTOM PANEL — BlurView ── */}
      <Animated.View style={[styles.bottomPanel, { opacity: overlayOpacity }]}>
        <BlurView intensity={65} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Category-coloured accent line */}
        <View style={[styles.panelAccent, { backgroundColor: accent }]} />

        <View style={styles.panelBody}>

          {/* Instructor */}
          <View style={styles.instructorRow}>
            {item.instructorAvatar ? (
              <Image source={{ uri: item.instructorAvatar }} style={styles.miniAvatar} />
            ) : (
              <View style={[styles.miniAvatarFallback, { backgroundColor: accent }]}>
                <Ionicons name="person" size={10} color="#fff" />
              </View>
            )}
            <Text style={styles.instructorName} numberOfLines={1}>
              {item.instructor ?? item.username ?? "Instructor"}
            </Text>
            {item.username && (
              <Text style={styles.instructorHandle}>@{item.username}</Text>
            )}
          </View>

          {/* Title */}
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.slice(0, 4).map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.ctaBtn, { backgroundColor: accent }]}
              onPress={() => navigation.navigate("CourseDetail", {
                courseId:    item.courseId,
                courseTitle: item.courseTitle ?? item.title,
              })}
            >
              <Ionicons name="rocket-outline" size={13} color="#fff" />
              <Text style={styles.ctaBtnText}>
                {(item.watchedPercent ?? 0) > 0 ? "Continue" : "Start Course"}
              </Text>
            </TouchableOpacity>

            {item.duration && (
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={11} color={PALETTE.textMuted} />
                <Text style={styles.durationText}>{item.duration}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────
//  DURATION FILTER HELPERS
// ─────────────────────────────────────────────
function parseDurationToSeconds(duration) {
  if (duration == null) return null;
  if (typeof duration === "number") return duration;
  const str = String(duration).trim();
  const iso  = str.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i);
  if (iso) {
    return (parseInt(iso[1] ?? 0) * 3600)
         + (parseInt(iso[2] ?? 0) * 60)
         + parseFloat(iso[3]  ?? 0);
  }
  const parts = str.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60  + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function isAllowedDuration(video) {
  const raw  = video.durationSeconds ?? video.duration;
  const secs = parseDurationToSeconds(raw);
  if (secs === null) return true;
  return secs >= 30 && secs <= 300;
}

// ─────────────────────────────────────────────
//  FEED SCREEN
// ─────────────────────────────────────────────
export default function Reels({ navigation }) {
  const [videos,      setVideos]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/videos/feed");
        const all = res?.data?.videos ?? [];
        setVideos(all.filter(isAllowedDuration));
      } catch (e) {
        console.log("Feed error:", e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  });
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 75 });

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}>
          <Ionicons name="school-outline" size={32} color={PALETTE.blue} />
        </View>
        <ActivityIndicator size="small" color={PALETTE.blue} style={{ marginTop: 20 }} />
        <Text style={styles.loadingLabel}>Preparing your feed…</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={item => String(item.id)}
      pagingEnabled
      snapToInterval={SCREEN_H}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      renderItem={({ item, index }) => (
        <VideoItem
          item={item}
          isActive={index === activeIndex}
          navigation={navigation}
        />
      )}
    />
  );
}

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({

  loadingScreen: {
    flex: 1, backgroundColor: PALETTE.bg,
    alignItems: "center", justifyContent: "center",
  },
  loadingIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: PALETTE.blueGlow,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: PALETTE.blue + "44",
  },
  loadingLabel: { color: PALETTE.textMuted, fontSize: 13, marginTop: 12, letterSpacing: 0.3 },

  container: { height: SCREEN_H, width: SCREEN_W, backgroundColor: PALETTE.bg },

  vignetteTop:    { position: "absolute", top: 0,    left: 0, right: 0, height: 180, backgroundColor: "transparent" },
  vignetteBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: 420, backgroundColor: "transparent" },

  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
  },
  pauseCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: "rgba(0,0,0,0.5)", borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },

  bookmarkBurst: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
  },

  // TOP BAR
  topBar: {
    position: "absolute", top: 52, left: 16, right: 16,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  categoryChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  categoryDot:      { width: 6, height: 6, borderRadius: 3 },
  categoryChipText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },

  topRight:    { flexDirection: "row", alignItems: "center", gap: 8 },
  levelPill:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  levelPillText: { fontSize: 11, fontWeight: "700" },
  lessonCounter: {
    flexDirection: "row", alignItems: "baseline",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 2,
  },
  lessonCounterCurrent: { fontSize: 13, fontWeight: "800", color: "#fff" },
  lessonCounterSep:     { fontSize: 11, color: PALETTE.textMuted },
  lessonCounterTotal:   { fontSize: 11, color: PALETTE.textMuted, fontWeight: "600" },

  // CHAPTER DOTS
  chapterDotsWrap: {
    position: "absolute", left: 14,
    top: SCREEN_H * 0.3, bottom: TAB_BAR_H + 200,
    justifyContent: "center",
  },
  chapterDots: { alignItems: "center", gap: 6 },
  chapterDot:  { width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" },

  // ACTION RAIL
  actionRail: {
    position: "absolute", right: 12,
    bottom: TAB_BAR_H + 20,
    alignItems: "center", gap: 22,
  },
  railBtn:   { alignItems: "center", gap: 3 },
  railLabel: { fontSize: 11, color: "#fff", fontWeight: "600" },

  // BOTTOM PANEL
  bottomPanel: {
    position: "absolute", bottom: TAB_BAR_H,
    left: 0, right: 0,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    overflow: "hidden",
    borderTopWidth: 0.75, borderColor: PALETTE.border,
  },
  panelAccent: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: 3, zIndex: 2,
  },
  panelBody: { padding: 16, paddingTop: 20, zIndex: 1 },

  instructorRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  miniAvatar:    { width: 24, height: 24, borderRadius: 12 },
  miniAvatarFallback: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  instructorName:   { fontSize: 12, color: PALETTE.textPrimary, fontWeight: "600" },
  instructorHandle: { fontSize: 11, color: PALETTE.textMuted, marginLeft: 2 },

  videoTitle: {
    fontSize: 16, fontWeight: "800", color: PALETTE.textPrimary,
    lineHeight: 22, marginBottom: 10, letterSpacing: 0.1,
  },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  tag: {
    backgroundColor: PALETTE.surfaceLight,
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 20, borderWidth: 1, borderColor: PALETTE.border,
  },
  tagText: { fontSize: 11, color: PALETTE.textMuted, fontWeight: "600" },

  ctaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ctaBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20,
  },
  ctaBtnText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  durationBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: PALETTE.surfaceLight,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  durationText: { fontSize: 11, color: PALETTE.textMuted, fontWeight: "600" },
});