// src/screens/CourseCompletionScreen.js
// Step 03 — Course Completion
// Displays celebration + summary stats. Uses the built-in Animated API to drop
// a few confetti pieces — no extra dependency required.

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Easing, StatusBar, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../constants/theme';

// Small confetti system — each piece has its own Animated.Value and loops.
function ConfettiPiece({ left, color, delay }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 220, duration: 3200, delay,
          easing: Easing.in(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1, duration: 3200, delay,
          easing: Easing.linear, useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [delay, translateY, rotate]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.confetti,
        { left, backgroundColor: color, transform: [{ translateY }, { rotate: spin }] },
      ]}
    />
  );
}

export default function CourseCompletionScreen({ route, navigation }) {
  const course = route?.params?.course ?? { title: 'Intro to UI/UX Design' };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just completed "${course.title}" on Nawarny 🎉`,
      });
    } catch (e) {
      // swallow
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Confetti row */}
      <View style={styles.confettiRow} pointerEvents="none">
        <ConfettiPiece left="12%" color={colors.primary}    delay={0} />
        <ConfettiPiece left="28%" color={colors.accent}     delay={300} />
        <ConfettiPiece left="48%" color={colors.success}    delay={600} />
        <ConfettiPiece left="68%" color="#EC4899"           delay={900} />
        <ConfettiPiece left="86%" color={colors.primary700} delay={1200} />
      </View>

      <View style={styles.body}>
        {/* Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeRing} />
          <Ionicons name="checkmark" size={58} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Congratulations, Jana! 🎉</Text>
        <Text style={styles.subtitle}>
          You've completed the course.{'\n'}Your hard work paid off.
        </Text>

        <Text style={styles.courseName}>{course.title}</Text>

        {/* Stat grid */}
        <View style={styles.stats}>
          <StatCard value="12/12" label="Lessons" />
          <StatCard value="94%"   label="Quiz avg" />
          <StatCard value="6h 42m" label="Time" />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Certificate', { course })}
          >
            <Text style={styles.primaryBtnText}>View Certificate</Text>
          </Pressable>

          <Pressable style={styles.ghostBtn} onPress={handleShare}>
            <Text style={styles.ghostBtnText}>Share achievement</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatCard({ value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: {
    flex: 1, paddingHorizontal: spacing.xl, alignItems: 'center',
  },
  confettiRow: {
    position: 'absolute', top: 60, left: 0, right: 0, height: 220, zIndex: 1,
  },
  confetti: {
    position: 'absolute', top: 0, width: 7, height: 12, borderRadius: 2,
  },
  badge: {
    width: 124, height: 124, borderRadius: 62,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.xxl, marginBottom: spacing.lg,
    ...shadow.primary,
  },
  badgeRing: {
    position: 'absolute', inset: -8,
    top: -8, left: -8, right: -8, bottom: -8,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.primary,
    borderRadius: 68, opacity: 0.4,
  },
  title: {
    fontSize: 22, fontWeight: '700', color: colors.ink,
    textAlign: 'center', letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: spacing.sm, color: colors.ink3, fontSize: 13,
    textAlign: 'center', lineHeight: 19, marginBottom: spacing.xl,
  },
  courseName: {
    color: colors.accent, fontSize: 14, fontWeight: '600',
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: 'row', gap: spacing.sm,
    marginBottom: spacing.xl, width: '100%',
  },
  statCard: {
    flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface2, borderRadius: radius.md,
    alignItems: 'center',
  },
  statVal: { fontSize: 17, fontWeight: '700', color: colors.ink },
  statLbl: { fontSize: 11, color: colors.ink3, marginTop: 2 },
  actions: { width: '100%', gap: spacing.sm, marginTop: 'auto', marginBottom: spacing.xxl },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14, borderRadius: radius.md,
    alignItems: 'center', ...shadow.primary,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  ghostBtn: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    paddingVertical: 14, borderRadius: radius.md, alignItems: 'center',
  },
  ghostBtnText: { color: colors.ink, fontWeight: '600', fontSize: 14 },
});