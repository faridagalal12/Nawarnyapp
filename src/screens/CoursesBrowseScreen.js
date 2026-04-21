// src/screens/CoursesBrowseScreen.js
// Step 01 — Browse Catalog
// Matches the HTML mockup: greeting, search, chips, featured card, popular list.
// Wire with the CoursesStack navigator (see src/navigations/CoursesStack.js).

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../constants/theme';

// --- Mock data — replace with api.getCourses() from services/api.js
const CATEGORIES = ['All', 'Design', 'Coding', 'Business', 'Languages'];

const FEATURED = {
  id: 'feat-1',
  title: 'UI/UX Design Fundamentals',
  instructor: 'Sara Khalil',
  duration: '6 weeks',
  tag: 'FEATURED',
};

const COURSES = [
  { id: 'c1', title: 'Intro to UI/UX Design', instructor: 'Sara Khalil',
    rating: 4.8, duration: '6h 20m', lessons: 12,
    thumbBg: colors.thumbPink, emoji: '🎨' },
  { id: 'c2', title: 'Python for Beginners', instructor: 'Omar Fathi',
    rating: 4.9, duration: '8h 10m', lessons: 24,
    thumbBg: colors.thumbGreen, emoji: '</>' },
  { id: 'c3', title: 'Data Analysis with Excel', instructor: 'Nour Adel',
    rating: 4.7, duration: '4h 30m', lessons: 10,
    thumbBg: colors.thumbBlue, emoji: '📊' },
  { id: 'c4', title: 'Business Fundamentals', instructor: 'Laila Hassan',
    rating: 4.6, duration: '5h 00m', lessons: 14,
    thumbBg: colors.thumbAmber, emoji: '💼' },
];

export default function CoursesBrowseScreen({ navigation }) {
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');

  const openCourse = (course) => navigation.navigate('CourseDetail', { course });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.hello}>
          <View>
            <Text style={styles.helloTitle}>Hello, Jana 👋</Text>
            <Text style={styles.helloSub}>What will you learn today?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>J</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.search}>
          <Feather name="search" size={16} color={colors.ink3} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, topics…"
            placeholderTextColor={colors.ink3}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((c) => {
            const active = c === activeCat;
            return (
              <Pressable
                key={c}
                onPress={() => setActiveCat(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Featured card */}
        <Pressable
          style={styles.featured}
          onPress={() => openCourse({ ...FEATURED, id: 'c1' })}
        >
          <View style={styles.featuredTag}>
            <Text style={styles.featuredTagText}>{FEATURED.tag}</Text>
          </View>
          <Text style={styles.featuredTitle}>{FEATURED.title}</Text>
          <Text style={styles.featuredSub}>
            Learn the essentials in {FEATURED.duration} · {FEATURED.instructor}
          </Text>
          <View style={styles.featuredCta}>
            <Text style={styles.featuredCtaText}>Start learning →</Text>
          </View>
        </Pressable>

        {/* Popular section */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Popular now</Text>
          <Text style={styles.sectionMore}>See all</Text>
        </View>

        {COURSES.map((course) => (
          <Pressable
            key={course.id}
            style={styles.card}
            onPress={() => openCourse(course)}
            android_ripple={{ color: colors.surface3 }}
          >
            <View style={[styles.thumb, { backgroundColor: course.thumbBg[0] }]}>
              <Text style={styles.thumbEmoji}>{course.emoji}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>{course.title}</Text>
              <Text style={styles.cardInstr}>{course.instructor}</Text>
              <View style={styles.cardRow3}>
                <Text style={styles.cardRate}>★ {course.rating}</Text>
                <Text style={styles.cardMuted}>· {course.duration}</Text>
                <Text style={styles.cardMuted}>· {course.lessons} lessons</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.ink4} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: spacing.huge },

  hello: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  helloTitle: { ...typography.heading, color: colors.ink, fontSize: 20 },
  helloSub: { color: colors.ink3, fontSize: 13, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#78350F', fontWeight: '700', fontSize: 15 },

  search: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface3,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    marginBottom: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink, padding: 0 },

  chipsRow: { gap: 6, paddingRight: spacing.xl, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    backgroundColor: colors.surface3, borderRadius: radius.pill,
    marginRight: 6,
  },
  chipActive: { backgroundColor: colors.ink },
  chipText: { fontSize: 12, color: colors.ink2, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },

  featured: {
    backgroundColor: '#312E81',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  featuredTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.sm, marginBottom: spacing.sm,
  },
  featuredTagText: {
    color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.6,
  },
  featuredTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  featuredSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4 },
  featuredCta: {
    alignSelf: 'flex-start', marginTop: spacing.md,
    backgroundColor: colors.primary, paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.sm,
  },
  featuredCtaText: { color: '#78350F', fontWeight: '700', fontSize: 11 },

  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.title, color: colors.ink, fontSize: 15 },
  sectionMore: { fontSize: 12, color: colors.primary700, fontWeight: '600' },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: 10, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  thumb: {
    width: 56, height: 56, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 22, color: '#FFFFFF' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 13, fontWeight: '600', color: colors.ink },
  cardInstr: { fontSize: 11, color: colors.ink3, marginTop: 2 },
  cardRow3: { flexDirection: 'row', gap: 8, marginTop: 6 },
  cardRate: { fontSize: 10, color: colors.primary700, fontWeight: '600' },
  cardMuted: { fontSize: 10, color: colors.ink3 },
});