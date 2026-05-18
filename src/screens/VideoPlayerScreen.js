import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function VideoPlayerScreen({ route, navigation }) {
  const { video, courseId } = route.params;
  const [videoEnded,  setVideoEnded]  = useState(false);
  const [completed,   setCompleted]   = useState(false);

  const player = useVideoPlayer(video.videoUrl, p => {
    p.loop  = false; // must be false so we can detect end
    p.muted = false;
  });

  // Listen for video ending
  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      setVideoEnded(true);
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    try { player.play(); } catch (e) {}
    return () => {
      try { player.pause(); } catch (e) {}
    };
  }, []);

  const handleComplete = async () => {
    try {
      const res = await api.post(`/courses/${courseId}/progress`, { videoId: video._id });
      setCompleted(true);
      setTimeout(() => {
        navigation.navigate({
          name: "CourseDetail",
          params: {
            refreshProgressAt: Date.now(),
            completedCourse: res?.data?.justCompleted
              ? {
                  id: courseId,
                  progressPercent: res?.data?.percent ?? 100,
                }
              : null,
          },
          merge: true,
        });
        navigation.goBack();
      }, 800);
    } catch (e) {
      console.log("Complete error:", e?.message);
    }
  };

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={true}
      />

      {/* Back button */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        {video.description ? (
          <Text style={styles.description} numberOfLines={2}>{video.description}</Text>
        ) : null}

        {/* Show complete button only after video ends */}
        {videoEnded && (
          <TouchableOpacity
            style={[styles.completeBtn, completed && styles.completeBtnDone]}
            onPress={handleComplete}
            disabled={completed}
          >
            <Ionicons
              name={completed ? "checkmark-circle" : "flag"}
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.completeBtnText}>
              {completed ? "Marked as Complete ✓" : "Mark as Complete"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
  },
  backBtn: {
    margin: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  info: {
    position: "absolute", bottom: 40, left: 16, right: 16,
  },
  title: {
    color: "#fff", fontSize: 17, fontWeight: "700",
    marginBottom: 6, textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  description: {
    color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  completeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#2F54EB", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 20, marginTop: 8,
  },
  completeBtnDone: { backgroundColor: "#10B981" },
  completeBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
