import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { height } = Dimensions.get('window');

export default function MockBannerAd({ onStartFree }) {
  return (
    <View style={styles.container}>
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>Sponsored</Text>
      </View>
      <View style={styles.iconBox}>
        <Ionicons name="school" size={48} color="#2F54EB" />
      </View>
      <Text style={styles.title}>Learn faster with Nawarny Pro</Text>
      <Text style={styles.subtitle}>Unlock all courses, go ad-free and earn more XP</Text>
      <TouchableOpacity style={styles.ctaBtn} onPress={onStartFree}>
        <Text style={styles.ctaText}>Try Free →</Text>
      </TouchableOpacity>
      <Text style={styles.skip}>Scroll to skip</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  adLabel: {
    position: 'absolute', top: 60, right: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  adLabelText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  iconBox: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 12, lineHeight: 32,
  },
  subtitle: {
    fontSize: 15, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', lineHeight: 22, marginBottom: 32,
  },
  ctaBtn: {
    backgroundColor: '#2F54EB', borderRadius: 16,
    paddingHorizontal: 36, paddingVertical: 16,
    marginBottom: 20,
  },
  ctaText: { fontSize: 16, color: '#fff', fontWeight: '800' },
  skip: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
});
