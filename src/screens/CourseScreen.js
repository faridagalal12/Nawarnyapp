import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

const courses = [
  {
    id: "1",
    title: "UI/UX",
    count: "20 Courses",
    iconLib: "MaterialCommunityIcons",
    icon: "monitor-screenshot",
    iconColor: "#FF6B35",
    bg: "#FFF0E6",
    
  },
  {
    id: "2",
    title: "Email Marketing",
    count: "18 Courses",
    iconLib: "MaterialCommunityIcons",
    icon: "email-newsletter",
    iconColor: "#3d5af1",
    bg: "#EEF0FF",
    
  },
  {
    id: "3",
    title: "Business Analytics",
    count: "10 Courses",
    iconLib: "FontAwesome5",
    icon: "chart-bar",
    iconColor: "#00B894",
    bg: "#E6FFF8",
   
  },
  {
    id: "4",
    title: "Career Skills",
    count: "16 Courses",
    iconLib: "FontAwesome5",
    icon: "briefcase",
    iconColor: "#F4A623",
    bg: "#FFF8E6",
  
  },
];

function CourseIcon({ iconLib, icon, iconColor, size = 38 }) {
  if (iconLib === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons name={icon} size={size} color={iconColor} />;
  }
  if (iconLib === "FontAwesome5") {
    return <FontAwesome5 name={icon} size={size} color={iconColor} />;
  }
  return <Ionicons name={icon} size={size} color={iconColor} />;
}

export default function CoursesScreen() {
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3d5af1" />

      {/* HEADER */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.hello}>Hello, 👋</Text>
              <Text style={styles.greeting}>Good Morning</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
              <Ionicons name="notifications" size={20} color="#3d5af1" />
              {/* Notification dot */}
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR */}
          <View style={[styles.searchBar, focused && styles.searchBarFocused]}>
            <Ionicons
              name="search-outline"
              size={18}
              color={focused ? "#3d5af1" : "#aaa"}
            />
            <TextInput
              placeholder="Search your topic"
              placeholderTextColor="#aaa"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* TITLE ROW */}
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Explore Business Topics</Text>
          <Ionicons name="copy-outline" size={24} color="#3d5af1" />
        </View>

        {/* SEE ALL RIGHT */}
        <View style={styles.seeAllRow}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* NO RESULTS */}
        {filtered.length === 0 && (
          <View style={styles.noResults}>
            <Ionicons name="search-outline" size={40} color="#ccc" />
            <Text style={styles.noResultsText}>No courses found</Text>
          </View>
        )}

        {/* COURSE GRID */}
        <View style={styles.grid}>
          {filtered.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.card}
              activeOpacity={0.85}
            >
              {/* ICON */}
              <View style={[styles.iconBox, { backgroundColor: course.bg }]}>
                <CourseIcon
                  iconLib={course.iconLib}
                  icon={course.icon}
                  iconColor={course.iconColor}
                  size={38}
                />
              </View>

              {/* TEXT */}
              <Text style={styles.cardTitle}>{course.title}</Text>
              <Text style={styles.cardCount}>{course.count}</Text>

              {/* DIVIDER */}
              <View style={styles.divider} />

              {/* STUDENTS */}
              <View style={styles.studentRow}>
                <Ionicons name="people-outline" size={12} color="#aaa" />
                <Text style={styles.studentText}>{course.students}</Text>
              </View>

            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F3F8",
  },

  // ── HEADER ──
  header: {
    backgroundColor: "#3d5af1",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 55,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#3d5af1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    marginTop: 8,
  },
  hello: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 3,
    fontWeight: "400",
  },
  bellBtn: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 11,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4757",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  searchBarFocused: {
    borderColor: "#fff",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
  },

  // ── BODY ──
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.2,
  },
  seeAllRow: {
    alignItems: "flex-end",
    marginBottom: 18,
  },
  seeAll: {
    color: "#3d5af1",
    fontSize: 13,
    fontWeight: "600",
  },
  noResults: {
    alignItems: "center",
    marginTop: 60,
    gap: 10,
  },
  noResultsText: {
    color: "#bbb",
    fontSize: 15,
  },

  // ── GRID ──
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    width: "47%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  iconBox: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 3,
    textAlign: "center",
    letterSpacing: 0.1,
  },
  cardCount: {
    fontSize: 12,
    color: "#888",
    fontWeight: "400",
    textAlign: "center",
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  studentText: {
    fontSize: 11,
    color: "#aaa",
    fontWeight: "400",
  },
});