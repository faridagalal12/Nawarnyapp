import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function VideoPlayerScreen({ route, navigation }) {
  const { videoUrl, title, uploadedAt } = route.params ?? {};

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
    p.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }, [isPlaying, player]);

  const formattedDate = uploadedAt
    ? new Date(uploadedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title ?? "Video"}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Video */}
      <View style={styles.videoWrapper}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
          contentFit="contain"
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Text style={styles.videoTitle}>{title ?? "Untitled Video"}</Text>
        {formattedDate && (
          <Text style={styles.videoDate}>
            <Ionicons name="calendar-outline" size={12} color="#888" />{" "}
            {formattedDate}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginHorizontal: 8,
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 9) / 16,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: SCREEN_WIDTH,
    height: (SCREEN_WIDTH * 9) / 16,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  playBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2F54EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2F54EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  infoCard: {
    backgroundColor: "#1a1a1a",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  videoDate: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
});