import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

const { height, width } = Dimensions.get("window");

function VideoItem({ item, isActive }) {
  const [liked, setLiked] = useState(item.isLiked ?? false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(item.likesCount ?? 0);

  const player = useVideoPlayer(item.videoUrl, p => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
      await api.post(`/videos/${item.id}/like`);
    } catch (err) {
      // revert on error
      setLiked(liked);
      setLikes(likes);
    }
  };

  return (
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Video info */}
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{item.title}</Text>
        <Text style={styles.videoCategory}>{item.category}</Text>
      </View>

      {/* Right side actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={32}
            color={liked ? "red" : "white"}
          />
          <Text style={styles.actionText}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={30} color="white" />
          <Text style={styles.actionText}>{item.commentsCount ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSaved(!saved)}
          style={styles.actionBtn}
        >
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={30}
            color={saved ? "#FFD700" : "white"}
          />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="arrow-redo-outline" size={30} color="white" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Reels() {
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
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
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
        <VideoItem item={item} isActive={index === activeIndex} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    height: height,
    width: width,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  videoInfo: {
    position: "absolute",
    bottom: 120,
    left: 15,
    maxWidth: width * 0.7,
  },
  videoTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  videoCategory: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  actions: {
    position: "absolute",
    right: 15,
    bottom: 120,
    alignItems: "center",
    gap: 24,
  },
  actionBtn: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
