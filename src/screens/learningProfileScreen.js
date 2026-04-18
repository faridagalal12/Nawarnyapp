// src/screens/learningProfileScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

// ─── Mock Data (replace with real API calls) ──────────────────────────────────
const USER = {
  name: "Jana Al-Rashidi",
  level: 12,
  levelTitle: "Knowledge Seeker",
  xp: 3420,
  xpToNext: 4000,
  totalXP: 18420,
  streak: 14,
  enrolledCourses: 8,
  rank: 14,
  rankDelta: +3,
};

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const STREAK_DONE = [true, true, true, true, true, false, false];

const ONGOING_COURSES = [
  { id: 1, title: "Python for Data Science",   lessons: 14, total: 22, pct: 64, color: "#3B6CF8", emoji: "🐍" },
  { id: 2, title: "UX Design Fundamentals",    lessons: 6,  total: 18, pct: 33, color: "#8B5CF6", emoji: "🎨" },
  { id: 3, title: "Digital Marketing Mastery", lessons: 9,  total: 12, pct: 75, color: "#EC4899", emoji: "📣" },
];

const SAVED_COURSES = [
  { id: 1, title: "Machine Learning A–Z",  tag: "AI",        tagColor: "#3B6CF8" },
  { id: 2, title: "Growth Hacking 101",    tag: "Marketing", tagColor: "#F59E0B" },
  { id: 3, title: "React Native Bootcamp", tag: "Dev",       tagColor: "#10B981" },
];

const BADGES = [
  { id: 1, emoji: "🔥", label: "7-Day Streak",  earned: true  },
  { id: 2, emoji: "⚡", label: "Speed Learner", earned: true  },
  { id: 3, emoji: "🏆", label: "Top 10",        earned: true  },
  { id: 4, emoji: "🎯", label: "Goal Setter",   earned: true  },
  { id: 5, emoji: "📚", label: "Bookworm",      earned: false },
  { id: 6, emoji: "🌟", label: "All-Star",      earned: false },
  { id: 7, emoji: "💎", label: "Diamond",       earned: false },
  { id: 8, emoji: "🚀", label: "Rocket",        earned: false },
];

const GOALS = [
  { id: 1, icon: "📖", label: "Lessons / Week",  current: 4,  target: 5  },
  { id: 2, icon: "⏱️", label: "Daily Minutes",   current: 22, target: 30 },
  { id: 3, icon: "🎓", label: "Courses / Month", current: 1,  target: 2  },
  { id: 4, icon: "▶️", label: "Videos / Week",   current: 9,  target: 10 },
];

const COMPLETED_COURSES = [
  { id: 1, title: "JavaScript Essentials", date: "Mar 2026", emoji: "⚙️" },
  { id: 2, title: "Public Speaking Pro",   date: "Feb 2026", emoji: "🎤" },
  { id: 3, title: "Excel for Business",    date: "Jan 2026", emoji: "📊" },
];

const LEADERBOARD = [
  { rank: 1,         name: "Layla K.",  xp: 5820,         avatar: "🦁" },
  { rank: 2,         name: "Yousef M.", xp: 5410,         avatar: "🐯" },
  { rank: 3,         name: "Sara T.",   xp: 4990,         avatar: "🦊" },
  { rank: USER.rank, name: "You",       xp: USER.totalXP, avatar: "⭐", isUser: true },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function ProgressBar({ pct, color = "#0066FF", height = 6 }) {
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.min(pct, 100)}%`, backgroundColor: color, height },
        ]}
      />
    </View>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

function Header() {
  const xpPct = Math.round((USER.xp / USER.xpToNext) * 100);
  const rankArrow = USER.rankDelta > 0 ? "▲" : USER.rankDelta < 0 ? "▼" : "–";

  return (
    <View style={styles.header}>
      <Text style={styles.headerLevel}>Lv.{USER.level} · {USER.levelTitle}</Text>

      <View style={styles.pillRow}>
        {[
          { label: "Courses",  value: String(USER.enrolledCourses) },
          { label: "Streak",   value: `${USER.streak} 🔥` },
          { label: "Total XP", value: USER.totalXP.toLocaleString() },
          { label: "Rank",     value: `#${USER.rank} ${rankArrow}` },
        ].map((s) => (
          <View key={s.label} style={styles.pill}>
            <Text style={styles.pillValue}>{s.value}</Text>
            <Text style={styles.pillLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.xpRow}>
        <Text style={styles.xpText}>{USER.xp.toLocaleString()} XP</Text>
        <Text style={styles.xpText}>{USER.xpToNext.toLocaleString()} XP → Lv.{USER.level + 1}</Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
      </View>
    </View>
  );
}

