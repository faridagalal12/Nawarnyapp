import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

const { height, width } = Dimensions.get("window");

const videos = [
  { id: "1", uri: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { id: "2", uri: "https://www.w3schools.com/html/movie.mp4" },
  { id: "3", uri: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4" },
];

function VideoItem({ uri, isActive }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(128);

  const player = useVideoPlayer(uri, p => {
    p.loop = true;
    p.muted = true;
  });

  React.useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    // ✅ Fix: exact screen height, overflow hidden
    <View style={styles.videoContainer}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* RIGHT SIDE ACTIONS - fixed position */}
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
          <Text style={styles.actionText}>48</Text>
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
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90, // ✅ higher threshold fixes overlap
  });

  return (
    <FlatList
      data={videos}
      keyExtractor={item => item.id}
      pagingEnabled
      snapToInterval={height} // ✅ snaps exactly to screen height
      snapToAlignment="start" //
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged.current}
      viewabilityConfig={viewabilityConfig.current}
      renderItem={({ item, index }) => (
        <VideoItem uri={item.uri} isActive={index === activeIndex} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    height: height,
    width: width,
    overflow: "hidden", //
    backgroundColor: "#000",
  },
  actions: {
    position: "absolute",
    right: 15,
    bottom: 120, //
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
