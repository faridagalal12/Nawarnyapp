import React, { useRef, useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  Image,
  ActivityIndicator,
  Animated,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

const { height, width } = Dimensions.get("window");

const CATEGORY_CONFIG = {
  Science:                { color: "#5ba8ff", bg: "rgba(91,168,255,0.18)",  border: "rgba(91,168,255,0.4)"  },
  Technology:             { color: "#a78bfa", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.4)" },
  Business:               { color: "#34d399", bg: "rgba(52,211,153,0.18)",  border: "rgba(52,211,153,0.4)"  },
  Design:                 { color: "#f472b6", bg: "rgba(244,114,182,0.18)", border: "rgba(244,114,182,0.4)" },
  Mathematics:            { color: "#fb923c", bg: "rgba(251,146,60,0.18)",  border: "rgba(251,146,60,0.4)"  },
  History:                { color: "#fbbf24", bg: "rgba(251,191,36,0.18)",  border: "rgba(251,191,36,0.4)"  },
  "Personal Development": { color: "#4ade80", bg: "rgba(74,222,128,0.18)", border: "rgba(74,222,128,0.4)"  },
  Physics:                { color: "#38bdf8", bg: "rgba(56,189,248,0.18)",  border: "rgba(56,189,248,0.4)"  },
  Chemistry:              { color: "#fb923c", bg: "rgba(251,146,60,0.18)",  border: "rgba(251,146,60,0.4)"  },
  Default:                { color: "#5ba8ff", bg: "rgba(91,168,255,0.18)",  border: "rgba(91,168,255,0.35)" },
};

const DIFFICULTY_CONFIG = {
  Beginner:     { color: "#4ade80", bg: "rgba(74,222,128,0.15)",  border: "rgba(74,222,128,0.35)"  },
  Intermediate: { color: "#f5c352", bg: "rgba(245,175,55,0.15)",  border: "rgba(245,175,55,0.35)"  },
  Advanced:     { color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)" },
  Default:      { color: "#f5c352", bg: "rgba(245,175,55,0.15)",  border: "rgba(245,175,55,0.30)"  },
};

function getCat(s)  { return CATEGORY_CONFIG[s]   ?? CATEGORY_CONFIG.Default;   }
function getDiff(d) { return DIFFICULTY_CONFIG[d] ?? DIFFICULTY_CONFIG.Default; }

const S = {
  textShadowColor: "rgba(0,0,0,0.99)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 12,
};

// ── Notes Modal ───────────────────────────────────────────────────────────────
function NotesModal({ visible, onClose, videoTitle, videoId }) {
  const [notes,   setNotes]   = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    console.log("NotesModal videoId:", videoId);
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/videos/${videoId}/notes`);
        console.log("Notes response:", JSON.stringify(res?.data));
        setNotes(res?.data?.notes ?? []);
      } catch {
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, videoId]);

  const addNote = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await api.post(`/videos/${videoId}/notes`, { text });
      api.post("/learning-profile/award-xp", { action: "ADD_NOTE" }).catch(() => {});
      const res = await api.get(`/videos/${videoId}/notes`);
      setNotes(res?.data?.notes ?? []);
    } catch (err) {
      console.log("Add note error:", err?.response?.data ?? err?.message);
    }
  };

  const deleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    try { await api.delete(`/videos/${videoId}/notes/${id}`); } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalBackdrop}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalDismiss} />
        </TouchableWithoutFeedback>

        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>My Notes</Text>
            <Text style={styles.modalSub} numberOfLines={1}>{videoTitle}</Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.noteInput}
              placeholder="Write a note..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              onPress={addNote}
              style={[styles.addBtn, !input.trim() && { opacity: 0.4 }]}
              disabled={!input.trim()}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#1a5ff5" style={{ marginTop: 24 }} />
          ) : notes.length === 0 ? (
            <View style={styles.emptyNotes}>
              <Ionicons name="document-text-outline" size={40} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyText}>No notes yet. Add your first one!</Text>
            </View>
          ) : (
            <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
              {notes.map(n => (
                <View key={n.id} style={styles.noteCard}>
                  <Text style={styles.noteText}>{n.text}</Text>
                  <TouchableOpacity onPress={() => deleteNote(n.id)}>
                    <Ionicons name="trash-outline" size={16} color="rgba(255,80,90,0.7)" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── VideoItem ─────────────────────────────────────────────────────────────────
function VideoItem({ item, isActive, navigation }) {
    const [liked,     setLiked]     = useState(item.isLiked ?? false);
  const [saved,     setSaved]     = useState(false);
  const [followed,  setFollowed]  = useState(false);
  const [likes,     setLikes]     = useState(item.likesCount ?? 0);
  const [progress,  setProgress]  = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale   = useRef(new Animated.Value(0.5)).current;

  const cat  = getCat(item.subject ?? item.category);
  const diff = getDiff(item.difficulty);

 const player = useVideoPlayer(
    item.videoUrl ? { uri: item.videoUrl } : null,
    p => {
      p.loop = true;
      p.muted = false;
    }
  );

  useEffect(() => {
    if (isActive && !paused) {
      player.play();
      setIsPlaying(true);
    } else {
      player.pause();
    }
  }, [isActive, paused]);

  useEffect(() => {
    if (!isActive) {
      setPaused(false);
      setIsPlaying(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      if (player.duration > 0)
        setProgress(player.currentTime / player.duration);
    }, 500);
    return () => clearInterval(id);
  }, [isActive, player]);

  const handleTap = () => {
    const willPause = !paused;
    setPaused(willPause);
    setIsPlaying(!willPause);
    
    // Award XP when user actively watches
    if (willPause === false) {
      api.post("/learning-profile/award-xp", { action: "WATCH_VIDEO" }).catch(() => {});
    }

    iconOpacity.stopAnimation();
    iconScale.stopAnimation();
    iconOpacity.setValue(0);
    iconScale.setValue(0.5);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 6 }),
        Animated.timing(iconOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
      ]),
      Animated.delay(700),
      Animated.timing(iconOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => iconScale.setValue(0.5));
  };

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes(n => n + (next ? 1 : -1));
    try {
      await api.post(`/videos/${item.id}/like`);
      if (next) api.post("/learning-profile/award-xp", { action: "LIKE_VIDEO" }).catch(() => {});
    } catch {
      setLiked(!next);
      setLikes(n => n + (next ? -1 : 1));
    }
  };

  return (
    <View style={styles.videoContainer}>

      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={StyleSheet.absoluteFill}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* play/pause animated icon */}
      <Animated.View
        style={[styles.pauseOverlay, { opacity: iconOpacity }]}
        pointerEvents="none"
      >
        <Animated.View style={[styles.pauseCircle, { transform: [{ scale: iconScale }] }]}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={44} color="#fff" />
        </Animated.View>
      </Animated.View>

      {/* ── dynamic top bar ── */}
      <View style={styles.topBar}>
        <View style={[styles.pill, { backgroundColor: cat.bg, borderColor: cat.border }]}>
          <View style={[styles.dot, { backgroundColor: cat.color }]} />
          <Text style={[styles.pillText, { color: cat.color }]}>
            {item.subject ?? item.category ?? "General"}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: diff.bg, borderColor: diff.border }]}>
          <Text style={[styles.pillText, { color: diff.color }]}>
            {item.difficulty ?? "Intermediate"}
          </Text>
        </View>
      </View>

      {/* ── right actions ── */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={32}
            color={liked ? "#ff4d58" : "#fff"}
          />
          <Text style={[styles.actionCount, S]}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowNotes(true)} style={styles.actionBtn}>
          <Ionicons name="create-outline" size={30} color="#fff" />
          <Text style={[styles.actionLabel, S]}>Notes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSaved(v => !v)} style={styles.actionBtn}>
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={30}
            color={saved ? "#1a5ff5" : "#fff"}
          />
          <Text style={[styles.actionLabel, S]}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* ── bottom content ── */}
<View style={styles.bottomContent} pointerEvents="box-none" collapsable={false}>
        <View style={styles.instructorRow}>
          {/* avatar — blue background */}
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => {
              const creatorId = item.creator?.id ?? item.creator?._id;
              if (creatorId) {
                navigation.navigate("PublicProfile", { creatorId });
              }
            }}
          >
            {item.educatorAvatar ? (
              <Image source={{ uri: item.educatorAvatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
            )}

            {/* follow badge — disappears after tap */}
            {!followed && (
              <TouchableOpacity
                onPress={() => setFollowed(true)}
                style={styles.followBadge}
              >
                <Ionicons name="add" size={9} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* name + cred — only from API, no hardcoded fallback */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              const creatorId = item.creator?.id ?? item.creator?._id;
              if (creatorId) navigation.navigate("PublicProfile", { creatorId });
            }}
          >
            {!!(item.educatorName ?? item.creator?.name) && (
              <Text style={[styles.instructorName, S]}>
                {item.educatorName ?? item.creator?.name}
              </Text>
            )}
            {!!(item.educatorCred ?? item.creator?.username) && (
              <Text style={[styles.instructorCred, S]}>
                {item.educatorCred ?? (item.creator?.username ? `@${item.creator.username}` : null)}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* title */}
        <Text style={[styles.videoTitle, S]} numberOfLines={2}>
          {item.title}
        </Text>

        {/* progress bar — always blue */}
        <View style={styles.progTrack}>
          <View style={[styles.progFill, {
            width: `${Math.round(progress * 100)}%`,
          }]} />
        </View>

      </View>

      <NotesModal
        visible={showNotes}
        onClose={() => setShowNotes(false)}
        videoTitle={item.title}
        videoId={item.id}
      />
    </View>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Reels ─────────────────────────────────────────────────────────────────────
export default function Reels({ navigation }) {
    const [originalVideos, setOriginalVideos] = useState([]);
  const [videos,         setVideos]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeIndex,    setActiveIndex]    = useState(0);
  const [screenFocused,  setScreenFocused]  = useState(true);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => setScreenFocused(false);
    }, [])
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/videos/feed?limit=50");
        const fetched = res?.data?.videos ?? [];
const fixed = fetched.map(v => ({ ...v }));
setOriginalVideos(fixed);
setVideos(shuffle(fixed));
      } catch (err) {
        console.log("Failed to load videos:", err?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 90 });

  const handleEndReached = () => {
    if (originalVideos.length === 0) return;
    setVideos(prev => [...prev, ...shuffle(originalVideos)]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1a5ff5" />
      </View>
    );
  }

  return (
    <FlatList
      data={videos}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      pagingEnabled
      snapToInterval={height}
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      renderItem={({ item, index }) => (
        <VideoItem item={item} isActive={index === activeIndex && screenFocused} navigation={navigation} />
      )}
    />
  );
}

// ── styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loader: {
    flex: 1, backgroundColor: "#0a0a14",
    justifyContent: "center", alignItems: "center",
  },
  videoContainer: {
    height, width,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  // play/pause
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center",
    zIndex: 30,
  },
  pauseCircle: {
    width: 86, height: 86, borderRadius: 43,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center", alignItems: "center",
  },

  // top bar
  topBar: {
    position: "absolute",
    top: 52, left: 0, right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  pill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderRadius: 20,
    paddingVertical: 5, paddingHorizontal: 12,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },

  // actions
  actions: {
    position: "absolute",
    right: 16, bottom: 170,
    alignItems: "center", gap: 26, zIndex: 10,
  },
  actionBtn: { alignItems: "center", gap: 4 },
  actionCount: { color: "#fff", fontSize: 13, fontWeight: "700" },
  actionLabel: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // bottom content
  bottomContent: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 96,
    zIndex: 10,
  },
  instructorRow: {
    flexDirection: "row", alignItems: "center",
    gap: 12, marginBottom: 12,
  },
  avatarWrap: { position: "relative", width: 50, height: 50 },
  avatarImg: {
    width: 50, height: 50, borderRadius: 25,
    borderWidth: 2.5, borderColor: "#4d8aff",
  },
  avatarFallback: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: "#bfdbfe",         
    borderWidth: 2, borderColor: "#93c5fd",
    justifyContent: "center", alignItems: "center",
  },
  followBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#1a5ff5",          // ✅ same blue as avatar
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  instructorName: {
    color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 2,
  },
  instructorCred: {
    color: "rgba(255,255,255,0.6)", fontSize: 13,
  },
  videoTitle: {
    color: "#fff", fontSize: 20, fontWeight: "800",
    lineHeight: 28, marginBottom: 16,
  },
  progTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2, overflow: "hidden",
  },
  progFill: {
    height: "100%", borderRadius: 2,
    backgroundColor: "#1a5ff5",          // ✅ always blue
  },

  // notes modal
  modalBackdrop: { flex: 1, justifyContent: "flex-end" },
  modalDismiss: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: {
    backgroundColor: "#0f1623",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    maxHeight: height * 0.75,
    borderTopWidth: 1, borderColor: "rgba(26,95,245,0.3)",
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 12, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)", marginBottom: 14,
  },
  modalTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 4 },
  modalSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center" },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
  },
  noteInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1, borderColor: "rgba(26,95,245,0.4)",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: "#fff", fontSize: 14, maxHeight: 100,
  },
  addBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#1a5ff5",
    justifyContent: "center", alignItems: "center",
  },
  emptyNotes: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" },
  notesList: { paddingHorizontal: 16, paddingTop: 12 },
  noteCard: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 0.5, borderColor: "rgba(26,95,245,0.2)",
    borderRadius: 12, padding: 12, marginBottom: 10, gap: 10,
  },
  noteText: { flex: 1, color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 20 },
});