function WeekStreak() {
  return (
    <Card>
      <SectionTitle title="📅 Weekly Streak" />
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d, i) => {
          const done = STREAK_DONE[i];
          const isToday = i === 4;
          return (
            <View key={i} style={styles.dayCol}>
              <View
                style={[
                  styles.dayDot,
                  { backgroundColor: done ? (isToday ? "#F97316" : "#0066FF") : "#E8EEFF" },
                ]}
              >
                {done && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.dayLabel, isToday && { color: "#F97316", fontWeight: "700" }]}>
                {d}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function LearningGoals({ onEdit }) {
  return (
    <Card>
      <View style={styles.cardHeader}>
        <SectionTitle title="🎯 Learning Goals" />
        <TouchableOpacity style={styles.editChip} onPress={onEdit}>
          <Text style={styles.editChipText}>Edit Goals</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.goalsGrid}>
        {GOALS.map((g) => {
          const pct = Math.round((g.current / g.target) * 100);
          return (
            <View key={g.id} style={styles.goalCell}>
              <Text style={styles.goalIcon}>{g.icon}</Text>
              <Text style={styles.goalLabel}>{g.label}</Text>
              <Text style={styles.goalValue}>
                {g.current}
                <Text style={styles.goalTarget}>/{g.target}</Text>
              </Text>
              <ProgressBar pct={pct} color={pct >= 100 ? "#10B981" : "#0066FF"} height={5} />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function OngoingCourses() {
  return (
    <Card>
      <SectionTitle title="▶️ Ongoing Courses" />
      {ONGOING_COURSES.map((c, idx) => (
        <View
          key={c.id}
          style={[styles.courseRow, idx < ONGOING_COURSES.length - 1 && styles.courseRowBorder]}
        >
          <View style={[styles.courseEmoji, { backgroundColor: c.color + "22" }]}>
            <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle} numberOfLines={1}>{c.title}</Text>
            <View style={styles.courseBarRow}>
              <View style={{ flex: 1 }}>
                <ProgressBar pct={c.pct} color={c.color} />
              </View>
              <Text style={[styles.coursePct, { color: c.color }]}>{c.pct}%</Text>
            </View>
            <Text style={styles.courseLessons}>{c.lessons}/{c.total} lessons</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

function SavedCourses() {
  return (
    <Card>
      <SectionTitle title="🔖 Saved Courses" />
      {SAVED_COURSES.map((c) => (
        <View key={c.id} style={styles.savedRow}>
          <Text style={styles.savedTitle}>{c.title}</Text>
          <View style={[styles.tag, { backgroundColor: c.tagColor + "18" }]}>
            <Text style={[styles.tagText, { color: c.tagColor }]}>{c.tag}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

function Badges() {
  return (
    <Card>
      <SectionTitle title="🏅 Badges" />
      <View style={styles.badgesGrid}>
        {BADGES.map((b) => (
          <View key={b.id} style={[styles.badgeCell, !b.earned && { opacity: 0.35 }]}>
            <View style={[styles.badgeCircle, b.earned && styles.badgeCircleEarned]}>
              <Text style={{ fontSize: 24 }}>{b.earned ? b.emoji : "🔒"}</Text>
            </View>
            <Text style={styles.badgeLabel}>{b.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function CompletedCourses() {
  return (
    <Card>
      <SectionTitle title="✅ Completed Courses" />
      {COMPLETED_COURSES.map((c) => (
        <View key={c.id} style={styles.completedRow}>
          <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
          <View style={styles.completedInfo}>
            <Text style={styles.completedTitle}>{c.title}</Text>
            <Text style={styles.completedDate}>Completed {c.date}</Text>
          </View>
          <TouchableOpacity style={styles.certButton}>
            <Text style={styles.certButtonText}>📜 Certificate</Text>
          </TouchableOpacity>
        </View>
      ))}
    </Card>
  );
}

function LeaderboardCard() {
  const rankArrow = USER.rankDelta > 0 ? "▲" : USER.rankDelta < 0 ? "▼" : "–";
  const rankColor = USER.rankDelta > 0 ? "#10B981" : USER.rankDelta < 0 ? "#EF4444" : "#fff";

  return (
    <Card>
      <SectionTitle title="🏆 Leaderboard Rank" />
      <View style={styles.rankBanner}>
        <View>
          <Text style={styles.rankBannerSub}>Your rank this week</Text>
          <Text style={styles.rankBannerNum}>#{USER.rank}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.rankDelta, { color: rankColor }]}>
            {rankArrow} {Math.abs(USER.rankDelta)}
          </Text>
          <Text style={styles.rankBannerSub}>vs last week</Text>
        </View>
      </View>

      {LEADERBOARD.map((row) => (
        <View key={row.rank} style={[styles.lbRow, row.isUser && styles.lbRowUser]}>
          <Text style={[styles.lbRank, row.rank <= 3 && { color: "#F59E0B" }]}>
            {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
          </Text>
          <Text style={styles.lbAvatar}>{row.avatar}</Text>
          <Text style={[styles.lbName, row.isUser && { fontWeight: "700", color: "#0066FF" }]}>
            {row.name}
          </Text>
          <Text style={styles.lbXP}>{row.xp.toLocaleString()} XP</Text>
        </View>
      ))}
    </Card>
  );
}

function EditGoalsModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>🎯 Edit Learning Goals</Text>
          {GOALS.map((g) => (
            <View key={g.id} style={styles.modalGoalRow}>
              <Text style={{ fontSize: 20, width: 28 }}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalGoalLabel}>{g.label}</Text>
                <Text style={styles.modalGoalTarget}>Target: {g.target}</Text>
              </View>
              <View style={styles.modalGoalBadge}>
                <Text style={styles.modalGoalBadgeText}>{g.current}/{g.target}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.modalSaveBtn} onPress={onClose}>
            <Text style={styles.modalSaveBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LearningProfileScreen({ navigation }) {
  const [editGoalsVisible, setEditGoalsVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0066FF" />

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Learning Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Header />
        <View style={styles.body}>
          <WeekStreak />
          <LearningGoals onEdit={() => setEditGoalsVisible(true)} />
          <OngoingCourses />
          <SavedCourses />
          <Badges />
          <CompletedCourses />
          <LeaderboardCard />
        </View>
      </ScrollView>

      <EditGoalsModal visible={editGoalsVisible} onClose={() => setEditGoalsVisible(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: "#F1F5F9" },
  scroll:       { paddingBottom: 32 },
  body:         { padding: 16, gap: 16 },

  navBar: {
    backgroundColor: "#0066FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn:   { padding: 8 },
  navTitle:  { color: "#fff", fontSize: 17, fontWeight: "700" },

  header: {
    backgroundColor: "#0066FF",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 4,
  },
  headerLevel: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 12 },
  pillRow:     { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  pill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  pillValue: { color: "#fff", fontSize: 13, fontWeight: "700" },
  pillLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  xpRow:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  xpText:    { color: "rgba(255,255,255,0.9)", fontSize: 11 },
  xpTrack:   { height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 99, overflow: "hidden" },
  xpFill:    { height: 8, backgroundColor: "#FCD34D", borderRadius: 99 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1E293B", marginBottom: 14 },

  progressTrack: { backgroundColor: "#E8EEFF", borderRadius: 99, overflow: "hidden" },
  progressFill:  { borderRadius: 99 },

  editChip:     { backgroundColor: "#E8EEFF", borderRadius: 99, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 14 },
  editChipText: { color: "#0066FF", fontSize: 12, fontWeight: "600" },

  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol:  { alignItems: "center", gap: 6 },
  dayDot:  { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  dayLabel:{ fontSize: 11, color: "#94A3B8" },

  goalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalCell:  { width: "47%", backgroundColor: "#F8FAFF", borderRadius: 12, padding: 12, gap: 4 },
  goalIcon:  { fontSize: 20 },
  goalLabel: { fontSize: 12, color: "#64748B" },
  goalValue: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  goalTarget:{ fontWeight: "400", color: "#94A3B8" },

  courseRow:       { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  courseRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#EEF2FF" },
  courseEmoji:     { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  courseInfo:      { flex: 1 },
  courseTitle:     { fontSize: 13, fontWeight: "600", color: "#1E293B", marginBottom: 6 },
  courseBarRow:    { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  coursePct:       { fontSize: 12, fontWeight: "700" },
  courseLessons:   { fontSize: 11, color: "#94A3B8" },

  savedRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFF", borderRadius: 12, padding: 12, marginBottom: 8 },
  savedTitle:{ fontSize: 13, fontWeight: "600", color: "#1E293B", flex: 1, marginRight: 8 },
  tag:       { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 10 },
  tagText:   { fontSize: 11, fontWeight: "700" },

  badgesGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCell:         { width: "22%", alignItems: "center", gap: 6 },
  badgeCircle:       { width: 52, height: 52, borderRadius: 26, backgroundColor: "#F1F5F9", borderWidth: 2, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  badgeCircleEarned: { backgroundColor: "#FEF9C3", borderColor: "#FCD34D" },
  badgeLabel:        { fontSize: 10, color: "#64748B", textAlign: "center", lineHeight: 13 },

  completedRow:  { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F0FDF4", borderRadius: 12, padding: 12, marginBottom: 8 },
  completedInfo: { flex: 1 },
  completedTitle:{ fontSize: 13, fontWeight: "600", color: "#1E293B" },
  completedDate: { fontSize: 11, color: "#64748B", marginTop: 2 },
  certButton:    { backgroundColor: "#10B981", borderRadius: 99, paddingVertical: 5, paddingHorizontal: 12 },
  certButtonText:{ color: "#fff", fontSize: 11, fontWeight: "700" },

  rankBanner:    { backgroundColor: "#0066FF", borderRadius: 14, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  rankBannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  rankBannerNum: { color: "#fff", fontSize: 36, fontWeight: "800", lineHeight: 42 },
  rankDelta:     { fontSize: 20, fontWeight: "700" },
  lbRow:         { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, backgroundColor: "#F8FAFF", marginBottom: 6 },
  lbRowUser:     { backgroundColor: "#E8EEFF", borderWidth: 1.5, borderColor: "#0066FF" },
  lbRank:        { fontSize: 13, fontWeight: "700", color: "#94A3B8", width: 26 },
  lbAvatar:      { fontSize: 18 },
  lbName:        { flex: 1, fontSize: 13, fontWeight: "500", color: "#1E293B" },
  lbXP:          { fontSize: 12, fontWeight: "700", color: "#0066FF" },

  modalOverlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet:         { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle:         { fontSize: 17, fontWeight: "700", color: "#1E293B", marginBottom: 20 },
  modalGoalRow:       { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  modalGoalLabel:     { fontSize: 13, color: "#64748B" },
  modalGoalTarget:    { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  modalGoalBadge:     { backgroundColor: "#E8EEFF", borderRadius: 99, paddingVertical: 4, paddingHorizontal: 12 },
  modalGoalBadgeText: { color: "#0066FF", fontSize: 12, fontWeight: "700" },
  modalSaveBtn:       { backgroundColor: "#0066FF", borderRadius: 14, padding: 14, alignItems: "center", marginTop: 8 },
  modalSaveBtnText:   { color: "#fff", fontSize: 15, fontWeight: "700" },
});