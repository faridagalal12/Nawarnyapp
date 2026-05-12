import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Image, SafeAreaView, StatusBar,
  Platform, Vibration, useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';

const LAMP_IMAGE  = require('../../assets/lamp1.png');
const BRAIN_IMAGE = require('../../assets/brain.png');

const BLUE = '#2F83D4';
const DARK = '#1A1A2E';
const MUTED = '#6B7280';

const courseCategories = [
  { label: 'Business',    icon: 'briefcase',    family: 'FontAwesome5', color: '#2F83D4' },
  { label: 'History',     icon: 'university',   family: 'FontAwesome5', color: '#8B5CF6' },
  { label: 'Chemistry',   icon: 'flask',        family: 'FontAwesome5', color: '#10B981' },
  { label: 'Science',     icon: 'atom',         family: 'FontAwesome5', color: '#06B6D4' },
  { label: 'Technology',  icon: 'laptop-code',  family: 'FontAwesome5', color: '#2563EB' },
  { label: 'Mathematics', icon: 'calculator',   family: 'FontAwesome5', color: '#7C3AED' },
  { label: 'Physics',     icon: 'magnet',       family: 'FontAwesome5', color: '#0EA5E9' },
  { label: 'Design',      icon: 'color-palette',family: 'Ionicons',     color: '#EF4444' },
];

const softSkills = [
  { label: 'Critical Thinking', tag: 'Skill Unlocked!', desc: 'Sharpen your mind. Solve real-world problems.', icon: 'brain', accent: '#2F83D4', softBg: '#EAF4FF', gems: '+60', coins: '+300', progress: '3 / 5 days', rank: 'Top 15%', featured: true },
  { label: 'Communication',     tag: 'Practice Path',   desc: 'Speak clearly, listen actively, and present ideas.', icon: 'message-text', accent: '#10B981', softBg: '#EAFBF4', gems: '+45', coins: '+220', progress: '2 / 4 days', rank: 'Top 24%' },
  { label: 'Analysis',          tag: 'New Challenge',   desc: 'Read patterns, compare options, and defend choices.', icon: 'chart-timeline-variant', accent: '#8B5CF6', softBg: '#F2EDFF', gems: '+55', coins: '+260', progress: '1 / 5 days', rank: 'Top 31%' },
  { label: 'Leadership',        tag: 'Team Skill',      desc: 'Guide decisions, set priorities, and motivate teams.', icon: 'account-group', accent: '#F97316', softBg: '#FFF3E8', gems: '+50', coins: '+240', progress: '4 / 6 days', rank: 'Top 18%' },
  { label: 'Problem Solving',   tag: 'Puzzle Run',      desc: 'Break challenges into small, winnable moves.', icon: 'puzzle', accent: '#0EA5E9', softBg: '#EAF7FF', gems: '+65', coins: '+310', progress: '2 / 5 days', rank: 'Top 12%' },
];

function CategoryIcon({ item, active }) {
  const iconColor = active ? '#FFFFFF' : item.color;
  if (item.family === 'Ionicons') return <Ionicons name={item.icon} size={22} color={iconColor} />;
  return <FontAwesome5 name={item.icon} size={19} color={iconColor} />;
}

