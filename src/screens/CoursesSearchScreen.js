import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, FlatList, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

export default function CoursesSearchScreen({ route, navigation }) {
  const [query, setQuery] = useState(route?.params?.query ?? "");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ courses: [], users: [] });

  useEffect(() => {
    if (query.trim()) search(query);
  }, []);

  const search = async (text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults({ courses: [], users: [] });
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/search/courses-users?q=${text}`);
      setResults(response?.data ?? { courses: [], users: [] });
    } catch (err) {
      console.log("Search error:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "all", label: "All" },
    { key: "courses", label: "Courses" },
    { key: "users", label: "Users" },
  ];

  const getFilteredResults = () => {
    if (activeTab === "courses") return results.courses.map(c => ({ ...c, _type: "course" }));
    if (activeTab === "users") return results.users.map(u => ({ ...u, _type: "user" }));
    return [
      ...results.courses.map(c => ({ ...c, _type: "course" })),
      ...results.users.map(u => ({ ...u, _type: "user" })),
    ];
  };

  const renderItem = ({ item }) => {
    if (item._type === "course") {
      return (
        <TouchableOpacity style={styles.resultItem}>
          <View style={styles.courseThumb}>
            <Ionicons name="book" size={24} color="#3d5af1" />
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>{item.title}</Text>
            <Text style={styles.resultSubtitle}>{item.category}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
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
            placeholder="Search courses, users..."
            value={query}
            onChangeText={search}
            autoFocus
            returnKeyType="search"
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

      {loading ? (
        <ActivityIndicator size="large" color="#3d5af1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredResults()}
          keyExtractor={(item, index) => `${item.objectID ?? index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {query.length > 0 ? `No results for "${query}"` : "Start typing to search..."}
            </Text>
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
  activeTab: { backgroundColor: "#3d5af1" },
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
  courseThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#EEF0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3d5af1",
    justifyContent: "center",
    alignItems: "center",
  },
  resultInfo: { flex: 1 },
  resultTitle: { fontSize: 15, fontWeight: "600", color: "#000" },
  resultSubtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 15 },
});
