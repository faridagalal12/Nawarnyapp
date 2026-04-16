import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

export default function VideoPlayerScreen({ route, navigation }) {
  const { video } = route.params;

  const player = useVideoPlayer(video.videoUrl, p => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    try {
      player.play();
    } catch (e) {}
    return () => {
      try {
        player.pause();
      } catch (e) {}
    };
  }, []);


  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.category}>{video.category}</Text>
        {video.description && (
          <Text style={styles.description}>{video.description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
  },
  info: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  category: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 8 },
  description: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
});
