// src/screens/CreatorProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../constants/theme';

// Mock courses per creator — replace with api.getCreatorCourses(creatorId)
const MOCK_COURSES = [
  { id: 'mc1', title: 'Intro to Design Systems', rating: 4.8, duration: '5h 20m', lessons: 14, emoji: '🎨', thumbBg: '#F472B6' },
  { id: 'mc2', title: 'Advanced Prototyping',    rating: 4.7, duration: '3h 10m', lessons: 9,  emoji: '⚡', thumbBg: '#60A5FA' },
  { id: 'mc3', title: 'Design for Developers',   rating: 4.6, duration: '6h 00m', lessons: 18, emoji: '🛠', thumbBg: '#34D399' },
];

export default function CreatorProfileScreen({ route, navigation }) {
  const { creator } = route.params;          // { id, name, specialty, followers, initial, bg }
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header back button */}
      <Pressable style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={colors.ink} />
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.heroSection}>
          <View style={[styles.avatar, { backgroundColor: creator.bg }]}>
            <Text style={styles.avatarInitial}>{creator.initial}</Text>
          </View>
          <Text style={styles.name}>{creator.name}</Text>
          <Text style={styles.specialty}>{creator.specialty}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{creator.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{MOCK_COURSES.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.7 ★</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {/* Follow button */}
          <Pressable
            style={[styles.followBtn, isFollowing && styles.followBtnActive]}
            onPress={() => setIsFollowing(f => !f)}
          >
            <Feather
              name={isFollowing ? 'user-check' : 'user-plus'}
              size={14}
              color={isFollowing ? colors.ink : '#FFFFFF'}
            />
            <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        </View>

        {/* Courses by this creator */}
        <Text style={styles.sectionTitle}>Courses by {creator.name.split(' ')[0]}</Text>

        {MOCK_COURSES.map((course) => (
          <Pressable
            key={course.id}
            style={styles.card}
            onPress={() => navigation.navigate('CourseDetail', { course })}
            android_ripple={{ color: colors.surface3 }}
          >
            <View style={[styles.thumb, { backgroundColor: course.thumbBg }]}>
              <Text style={styles.thumbEmoji}>{course.emoji}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={1}>{course.title}</Text>
              <View style={styles.cardRow}>
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
  safe:   { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 60 },

  back: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarInitial: { fontSize: 34, fontWeight: '700', color: '#FFFFFF' },
  name:      { fontSize: 20, fontWeight: '700', color: colors.ink },
  specialty: { fontSize: 13, color: colors.ink3, marginTop: 3 },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.lg, marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  stat:       { alignItems: 'center', minWidth: 64 },
  statValue:  { fontSize: 15, fontWeight: '700', color: colors.ink },
  statLabel:  { fontSize: 10, color: colors.ink3, marginTop: 2 },
  statDivider:{ width: 1, height: 28, backgroundColor: colors.line },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg, paddingVertical: 9,
    borderRadius: radius.pill,
  },
  followBtnActive:     { backgroundColor: colors.surface3 },
  followBtnText:       { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  followBtnTextActive: { color: colors.ink },

  sectionTitle: {
    ...typography.title, fontSize: 15, color: colors.ink,
    marginBottom: spacing.md,
  },

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
  cardInfo:   { flex: 1 },
  cardTitle:  { fontSize: 13, fontWeight: '600', color: colors.ink },
  cardRow:    { flexDirection: 'row', gap: 8, marginTop: 6 },
  cardRate:   { fontSize: 10, color: colors.primary700, fontWeight: '600' },
  cardMuted:  { fontSize: 10, color: colors.ink3 },
});