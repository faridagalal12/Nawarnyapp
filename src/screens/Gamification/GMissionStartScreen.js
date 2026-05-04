import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LAMP_IMAGE = require('../../assets/lamp1.png');

const BLUE = '#1689EA';
const DEEP_BLUE = '#0474D8';
const NAVY = '#08224A';

const fallbackCategory = {
  label: 'UI/UX',
  icon: 'color-palette',
  family: 'Ionicons',
  color: '#EF4444',
};

function CourseIcon({ category, size = 46, color = '#FFFFFF' }) {
  if (category?.family === 'Ionicons') {
    return <Ionicons name={category.icon} size={size} color={color} />;
  }

  if (category?.family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={category.icon} size={size} color={color} />;
  }

  return <FontAwesome5 name={category?.icon || 'graduation-cap'} size={size - 4} color={color} />;
}

function getMissionLevels(categoryLabel) {
  const label = categoryLabel || 'Mission';

  if (label === 'UI/UX') {
    return ['Basics', 'Wireframes', 'Colors', 'Prototype', 'UX Process', 'Usability', 'Product Thinking', 'Final Challenge'];
  }

  if (label === 'Business') {
    return ['Basics', 'Customers', 'Market Map', 'Value', 'Pricing', 'Strategy', 'Pitch', 'Final Deal'];
  }

  if (label === 'History') {
    return ['Foundations', 'Timelines', 'Sources', 'Causes', 'Civilizations', 'Reform', 'Conflict', 'Era Mastery'];
  }

  if (label === 'Chemistry') {
    return ['Atoms', 'Bonding', 'Molecules', 'Reactions', 'Acids', 'Equations', 'Lab Safety', 'Reaction Lab'];
  }

  if (label === 'Career Skills') {
    return ['Goals', 'Resume', 'Interviews', 'Feedback', 'Teamwork', 'Time Plans', 'Work Scenarios', 'Career Ready'];
  }

  if (label === 'Coding') {
    return ['Syntax', 'Variables', 'Functions', 'Conditions', 'Loops', 'Components', 'Debug Lab', 'Mini App'];
  }

  if (label === 'Finance') {
    return ['Money Basics', 'Budgeting', 'Saving', 'Interest', 'Cash Flow', 'Investing', 'Risk', 'Money Plan'];
  }

  if (label === 'Marketing') {
    return ['Audience', 'Positioning', 'Channels', 'Campaigns', 'Copy', 'Metrics', 'Growth Tests', 'Campaign Lab'];
  }

  if (label === 'AI Basics') {
    return ['AI Basics', 'Prompts', 'Data', 'Models', 'Bias', 'Automation', 'Evaluation', 'AI Challenge'];
  }

  if (label === 'Critical Thinking') {
    return ['Mind Warmup', 'Evidence', 'Spot Bias', 'Assumptions', 'Logic Paths', 'Tradeoffs', 'Decision Lab', 'Boss Choice'];
  }

  if (label === 'Communication') {
    return ['Clear Message', 'Listening', 'Tone', 'Structure', 'Feedback', 'Story Flow', 'Present', 'Speaker Badge'];
  }

  if (label === 'Problem Solving') {
    return ['Define', 'Break Down', 'Constraints', 'Options', 'Test Ideas', 'Root Cause', 'Solve', 'Solution Sprint'];
  }

  return ['Foundations', `${label} Tools`, 'Core Ideas', 'Practice Lab', 'Patterns', 'Scenarios', 'Advanced Run', 'Final Mission'];
}

