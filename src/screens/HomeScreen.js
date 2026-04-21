import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Reels from "../components/Reels";

export default function HomeScreen({navigation}) {
  const [activeTab, setActiveTab] = useState("forYou");

  return (
    <View style={styles.container}>

      {/* TOP BAR */}
      <View style={styles.topBar}>

        {/* FOLLOWING TAB */}
        <TouchableOpacity onPress={() => setActiveTab("following")}>
          <Text style={[
            styles.tabText,
            activeTab === "following" && styles.activeTabText
          ]}>
            Following
          </Text>
          {activeTab === "following" && <View style={styles.underline} />}
        </TouchableOpacity>

        {/* FOR YOU TAB */}
        <TouchableOpacity onPress={() => setActiveTab("forYou")}>
          <Text style={[
            styles.tabText,
            activeTab === "forYou" && styles.activeTabText
          ]}>
            For You
          </Text>
          {activeTab === "forYou" && <View style={styles.underline} />}
        </TouchableOpacity>

        {/* SEARCH ICON */}
        <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <Ionicons name="search-outline" size={22} color="#fff" />
        </TouchableOpacity>

      </View>

      {/* REELS */}
      <View style={styles.reelsContainer}>
        <Reels />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "400",
    color: "rgba(255,255,255,0.6)",
    paddingBottom: 4,
    textAlign: "center",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#fff",
  },
  underline: {
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 2,
    marginTop: 2,
  },
  reelsContainer: {
    flex: 1,
  },
});