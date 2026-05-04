// src/screens/ManageCoursesScreen.js
// Nawarny — Manage Courses
// Creators can view, edit, publish/unpublish, and delete their courses.
// Upload new course triggers DocumentPicker → multipart POST.

import React, { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import api from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// Mock courses (replace with real API)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_COURSES = [
  {
    id: "1",
    title: "Intro to Aerodynamics",
    subject: "Engineering",
    students: 342,
    lessons: 12,
    color: "#4F8EF7",
    bg: "#eaf0ff",
    icon: "airplane-outline",
    published: true,
    rating: 4.8,
    revenue: 1820,
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    title: "CFD for Beginners",
    subject: "Engineering",
    students: 189,
    lessons: 8,
    color: "#AF52DE",
    bg: "#f5eeff",
    icon: "desktop-outline",
    published: true,
    rating: 4.6,
    revenue: 945,
    lastUpdated: "1 week ago",
  },
  {
    id: "3",
    title: "Propulsion Systems",
    subject: "Aerospace",
    students: 97,
    lessons: 6,
    color: "#FF9500",
    bg: "#fff5e6",
    icon: "settings-outline",
    published: false,
    rating: null,
    revenue: 0,
    lastUpdated: "3 weeks ago",
  },
  {
    id: "4",
    title: "Flight Dynamics 101",
    subject: "Aerospace",
    students: 0,
    lessons: 3,
    color: "#34C759",
    bg: "#eafff0",
    icon: "navigate-outline",
    published: false,
    rating: null,
    revenue: 0,
    lastUpdated: "just now",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Upload course helper
// ─────────────────────────────────────────────────────────────────────────────
async function pickAndUploadCourse(onSuccess, onError, onLoading) {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/zip", "video/*", "*/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const file = result.assets[0];
    Alert.alert(
      "Upload course",
      `Upload "${file.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upload",
          onPress: async () => {
            onLoading?.(true);
            try {
              const formData = new FormData();
              formData.append("course", {
                uri: file.uri,
                name: file.name,
                type: file.mimeType ?? "application/octet-stream",
              });
              await api.post("/creators/courses/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
              onSuccess?.("Course uploaded! 🎉");
            } catch {
              onError?.("Upload failed. Please try again.");
            } finally {
              onLoading?.(false);
            }
          },
        },
      ]
    );
  } catch {
    onError?.("Could not open file picker.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter tab bar
// ─────────────────────────────────────────────────────────────────────────────
function FilterBar({ active, onChange }) {
  const TABS = [
    { key: "all",       label: "All"        },
    { key: "published", label: "Published"  },
    { key: "draft",     label: "Drafts"     },
  ];

  return (
    <View style={filterStyles.bar}>
      {TABS.map(t => (
        <TouchableOpacity
          key={t.key}
          style={[filterStyles.btn, active === t.key && filterStyles.btnActive]}
          onPress={() => onChange(t.key)}
        >
          <Text style={[filterStyles.label, active === t.key && filterStyles.labelActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const filterStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    padding: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  btn:        { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  btnActive:  { backgroundColor: "#2F54EB" },
  label:      { fontSize: 12, fontWeight: "600", color: "#888" },
  labelActive:{ color: "#fff" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Course card
// ─────────────────────────────────────────────────────────────────────────────
function CourseCard({ course, onEdit, onTogglePublish, onDelete }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn  = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  const pressOut = () => Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 300, friction: 10 }).start();

  return (
    <Animated.View style={[cardStyles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* Status pill */}
      <View style={[cardStyles.statusPill, course.published ? cardStyles.pillPublished : cardStyles.pillDraft]}>
        <View style={[cardStyles.statusDot, { backgroundColor: course.published ? "#34C759" : "#FF9500" }]} />
        <Text style={[cardStyles.statusText, { color: course.published ? "#1A7A36" : "#7A4400" }]}>
          {course.published ? "Published" : "Draft"}
        </Text>
      </View>

      {/* Header row */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={() => onEdit(course)}
        style={cardStyles.topRow}
      >
        <View style={[cardStyles.iconBox, { backgroundColor: course.bg }]}>
          <Ionicons name={course.icon} size={24} color={course.color} />
        </View>
        <View style={cardStyles.info}>
          <Text style={cardStyles.title} numberOfLines={1}>{course.title}</Text>
          <Text style={cardStyles.subject}>{course.subject}</Text>
          <Text style={cardStyles.updated}>Updated {course.lastUpdated}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>

      {/* Stats row */}
      <View style={cardStyles.statsRow}>
        <View style={cardStyles.statItem}>
          <Ionicons name="people-outline" size={13} color="#888" />
          <Text style={cardStyles.statVal}>{fmt(course.students)}</Text>
          <Text style={cardStyles.statLbl}>students</Text>
        </View>
        <View style={cardStyles.statDivider} />
        <View style={cardStyles.statItem}>
          <Ionicons name="play-circle-outline" size={13} color="#888" />
          <Text style={cardStyles.statVal}>{course.lessons}</Text>
          <Text style={cardStyles.statLbl}>lessons</Text>
        </View>
        <View style={cardStyles.statDivider} />
        <View style={cardStyles.statItem}>
          <Ionicons name="cash-outline" size={13} color="#888" />
          <Text style={cardStyles.statVal}>${fmt(course.revenue)}</Text>
          <Text style={cardStyles.statLbl}>earned</Text>
        </View>
        {course.rating && (
          <>
            <View style={cardStyles.statDivider} />
            <View style={cardStyles.statItem}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={cardStyles.statVal}>{course.rating}</Text>
              <Text style={cardStyles.statLbl}>rating</Text>
            </View>
          </>
        )}
      </View>

      {/* Action buttons */}
      <View style={cardStyles.actionsRow}>
        <TouchableOpacity style={cardStyles.actionBtn} onPress={() => onEdit(course)}>
          <Ionicons name="create-outline" size={16} color="#2F54EB" />
          <Text style={[cardStyles.actionText, { color: "#2F54EB" }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[cardStyles.actionBtn, { borderColor: course.published ? "#FF9500" : "#34C759" }]}
          onPress={() => onTogglePublish(course)}
        >
          <Ionicons
            name={course.published ? "eye-off-outline" : "eye-outline"}
            size={16}
            color={course.published ? "#FF9500" : "#34C759"}
          />
          <Text style={[cardStyles.actionText, { color: course.published ? "#FF9500" : "#34C759" }]}>
            {course.published ? "Unpublish" : "Publish"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[cardStyles.actionBtn, { borderColor: "#FFE5E5" }]}
          onPress={() => onDelete(course)}
        >
          <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          <Text style={[cardStyles.actionText, { color: "#FF3B30" }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 10,
  },
  pillPublished: { backgroundColor: "#EDFFF3" },
  pillDraft:     { backgroundColor: "#FFF5E6" },
  statusDot:     { width: 6, height: 6, borderRadius: 3 },
  statusText:    { fontSize: 11, fontWeight: "700" },

  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconBox: {
    width: 48, height: 48, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
  },
  info:    { flex: 1 },
  title:   { fontSize: 14, fontWeight: "800", color: "#111", marginBottom: 2 },
  subject: { fontSize: 12, color: "#888", fontWeight: "500" },
  updated: { fontSize: 10, color: "#bbb", marginTop: 2 },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  statItem:   { flex: 1, alignItems: "center", gap: 2 },
  statVal:    { fontSize: 13, fontWeight: "800", color: "#111" },
  statLbl:    { fontSize: 9, color: "#aaa", fontWeight: "500" },
  statDivider:{ width: 1, height: 24, backgroundColor: "#eee" },

  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    backgroundColor: "#FAFBFF",
  },
  actionText: { fontSize: 12, fontWeight: "700" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Edit Course Modal
// ─────────────────────────────────────────────────────────────────────────────
function EditCourseModal({ course, visible, onClose, onSave }) {
  const [title, setTitle]     = useState(course?.title ?? "");
  const [subject, setSubject] = useState(course?.subject ?? "");
  const [published, setPublished] = useState(course?.published ?? false);

  React.useEffect(() => {
    if (course) {
      setTitle(course.title);
      setSubject(course.subject);
      setPublished(course.published);
    }
  }, [course]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a course title.");
      return;
    }
    onSave({ ...course, title: title.trim(), subject: subject.trim(), published });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose} style={modalStyles.cancelBtn}>
            <Text style={modalStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={modalStyles.headerTitle}>Edit Course</Text>
          <TouchableOpacity onPress={handleSave} style={modalStyles.saveBtn}>
            <Text style={modalStyles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={modalStyles.body} showsVerticalScrollIndicator={false}>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Course title</Text>
            <TextInput
              style={modalStyles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter course title"
              placeholderTextColor="#bbb"
              maxLength={80}
            />
          </View>

          <View style={modalStyles.field}>
            <Text style={modalStyles.label}>Subject</Text>
            <TextInput
              style={modalStyles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Engineering, Physics"
              placeholderTextColor="#bbb"
              maxLength={40}
            />
          </View>

          <View style={[modalStyles.field, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}>
            <View>
              <Text style={modalStyles.label}>Published</Text>
              <Text style={modalStyles.sublabel}>Visible to all students</Text>
            </View>
            <Switch
              value={published}
              onValueChange={setPublished}
              trackColor={{ false: "#eee", true: "#2F54EB" }}
              thumbColor="#fff"
            />
          </View>

          <View style={modalStyles.infoCard}>
            <Ionicons name="information-circle-outline" size={16} color="#2F54EB" />
            <Text style={modalStyles.infoText}>
              To add or reorder lessons, use the full course editor from your web dashboard.
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 16, fontWeight: "800", color: "#111" },
  cancelBtn:   { padding: 4 },
  cancelText:  { fontSize: 15, color: "#888", fontWeight: "500" },
  saveBtn:     { backgroundColor: "#2F54EB", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  saveText:    { fontSize: 14, color: "#fff", fontWeight: "700" },
  body:        { padding: 16, paddingBottom: 40 },
  field:       { marginBottom: 18 },
  label:       { fontSize: 11, fontWeight: "700", color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  sublabel:    { fontSize: 11, color: "#bbb", marginTop: 2 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 12, color: "#185FA5", lineHeight: 17 },
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary stats bar
// ─────────────────────────────────────────────────────────────────────────────
function SummaryBar({ courses }) {
  const published  = courses.filter(c => c.published).length;
  const drafts     = courses.filter(c => !c.published).length;
  const totalStudents = courses.reduce((acc, c) => acc + c.students, 0);
  const totalRevenue  = courses.reduce((acc, c) => acc + c.revenue, 0);

  return (
    <View style={summaryStyles.bar}>
      <View style={summaryStyles.item}>
        <Text style={summaryStyles.val}>{published}</Text>
        <Text style={summaryStyles.lbl}>Published</Text>
      </View>
      <View style={summaryStyles.div} />
      <View style={summaryStyles.item}>
        <Text style={summaryStyles.val}>{drafts}</Text>
        <Text style={summaryStyles.lbl}>Drafts</Text>
      </View>
      <View style={summaryStyles.div} />
      <View style={summaryStyles.item}>
        <Text style={summaryStyles.val}>{fmt(totalStudents)}</Text>
        <Text style={summaryStyles.lbl}>Students</Text>
      </View>
      <View style={summaryStyles.div} />
      <View style={summaryStyles.item}>
        <Text style={summaryStyles.val}>${fmt(totalRevenue)}</Text>
        <Text style={summaryStyles.lbl}>Revenue</Text>
      </View>
    </View>
  );
}

const summaryStyles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  item: { flex: 1, alignItems: "center" },
  val:  { fontSize: 17, fontWeight: "800", color: "#111" },
  lbl:  { fontSize: 10, color: "#888", marginTop: 2, fontWeight: "500" },
  div:  { width: 1, height: 28, backgroundColor: "#eee" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <View style={toastStyles.wrap}>
      <Ionicons name="checkmark-circle" size={18} color="#34C759" />
      <Text style={toastStyles.text}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={16} color="#888" />
      </TouchableOpacity>
    </View>
  );
}

const toastStyles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  text: { flex: 1, fontSize: 13, fontWeight: "600", color: "#111" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Main ManageCoursesScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function ManageCoursesScreen({ navigation }) {
  const [courses, setCourses]     = useState(MOCK_COURSES);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter]       = useState("all");
  const [toast, setToast]         = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [editVisible, setEditVisible] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const fetchCourses = async () => {
        try {
          const res = await api.get("/creators/courses");
          if (res?.data?.courses) setCourses(res.data.courses);
        } catch {
          // keep mock
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    }, [])
  );

  const filteredCourses = courses.filter(c => {
    if (filter === "published") return c.published;
    if (filter === "draft")     return !c.published;
    return true;
  });

  const handleEdit = (course) => {
    setEditCourse(course);
    setEditVisible(true);
  };

  const handleSave = async (updated) => {
    try {
      await api.put(`/creators/courses/${updated.id}`, {
        title: updated.title,
        subject: updated.subject,
        published: updated.published,
      });
    } catch {
      // update locally even if API fails
    }
    setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast("Course updated ✅");
  };

  const handleTogglePublish = (course) => {
    const action = course.published ? "unpublish" : "publish";
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} course`,
      `Are you sure you want to ${action} "${course.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: course.published ? "destructive" : "default",
          onPress: async () => {
            try {
              await api.patch(`/creators/courses/${course.id}/publish`, {
                published: !course.published,
              });
            } catch { /* update locally */ }
            setCourses(prev =>
              prev.map(c => c.id === course.id ? { ...c, published: !c.published } : c)
            );
            showToast(course.published ? "Course unpublished" : "Course published! 🎉");
          },
        },
      ]
    );
  };

  const handleDelete = (course) => {
    Alert.alert(
      "Delete course",
      `This will permanently delete "${course.title}" and all its lessons. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/creators/courses/${course.id}`);
            } catch { /* remove locally */ }
            setCourses(prev => prev.filter(c => c.id !== course.id));
            showToast("Course deleted");
          },
        },
      ]
    );
  };

  const handleUpload = () => {
    pickAndUploadCourse(
      (msg) => showToast(msg),
      (msg) => Alert.alert("Error", msg),
      (val) => setUploading(val)
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6fb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#2F54EB" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Manage Courses</Text>
          <Text style={styles.headerSub}>{courses.length} course{courses.length !== 1 ? "s" : ""} total</Text>
        </View>
        <TouchableOpacity
          style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="add" size={20} color="#fff" />
          }
          <Text style={styles.uploadBtnText}>{uploading ? "Uploading…" : "New"}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      <SummaryBar courses={courses} />

      {/* Filter */}
      <FilterBar active={filter} onChange={setFilter} />

      {/* Courses list */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2F54EB" />
          <Text style={styles.loadingText}>Loading your courses…</Text>
        </View>
      ) : filteredCourses.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="book-outline" size={28} color="#2F54EB" />
          </View>
          <Text style={styles.emptyTitle}>
            {filter === "published" ? "No published courses yet"
              : filter === "draft" ? "No drafts"
              : "No courses yet"}
          </Text>
          <Text style={styles.emptySub}>
            {filter === "all"
              ? "Tap + New to upload your first course."
              : "Switch to All to see your courses."}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}

      {/* Edit modal */}
      {editCourse && (
        <EditCourseModal
          course={editCourse}
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      <Toast message={toast} onClose={() => setToast(null)} />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111", letterSpacing: -0.3 },
  headerSub:   { fontSize: 11, color: "#888", marginTop: 1 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#2F54EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  uploadBtnText: { fontSize: 13, color: "#fff", fontWeight: "700" },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 13, color: "#aaa" },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 6, textAlign: "center" },
  emptySub:   { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 19 },
});