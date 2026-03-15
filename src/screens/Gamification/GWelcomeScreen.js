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
  useWindowDimensions,
} from 'react-native';

// ─────────────────────────────────────────────────────
//  ASSETS — replace with your actual paths
// ─────────────────────────────────────────────────────
const LAMP_IMAGE  = require('../../assets/lamp1.png');
const BRAIN_IMAGE = require('../../assets/brain.png');
// ─────────────────────────────────────────────────────

const BLUE      = '#5BA8E8';
const YELLOW_BG = '#FAF5B8';
const DARK      = '#1A1A2E';

const categories = ['Business', 'History', 'Chemistry', 'Career Skills', 'UI/UX Design'];

export default function GWelcomeScreen() {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ════════════════════════════
            BACKGROUND — light grey top
        ════════════════════════════ */}
        <View style={styles.topSection}>

          {/* ── Top bar: gems & coins ── */}
          <View style={styles.topBar}>
            <View style={styles.currencyPill}>
              {/* Diamond icon */}
              <View style={styles.diamondIcon}>
                <View style={styles.diamondInner} />
              </View>
              <Text style={styles.currencyText}>12</Text>

              <View style={styles.currencyDivider} />

              {/* Coin icon */}
              <View style={styles.coinIcon} />
              <Text style={styles.currencyText}>1,214</Text>
            </View>
          </View>

          {/* ── Hero ── */}
          <View style={styles.hero}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.welcomeTitle}>Welcome{'\n'}Back!</Text>
              <Text style={styles.welcomeSub}>Ready to level up{'\n'}your skills</Text>
            </View>
            <Image source={LAMP_IMAGE} style={styles.lampImage} resizeMode="contain" />
          </View>
        </View>

        {/* ════════════════════════════
            WHITE CARD
        ════════════════════════════ */}
        <View style={styles.card}>

          {/* Notch tab */}
          <View style={styles.notchTab} />

          {/* Back arrow */}
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* ── Category chips ── */}
          <View style={styles.chipsSection}>

            {/* Row 1: Business + History + See all */}
            <View style={styles.chipRowBetween}>
              <View style={styles.chipRow}>
                <TouchableOpacity style={styles.chip} activeOpacity={0.8}>
                  <Text style={styles.chipText}>{categories[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chip} activeOpacity={0.8}>
                  <Text style={styles.chipText}>{categories[1]}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.seeAllBtn} activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Row 2: Chemistry + Career Skills */}
            <View style={styles.chipRow}>
              <TouchableOpacity style={styles.chip} activeOpacity={0.8}>
                <Text style={styles.chipText}>{categories[2]}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} activeOpacity={0.8}>
                <Text style={styles.chipText}>{categories[3]}</Text>
              </TouchableOpacity>
            </View>

            {/* Row 3: UI/UX Design */}
            <View style={styles.chipRow}>
              <TouchableOpacity style={styles.chip} activeOpacity={0.8}>
                <Text style={styles.chipText}>{categories[4]}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Skill Unlocked Banner ── */}
          <View style={styles.skillBanner}>

            {/* Left content */}
            <View style={styles.bannerLeft}>
              <Text style={styles.skillUnlockedTitle}>Skill Unlocked!</Text>
              <Text style={styles.skillName}>Critical Thinking</Text>
              <Text style={styles.skillDesc}>
                Deep Dive Into Problem Solving{'\n'}&amp; Decision-Making
              </Text>

              {/* Reward pill */}
              <View style={styles.rewardPill}>
                {/* Diamond */}
                <View style={[styles.diamondIcon, { width: 14, height: 14 }]}>
                  <View style={[styles.diamondInner, { width: 8, height: 8 }]} />
                </View>
                <Text style={styles.rewardValue}>312</Text>

                <View style={styles.rewardDivider} />

                {/* Coin */}
                <View style={[styles.coinIcon, { width: 14, height: 14, backgroundColor: '#F5C542' }]} />
                <Text style={styles.rewardValue}>3000</Text>
              </View>

              {/* CTA button */}
              <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
                <Text style={styles.ctaBtnText}>Check it out now</Text>
              </TouchableOpacity>
            </View>

            {/* Brain mascot */}
            <Image
              source={BRAIN_IMAGE}
              style={styles.brainImage}
              resizeMode="contain"
            />
          </View>

        </View>
        {/* end card */}
      </ScrollView>

      {/* YOUR NAVIGATION COMPONENT GOES HERE */}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────
const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },

  // ── Top section (grey bg behind hero)
  topSection: {
    backgroundColor: '#F7F8FA',
    paddingBottom: 25,
  },

  // ── Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 6,
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    marginLeft: 5,
  },
  currencyDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },

  // Diamond icon (CSS-drawn)
  diamondIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#6EC6F5',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamondInner: {
    width: 8,
    height: 8,
    backgroundColor: '#A8DFFB',
    borderRadius: 1,
  },

  // Coin icon
  coinIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F5C542',
    borderWidth: 2,
    borderColor: '#E6A800',
    shadowColor: '#F5C542',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },

  // ── Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 8,
  },
  heroTextBlock: { flex: 1 },
  welcomeTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: DARK,
    marginBottom: 10,
    letterSpacing: -1,
    lineHeight: 46,
  },
  welcomeSub: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4A4A6A',
    lineHeight: 26,
  },
  lampImage: {
    width: 180,
    height: 180,
    marginBottom: -20,
  },

  // ── White card
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
    marginTop: -4,
    flex: 1,
    // Card shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
  },

  // Notch tab on card
  notchTab: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D8DAE0',
    marginBottom: 16,
    marginTop: 4,
  },

  // Back button
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  backArrow: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
  },

  // ── Chips
  chipsSection: {
    gap: 12,
    marginBottom: 28,
  },
  chipRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chip: {
    backgroundColor: BLUE,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 11,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.1,
  },
  seeAllBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#F3F4F8',
    borderWidth: 1,
    borderColor: '#E2E4EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  seeAllText: {
    color: DARK,
    fontSize: 15,
    fontWeight: '700',
  },

  // ── Skill Banner
  skillBanner: {
    backgroundColor: YELLOW_BG,
    borderRadius: 26,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    shadowColor: '#D4B800',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#EEE090',
    overflow: 'visible',
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  skillUnlockedTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: DARK,
    marginBottom: 4,
  },
  skillName: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK,
    marginBottom: 5,
  },
  skillDesc: {
    fontSize: 17,
    color: '#555',
    lineHeight: 20,
    marginBottom: 14,
  },

  // Reward pill
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8DFA0',
    marginBottom: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardValue: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    marginLeft: 4,
  },
  rewardDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#DDD',
    marginHorizontal: 8,
  },

  // CTA button
  ctaBtn: {
    backgroundColor: BLUE,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // Brain image
  brainImage: {
    width: 150,
    height: 170,
    marginBottom: -22,
    alignSelf: 'flex-end',
  },

});