export default function GMissionStartScreen({ navigation, route }) {
  const category = route?.params?.category || fallbackCategory;
  const totalPoints = route?.params?.totalPoints ?? 20;
  const earnedBadges = route?.params?.earnedBadges ?? 4;
  const [started, setStarted] = useState(false);

  const lampMotion = useRef(new Animated.Value(0)).current;
  const iconMotion = useRef(new Animated.Value(0)).current;
  const finalLogo = useRef(new Animated.Value(0)).current;
  const cardReveal = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  const levels = useMemo(() => getMissionLevels(category.label), [category.label]);

  useEffect(() => {
    Vibration.vibrate([0, 70, 40, 110]);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(lampMotion, {
          toValue: 1,
          duration: 1450,
          useNativeDriver: true,
        }),
        Animated.timing(iconMotion, {
          toValue: 1,
          duration: 1450,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(finalLogo, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(cardReveal, {
          toValue: 1,
          duration: 920,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [cardReveal, finalLogo, iconMotion, lampMotion, pulse]);

  const handleEnterMissionQuestions = () => {
    Vibration.vibrate([0, 55, 35, 120]);
    setStarted(true);
    setTimeout(() => {
      navigation.navigate('GMission', {
        category,
        levels,
        totalPoints,
        earnedBadges,
        currentLevel: 2,
      });
    }, 180);
  };

  const lampStyle = {
    opacity: lampMotion.interpolate({
      inputRange: [0, 0.68, 1],
      outputRange: [1, 1, 0],
    }),
    transform: [
      {
        translateX: lampMotion.interpolate({
          inputRange: [0, 1],
          outputRange: [-68, 0],
        }),
      },
      {
        scale: lampMotion.interpolate({
          inputRange: [0, 1],
          outputRange: [0.82, 0.48],
        }),
      },
    ],
  };

  const iconStyle = {
    opacity: iconMotion.interpolate({
      inputRange: [0, 0.68, 1],
      outputRange: [1, 1, 0],
    }),
    transform: [
      {
        translateX: iconMotion.interpolate({
          inputRange: [0, 1],
          outputRange: [68, 0],
        }),
      },
      {
        scale: iconMotion.interpolate({
          inputRange: [0, 1],
          outputRange: [0.84, 0.52],
        }),
      },
    ],
  };

  const revealStyle = {
    opacity: cardReveal,
    transform: [
      {
        translateY: cardReveal.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={DEEP_BLUE} />

      <LinearGradient colors={['#1E9BFF', DEEP_BLUE, '#057BD9']} style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.75} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.currencyPill}>
              <Text style={styles.currencyIcon}>💎</Text>
              <Text style={styles.currencyText}>{earnedBadges * 250}</Text>
              <View style={styles.currencyDivider} />
              <View style={styles.coinIcon}>
                <Text style={styles.coinIconText}>$</Text>
              </View>
              <Text style={styles.currencyText}>{(totalPoints + 6320).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.logoStage}>
            <Animated.View style={[styles.mergeLamp, lampStyle]}>
              <Image source={LAMP_IMAGE} style={styles.lampImage} resizeMode="contain" />
            </Animated.View>

            <Animated.View style={[styles.mergeIcon, { backgroundColor: category.color }, iconStyle]}>
              <CourseIcon category={category} size={44} />
            </Animated.View>

            <Animated.View
              style={[
                styles.finalLogoRing,
                {
                  opacity: finalLogo,
                  transform: [{ scale: Animated.multiply(finalLogo, pulse) }],
                },
              ]}
            >
              <View style={[styles.finalLogoCore, { backgroundColor: category.color }]}>
                <CourseIcon category={category} size={46} />
                <Image source={LAMP_IMAGE} style={styles.logoLampBadge} resizeMode="contain" />
              </View>
            </Animated.View>
          </View>

          <Animated.View style={revealStyle}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            <Text style={styles.categorySubtitle}>
              Get ready for your {category.missionType ? category.missionType.toLowerCase() : 'mission'}
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIconWrap}>
                  <MaterialCommunityIcons name="layers-triple" size={31} color={BLUE} />
                </View>
                <Text style={styles.summaryValue}>8</Text>
                <Text style={styles.summaryLabel}>Levels</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconWrap, styles.summaryStarBg]}>
                  <Ionicons name="star" size={32} color="#8B5CF6" />
                </View>
                <Text style={styles.summaryValue}>+350</Text>
                <Text style={styles.summaryLabel}>XP</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.fireIcon}>🔥</Text>
                <Text style={styles.summaryValue}>7</Text>
                <Text style={styles.summaryLabel}>Daily Streak</Text>
              </View>
            </View>

            <View style={styles.levelList}>
              {levels.map((level, index) => {
                const number = index + 1;
                const completed = number === 1;
                const current = number === 2;

                return (
                  <TouchableOpacity
                    key={level}
                    style={[styles.levelCard, current && styles.currentLevelCard]}
                    activeOpacity={0.82}
                    onPress={current ? handleEnterMissionQuestions : undefined}
                  >
                    <View
                      style={[
                        styles.levelNumber,
                        completed && styles.completedLevelNumber,
                        current && styles.currentLevelNumber,
                      ]}
                    >
                      <Text style={styles.levelNumberText}>{number}</Text>
                    </View>

                    <View style={styles.levelCopy}>
                      <Text
                        style={[
                          styles.levelMeta,
                          completed && styles.completedText,
                          current && styles.currentText,
                        ]}
                      >
                        Level {number}
                      </Text>
                      <Text style={styles.levelName}>{level}</Text>
                    </View>

                    {completed ? (
                      <View style={styles.completedPill}>
                        <Text style={styles.completedPillText}>Completed</Text>
                        <Ionicons name="checkmark-circle" size={32} color="#22C55E" />
                      </View>
                    ) : current ? (
                      <View style={styles.currentPill}>
                        <Text style={styles.currentPillText}>Current</Text>
                        <Ionicons name="chevron-forward" size={32} color={BLUE} />
                      </View>
                    ) : (
                      <Ionicons name="lock-closed" size={30} color="#72839A" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.streakLine}>✨ Keep your streak going</Text>

            <TouchableOpacity style={styles.startButton} activeOpacity={0.86} onPress={handleEnterMissionQuestions}>
              <Text style={styles.startEmoji}>🚀</Text>
              <Text style={styles.startButtonText}>{started ? 'Mission Started' : 'Get Started'}</Text>
              <Ionicons name={started ? 'checkmark' : 'chevron-forward'} size={34} color={NAVY} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DEEP_BLUE,
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 34,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,72,150,0.28)',
  },
  currencyIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  coinIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F5C542',
    borderWidth: 2,
    borderColor: '#FFDD67',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
    shadowColor: '#7C4A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  coinIconText: {
    color: '#B45309',
    fontSize: 15,
    fontWeight: '900',
  },
  currencyText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  currencyDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 11,
  },
  logoStage: {
    height: 186,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mergeLamp: {
    position: 'absolute',
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lampImage: {
    width: 92,
    height: 92,
  },
  mergeIcon: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFD84D',
  },
  finalLogoRing: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: '#FFD84D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#002F6C',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
    elevation: 10,
  },
  finalLogoCore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
  },
  logoLampBadge: {
    position: 'absolute',
    right: -13,
    bottom: -12,
    width: 42,
    height: 42,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 2,
  },
  categorySubtitle: {
    color: '#BFE4FF',
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  summaryCard: {
    minHeight: 120,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 24,
    shadowColor: '#003E83',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryStarBg: {
    backgroundColor: '#F2EDFF',
  },
  summaryValue: {
    color: NAVY,
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    color: '#62728A',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 68,
    backgroundColor: '#DDE4EE',
  },
  fireIcon: {
    fontSize: 42,
    marginBottom: 6,
  },
  levelList: {
    gap: 14,
  },
  levelCard: {
    minHeight: 86,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#003E83',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 6,
  },
  currentLevelCard: {
    borderColor: '#FFD84D',
  },
  levelNumber: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  completedLevelNumber: {
    backgroundColor: '#22C55E',
  },
  currentLevelNumber: {
    backgroundColor: BLUE,
  },
  levelNumberText: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
  },
  levelCopy: {
    flex: 1,
  },
  levelMeta: {
    color: '#7A8BA3',
    fontSize: 15,
    fontWeight: '900',
  },
  completedText: {
    color: '#16A34A',
  },
  currentText: {
    color: BLUE,
  },
  levelName: {
    color: NAVY,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedPillText: {
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: '900',
  },
  currentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentPillText: {
    color: '#FFFFFF',
    backgroundColor: BLUE,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '900',
  },
  streakLine: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  startButton: {
    minHeight: 78,
    borderRadius: 20,
    backgroundColor: '#FFD84D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    gap: 13,
    shadowColor: '#7C4A00',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  startEmoji: {
    fontSize: 31,
  },
  startButtonText: {
    flex: 1,
    color: NAVY,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
});
