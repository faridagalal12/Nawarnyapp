// src/screens/CertificateScreen.js
// Step 04 — Certificate of Completion
// Receives the course object. Learner name is hard-coded here — swap it for
// the authenticated user from your AuthContext.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, StatusBar, Share, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadow } from '../constants/theme';

const LEARNER_NAME = 'Jana Osama'; // TODO: pull from AuthContext

export default function CertificateScreen({ route, navigation }) {
  const course = route?.params?.course ?? { title: 'Intro to UI/UX Design' };

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const certId = 'NWR-2026-00184'; // TODO: generate server-side

  const handleDownload = () => {
    // TODO: use expo-print + expo-sharing to render a real PDF.
    Alert.alert('Download', 'Certificate PDF will be saved to your device.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I earned a certificate in "${course.title}" on Nawarny! (${certId})`,
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Your Certificate</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Certificate card */}
      <View style={styles.certWrap}>
        <View style={styles.certificate}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerBR} />

          <View style={styles.certLogo}>
            <Ionicons name="bulb" size={22} color="#FFFFFF" />
          </View>

          <Text style={styles.kicker}>Certificate of Completion</Text>
          <Text style={styles.brand}>Nawarny</Text>

          <Text style={styles.awarded}>This certifies that</Text>
          <Text style={styles.name}>{LEARNER_NAME}</Text>

          <Text style={styles.desc}>
            has successfully completed{'\n'}
            <Text style={styles.descBold}>{course.title}</Text>{'\n'}
            — {course.lessons ?? 12} lessons · {course.duration ?? '6h 20m'} — with an overall score of{' '}
            <Text style={styles.descBold}>94%</Text>.
          </Text>

          <View style={styles.certFooter}>
            <View>
              <Text style={styles.footerVal}>{today}</Text>
              <Text style={styles.footerLbl}>Date issued</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerVal}>{certId}</Text>
              <Text style={styles.footerLbl}>Certificate ID</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={handleDownload}>
          <Ionicons name="download-outline" size={16} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Download</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={16} color="#FFFFFF" />
          <Text style={styles.ghostBtnText}>Share</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F172A' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  headerBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  certWrap: { padding: spacing.lg, flex: 1, justifyContent: 'center' },

  certificate: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.lg, padding: spacing.xl,
    borderWidth: 2, borderColor: '#FDE68A',
    alignItems: 'center', position: 'relative',
    ...shadow.md,
  },
  cornerTL: {
    position: 'absolute', top: 8, left: 8, width: 36, height: 36,
    borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.primary,
  },
  cornerBR: {
    position: 'absolute', bottom: 8, right: 8, width: 36, height: 36,
    borderBottomWidth: 2, borderRightWidth: 2, borderColor: colors.primary,
  },

  certLogo: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  kicker: {
    fontSize: 9, letterSpacing: 2, color: colors.ink3,
    fontWeight: '700',
  },
  brand: {
    fontSize: 22, marginTop: 2, marginBottom: spacing.md,
    color: colors.ink,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '700',
  },
  awarded: { fontSize: 11, color: colors.ink3, marginBottom: 2 },
  name: {
    fontSize: 22, fontWeight: '700', color: colors.primary700,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    borderBottomWidth: 1, borderBottomColor: '#FDE68A',
    paddingBottom: 4, marginBottom: spacing.md, paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },
  desc: {
    fontSize: 12, color: colors.ink2, lineHeight: 18,
    textAlign: 'center', marginBottom: spacing.md,
  },
  descBold: { color: colors.ink, fontWeight: '700' },

  certFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch',
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: '#FDE68A',
    borderStyle: 'dashed',
  },
  footerVal: { fontSize: 11, color: colors.ink, fontWeight: '700' },
  footerLbl: { fontSize: 9, color: colors.ink3, marginTop: 1 },

  actions: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.lg,
  },
  primaryBtn: {
    flex: 1, flexDirection: 'row', gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  ghostBtn: {
    flex: 1, flexDirection: 'row', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 12, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  ghostBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});