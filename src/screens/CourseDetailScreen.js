// src/screens/CourseDetailScreen.js
// Step 02 — Course Detail
// Receives the course object via route.params.course.
// Tapping "Enroll now" simulates course completion and jumps to CourseCompletion.
// In production, replace that onPress with a call to your enrollment API.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../constants/theme';

const TABS = ['Curriculum', 'About', 'Reviews'];

const MODULES = [
  { n: '01', title: 'Foundations of Design',  duration: '45m',      meta: '3 lessons · 1 quiz',  state: 'done' },
  { n: '02', title: 'Color & Typography',     duration: '1h 10m',   meta: '4 lessons · 1 quiz',  state: 'active' },
  { n: '03', title: 'Wireframing in Figma',   duration: '1h 30m',   meta: '5 lessons · 1 project', state: 'locked' },
];

export default function CourseDetailScreen({ route, navigation }) {
  const course = route?.params?.course ?? {
    title: 'Intro to UI/UX Design',
    instructor: 'Sara Khalil',
  };
  const [tab, setTab] = useState('Curriculum');

  const handleEnroll = () => {
    // TODO: call enrollment API via services/api.js
    navigation.navigate('Payment', { course });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Pressable style={styles.heroBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color={colors.ink} />
          </Pressable>
          <Pressable style={[styles.heroBtn, styles.heroBtnRight]}>
            <Ionicons name="bookmark-outline" size={16} color={colors.ink} />
          </Pressable>
          <View style={styles.playBtn}>
            <Ionicons name="play" size={22} color="#BE185D" />
          </View>
        </View>

        {/* Title */}
        <View style={styles.body}>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.meta}>
            {course.instructor} · Beginner · English + Arabic
          </Text>

          {/* Stat row */}
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>★ {course.rating ?? 4.8}</Text>
              <Text style={styles.statLbl}>Rating</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{course.lessons ?? 12}</Text>
              <Text style={styles.statLbl}>Lessons</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{course.duration ?? '6h 20m'}</Text>
              <Text style={styles.statLbl}>Duration</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={styles.tabPill}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                {tab === t && <View style={styles.tabUnderline} />}
              </Pressable>
            ))}
          </View>

          {/* Modules */}
          {tab === 'Curriculum' && MODULES.map((m) => (
            <View key={m.n} style={styles.module}>
              <View style={styles.modTop}>
                <Text style={styles.modN}>{m.n}</Text>
                <Text style={styles.modT}>{m.title}</Text>
                <Text style={styles.modD}>{m.duration}</Text>
              </View>
              <View style={styles.modBottom}>
                <Text style={styles.modMeta}>• {m.meta}</Text>
                <Text style={styles.modState}>
                  {m.state === 'done' ? '✓' : m.state === 'active' ? '▶' : '🔒'}
                </Text>
              </View>
            </View>
          ))}

          {tab === 'About' && (
            <Text style={styles.aboutText}>
              A friendly beginner introduction to UI/UX — covering design
              foundations, color &amp; typography systems, and a hands-on
              wireframing module in Figma. You'll finish with a portfolio-ready
              case study.
            </Text>
          )}

          {tab === 'Reviews' && (
            <Text style={styles.aboutText}>⭐ 4.8 / 5.0 from 2,318 learners</Text>
          )}
        </View>
      </ScrollView>

      {/* Sticky enroll bar */}
      <View style={styles.enrollBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.priceStrike}>EGP 499</Text>
          <Text style={styles.priceFree}>Free</Text>
        </View>
        <Pressable style={styles.enrollBtn} onPress={handleEnroll}>
          <Text style={styles.enrollText}>Enroll now →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingBottom: 120 },

  hero: {
    height: 220,
    backgroundColor: '#BE185D',
    // gradient-ish fallback — use expo-linear-gradient for a real gradient
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  heroBtn: {
    position: 'absolute', top: spacing.md, left: spacing.md,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBtnRight: { left: undefined, right: spacing.md },
  playBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    ...shadow.md,
  },

  body: { padding: spacing.lg },
  title: { ...typography.title, color: colors.ink, fontSize: 18 },
  meta: { fontSize: 12, color: colors.ink3, marginTop: 4, marginBottom: spacing.md },

  statRow: {
    flexDirection: 'row', gap: spacing.md,
    backgroundColor: colors.surface2,
    borderRadius: radius.md, padding: spacing.md,
    marginBottom: spacing.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '700', color: colors.ink },
  statLbl: { fontSize: 10, color: colors.ink3, marginTop: 2 },

  tabsRow: {
    flexDirection: 'row', gap: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.line,
    marginBottom: spacing.md,
  },
  tabPill: { paddingVertical: spacing.sm },
  tabText: { fontSize: 13, color: colors.ink3, fontWeight: '600' },
  tabTextActive: { color: colors.primary700 },
  tabUnderline: {
    height: 2, backgroundColor: colors.primary,
    position: 'absolute', bottom: -1, left: 0, right: 0,
  },

  module: {
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  modTop: { flexDirection: 'row', alignItems: 'center' },
  modN: { fontSize: 12, color: colors.ink3, fontWeight: '700' },
  modT: { flex: 1, marginLeft: 10, fontSize: 13, color: colors.ink, fontWeight: '500' },
  modD: { fontSize: 11, color: colors.ink3 },
  modBottom: {
    marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.line,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  modMeta: { fontSize: 11, color: colors.ink3 },
  modState: { fontSize: 12 },

  aboutText: { fontSize: 13, color: colors.ink2, lineHeight: 20 },

  enrollBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.line,
  },
  priceStrike: {
    fontSize: 10, color: colors.ink3, textDecorationLine: 'line-through',
  },
  priceFree: { fontSize: 18, fontWeight: '700', color: colors.success },
  enrollBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl, paddingVertical: 12,
    borderRadius: radius.md,
    ...shadow.primary,
  },
  enrollText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});