import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';

const LAMP_IMAGE = require('../../assets/lamp.png');

const BLUE = '#4BAEE8';
const YELLOW_BG = '#FFF9D6';
const GOLD = '#F5A623';

const categories = ['Business', 'History', 'Chemistry', 'Career Skills', 'UI/UX Design'];

export default function GWelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- TOP BAR --- */}
        <View style={styles.topBar}>
          <View style={styles.gemRow}>
            <Text style={styles.gemIcon}>💎</Text>
            <Text style={styles.gemText}>12</Text>
            <Text style={[styles.gemIcon, { marginLeft: 12 }]}>🟡</Text>
            <Text style={styles.gemText}>1,214</Text>
          </View>
        </View>

        {/* --- HERO SECTION --- */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSub}>Ready to level up{'\n'}your skills</Text>
          </View>
          <Image source={LAMP_IMAGE} style={styles.lampImage} resizeMode="contain" />
        </View>

        {/* --- BOTTOM CARD --- */}
        <View style={styles.card}>
          {/* Back arrow */}
          <TouchableOpacity style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* Category chips */}
          <View style={styles.chipsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat} style={styles.chip}>
                <Text style={styles.chipText}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Skill Unlocked Banner */}
          <View style={styles.skillBanner}>
            <View style={styles.skillBannerLeft}>
              <Text style={styles.skillUnlockedLabel}>Skill Unlocked!</Text>
              <Text style={styles.skillTitle}>Critical Thinking</Text>
              <Text style={styles.skillDesc}>
                Deep Dive Into Problem Solving{'\n'}&amp; Decision-Making
              </Text>
              <View style={styles.skillRewards}>
                <Text style={styles.rewardIcon}>💎</Text>
                <Text style={styles.rewardText}>312</Text>
                <Text style={[styles.rewardIcon, { marginLeft: 10 }]}>🟡</Text>
                <Text style={styles.rewardText}>3000</Text>
              </View>
            </View>
            {/* Brain mascot placeholder — swap with your asset */}
            <View style={styles.brainPlaceholder}>
              <Text style={{ fontSize: 52 }}>🧠</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },

  // --- TOP BAR
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
  },
  gemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  gemIcon: { fontSize: 14 },
  gemText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },

  // --- HERO
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  heroText: { flex: 1 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
  },
  lampImage: {
    width: 130,
    height: 130,
    marginBottom: -10,
  },

  // --- CARD
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 420,
  },
  backBtn: {
    marginBottom: 16,
  },
  backArrow: {
    fontSize: 22,
    color: '#333',
  },

  // --- CHIPS
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  chip: {
    backgroundColor: BLUE,
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  seeAll: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },

  // --- SKILL BANNER
  skillBanner: {
    backgroundColor: YELLOW_BG,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillBannerLeft: { flex: 1 },
  skillUnlockedLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  skillTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  skillDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
    marginBottom: 10,
  },
  skillRewards: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: { fontSize: 14 },
  rewardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  brainPlaceholder: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
