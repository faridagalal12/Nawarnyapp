import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CreatorCourseCard({ item, navigation }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("EditCourse", { course: item })}
    >
      <View style={styles.courseIconBox}>
        <Ionicons name="book-outline" size={22} color="#4F8EF7" />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: "80%" }]} />
        </View>
        <Text style={styles.courseMeta}>{item.enrolledCount ?? 0} students enrolled</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
    borderRadius: 14, padding: 12, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  courseIconBox: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: "#eaf0ff",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 13, fontWeight: "700", color: "#111", marginBottom: 6 },
  progressTrack: { height: 4, backgroundColor: "#eee", borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 4, borderRadius: 3, backgroundColor: "#4F8EF7" },
  courseMeta: { fontSize: 11, color: "#999", fontWeight: "500" },
});