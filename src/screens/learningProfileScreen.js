import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// ─── Shared helpers ───────────────────────────────────────────────────────────
function SectionTitle({ title, icon, iconColor = "#0066FF" }) {
  return (
    <View style={styles.sectionTitleRow}>
      {icon ? <Ionicons name={icon} size={16} color={iconColor} style={{ marginRight: 6 }} /> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function ProgressBar({ pct, color = "#0066FF", height = 6 }) {
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color, height }]} />
    </View>
  );
}

// ─── Section components ───────────────────────────────────────────────────────
function Header({ stats }) {
  if (!stats) return null;
  const xpPct = stats.xpToNext > 0
    ? Math.round((stats.xp / (stats.xp + stats.xpToNext)) * 100)
    : 100;
  const rankArrow = stats.rankDelta > 0 ? "▲" : stats.rankDelta < 0 ? "▼" : "–";

  return (
    <View style={styles.header}>
      <Text style={styles.headerLevel}>Lv.{stats.level} · {stats.levelTitle}</Text>
      <View style={styles.pillRow}>
        {[
          { label: "Courses",  value: String(stats.enrolledCourses) },
          { label: "Streak",   value: `${stats.streak}`, iconAfter: "flame", iconColor: "#F97316" },
          { label: "Total XP", value: stats.totalXP.toLocaleString() },
          { label: "Rank",     value: stats.rank > 0 ? `#${stats.rank} ${rankArrow}` : "—" },
        ].map((s) => (
          <View key={s.label} style={styles.pill}>
            <View style={styles.pillValueRow}>
              <Text style={styles.pillValue}>{s.value}</Text>
              {s.iconAfter ? <Ionicons name={s.iconAfter} size={12} color={s.iconColor} style={{ marginLeft: 4 }} /> : null}
            </View>
            <Text style={styles.pillLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.xpRow}>
        <Text style={styles.xpText}>{stats.xp.toLocaleString()} XP</Text>
        <Text style={styles.xpText}>{stats.xpToNext.toLocaleString()} XP → Lv.{stats.level + 1}</Text>
      </View>
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { width: `${xpPct}%` }]} />
      </View>
    </View>
  );
}

function WeekStreak({ streakData }) {
  if (!streakData) return null;
  const weekStreak = streakData.weekStreak ?? [false, false, false, false, false, false, false];
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <Card>
      <SectionTitle title="Weekly Streak" icon="calendar" />
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d, i) => {
          const done = weekStreak[i];
          const isToday = i === todayIndex;
          return (
            <View key={i} style={styles.dayCol}>
              <View style={[styles.dayDot, { backgroundColor: done ? (isToday ? "#F97316" : "#0066FF") : "#E8EEFF" }]}>
                {done && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.dayLabel, isToday && { color: "#F97316", fontWeight: "700" }]}>{d}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function LearningGoals({ goals, onEdit }) {
  if (!goals) return null;
  return (
    <Card>
      <View style={styles.cardHeader}>
        <SectionTitle title="Learning Goals" icon="locate" iconColor="#10B981" />
        <TouchableOpacity style={styles.editChip} onPress={onEdit}>
          <Text style={styles.editChipText}>Edit Goals</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.goalsGrid}>
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
          return (
            <View key={g.id} style={styles.goalCell}>
              <Ionicons name={g.icon} size={20} color="#0066FF" />
              <Text style={styles.goalLabel}>{g.label}</Text>
              <Text style={styles.goalValue}>
                {g.current}<Text style={styles.goalTarget}>/{g.target}</Text>
              </Text>
              <ProgressBar pct={pct} color={pct >= 100 ? "#10B981" : "#0066FF"} height={5} />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function Badges({ badges }) {
  if (!badges) return null;
  return (
    <Card>
      <SectionTitle title="Badges" icon="medal" iconColor="#F59E0B" />
      <View style={styles.badgesGrid}>
        {badges.map((b) => (
          <View key={b.id} style={styles.badgeCell}>
            <View style={[styles.badgeCircle, b.earned && styles.badgeCircleEarned, b.earned && { borderColor: b.color }]}>
              <Ionicons name={b.earned ? b.icon : "lock-closed"} size={22} color={b.earned ? b.color : "#94A3B8"} />
            </View>
            <Text style={[styles.badgeLabel, !b.earned && { color: "#94A3B8" }]}>{b.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function CompletedCourses({ courses }) {
  if (!courses || courses.length === 0) return null;
  return (
    <Card>
      <SectionTitle title="Completed Courses" icon="checkmark-circle" iconColor="#10B981" />
      {courses.map((c) => (
        <View key={c.id} style={styles.completedRow}>
          <View style={styles.completedIconWrap}>
            <Ionicons name={c.icon ?? "school"} size={20} color="#10B981" />
          </View>
          <View style={styles.completedInfo}>
            <Text style={styles.completedTitle} numberOfLines={2}>{c.title}</Text>
            <Text style={styles.completedDate}>Completed {c.date}</Text>
          </View>
          <TouchableOpacity style={styles.certButton}>
            <Ionicons name="ribbon" size={13} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.certButtonText}>Certificate</Text>
          </TouchableOpacity>
        </View>
      ))}
    </Card>
  );
}

function LeaderboardCard({ leaderboard, stats }) {
  if (!leaderboard || !stats) return null;
  const rankArrow = stats.rankDelta > 0 ? "▲" : stats.rankDelta < 0 ? "▼" : "–";
  const rankColor = stats.rankDelta > 0 ? "#10B981" : stats.rankDelta < 0 ? "#EF4444" : "#fff";

  return (
    <Card>
      <SectionTitle title="Leaderboard Rank" icon="trophy" iconColor="#F59E0B" />
      <View style={styles.rankBanner}>
        <View>
          <Text style={styles.rankBannerSub}>Your rank this week</Text>
          <Text style={styles.rankBannerNum}>{stats.rank > 0 ? `#${stats.rank}` : "—"}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
<Text style={[styles.rankDelta, { color: rankColor }]}>{stats.rankDelta === 0 ? "\u2013" : `${rankArrow} ${Math.abs(stats.rankDelta)}`}</Text>     
   <Text style={styles.rankBannerSub}>vs last week</Text>
        </View>
      </View>
      {leaderboard.map((row) => (
        <View key={row.rank} style={[styles.lbRow, row.isUser && styles.lbRowUser]}>
          <Text style={[styles.lbRank, row.rank <= 3 && { color: "#F59E0B" }]}>#{row.rank}</Text>
          <View style={styles.lbAvatarCircle}>
            <Text style={styles.lbAvatarText}>{row.initial}</Text>
          </View>
          <Text style={[styles.lbName, row.isUser && { fontWeight: "700", color: "#0066FF" }]} numberOfLines={1}>
            {row.name}
          </Text>
          <Text style={styles.lbXP}>{row.xp.toLocaleString()} XP</Text>
        </View>
      ))}
    </Card>
  );
}

function EditGoalsModal({ visible, onClose, goals, onSave }) {
  const [targets, setTargets] = useState({});

  React.useEffect(() => {
    if (goals) {
      setTargets({
        lessonsPerWeek:  goals[0]?.target ?? 5,
        dailyMinutes:    goals[1]?.target ?? 30,
        coursesPerMonth: goals[2]?.target ?? 2,
        videosPerWeek:   goals[3]?.target ?? 10,
      });
    }
  }, [goals]);

  const handleSave = async () => {
    try {
      await api.put("/learning-profile/goals", targets);
      onSave();
      onClose();
    } catch (err) {
      console.log("Failed to save goals:", err?.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet}>
          <View style={styles.modalTitleRow}>
            <Ionicons name="locate" size={18} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.modalTitle}>Edit Learning Goals</Text>
          </View>
          {goals?.map((g, i) => {
            const keys = ["lessonsPerWeek", "dailyMinutes", "coursesPerMonth", "videosPerWeek"];
            const key = keys[i];
            return (
              <View key={g.id} style={styles.modalGoalRow}>
                <Ionicons name={g.icon} size={20} color="#0066FF" style={{ width: 28 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalGoalLabel}>{g.label}</Text>
                  <Text style={styles.modalGoalTarget}>Current target: {targets[key]}</Text>
                </View>
                <View style={styles.modalGoalBtnRow}>
                  <TouchableOpacity
                    onPress={() => setTargets(t => ({ ...t, [key]: Math.max(1, (t[key] ?? 1) - 1) }))}
                    style={styles.modalGoalBtn}
                  >
                    <Ionicons name="remove" size={16} color="#0066FF" />
                  </TouchableOpacity>
                  <Text style={styles.modalGoalBadgeText}>{targets[key]}</Text>
                  <TouchableOpacity
                    onPress={() => setTargets(t => ({ ...t, [key]: (t[key] ?? 1) + 1 }))}
                    style={styles.modalGoalBtn}
                  >
                    <Ionicons name="add" size={16} color="#0066FF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
            <Text style={styles.modalSaveBtnText}>Save Goals</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function LearningProfileScreen({ navigation }) {
  const [stats,       setStats]       = useState(null);
  const [streakData,  setStreakData]  = useState(null);
  const [goals,       setGoals]       = useState(null);
  const [badges,      setBadges]      = useState(null);
  const [completed,   setCompleted]   = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [editGoalsVisible, setEditGoalsVisible] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, streakRes, goalsRes, badgesRes, completedRes, lbRes] = await Promise.all([
        api.get("/learning-profile/stats"),
        api.get("/learning-profile/streak"),
        api.get("/learning-profile/goals"),
        api.get("/learning-profile/badges"),
        api.get("/learning-profile/completed-courses"),
        api.get("/learning-profile/leaderboard"),
      ]);
      setStats(statsRes?.data);
      setStreakData(streakRes?.data);
      setGoals(goalsRes?.data);
      setBadges(badgesRes?.data);
      setCompleted(completedRes?.data);
      setLeaderboard(lbRes?.data);
    } catch (err) {
      console.log("Failed to load learning profile:", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

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

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Header stats={stats} />
          <View style={styles.body}>
            <WeekStreak streakData={streakData} />
            <LearningGoals goals={goals} onEdit={() => setEditGoalsVisible(true)} />
            <Badges badges={badges} />
            <CompletedCourses courses={completed} />
            <LeaderboardCard leaderboard={leaderboard} stats={stats} />
          </View>
        </ScrollView>
      )}

      <EditGoalsModal
        visible={editGoalsVisible}
        onClose={() => setEditGoalsVisible(false)}
        goals={goals}
        onSave={fetchAll}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#F1F5F9" },
  scroll:         { paddingBottom: 32 },
  body:           { padding: 16, gap: 16 },
  loaderContainer:{ flex: 1, justifyContent: "center", alignItems: "center" },

  navBar: {
    backgroundColor: "#0066FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn:  { padding: 8 },
  navTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },

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
  pillValueRow: { flexDirection: "row", alignItems: "center" },
  pillValue:    { color: "#fff", fontSize: 13, fontWeight: "700" },
  pillLabel:    { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  xpRow:        { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  xpText:       { color: "rgba(255,255,255,0.9)", fontSize: 11 },
  xpTrack:      { height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 99, overflow: "hidden" },
  xpFill:       { height: 8, backgroundColor: "#FCD34D", borderRadius: 99 },

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
  cardHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  sectionTitle:    { fontSize: 15, fontWeight: "700", color: "#1E293B" },

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
  goalLabel: { fontSize: 12, color: "#64748B" },
  goalValue: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  goalTarget:{ fontWeight: "400", color: "#94A3B8" },

  badgesGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCell:         { width: "22%", alignItems: "center", gap: 6 },
  badgeCircle:       { width: 52, height: 52, borderRadius: 26, backgroundColor: "#F1F5F9", borderWidth: 2, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  badgeCircleEarned: { backgroundColor: "#FEF9C3" },
  badgeLabel:        { fontSize: 10, color: "#64748B", textAlign: "center", lineHeight: 13 },

  completedRow:      { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F0FDF4", borderRadius: 12, padding: 12, marginBottom: 8 },
  completedIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  completedInfo:     { flex: 1, minWidth: 0 },
  completedTitle:    { fontSize: 13, fontWeight: "600", color: "#1E293B" },
  completedDate:     { fontSize: 11, color: "#64748B", marginTop: 2 },
  certButton:        { flexDirection: "row", alignItems: "center", backgroundColor: "#10B981", borderRadius: 99, paddingVertical: 6, paddingHorizontal: 12, flexShrink: 0 },
  certButtonText:    { color: "#fff", fontSize: 11, fontWeight: "700" },

  rankBanner:    { backgroundColor: "#0066FF", borderRadius: 14, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  rankBannerSub: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  rankBannerNum: { color: "#fff", fontSize: 36, fontWeight: "800", lineHeight: 42 },
  rankDelta:     { fontSize: 20, fontWeight: "700" },
  lbRow:         { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, backgroundColor: "#F8FAFF", marginBottom: 6 },
  lbRowUser:     { backgroundColor: "#E8EEFF", borderWidth: 1.5, borderColor: "#0066FF" },
  lbRank:        { fontSize: 13, fontWeight: "700", color: "#94A3B8", width: 30 },
  lbAvatarCircle:{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#E8EEFF", alignItems: "center", justifyContent: "center" },
  lbAvatarText:  { fontSize: 12, fontWeight: "700", color: "#0066FF" },
  lbName:        { flex: 1, fontSize: 13, fontWeight: "500", color: "#1E293B" },
  lbXP:          { fontSize: 12, fontWeight: "700", color: "#0066FF" },

  modalOverlay:       { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  modalSheet:         { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitleRow:      { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  modalTitle:         { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  modalGoalRow:       { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  modalGoalLabel:     { fontSize: 13, color: "#64748B" },
  modalGoalTarget:    { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  modalGoalBtnRow:    { flexDirection: "row", alignItems: "center", gap: 8 },
  modalGoalBtn:       { backgroundColor: "#E8EEFF", borderRadius: 99, width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  modalGoalBadgeText: { color: "#0066FF", fontSize: 14, fontWeight: "700", minWidth: 24, textAlign: "center" },
  modalSaveBtn:       { backgroundColor: "#0066FF", borderRadius: 14, padding: 14, alignItems: "center", marginTop: 8 },
  modalSaveBtnText:   { color: "#fff", fontSize: 15, fontWeight: "700" },
});