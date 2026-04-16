import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    videos: [],
    topics: [],
    users: [],
    courses: [],
  });

  const search = async (text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ videos: [], topics: [], users: [], courses: [] });
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/search?q=${text}`);
      setResults(response?.data ?? { videos: [], topics: [], users: [], courses: [] });
    } catch (err) {
      console.log("Search error:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "videos", label: "Videos" },
    { key: "topics", label: "Topics" },
    { key: "users", label: "Users" },
    { key: "courses", label: "Courses" },
  ];

  const renderVideo = ({ item }) => (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => navigation.navigate("VideoPlayer", { video: item })}
    >

      <View style={styles.videoThumb}>
        <Ionicons name="play-circle" size={30} color="#0066FF" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultSubtitle}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTopic = ({ item }) => (
    <TouchableOpacity style={styles.topicItem}>
      <Text style={styles.topicEmoji}>{item.emoji}</Text>
      <Text style={styles.topicName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.avatarPlaceholder}>
        <Ionicons name="person" size={24} color="#fff" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultSubtitle}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCourse = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.courseThumb}>
        <Ionicons name="book" size={24} color="#0066FF" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultSubtitle}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  const getFilteredResults = () => {
    if (activeTab === "all") {
      return [
        ...results.videos.map(v => ({ ...v, _type: "video" })),
        ...results.topics.map(t => ({ ...t, _type: "topic" })),
        ...results.users.map(u => ({ ...u, _type: "user" })),
        ...results.courses.map(c => ({ ...c, _type: "course" })),
      ];
    }
    if (activeTab === "videos") return results.videos.map(v => ({ ...v, _type: "video" }));
    if (activeTab === "topics") return results.topics.map(t => ({ ...t, _type: "topic" }));
    if (activeTab === "users") return results.users.map(u => ({ ...u, _type: "user" }));
    if (activeTab === "courses") return results.courses.map(c => ({ ...c, _type: "course" }));
    return [];
  };

  const renderItem = ({ item }) => {
    if (item._type === "video") return renderVideo({ item });
    if (item._type === "topic") return renderTopic({ item });
    if (item._type === "user") return renderUser({ item });
    if (item._type === "course") return renderCourse({ item });
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos, topics, users..."
            value={query}
            onChangeText={search}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => search("")}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#0066FF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredResults()}
          keyExtractor={(item, index) => `${item.objectID ?? index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            query.length > 0 ? (
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            ) : (
              <Text style={styles.emptyText}>Start typing to search...</Text>
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#000" },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeTab: { backgroundColor: "#0066FF" },
  tabText: { fontSize: 13, color: "#666" },
  activeTabText: { color: "#fff", fontWeight: "600" },
  list: { padding: 16 },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  videoThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
  },
  courseThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0066FF",
    justifyContent: "center",
    alignItems: "center",
  },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: 15, fontWeight: "600", color: "#000" },
  resultSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  topicEmoji: { fontSize: 28 },
  topicName: { fontSize: 15, fontWeight: "600", color: "#000" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 15 },
});
