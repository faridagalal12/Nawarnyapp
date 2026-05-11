import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Vibration,
  useWindowDimensions,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const LAMP_IMAGE = require('../../assets/lamp1.png');
const BRAIN_IMAGE = require('../../assets/brain.png');

const BLUE = '#2F83D4';
const DARK = '#1A1A2E';
const MUTED = '#6B7280';

const courseCategories = [
  { label: 'Business', icon: 'briefcase', family: 'FontAwesome5', color: '#2F83D4' },
  { label: 'History', icon: 'university', family: 'FontAwesome5', color: '#8B5CF6' },
  { label: 'Chemistry', icon: 'flask', family: 'FontAwesome5', color: '#10B981' },
  { label: 'Career Skills', icon: 'rocket', family: 'FontAwesome5', color: '#F97316' },
  { label: 'UI/UX', icon: 'color-palette', family: 'Ionicons', color: '#EF4444' },
  { label: 'Marketing', icon: 'bullhorn', family: 'FontAwesome5', color: '#F59E0B' },
  { label: 'Coding', icon: 'code-slash', family: 'Ionicons', color: '#2563EB' },
  { label: 'Finance', icon: 'chart-line', family: 'FontAwesome5', color: '#14B8A6' },
  { label: 'Science', icon: 'atom', family: 'FontAwesome5', color: '#06B6D4' },
  { label: 'Math', icon: 'calculator', family: 'FontAwesome5', color: '#7C3AED' },
  { label: 'AI Basics', icon: 'robot', family: 'FontAwesome5', color: '#0EA5E9' },
  { label: 'Startup', icon: 'lightbulb', family: 'FontAwesome5', color: '#FACC15' },
  { label: 'Languages', icon: 'language', family: 'FontAwesome5', color: '#EC4899' },
  { label: 'Data', icon: 'database', family: 'FontAwesome5', color: '#6366F1' },
  { label: 'Health', icon: 'heartbeat', family: 'FontAwesome5', color: '#F43F5E' },
  { label: 'Teaching', icon: 'school', family: 'Ionicons', color: '#22C55E' },
];

