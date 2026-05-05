// src/screens/CourseContentScreen.js
// Step 03 — Course Content (lesson playback)
// Receives the course object via route.params.course.
// User progresses through lessons; tapping "Complete course" on the last lesson
// navigates to CourseCompletion (history is preserved).
// In production, swap the placeholder player for expo-av <Video /> and replace
// the LESSONS constant with data from services/api.js.

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../constants/theme';

// --- Mock lesson data — replace with api.getLessons(courseId) ---
const LESSONS = [
  { id: 'l1', n: 1, title: 'Welcome & course overview',  duration: '4:30',  type: 'video' },
  { id: 'l2', n: 2, title: 'What is UI vs UX',           duration: '8:15',  type: 'video' },
  { id: 'l3', n: 3, title: 'Design principles in 5 min', duration: '5:50',  type: 'video' },
  { id: 'l4', n: 4, title: 'Color theory basics',        duration: '12:20', type: 'video' },
  { id: 'l5', n: 5, title: 'Typography fundamentals',    duration: '10:05', type: 'video' },
  { id: 'l6', n: 6, title: 'Quiz: foundations',          duration: '6 Q',   type: 'quiz'  },
];

export default function CourseContentScreen({ route, navigation }) {
  const course = route?.params?.course ?? {
    title: 'Intro to UI/UX Design',
    instructor: 'Sara Khalil',
  };

  const [currentId, setCurrentId] = useState(LESSONS[0].id);
  const [completed, setCompleted] = useState({});

  const current = useMemo(
    () => LESSONS.find((l) => l.id === currentId) ?? LESSONS[0],
    [currentId]
  );
  const currentIdx = LESSONS.findIndex((l) => l.id === currentId);
  const isLast = currentIdx === LESSONS.length - 1;
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPct = Math.round((completedCount / LESSONS.length) * 100);

  const markCurrentComplete = () =>
    setCompleted((prev) => ({ ...prev, [currentId]: true }));

  const handleNext = () => {
    markCurrentComplete();
    if (isLast) {
      navigation.navigate('CourseCompletion', { course });
      return;
    }
    setCurrentId(LESSONS[currentIdx + 1].id);
  };

  const handlePrev = () => {
    if (currentIdx === 0) return;
    setCurrentId(LESSONS[currentIdx - 1].id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
          <Text style={styles.headerSub}>
            Lesson {currentIdx + 1} of {LESSONS.length} · {progressPct}% complete
          </Text>
        </View>
      </View>

      {/* Player (placeholder — swap for expo-av <Video /> in production) */}
      <View style={styles.player}>
        <View style={styles.playerOverlay}>
          <Pressable style={styles.playBtn}>
            <Ionicons
              name={current.type === 'quiz' ? 'help-circle' : 'play'}
              size={28}
              color="#BE185D"
            />
          </Pressable>
          <Text style={styles.playerDuration}>{current.duration}</Text>
        </View>
        <View style={styles.playerControls}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '35%' }]} />
          </View>
          <View style={styles.controlsRow}>
            <Feather name="skip-back" size={16} color="#FFFFFF" />
            <Feather name="play" size={18} color="#FFFFFF" />
            <Feather name="skip-forward" size={16} color="#FFFFFF" />
            <View style={{ flex: 1 }} />
            <Feather name="maximize-2" size={14} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Current lesson info */}
        <View style={styles.lessonHead}>
          <Text style={styles.lessonNumber}>Lesson {current.n}</Text>
          <Text style={styles.lessonTitle}>{current.title}</Text>
          <Text style={styles.lessonMeta}>
            {course.instructor} · {current.duration}
          </Text>
        </View>

        {/* About this lesson */}
        <View style={styles.card}>
          <Text style={styles.cardLbl}>About this lesson</Text>
          <Text style={styles.cardBody}>
            A short, focused walkthrough covering the key concepts. Take notes,
            pause when you need to, and don't move on until the idea clicks.
          </Text>
        </View>

        {/* Course progress */}
        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressLbl}>Course progress</Text>
            <Text style={styles.progressVal}>{progressPct}%</Text>
          </View>
          <View style={styles.progressBarOuter}>
            <View style={[styles.progressBarInner, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Lesson list */}
        <Text style={styles.section}>All lessons</Text>
        {LESSONS.map((l, idx) => {
          const isCurrent = l.id === currentId;
          const isDone = !!completed[l.id];
          return (
            <Pressable
              key={l.id}
              style={[styles.lessonRow, isCurrent && styles.lessonRowActive]}
              onPress={() => setCurrentId(l.id)}
            >
              <View style={[styles.lessonIcon, isDone && styles.lessonIconDone]}>
                {isDone ? (
                  <Feather name="check" size={14} color="#FFFFFF" />
                ) : isCurrent ? (
                  <Feather name="play" size={12} color={colors.primary700} />
                ) : (
                  <Text style={styles.lessonNum}>{idx + 1}</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.lessonRowTitle, isCurrent && styles.lessonRowTitleActive]}
                  numberOfLines={1}
                >
                  {l.title}
                </Text>
                <Text style={styles.lessonRowMeta}>
                  {l.type === 'quiz' ? 'Quiz' : 'Video'} · {l.duration}
                </Text>
              </View>
              {isCurrent && (
                <Feather name="chevron-right" size={16} color={colors.primary700} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Sticky nav bar */}
      <View style={styles.navBar}>
        <Pressable
          style={[styles.navBtnSecondary, currentIdx === 0 && styles.navBtnDisabled]}
          onPress={handlePrev}
          disabled={currentIdx === 0}
        >
          <Feather name="chevron-left" size={16} color={colors.ink2} />
          <Text style={styles.navBtnSecondaryText}>Previous</Text>
        </Pressable>
        <Pressable style={styles.navBtnPrimary} onPress={handleNext}>
          <Text style={styles.navBtnPrimaryText}>
            {isLast ? 'Complete course →' : 'Next lesson →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: 110 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  headerSub: { fontSize: 11, color: colors.ink3, marginTop: 2 },

  player: {
    height: 200,
    backgroundColor: '#1F2937',
  },
  playerOverlay: {
    flex: 1,
    backgroundColor: '#BE185D',
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  playBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...shadow.md,
  },
  playerDuration: {
    position: 'absolute', bottom: spacing.sm, right: spacing.md,
    color: '#FFFFFF', fontSize: 11, fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  playerControls: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  progressBar: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%', backgroundColor: colors.primary, borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
  },

  lessonHead: { marginBottom: spacing.lg },
  lessonNumber: {
    fontSize: 10, color: colors.primary700, fontWeight: '700',
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  lessonTitle: { ...typography.title, fontSize: 17, color: colors.ink, marginTop: 2 },
  lessonMeta: { fontSize: 11, color: colors.ink3, marginTop: 4 },

  card: {
    padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.surface2,
    marginBottom: spacing.lg,
  },
  cardLbl: {
    fontSize: 10, fontWeight: '700', color: colors.ink3,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  cardBody: { fontSize: 12, color: colors.ink2, lineHeight: 18 },

  progressCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  progressLbl: {
    fontSize: 10, color: colors.ink3, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  progressVal: { fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 2 },
  progressBarOuter: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: colors.surface3,
  },
  progressBarInner: {
    height: '100%', borderRadius: 3, backgroundColor: colors.primary,
  },

  section: {
    fontSize: 12, fontWeight: '700', color: colors.ink2,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },

  lessonRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line,
    marginBottom: spacing.sm,
  },
  lessonRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface2,
  },
  lessonIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surface3,
    alignItems: 'center', justifyContent: 'center',
  },
  lessonIconDone: { backgroundColor: colors.success },
  lessonNum: { fontSize: 11, fontWeight: '700', color: colors.ink2 },
  lessonRowTitle: { fontSize: 13, fontWeight: '500', color: colors.ink },
  lessonRowTitleActive: { color: colors.primary700, fontWeight: '700' },
  lessonRowMeta: { fontSize: 10, color: colors.ink3, marginTop: 2 },

  navBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', gap: spacing.md,
    padding: spacing.md, paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.line,
  },
  navBtnSecondary: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line,
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnSecondaryText: { color: colors.ink2, fontWeight: '600', fontSize: 13 },
  navBtnPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.primary,
  },
  navBtnPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});