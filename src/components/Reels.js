import React from "react";
import { View, FlatList, Dimensions } from "react-native";
import { Video } from "expo-av";

const { height } = Dimensions.get("window");

const videos = [
  {
    id: "1",
    uri: "https://assets.mixkit.co/videos/preview/mixkit-man-working-on-laptop-while-drinking-coffee-43555-large.mp4",
  },
  {
    id: "2",
    uri: "https://assets.mixkit.co/videos/preview/mixkit-woman-recording-herself-with-the-mobile-phone-43552-large.mp4",
  },
];

export default function Reels() {
  const renderItem = ({ item }) => (
    <View style={{ height }}>
      <Video
        source={{ uri: item.uri }}
        style={{ flex: 1 }}
        resizeMode="cover"
        shouldPlay
        isLooping
      />
    </View>
  );

  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      pagingEnabled
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  );
}