const softSkills = [
  {
    label: 'Critical Thinking',
    tag: 'Skill Unlocked!',
    desc: 'Sharpen your mind. Solve real-world problems.',
    icon: 'brain',
    accent: '#2F83D4',
    softBg: '#EAF4FF',
    gems: '+60',
    coins: '+300',
    progress: '3 / 5 days',
    rank: 'Top 15%',
    featured: true,
  },
  {
    label: 'Communication',
    tag: 'Practice Path',
    desc: 'Speak clearly, listen actively, and present ideas.',
    icon: 'message-text',
    accent: '#10B981',
    softBg: '#EAFBF4',
    gems: '+45',
    coins: '+220',
    progress: '2 / 4 days',
    rank: 'Top 24%',
  },
  {
    label: 'Analysis',
    tag: 'New Challenge',
    desc: 'Read patterns, compare options, and defend choices.',
    icon: 'chart-timeline-variant',
    accent: '#8B5CF6',
    softBg: '#F2EDFF',
    gems: '+55',
    coins: '+260',
    progress: '1 / 5 days',
    rank: 'Top 31%',
  },
  {
    label: 'Leadership',
    tag: 'Team Skill',
    desc: 'Guide decisions, set priorities, and motivate teams.',
    icon: 'account-group',
    accent: '#F97316',
    softBg: '#FFF3E8',
    gems: '+50',
    coins: '+240',
    progress: '4 / 6 days',
    rank: 'Top 18%',
  },
  {
    label: 'Problem Solving',
    tag: 'Puzzle Run',
    desc: 'Break challenges into small, winnable moves.',
    icon: 'puzzle',
    accent: '#0EA5E9',
    softBg: '#EAF7FF',
    gems: '+65',
    coins: '+310',
    progress: '2 / 5 days',
    rank: 'Top 12%',
  },
  {
    label: 'Creativity',
    tag: 'Idea Lab',
    desc: 'Generate fresh ideas and turn them into action.',
    icon: 'lightbulb-on',
    accent: '#F59E0B',
    softBg: '#FFF8E7',
    gems: '+45',
    coins: '+230',
    progress: '1 / 4 days',
    rank: 'Top 29%',
  },
  {
    label: 'Teamwork',
    tag: 'Co-op Quest',
    desc: 'Coordinate, support, and win shared missions.',
    icon: 'account-multiple-check',
    accent: '#14B8A6',
    softBg: '#E8FBF8',
    gems: '+50',
    coins: '+250',
    progress: '3 / 6 days',
    rank: 'Top 22%',
  },
  {
    label: 'Time Management',
    tag: 'Speed Boost',
    desc: 'Plan your day and protect your focus streak.',
    icon: 'clock-check',
    accent: '#6366F1',
    softBg: '#EEF2FF',
    gems: '+40',
    coins: '+210',
    progress: '2 / 3 days',
    rank: 'Top 19%',
  },
  {
    label: 'Emotional IQ',
    tag: 'Mind Shield',
    desc: 'Notice emotions and respond with control.',
    icon: 'heart-pulse',
    accent: '#EC4899',
    softBg: '#FDF2F8',
    gems: '+55',
    coins: '+270',
    progress: '1 / 5 days',
    rank: 'Top 34%',
  },
  {
    label: 'Negotiation',
    tag: 'Arena Skill',
    desc: 'Find common ground and make stronger deals.',
    icon: 'handshake',
    accent: '#F97316',
    softBg: '#FFF3E8',
    gems: '+60',
    coins: '+290',
    progress: '2 / 5 days',
    rank: 'Top 27%',
  },
  {
    label: 'Adaptability',
    tag: 'Flex Mode',
    desc: 'Switch strategies when the mission changes.',
    icon: 'swap-horizontal-bold',
    accent: '#84CC16',
    softBg: '#F1FBE8',
    gems: '+42',
    coins: '+225',
    progress: '4 / 7 days',
    rank: 'Top 21%',
  },
  {
    label: 'Decision Making',
    tag: 'Boss Choice',
    desc: 'Compare tradeoffs and choose with confidence.',
    icon: 'scale-balance',
    accent: '#64748B',
    softBg: '#F1F5F9',
    gems: '+58',
    coins: '+285',
    progress: '3 / 5 days',
    rank: 'Top 16%',
  },
];

const dailyQuests = [
  { title: 'Quiz Sprint', reward: '+80 Points', points: 80, badges: 0, progress: '1 / 3', icon: 'timer-sand', accent: '#2F83D4' },
  { title: 'Watch Lesson', reward: '+45 Points', points: 45, badges: 0, progress: '2 / 4', icon: 'play-circle', accent: '#10B981' },
  { title: 'Skill Battle', reward: '+1 Badge', points: 0, badges: 1, progress: '0 / 1', icon: 'sword-cross', accent: '#F97316' },
  { title: 'Review Notes', reward: '+30 Points', points: 30, badges: 0, progress: '3 / 5', icon: 'notebook-check', accent: '#8B5CF6' },
];

const achievementBadges = [
  { title: 'First Spark', subtitle: 'Started your path', icon: 'lightning-bolt', accent: '#F59E0B' },
  { title: 'Focus Shield', subtitle: '3 days focused', icon: 'shield-check', accent: '#2F83D4' },
  { title: 'Brain Boost', subtitle: 'Solved 5 puzzles', icon: 'brain', accent: '#8B5CF6' },
  { title: 'Team Player', subtitle: 'Co-op challenge', icon: 'account-group', accent: '#10B981' },
];

function CategoryIcon({ item, active }) {
  const iconColor = active ? '#FFFFFF' : item.color;

  if (item.family === 'Ionicons') {
    return <Ionicons name={item.icon} size={22} color={iconColor} />;
  }

  return <FontAwesome5 name={item.icon} size={19} color={iconColor} />;
}