export default function GWelcomeScreen({ navigation, route }) {
  const { height } = useWindowDimensions();
  const [selectedCourse, setSelectedCourse] = useState(courseCategories[0].label);
  const [selectedSkill,  setSelectedSkill]  = useState(softSkills[0].label);
  const [refreshing,     setRefreshing]     = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [stats,          setStats]          = useState(null);
  const [quests,         setQuests]         = useState([]);
  const [questsClaimed,  setQuestsClaimed]  = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, questsRes] = await Promise.all([
        api.get('/gamification/stats'),
        api.get('/gamification/daily-quests'),
      ]);
      setStats(statsRes?.data ?? null);
      setQuests(questsRes?.data?.quests ?? []);
      setQuestsClaimed(questsRes?.data?.allClaimed ?? false);
    } catch (err) {
      console.log('Failed to fetch gamification data:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  // Refresh when GMissionScreen signals completion via route param
  useEffect(() => {
    if (route?.params?.refresh) {
      fetchData();
    }
  }, [route?.params?.refresh]);

  const handleRefresh = () => { setRefreshing(true); fetchData(); };

  const handleClaimDailyQuests = async () => {
    if (questsClaimed) return;
    Vibration.vibrate([0, 80, 45, 120]);
    try {
      await api.post('/gamification/daily-quests/claim');
      setQuestsClaimed(true);
      fetchData();
    } catch (err) {
      console.log('Claim error:', err?.message);
    }
  };

  const handleCoursePress = (item) => {
    setSelectedCourse(item.label);
    Vibration.vibrate(45);
    navigation?.navigate('MissionStart', {
      category:     item,
      totalPoints:  stats?.xp ?? 0,
      earnedBadges: stats?.earnedBadgesCount ?? 0,
    });
  };

  const handleSkillPress = (skill) => {
    setSelectedSkill(skill.label);
    Vibration.vibrate(45);
    navigation?.navigate('MissionStart', {
      category:     { label: skill.label, icon: skill.icon, family: 'MaterialCommunityIcons', color: skill.accent, missionType: 'Soft Skill' },
      totalPoints:  stats?.xp ?? 0,
      earnedBadges: stats?.earnedBadgesCount ?? 0,
    });
  };

  const handleSkillStartPress = (skill) => {
    setSelectedSkill(skill.label);
    Vibration.vibrate([0, 55, 35, 120]);
    navigation?.navigate('GMission', {
      category:     { label: skill.label, icon: skill.icon, family: 'MaterialCommunityIcons', color: skill.accent, missionType: 'Soft Skill' },
      totalPoints:  stats?.xp ?? 0,
      earnedBadges: stats?.earnedBadgesCount ?? 0,
      currentLevel: 1,
    });
  };

  const xp               = stats?.xp ?? 0;
  const level            = stats?.level ?? 1;
  const streak           = stats?.streak ?? 0;
  const earnedBadges     = stats?.earnedBadgesCount ?? 0;
  const pointsPerLevel   = 2000;
  const pointsIntoLevel  = xp % pointsPerLevel;
  const pointsToNextLevel= pointsPerLevel - pointsIntoLevel;
  const levelProgressWidth = `${Math.max(3, (pointsIntoLevel / pointsPerLevel) * 100)}%`;
  const claimablePoints  = quests.reduce((sum, q) => sum + (q.xpReward ?? 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BLUE} colors={[BLUE, '#F59E0B']} />}
      >
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <View style={styles.currencyPill}>
              <View style={styles.diamondIcon}><View style={styles.diamondInner} /></View>
              <Text style={styles.currencyText}>{earnedBadges}</Text>
              <View style={styles.currencyDivider} />
              <View style={styles.coinIcon} />
              <Text style={styles.currencyText}>{xp.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.welcomeTitle}>Welcome{'\n'}Back!</Text>
              <Text style={styles.welcomeSub}>Ready to practice{'\n'}your skills</Text>
            </View>
            <Image source={LAMP_IMAGE} style={styles.lampImage} resizeMode="contain" />
          </View>

          <View style={styles.levelBanner}>
            <View style={styles.levelIcon}><Text style={styles.levelIconText}>⚡</Text></View>
            <View style={styles.levelInfo}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelText}>Level {level} · {xp.toLocaleString()} XP</Text>
                <Text style={styles.nextLevelText}>{pointsToNextLevel.toLocaleString()} to next</Text>
              </View>
              <View style={styles.levelTrack}>
                <View style={[styles.levelProgress, { width: levelProgressWidth }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.notchTab} />

          {loading ? (
            <ActivityIndicator size="large" color={BLUE} style={{ marginTop: 40, marginBottom: 40 }} />
          ) : (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={styles.statIconBox}><Text style={styles.statEmoji}>🔥</Text></View>
                  <View>
                    <Text style={styles.statValue}>{streak}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                  </View>
                </View>
                <View style={styles.statCardLarge}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statValue}>{pointsIntoLevel.toLocaleString()}</Text>
                    <Text style={styles.statTotal}> / 2,000 XP</Text>
                  </View>
                  <View style={styles.smallTrack}>
                    <View style={[styles.smallProgress, { width: levelProgressWidth }]} />
                  </View>
                </View>
                <TouchableOpacity style={styles.chestCard} activeOpacity={0.8}>
                  <Text style={styles.chestEmoji}>🎁</Text>
                  <View>
                    <Text style={styles.statValue}>Next reward</Text>
                    <Text style={styles.statLabel}>keep going!</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.questBoard}>
                <View style={styles.questBoardTop}>
                  <View>
                    <Text style={styles.questEyebrow}>Nawarny Quest Board</Text>
                    <Text style={styles.questTitle}>Today's Power Run</Text>
                  </View>
                  <View style={styles.questLevelBadge}>
                    <Ionicons name="flash" size={15} color="#FFFFFF" />
                    <Text style={styles.questLevelText}>Combo x2</Text>
                  </View>
                </View>
                <View style={styles.questBoardStats}>
                  <View style={styles.questMiniPanel}>
                    <MaterialCommunityIcons name="map-marker-path" size={23} color={BLUE} />
                    <View>
                      <Text style={styles.questMiniValue}>{quests.filter(q => !q.completed).length} missions</Text>
                      <Text style={styles.questMiniLabel}>left today</Text>
                    </View>
                  </View>
                  <View style={styles.questMiniPanel}>
                    <MaterialCommunityIcons name="trophy-award" size={24} color="#F59E0B" />
                    <View>
                      <Text style={styles.questMiniValue}>Level {level}</Text>
                      <Text style={styles.questMiniLabel}>your rank</Text>
                    </View>
                  </View>
                  <View style={styles.questMiniPanel}>
                    <MaterialCommunityIcons name="medal" size={24} color="#F59E0B" />
                    <View>
                      <Text style={styles.questMiniValue}>{earnedBadges} badges</Text>
                      <Text style={styles.questMiniLabel}>collected</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Choose your mission category</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
                {courseCategories.map(item => {
                  const active = selectedCourse === item.label;
                  return (
                    <TouchableOpacity key={item.label} style={[styles.categoryTile, active && styles.categoryTileActive]} activeOpacity={0.82} onPress={() => handleCoursePress(item)}>
                      <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive]}>
                        <CategoryIcon item={item} active={active} />
                      </View>
                      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{item.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daily Quests</Text>
                <TouchableOpacity style={[styles.seeAllBtn, questsClaimed && styles.claimedBtn]} activeOpacity={0.75} onPress={handleClaimDailyQuests}>
                  <Text style={[styles.seeAllText, questsClaimed && styles.claimedBtnText]}>
                    {questsClaimed ? 'Claimed' : `Claim +${claimablePoints} XP`}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.questScrollContent}>
                {quests.length === 0 ? (
                  <View style={styles.emptyQuests}><Text style={styles.emptyQuestsText}>No quests today yet</Text></View>
                ) : quests.map((quest, i) => (
                  <TouchableOpacity key={i} style={[styles.dailyQuestCard, (questsClaimed || quest.completed) && styles.dailyQuestClaimed]} activeOpacity={0.85}>
                    <View style={[styles.dailyQuestIcon, { backgroundColor: BLUE }]}>
                      <MaterialCommunityIcons name={(questsClaimed || quest.completed) ? 'check-bold' : 'timer-sand'} size={25} color="#FFFFFF" />
                    </View>
                    <Text style={styles.dailyQuestTitle}>{quest.title}</Text>
                    <Text style={[styles.dailyQuestReward, (questsClaimed || quest.completed) && styles.dailyQuestRewardClaimed]}>
                      {(questsClaimed || quest.completed) ? 'Reward claimed' : `+${quest.xpReward} XP`}
                    </Text>
                    <View style={styles.dailyQuestTrack}>
                      <View style={[styles.dailyQuestProgress, { backgroundColor: BLUE }, (questsClaimed || quest.completed) && styles.dailyQuestProgressClaimed]} />
                    </View>
                    <Text style={styles.dailyQuestCount}>{(questsClaimed || quest.completed) ? 'Completed' : quest.description}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Soft Skills</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.skillsScrollContent}>
                {softSkills.map(skill => {
                  const active = selectedSkill === skill.label;
                  return (
                    <TouchableOpacity key={skill.label} style={[styles.skillBanner, skill.featured && styles.unlockedSkillBanner, active && styles.skillBannerActive]} activeOpacity={0.88} onPress={() => handleSkillPress(skill)}>
                      {skill.featured && (
                        <View style={styles.unlockedRibbon}>
                          <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                          <Text style={styles.unlockedRibbonText}>Unlocked</Text>
                        </View>
                      )}
                      <View style={styles.skillTopRow}>
                        <Text style={[styles.skillTag, { backgroundColor: skill.accent }]}>{skill.tag}</Text>
                        {active && <View style={styles.checkBadge}><Ionicons name="checkmark" size={16} color="#FFFFFF" /></View>}
                      </View>
                      <View style={styles.skillMainRow}>
                        <View style={[styles.bannerLeft, skill.featured && styles.unlockedBannerLeft]}>
                          <Text style={styles.skillName}>{skill.label}</Text>
                          <Text style={styles.skillDesc}>{skill.desc}</Text>
                          <View style={styles.rewardPill}>
                            <View style={[styles.diamondIcon, styles.rewardDiamond]}><View style={styles.rewardDiamondInner} /></View>
                            <Text style={styles.rewardValue}>{skill.gems}</Text>
                            <View style={styles.rewardDivider} />
                            <View style={[styles.coinIcon, styles.rewardCoin]} />
                            <Text style={styles.rewardValue}>{skill.coins}</Text>
                          </View>
                        </View>
                        <View style={[styles.skillVisual, { backgroundColor: skill.softBg }, skill.featured && styles.unlockedSkillVisual]}>
                          {skill.featured ? (
                            <Image source={BRAIN_IMAGE} style={styles.brainImage} resizeMode="contain" />
                          ) : (
                            <MaterialCommunityIcons name={skill.icon} size={62} color={skill.accent} />
                          )}
                          <View style={[styles.medalBadge, { backgroundColor: skill.accent }]}>
                            <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: skill.accent }]} activeOpacity={0.85} onPress={() => handleSkillStartPress(skill)}>
                        <Text style={styles.ctaBtnText}>Start</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.skillBottomRow}>
                        <View style={styles.miniStatCard}>
                          <Ionicons name="calendar-outline" size={20} color={skill.accent} />
                          <View>
                            <Text style={styles.miniStatTitle}>Weekly Goal</Text>
                            <Text style={styles.miniStatValue}>{skill.progress}</Text>
                          </View>
                        </View>
                        <View style={styles.miniStatCard}>
                          <Text style={styles.trophyIcon}>🏆</Text>
                          <View>
                            <Text style={styles.miniStatTitle}>{skill.rank}</Text>
                            <Text style={styles.miniStatValue}>Your Rank</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  topSection: { backgroundColor: '#F7F8FA', paddingBottom: 18 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 22, paddingTop: Platform.OS === 'android' ? 14 : 8, paddingBottom: 6 },
  currencyPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 14, paddingVertical: 7, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: '#EBEBEB' },
  currencyText: { fontSize: 14, fontWeight: '700', color: DARK, marginLeft: 5 },
  currencyDivider: { width: 1, height: 14, backgroundColor: '#E0E0E0', marginHorizontal: 10 },
  diamondIcon: { width: 16, height: 16, backgroundColor: '#6EC6F5', transform: [{ rotate: '45deg' }], borderRadius: 2, alignItems: 'center', justifyContent: 'center' },
  diamondInner: { width: 8, height: 8, backgroundColor: '#A8DFFB', borderRadius: 1 },
  coinIcon: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#F5C542', borderWidth: 2, borderColor: '#E6A800' },
  hero: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 28, paddingTop: 4, paddingBottom: 8 },
  heroTextBlock: { flex: 1 },
  welcomeTitle: { fontSize: 40, fontWeight: '900', color: DARK, marginBottom: 10, lineHeight: 46 },
  welcomeSub: { fontSize: 18, fontWeight: '500', color: '#4A4A6A', lineHeight: 26 },
  lampImage: { width: 180, height: 180, marginBottom: -20 },
  levelBanner: { marginTop: 8, marginHorizontal: 22, backgroundColor: BLUE, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', shadowColor: BLUE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.24, shadowRadius: 14, elevation: 7 },
  levelIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFD166', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  levelIconText: { fontSize: 15 },
  levelInfo: { flex: 1 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  levelText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  nextLevelText: { color: '#FFE36E', fontSize: 12, fontWeight: '900' },
  levelTrack: { height: 5, borderRadius: 999, backgroundColor: '#6CB2ED', overflow: 'hidden' },
  levelProgress: { height: '100%', borderRadius: 999, backgroundColor: '#FFD166' },
  card: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 34, borderTopRightRadius: 34, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 30, marginTop: -4, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 16 },
  notchTab: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#D8DAE0', marginBottom: 18, marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  statCard: { minWidth: 82, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E7EAF1', shadowColor: '#111827', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 7, elevation: 2 },
  statCardLarge: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 10, borderWidth: 1, borderColor: '#E7EAF1', shadowColor: '#111827', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 7, elevation: 2 },
  chestCard: { minWidth: 106, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E7EAF1', shadowColor: '#111827', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 7, elevation: 2 },
  statIconBox: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  statEmoji: { fontSize: 16 },
  chestEmoji: { fontSize: 24, marginRight: 7 },
  statValue: { fontSize: 11, fontWeight: '900', color: DARK },
  statLabel: { fontSize: 9, color: MUTED, fontWeight: '600', marginTop: 1 },
  statTotal: { fontSize: 10, color: MUTED, fontWeight: '700' },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  smallTrack: { height: 5, borderRadius: 999, backgroundColor: '#E8EEF8', overflow: 'hidden' },
  smallProgress: { width: '60%', height: '100%', backgroundColor: BLUE, borderRadius: 999 },
  questBoard: { backgroundColor: '#0F172A', borderRadius: 18, padding: 14, marginBottom: 18 },
  questBoardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 13 },
  questEyebrow: { color: '#93C5FD', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  questTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: 3 },
  questLevelBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: BLUE, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, gap: 5 },
  questLevelText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  questBoardStats: { flexDirection: 'row', gap: 10 },
  questMiniPanel: { flex: 1, minHeight: 56, backgroundColor: '#FFFFFF', borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8 },
  questMiniValue: { color: DARK, fontSize: 12, fontWeight: '900' },
  questMiniLabel: { color: MUTED, fontSize: 9, fontWeight: '700', marginTop: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 11 },
  sectionTitle: { color: DARK, fontSize: 15, fontWeight: '900' },
  seeAllBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F8', borderWidth: 1, borderColor: '#E2E4EC' },
  seeAllText: { color: DARK, fontSize: 12, fontWeight: '800' },
  claimedBtn: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  claimedBtnText: { color: '#047857' },
  categoryScrollContent: { paddingRight: 22, paddingBottom: 20, gap: 10 },
  categoryTile: { width: 78, height: 74, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6EAF2', alignItems: 'center', justifyContent: 'center', shadowColor: '#111827', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  categoryTileActive: { backgroundColor: BLUE, borderColor: BLUE, shadowColor: BLUE, shadowOpacity: 0.24 },
  categoryIconWrap: { height: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  categoryIconWrapActive: { transform: [{ scale: 1.08 }] },
  categoryText: { color: DARK, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  categoryTextActive: { color: '#FFFFFF' },
  questScrollContent: { paddingRight: 22, paddingBottom: 20, gap: 10 },
  dailyQuestCard: { width: 130, minHeight: 150, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6EAF2', padding: 11, shadowColor: '#111827', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  dailyQuestClaimed: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  dailyQuestIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 11 },
  dailyQuestTitle: { color: DARK, fontSize: 13, fontWeight: '900', minHeight: 34 },
  dailyQuestReward: { color: MUTED, fontSize: 10, fontWeight: '800', marginBottom: 9 },
  dailyQuestRewardClaimed: { color: '#047857' },
  dailyQuestTrack: { height: 5, backgroundColor: '#E8EEF8', borderRadius: 999, overflow: 'hidden', marginBottom: 7 },
  dailyQuestProgress: { width: '48%', height: '100%', borderRadius: 999 },
  dailyQuestProgressClaimed: { width: '100%', backgroundColor: '#10B981' },
  dailyQuestCount: { color: DARK, fontSize: 10, fontWeight: '900' },
  emptyQuests: { paddingHorizontal: 20, paddingVertical: 30 },
  emptyQuestsText: { color: MUTED, fontSize: 13 },
  skillsScrollContent: { paddingRight: 22, paddingTop: 16, paddingBottom: 18, gap: 14 },
  skillBanner: { width: 306, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, shadowColor: '#111827', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.09, shadowRadius: 16, elevation: 6, borderWidth: 1, borderColor: '#E6EAF2' },
  skillBannerActive: { borderColor: '#BED8F6', backgroundColor: '#FBFDFF' },
  unlockedSkillBanner: { backgroundColor: '#FFFBEB', borderColor: '#FACC15', borderWidth: 2, paddingTop: 22, paddingBottom: 14, shadowColor: '#F59E0B', shadowOpacity: 0.25, shadowRadius: 18, elevation: 10 },
  unlockedRibbon: { position: 'absolute', top: -10, left: 15, zIndex: 3, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F59E0B', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2, borderColor: '#FFFFFF' },
  unlockedRibbonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  skillTopRow: { minHeight: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 9 },
  skillMainRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerLeft: { flex: 1, paddingRight: 8 },
  unlockedBannerLeft: { paddingRight: 12 },
  skillTag: { color: '#FFFFFF', fontSize: 9, lineHeight: 14, fontWeight: '900', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, overflow: 'hidden', textTransform: 'uppercase' },
  checkBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F5B428', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  skillName: { fontSize: 20, fontWeight: '900', color: DARK, marginBottom: 6 },
  skillDesc: { fontSize: 11, color: MUTED, lineHeight: 15, marginBottom: 12, maxWidth: 156 },
  rewardPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#F8FAFF', borderRadius: 13, paddingHorizontal: 9, paddingVertical: 7, borderWidth: 1, borderColor: '#E6EAF2', marginBottom: 10, gap: 4 },
  rewardDiamond: { width: 13, height: 13 },
  rewardDiamondInner: { width: 7, height: 7, backgroundColor: '#A8DFFB', borderRadius: 1 },
  rewardCoin: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#F5C542' },
  rewardValue: { fontSize: 11, fontWeight: '900', color: DARK, marginLeft: 4 },
  rewardDivider: { width: 1, height: 12, backgroundColor: '#DDD', marginHorizontal: 8 },
  ctaBtn: { borderRadius: 14, paddingVertical: 11, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 10 },
  ctaBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  brainImage: { width: 88, height: 94 },
  skillVisual: { width: 100, height: 100, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  unlockedSkillVisual: { width: 104, height: 104, marginRight: 2 },
  medalBadge: { position: 'absolute', right: -4, bottom: -4, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  skillBottomRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  miniStatCard: { flex: 1, minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E6EAF2', backgroundColor: '#F8FAFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9, gap: 7 },
  miniStatTitle: { fontSize: 9, color: DARK, fontWeight: '900' },
  miniStatValue: { fontSize: 8, color: MUTED, fontWeight: '700', marginTop: 1 },
  trophyIcon: { fontSize: 20 },
});