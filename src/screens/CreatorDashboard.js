// src/screens/CreatorDashboardScreen.js
// Nawarny — Creator Dashboard
// Period picker: This week / This month / All time
// Each period shows different stats, chart data, top videos & courses.
// Falls back to mock data if API is not ready.

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
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import api from "../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// Mock data — different values per period
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_DATA = {
  week: {
    totalViews:      3820,
    viewsChange:     18,
    followers:       42,
    followersLabel:  "new this week",
    totalVideos:     2,
    drafts:          1,
    avgWatchTime:    71,
    revenue:         112,
    completionRate:  76,
    weeklyViews:     [4, 7, 3, 9, 6, 12, 8],
    topVideos: [
      { id: "1", title: "CFD Basics for Beginners",    views: 1420, watchPct: 74, subject: "Engineering"  },
      { id: "2", title: "Bernoulli's Principle in 60s", views: 980,  watchPct: 68, subject: "Aerodynamics" },
      { id: "3", title: "Mach Numbers Explained",       views: 760,  watchPct: 61, subject: "Aerodynamics" },
      { id: "4", title: "Wing Lift Explained",          views: 660,  watchPct: 55, subject: "Physics"      },
    ],
    topCourses: [
      { id: "1", title: "Intro to Aerodynamics", students: 28,  color: "#4F8EF7" },
      { id: "2", title: "CFD for Beginners",     students: 14,  color: "#AF52DE" },
      { id: "3", title: "Propulsion Systems",    students: 6,   color: "#FF9500" },
    ],
  },
  month: {
    totalViews:      14600,
    viewsChange:     31,
    followers:       210,
    followersLabel:  "new this month",
    totalVideos:     4,
    drafts:          2,
    avgWatchTime:    68,
    revenue:         840,
    completionRate:  74,
    weeklyViews:     [38, 52, 29, 61, 44, 78, 55],
    topVideos: [
      { id: "1", title: "CFD Basics for Beginners",    views: 5200, watchPct: 74, subject: "Engineering"  },
      { id: "2", title: "Bernoulli's Principle in 60s", views: 3800, watchPct: 68, subject: "Aerodynamics" },
      { id: "3", title: "Mach Numbers Explained",       views: 2900, watchPct: 61, subject: "Aerodynamics" },
      { id: "4", title: "Wing Lift Explained",          views: 2700, watchPct: 55, subject: "Physics"      },
    ],
    topCourses: [
      { id: "1", title: "Intro to Aerodynamics", students: 120, color: "#4F8EF7" },
      { id: "2", title: "CFD for Beginners",     students: 72,  color: "#AF52DE" },
      { id: "3", title: "Propulsion Systems",    students: 38,  color: "#FF9500" },
    ],
  },
  all: {
    totalViews:      52480,
    viewsChange:     null,
    followers:       1240,
    followersLabel:  "total followers",
    totalVideos:     6,
    drafts:          2,
    avgWatchTime:    68,
    revenue:         4380,
    completionRate:  74,
    weeklyViews:     [120, 190, 80, 240, 170, 310, 220],
    topVideos: [
      { id: "1", title: "CFD Basics for Beginners",    views: 21000, watchPct: 74, subject: "Engineering"  },
      { id: "2", title: "Bernoulli's Principle in 60s", views: 12400, watchPct: 68, subject: "Aerodynamics" },
      { id: "3", title: "Mach Numbers Explained",       views: 9700,  watchPct: 61, subject: "Aerodynamics" },
      { id: "4", title: "Wing Lift Explained",          views: 8100,  watchPct: 55, subject: "Physics"      },
    ],
    topCourses: [
      { id: "1", title: "Intro to Aerodynamics", students: 342, color: "#4F8EF7" },
      { id: "2", title: "CFD for Beginners",     students: 189, color: "#AF52DE" },
      { id: "3", title: "Propulsion Systems",    students: 97,  color: "#FF9500" },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mini bar chart
// ─────────────────────────────────────────────────────────────────────────────
function BarChart({ data, period }) {
  const days  = ["S", "M", "T", "W", "T", "F", "S"];
  const max   = Math.max(...data);
  const today = new Date().getDay();

  return (
    <View style={chartStyles.wrap}>
      {data.map((v, i) => {
        const pct    = v / max;
        const active = period === "week" && i === today;
        return (
          <View key={i} style={chartStyles.col}>
            <View style={chartStyles.barTrack}>
              <View
                style={[
                  chartStyles.bar,
                  { height: `${Math.max(Math.round(pct * 100), 4)}%` },
                  active && chartStyles.barActive,
                ]}
              />
            </View>
            <Text style={[chartStyles.dayLabel, active && chartStyles.dayLabelActive]}>
              {days[i]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    gap: 5,
    paddingTop: 4,
  },
  col: { flex: 1, alignItems: "center", gap: 4 },
  barTrack: {
    flex: 1,
    width: "100%",
    backgroundColor: "#EEF2FF",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar:             { width: "100%", backgroundColor: "#93ACFF", borderRadius: 6 },
  barActive:       { backgroundColor: "#2F54EB" },
  dayLabel:        { fontSize: 9, color: "#aaa", fontWeight: "600" },
  dayLabelActive:  { color: "#2F54EB", fontWeight: "800" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, subColor = "#34C759", accent = "#2F54EB" }) {
  return (
    <View style={cardStyles.stat}>
      <View style={[cardStyles.statIconBox, { backgroundColor: accent + "18" }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={cardStyles.statValue}>{value}</Text>
      <Text style={cardStyles.statLabel}>{label}</Text>
      {!!sub && <Text style={[cardStyles.statSub, { color: subColor }]}>{sub}</Text>}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  stat: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    minWidth: (SCREEN_WIDTH - 48) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBox: {
    width: 34, height: 34, borderRadius: 10,
    justifyContent: "center", alignItems: "center", marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: "#111", letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: "#888", marginTop: 2, fontWeight: "500" },
  statSub:   { fontSize: 10, marginTop: 3, fontWeight: "600" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Top Video Row
// ─────────────────────────────────────────────────────────────────────────────
function VideoRow({ item, rank }) {
  const rankColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : "#ddd";
  return (
    <View style={vidStyles.row}>
      <View style={[vidStyles.rank, { backgroundColor: rankColor + "33" }]}>
        <Text style={[vidStyles.rankText, { color: rankColor === "#ddd" ? "#aaa" : rankColor }]}>#{rank}</Text>
      </View>
      <View style={vidStyles.info}>
        <Text style={vidStyles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={vidStyles.meta}>{item.subject} · {fmt(item.views)} views</Text>
      </View>
      <View style={vidStyles.watchWrap}>
        <Text style={vidStyles.watchPct}>{item.watchPct}%</Text>
        <Text style={vidStyles.watchLabel}>watched</Text>
      </View>
    </View>
  );
}

const vidStyles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#f0f0f0",
  },
  rank:      { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  rankText:  { fontSize: 11, fontWeight: "800" },
  info:      { flex: 1 },
  title:     { fontSize: 12, fontWeight: "700", color: "#111" },
  meta:      { fontSize: 10, color: "#999", marginTop: 2 },
  watchWrap: { alignItems: "flex-end" },
  watchPct:  { fontSize: 13, fontWeight: "800", color: "#2F54EB" },
  watchLabel:{ fontSize: 9, color: "#aaa" },
});

// ─────────────────────────────────────────────────────────────────────────────
// Course Row
// ─────────────────────────────────────────────────────────────────────────────
function CourseRow({ item, maxStudents }) {
  const pct = item.students / maxStudents;
  return (
    <View style={crStyles.row}>
      <View style={crStyles.topLine}>
        <Text style={crStyles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={[crStyles.students, { color: item.color }]}>{item.students}</Text>
      </View>
      <View style={crStyles.track}>
        <View style={[crStyles.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: item.color }]} />
      </View>
    </View>
  );
}

const crStyles = StyleSheet.create({
  row:      { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#f0f0f0" },
  topLine:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  title:    { fontSize: 12, fontWeight: "700", color: "#111", flex: 1, marginRight: 8 },
  students: { fontSize: 12, fontWeight: "800" },
  track:    { height: 5, backgroundColor: "#eee", borderRadius: 3, overflow: "hidden" },
  fill:     { height: 5, borderRadius: 3 },
});

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, children, action, onAction }) {
  return (
    <View style={secStyles.wrap}>
      <View style={secStyles.header}>
        <Text style={secStyles.title}>{title}</Text>
        {!!action && (
          <TouchableOpacity onPress={onAction}>
            <Text style={secStyles.action}>{action}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={secStyles.body}>{children}</View>
    </View>
  );
}

const secStyles = StyleSheet.create({
  wrap:   { marginHorizontal: 16, marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  title:  { fontSize: 15, fontWeight: "800", color: "#111" },
  action: { fontSize: 12, color: "#2F54EB", fontWeight: "600" },
  body:   {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Period badge helper
// ─────────────────────────────────────────────────────────────────────────────
function periodLabel(period) {
  if (period === "week")  return "this week";
  if (period === "month") return "this month";
  return "all time";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CreatorDashboardScreen
// ─────────────────────────────────────────────────────────────────────────────
export default function CreatorDashboardScreen({ navigation }) {
  const [data, setData]       = useState(MOCK_DATA.week);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod]   = useState("week");

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const loadData = useCallback(async (p) => {
    // Fade out
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    setLoading(true);

    try {
      const res = await api.get(`/creators/dashboard?period=${p}`);
      if (res?.data) {
        setData(res.data);
      } else {
        setData(MOCK_DATA[p]);
      }
    } catch {
      // API not ready — use mock
      setData(MOCK_DATA[p]);
    } finally {
      setLoading(false);
      // Fade in
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(period);
    }, [period])
  );

  const switchPeriod = (p) => {
    if (p === period) return;
    setPeriod(p);
  };

  const maxStudents = data.topCourses?.[0]?.students ?? 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f6fb" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#2F54EB" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Creator Dashboard</Text>
          <Text style={styles.headerSub}>Your channel at a glance</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => Alert.alert("Coming soon", "Creator settings are not available yet.")}
        >
          <Ionicons name="settings-outline" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {/* ── Period picker ── */}
      <View style={styles.periodRow}>
        {[
          { key: "week",  label: "This week"  },
          { key: "month", label: "This month" },
          { key: "all",   label: "All time"   },
        ].map(p => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => switchPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#2F54EB" />
          <Text style={styles.loadingText}>Updating stats…</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Stat Cards ── */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="eye-outline"
              label="Total Views"
              value={fmt(data.totalViews)}
              sub={data.viewsChange ? `↑ ${data.viewsChange}% vs last ${periodLabel(period)}` : "all time total"}
              subColor={data.viewsChange ? "#34C759" : "#888"}
              accent="#2F54EB"
            />
            <StatCard
              icon="people-outline"
              label="Followers"
              value={fmt(data.followers)}
              sub={data.followersLabel}
              subColor="#34C759"
              accent="#34C759"
            />
            <StatCard
              icon="videocam-outline"
              label="Videos"
              value={data.totalVideos}
              sub={`${data.drafts} draft${data.drafts !== 1 ? "s" : ""}`}
              subColor="#FF9500"
              accent="#FF9500"
            />
            <StatCard
              icon="time-outline"
              label="Avg Watch"
              value={`${data.avgWatchTime}%`}
              sub="above average"
              accent="#AF52DE"
            />
            <StatCard
              icon="cash-outline"
              label="Revenue"
              value={`$${fmt(data.revenue)}`}
              sub={period === "all" ? "total earned" : `${periodLabel(period)}`}
              subColor="#185FA5"
              accent="#185FA5"
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Completion"
              value={`${data.completionRate}%`}
              sub="top 10%"
              subColor="#FF3B30"
              accent="#FF3B30"
            />
          </View>

          {/* ── Views Chart ── */}
          <Section
            title={
              period === "week"  ? "Views — this week"  :
              period === "month" ? "Views — this month" :
              "Views — all time"
            }
          >
            <BarChart data={data.weeklyViews} period={period} />
          </Section>

          {/* ── Top Videos ── */}
          <Section title={`Top videos · ${periodLabel(period)}`}>
            {data.topVideos.map((v, i) => (
              <VideoRow key={v.id} item={v} rank={i + 1} />
            ))}
          </Section>

          {/* ── Course Performance ── */}
          <Section title={`Course enrolments · ${periodLabel(period)}`}>
            <Text style={styles.courseSubLabel}>Students enrolled per course</Text>
            {data.topCourses.map(c => (
              <CourseRow key={c.id} item={c} maxStudents={maxStudents} />
            ))}
          </Section>

          {/* ── Tip card ── */}
          <View style={styles.tipCard}>
            <View style={styles.tipIconBox}>
              <Ionicons name="bulb-outline" size={20} color="#FFD700" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Grow faster 🚀</Text>
              <Text style={styles.tipBody}>
                Videos under 90 seconds get 2× more completions. Try breaking your next lesson into shorter clips.
              </Text>
            </View>
          </View>

        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#f4f6fb" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111", letterSpacing: -0.3 },
  headerSub:   { fontSize: 11, color: "#888", marginTop: 1 },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },

  periodRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  periodBtn:       { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
  periodBtnActive: { backgroundColor: "#2F54EB" },
  periodText:      { fontSize: 12, fontWeight: "600", color: "#888" },
  periodTextActive:{ color: "#fff" },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 13, color: "#aaa" },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },

  courseSubLabel: { fontSize: 11, color: "#aaa", fontWeight: "500", marginBottom: 6 },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#FFFBEA",
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#FFE58F",
  },
  tipIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#FFF3B0",
    justifyContent: "center", alignItems: "center",
  },
  tipTitle: { fontSize: 13, fontWeight: "700", color: "#7A5500", marginBottom: 3 },
  tipBody:  { fontSize: 11, color: "#9A6F00", lineHeight: 16 },
});