export default function GWelcomeScreen({ navigation }) {
  const { height } = useWindowDimensions();
  const [selectedCourse, setSelectedCourse] = useState(courseCategories[0].label);
  const [selectedSkill, setSelectedSkill] = useState(softSkills[0].label);
  const [totalPoints, setTotalPoints] = useState(20);
  const [earnedBadges, setEarnedBadges] = useState(achievementBadges.length);
  const [dailyQuestsClaimed, setDailyQuestsClaimed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const pointsPerLevel = 2000;
  const currentLevel = Math.floor(totalPoints / pointsPerLevel) + 1;
  const pointsIntoLevel = totalPoints % pointsPerLevel;
  const pointsToNextLevel = pointsPerLevel - pointsIntoLevel;
  const levelProgressWidth = `${Math.max(3, (pointsIntoLevel / pointsPerLevel) * 100)}%`;
  const claimablePoints = dailyQuests.reduce((sum, quest) => sum + quest.points, 0);
  const claimableBadges = dailyQuests.reduce((sum, quest) => sum + quest.badges, 0);

  const handleClaimDailyQuests = () => {
    Vibration.vibrate(dailyQuestsClaimed ? 35 : [0, 80, 45, 120]);

    if (dailyQuestsClaimed) return;

    setTotalPoints((points) => points + claimablePoints);
    setEarnedBadges((badges) => badges + claimableBadges);
    setDailyQuestsClaimed(true);
  };

  const handleRefresh = () => {
    Vibration.vibrate(35);
    setRefreshing(true);
    setTimeout(() => {
      setSelectedCourse(courseCategories[0].label);
      setSelectedSkill(softSkills[0].label);
      setRefreshing(false);
    }, 700);
  };

  const handleCoursePress = (item) => {
    setSelectedCourse(item.label);
    Vibration.vibrate(45);
    navigation?.navigate('MissionStart', {
      category: item,
      totalPoints,
      earnedBadges,
    });
  };

  const handleSkillPress = (skill) => {
    setSelectedSkill(skill.label);
    Vibration.vibrate(45);
    navigation?.navigate('MissionStart', {
      category: {
        label: skill.label,
        icon: skill.icon,
        family: 'MaterialCommunityIcons',
        color: skill.accent,
        missionType: 'Soft Skill',
      },
      totalPoints,
      earnedBadges,
    });
  };

  const handleSkillStartPress = (skill) => {
    setSelectedSkill(skill.label);
    Vibration.vibrate([0, 55, 35, 120]);
    navigation?.navigate('GMission', {
      category: {
        label: skill.label,
        icon: skill.icon,
        family: 'MaterialCommunityIcons',
        color: skill.accent,
        missionType: 'Soft Skill',
      },
      totalPoints,
      earnedBadges,
      currentLevel: 2,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8FA" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BLUE}
            colors={[BLUE, '#F59E0B']}
          />
        }
      >
        <View style={styles.topSection}>
          <View style={styles.topBar}>
            <View style={styles.currencyPill}>
              <View style={styles.diamondIcon}>
                <View style={styles.diamondInner} />
              </View>
              <Text style={styles.currencyText}>12</Text>

              <View style={styles.currencyDivider} />

              <View style={styles.coinIcon} />
              <Text style={styles.currencyText}>1,214</Text>
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
            <View style={styles.levelIcon}>
              <Text style={styles.levelIconText}>⚡</Text>
            </View>
            <View style={styles.levelInfo}>
              <View style={styles.levelHeader}>
                    <Text style={styles.levelText}>Level {currentLevel} · {totalPoints.toLocaleString()} Points</Text>
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

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconBox}>
                <Text style={styles.statEmoji}>🔥</Text>
              </View>
              <View>
                <Text style={styles.statValue}>1</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.statCardLarge}>
              <View style={styles.statHeader}>
                <Text style={styles.statValue}>{pointsIntoLevel.toLocaleString()}</Text>
                <Text style={styles.statTotal}> / 2,000 Points</Text>
              </View>
              <View style={styles.smallTrack}>
                <View style={[styles.smallProgress, { width: levelProgressWidth }]} />
              </View>
            </View>

            <TouchableOpacity style={styles.chestCard} activeOpacity={0.8}>
              <Text style={styles.chestEmoji}>🎁</Text>
              <View>
                <Text style={styles.statValue}>Next reward</Text>
                <Text style={styles.statLabel}>in 2 quizzes</Text>
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
                  <Text style={styles.questMiniValue}>3 missions</Text>
                  <Text style={styles.questMiniLabel}>left today</Text>
                </View>
              </View>
              <View style={styles.questMiniPanel}>
                <MaterialCommunityIcons name="trophy-award" size={24} color="#F59E0B" />
                <View>
                  <Text style={styles.questMiniValue}>Rookie II</Text>
                  <Text style={styles.questMiniLabel}>arena rank</Text>
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
            <TouchableOpacity style={styles.roundArrow} activeOpacity={0.75}>
              <Ionicons name="chevron-forward" size={18} color={DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {courseCategories.map((item) => {
              const active = selectedCourse === item.label;

              return (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.categoryTile, active && styles.categoryTileActive]}
                  activeOpacity={0.82}
                  onPress={() => handleCoursePress(item)}
                >
                  <View style={[styles.categoryIconWrap, active && styles.categoryIconWrapActive]}>
                    <CategoryIcon item={item} active={active} />
                  </View>
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Quests</Text>
            <TouchableOpacity
              style={[styles.seeAllBtn, dailyQuestsClaimed && styles.claimedBtn]}
              activeOpacity={0.75}
              onPress={handleClaimDailyQuests}
            >
              <Text style={[styles.seeAllText, dailyQuestsClaimed && styles.claimedBtnText]}>
                {dailyQuestsClaimed ? 'Claimed' : `Claim +${claimablePoints}`}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.questScrollContent}
          >
            {dailyQuests.map((quest) => (
              <TouchableOpacity
                key={quest.title}
                style={[styles.dailyQuestCard, dailyQuestsClaimed && styles.dailyQuestClaimed]}
                activeOpacity={0.85}
              >
                <View style={[styles.dailyQuestIcon, { backgroundColor: quest.accent }]}>
                  <MaterialCommunityIcons
                    name={dailyQuestsClaimed ? 'check-bold' : quest.icon}
                    size={25}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.dailyQuestTitle}>{quest.title}</Text>
                <Text style={[styles.dailyQuestReward, dailyQuestsClaimed && styles.dailyQuestRewardClaimed]}>
                  {dailyQuestsClaimed ? 'Reward claimed' : quest.reward}
                </Text>
                <View style={styles.dailyQuestTrack}>
                  <View
                    style={[
                      styles.dailyQuestProgress,
                      { backgroundColor: quest.accent },
                      dailyQuestsClaimed && styles.dailyQuestProgressClaimed,
                    ]}
                  />
                </View>
                <Text style={styles.dailyQuestCount}>
                  {dailyQuestsClaimed ? 'Completed' : quest.progress}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Soft Skills</Text>
            <TouchableOpacity style={styles.seeAllBtn} activeOpacity={0.75}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.skillsScrollContent}
          >
            {softSkills.map((skill) => {
              const active = selectedSkill === skill.label;

              return (
                <TouchableOpacity
                  key={skill.label}
                  style={[
                    styles.skillBanner,
                    skill.featured && styles.unlockedSkillBanner,
                    active && styles.skillBannerActive,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleSkillPress(skill)}
                >
                  {skill.featured && (
                    <View style={styles.unlockedRibbon}>
                      <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                      <Text style={styles.unlockedRibbonText}>Unlocked</Text>
                    </View>
                  )}

                  <View style={styles.skillTopRow}>
                    <Text style={[styles.skillTag, { backgroundColor: skill.accent }]}>
                      {skill.tag}
                    </Text>
                    {active && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  <View style={styles.skillMainRow}>
                    <View style={[styles.bannerLeft, skill.featured && styles.unlockedBannerLeft]}>
                      <Text style={styles.skillName}>{skill.label}</Text>
                      <Text style={styles.skillDesc}>{skill.desc}</Text>

                      <View style={styles.rewardPill}>
                        <View style={[styles.diamondIcon, styles.rewardDiamond]}>
                          <View style={styles.rewardDiamondInner} />
                        </View>
                        <Text style={styles.rewardValue}>{skill.gems}</Text>

                        <View style={styles.rewardDivider} />

                        <View style={[styles.coinIcon, styles.rewardCoin]} />
                        <Text style={styles.rewardValue}>{skill.coins}</Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.skillVisual,
                        { backgroundColor: skill.softBg },
                        skill.featured && styles.unlockedSkillVisual,
                      ]}
                    >
                      {skill.featured ? (
                        <Image source={BRAIN_IMAGE} style={styles.brainImage} resizeMode="contain" />
                      ) : (
                        <MaterialCommunityIcons name={skill.icon} size={62} color={skill.accent} />
                      )}
                      <View style={[styles.medalBadge, { backgroundColor: skill.accent }]}>
                        <Ionicons name="checkmark" size={22} color="#FFFFFF" />
                      </View>
                      {skill.featured && (
                        <View style={styles.unlockGlowBadge}>
                          <Text style={styles.unlockGlowText}>NEW</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.ctaBtn, { backgroundColor: skill.accent }]}
                    activeOpacity={0.85}
                    onPress={() => handleSkillStartPress(skill)}
                  >
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

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievement Badges · {earnedBadges}</Text>
            <TouchableOpacity style={styles.roundArrow} activeOpacity={0.75}>
              <Ionicons name="chevron-forward" size={18} color={DARK} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesScrollContent}
          >
            {achievementBadges.map((badge) => (
              <TouchableOpacity key={badge.title} style={styles.badgeCard} activeOpacity={0.84}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.accent }]}>
                  <MaterialCommunityIcons name={badge.icon} size={28} color="#FFFFFF" />
                </View>
                <View style={styles.badgeCopy}>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeSubtitle}>{badge.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  topSection: {
    backgroundColor: '#F7F8FA',
    paddingBottom: 18,
  },
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
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 28,
    paddingTop: 4,
    paddingBottom: 8,
  },
  heroTextBlock: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: DARK,
    marginBottom: 10,
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
  levelBanner: {
    marginTop: 8,
    marginHorizontal: 22,
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 7,
  },
  levelIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  levelIconText: {
    fontSize: 15,
  },
  levelInfo: {
    flex: 1,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  nextLevelText: {
    color: '#FFE36E',
    fontSize: 12,
    fontWeight: '900',
  },
  levelTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#6CB2ED',
    overflow: 'hidden',
  },
  levelProgress: {
    width: '48%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFD166',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
    marginTop: -4,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
  },
  notchTab: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D8DAE0',
    marginBottom: 18,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  statCard: {
    minWidth: 82,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EAF1',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  statCardLarge: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E7EAF1',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  chestCard: {
    minWidth: 106,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7EAF1',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },
  statIconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  statEmoji: {
    fontSize: 16,
  },
  chestEmoji: {
    fontSize: 24,
    marginRight: 7,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '900',
    color: DARK,
  },
  statLabel: {
    fontSize: 9,
    color: MUTED,
    fontWeight: '600',
    marginTop: 1,
  },
  statTotal: {
    fontSize: 10,
    color: MUTED,
    fontWeight: '700',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  smallTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E8EEF8',
    overflow: 'hidden',
  },
  smallProgress: {
    width: '60%',
    height: '100%',
    backgroundColor: BLUE,
    borderRadius: 999,
  },
  questBoard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  questBoardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 13,
  },
  questEyebrow: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  questTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },
  questLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },
  questLevelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  questBoardStats: {
    flexDirection: 'row',
    gap: 10,
  },
  questMiniPanel: {
    flex: 1,
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  questMiniValue: {
    color: DARK,
    fontSize: 12,
    fontWeight: '900',
  },
  questMiniLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 11,
  },
  sectionTitle: {
    color: DARK,
    fontSize: 15,
    fontWeight: '900',
  },
  roundArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7EAF1',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryScrollContent: {
    paddingRight: 22,
    paddingBottom: 20,
    gap: 10,
  },
  categoryTile: {
    width: 78,
    height: 74,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryTileActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
    shadowColor: BLUE,
    shadowOpacity: 0.24,
  },
  categoryIconWrap: {
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  categoryIconWrapActive: {
    transform: [{ scale: 1.08 }],
  },
  categoryText: {
    color: DARK,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  seeAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    fontSize: 12,
    fontWeight: '800',
  },
  claimedBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  claimedBtnText: {
    color: '#047857',
  },
  skillsScrollContent: {
    paddingRight: 22,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 14,
  },
  questScrollContent: {
    paddingRight: 22,
    paddingBottom: 20,
    gap: 10,
  },
  dailyQuestCard: {
    width: 130,
    minHeight: 150,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAF2',
    padding: 11,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dailyQuestClaimed: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  dailyQuestIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },
  dailyQuestTitle: {
    color: DARK,
    fontSize: 13,
    fontWeight: '900',
    minHeight: 34,
  },
  dailyQuestReward: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 9,
  },
  dailyQuestRewardClaimed: {
    color: '#047857',
  },
  dailyQuestTrack: {
    height: 5,
    backgroundColor: '#E8EEF8',
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 7,
  },
  dailyQuestProgress: {
    width: '48%',
    height: '100%',
    borderRadius: 999,
  },
  dailyQuestProgressClaimed: {
    width: '100%',
    backgroundColor: '#10B981',
  },
  dailyQuestCount: {
    color: DARK,
    fontSize: 10,
    fontWeight: '900',
  },
  skillBanner: {
    width: 306,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    overflow: 'visible',
  },
  skillBannerActive: {
    borderColor: '#BED8F6',
    backgroundColor: '#FBFDFF',
  },
  unlockedSkillBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FACC15',
    borderWidth: 2,
    paddingTop: 22,
    paddingBottom: 14,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  unlockedRibbon: {
    position: 'absolute',
    top: -10,
    left: 15,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unlockedRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  skillTopRow: {
    minHeight: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 9,
  },
  skillMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  unlockedBannerLeft: {
    paddingRight: 12,
  },
  skillTag: {
    color: '#FFFFFF',
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  checkBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F5B428',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  skillName: {
    fontSize: 20,
    fontWeight: '900',
    color: DARK,
    marginBottom: 6,
  },
  skillDesc: {
    fontSize: 11,
    color: MUTED,
    lineHeight: 15,
    marginBottom: 12,
    maxWidth: 156,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F8FAFF',
    borderRadius: 13,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    marginBottom: 10,
    gap: 4,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardDiamond: {
    width: 13,
    height: 13,
  },
  rewardDiamondInner: {
    width: 7,
    height: 7,
    backgroundColor: '#A8DFFB',
    borderRadius: 1,
  },
  rewardCoin: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#F5C542',
  },
  rewardValue: {
    fontSize: 11,
    fontWeight: '900',
    color: DARK,
    marginLeft: 4,
  },
  rewardDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#DDD',
    marginHorizontal: 8,
  },
  ctaBtn: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 10,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  brainImage: {
    width: 88,
    height: 94,
  },
  skillVisual: {
    width: 100,
    height: 100,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedSkillVisual: {
    width: 104,
    height: 104,
    marginRight: 2,
  },
  medalBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  unlockGlowBadge: {
    position: 'absolute',
    top: -6,
    right: -5,
    backgroundColor: '#FACC15',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unlockGlowText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '900',
  },
  skillBottomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  miniStatCard: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    backgroundColor: '#F8FAFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    gap: 7,
  },
  miniStatTitle: {
    fontSize: 9,
    color: DARK,
    fontWeight: '900',
  },
  miniStatValue: {
    fontSize: 8,
    color: MUTED,
    fontWeight: '700',
    marginTop: 1,
  },
  trophyIcon: {
    fontSize: 20,
  },
  badgesScrollContent: {
    paddingRight: 22,
    paddingBottom: 8,
    gap: 10,
  },
  badgeCard: {
    width: 162,
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 9,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCopy: {
    flex: 1,
  },
  badgeTitle: {
    color: DARK,
    fontSize: 12,
    fontWeight: '900',
  },
  badgeSubtitle: {
    color: MUTED,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },
});