import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const BLUE = '#1689EA';
const DEEP_BLUE = '#0474D8';
const NAVY = '#08224A';
const YELLOW = '#FFD84D';

const fallbackCategory = {
  label: 'UI/UX',
  icon: 'color-palette',
  family: 'Ionicons',
  color: '#EF4444',
};

const LEADERBOARDS = {
  Today: [
    { rank: 1, name: 'Alex Morgan', xp: 28740, streak: 15, initial: 'A', color: '#F59E0B' },
    { rank: 2, name: 'Sarah Chen', xp: 21350, streak: 13, initial: 'S', color: '#60A5FA' },
    { rank: 3, name: 'Riya Patel', xp: 18930, streak: 11, initial: 'R', color: '#FB7185' },
    { rank: 4, name: 'Mei Ling', xp: 16870, streak: 12, initial: 'M', color: '#A855F7' },
    { rank: 5, name: 'James Lee', xp: 15640, streak: 9, initial: 'J', color: '#10B981' },
    { rank: 6, name: 'Youssef Tarek', xp: 14800, streak: 8, initial: 'Y', color: '#3B82F6' },
    { rank: 7, name: 'Selim Waleed', xp: 13420, streak: 7, initial: 'S', color: '#EC4899' },
    { rank: 8, name: 'You', xp: 12960, streak: 7, initial: 'You', color: BLUE, isUser: true },
  ],
  'This Week': [
    { rank: 1, name: 'Sarah Chen', xp: 52400, streak: 18, initial: 'S', color: '#60A5FA' },
    { rank: 2, name: 'Alex Morgan', xp: 50120, streak: 15, initial: 'A', color: '#F59E0B' },
    { rank: 3, name: 'James Lee', xp: 47240, streak: 14, initial: 'J', color: '#10B981' },
    { rank: 4, name: 'Riya Patel', xp: 45110, streak: 11, initial: 'R', color: '#FB7185' },
    { rank: 5, name: 'Mei Ling', xp: 43890, streak: 12, initial: 'M', color: '#A855F7' },
    { rank: 6, name: 'You', xp: 42180, streak: 9, initial: 'You', color: BLUE, isUser: true },
    { rank: 7, name: 'Youssef Tarek', xp: 39720, streak: 8, initial: 'Y', color: '#3B82F6' },
    { rank: 8, name: 'Selim Waleed', xp: 37190, streak: 7, initial: 'S', color: '#EC4899' },
  ],
  'All Time': [
    { rank: 1, name: 'Mei Ling', xp: 188420, streak: 32, initial: 'M', color: '#A855F7' },
    { rank: 2, name: 'Alex Morgan', xp: 177900, streak: 28, initial: 'A', color: '#F59E0B' },
    { rank: 3, name: 'Sarah Chen', xp: 171350, streak: 26, initial: 'S', color: '#60A5FA' },
    { rank: 4, name: 'Riya Patel', xp: 160210, streak: 22, initial: 'R', color: '#FB7185' },
    { rank: 5, name: 'James Lee', xp: 151640, streak: 20, initial: 'J', color: '#10B981' },
    { rank: 6, name: 'Youssef Tarek', xp: 140800, streak: 19, initial: 'Y', color: '#3B82F6' },
    { rank: 7, name: 'You', xp: 132960, streak: 17, initial: 'You', color: BLUE, isUser: true },
    { rank: 8, name: 'Selim Waleed', xp: 123420, streak: 15, initial: 'S', color: '#EC4899' },
  ],
};

function CourseIcon({ category, size = 22, color = '#FFFFFF' }) {
  if (category?.family === 'Ionicons') {
    return <Ionicons name={category.icon} size={size} color={color} />;
  }

  if (category?.family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={category.icon} size={size} color={color} />;
  }

  return <FontAwesome5 name={category?.icon || 'graduation-cap'} size={size - 3} color={color} />;
}

function CurrencyPill({ gems, coins }) {
  return (
    <View style={styles.currencyPill}>
      <Ionicons name="diamond" size={15} color="#A8DFFB" />
      <Text style={styles.currencyText}>{gems.toLocaleString()}</Text>
      <View style={styles.currencyDivider} />
      <View style={styles.coinIcon}>
        <Text style={styles.coinIconText}>$</Text>
      </View>
      <Text style={styles.currencyText}>{coins.toLocaleString()}</Text>
    </View>
  );
}

function Avatar({ item, size = 40, user = false }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: item.color }, user && styles.userAvatar]}>
      <Text style={[styles.avatarText, user && styles.userAvatarText]}>{item.initial}</Text>
    </View>
  );
}

function Podium({ leaders }) {
  const first = leaders.find((item) => item.rank === 1);
  const second = leaders.find((item) => item.rank === 2);
  const third = leaders.find((item) => item.rank === 3);

  return (
    <View style={styles.podiumCard}>
      <View style={[styles.podiumColumn, styles.sidePodium]}>
        <Avatar item={second} size={64} />
        <View style={styles.rankBubble}>
          <Text style={styles.rankBubbleText}>2</Text>
        </View>
        <View style={[styles.podiumBlock, styles.secondBlock]}>
          <Text style={styles.podiumName}>{second.name}</Text>
          <Text style={styles.podiumXp}>{second.xp.toLocaleString()} XP</Text>
        </View>
      </View>

      <View style={[styles.podiumColumn, styles.centerPodium]}>
        <View style={styles.crown}>
          <MaterialCommunityIcons name="crown" size={38} color="#F5B428" />
        </View>
        <Avatar item={first} size={78} />
        <View style={[styles.rankBubble, styles.firstRankBubble]}>
          <Text style={styles.rankBubbleText}>1</Text>
        </View>
        <View style={[styles.podiumBlock, styles.firstBlock]}>
          <Text style={[styles.podiumName, styles.firstName]}>{first.name}</Text>
          <Text style={[styles.podiumXp, styles.firstXp]}>{first.xp.toLocaleString()} XP</Text>
        </View>
      </View>

      <View style={[styles.podiumColumn, styles.sidePodium]}>
        <Avatar item={third} size={64} />
        <View style={[styles.rankBubble, styles.thirdRankBubble]}>
          <Text style={styles.rankBubbleText}>3</Text>
        </View>
        <View style={[styles.podiumBlock, styles.thirdBlock]}>
          <Text style={styles.podiumName}>{third.name}</Text>
          <Text style={styles.podiumXp}>{third.xp.toLocaleString()} XP</Text>
        </View>
      </View>
    </View>
  );
}

function RankRow({ item }) {
  return (
    <View style={[styles.rankRow, item.isUser && styles.userRankRow]}>
      <Text style={[styles.rankNumber, item.isUser && styles.userRankText]}>{item.rank}</Text>
      <Avatar item={item} size={36} user={item.isUser} />
      <Text style={[styles.rankName, item.isUser && styles.userRankText]} numberOfLines={1}>{item.name}</Text>
      <View style={styles.streakWrap}>
        <Ionicons name="flame" size={17} color="#F97316" />
        <Text style={[styles.streakText, item.isUser && styles.userRankText]}>{item.streak}</Text>
      </View>
      <Text style={[styles.rankXp, item.isUser && styles.userXp]}>{item.xp.toLocaleString()} XP</Text>
    </View>
  );
}

export default function GMissionLeaderboardScreen({ navigation, route }) {
  const category = route?.params?.category || fallbackCategory;
  const levels = route?.params?.levels || [];
  const currentLevel = route?.params?.currentLevel || 2;
  const nextLevel = route?.params?.nextLevel || currentLevel + 1;
  const totalPoints = route?.params?.totalPoints ?? 20;
  const earnedBadges = route?.params?.earnedBadges ?? 4;
  const [activeTab, setActiveTab] = useState('Today');

  const rows = LEADERBOARDS[activeTab];
  const leaders = rows.slice(0, 3);
  const rankRows = rows.slice(3);
  const nextLevelName = levels[nextLevel - 1] || `Level ${nextLevel}`;
  const canPlayNext = nextLevel <= 8;

  const playNextLevel = () => {
    if (!canPlayNext) {
      navigation.navigate('ChallengeHome');
      return;
    }

    navigation.navigate('GMission', {
      category,
      levels,
      totalPoints,
      earnedBadges,
      currentLevel: nextLevel,
    });
  };

  const categoryTitle = useMemo(() => `${category.label || 'Mission'} • Level ${currentLevel}`, [category.label, currentLevel]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={DEEP_BLUE} />
      <LinearGradient colors={['#1E9BFF', DEEP_BLUE, '#056FC9']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.78} onPress={() => navigation.navigate('ChallengeHome')}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Leaderboard</Text>
            <CurrencyPill gems={earnedBadges * 250} coins={totalPoints + 6320} />
          </View>

          <View style={styles.categoryPill}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color || '#EF4444' }]}>
              <CourseIcon category={category} size={22} />
            </View>
            <Text style={styles.categoryTitle}>{categoryTitle}</Text>
            <View style={styles.trophyBubble}>
              <Ionicons name="trophy" size={22} color={YELLOW} />
            </View>
          </View>

          <View style={styles.tabs}>
            {Object.keys(LEADERBOARDS).map((tab) => {
              const active = activeTab === tab;

              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, active && styles.activeTab]}
                  activeOpacity={0.82}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, active && styles.activeTabText]}>{tab}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Podium leaders={leaders} />

          <View style={styles.rankList}>
            {rankRows.map((item) => (
              <RankRow key={`${activeTab}-${item.rank}-${item.name}`} item={item} />
            ))}
          </View>

          <View style={styles.climbCard}>
            <View style={styles.climbIcon}>
              <Ionicons name="star" size={32} color={YELLOW} />
            </View>
            <View style={styles.climbCopy}>
              <Text style={styles.climbTitle}>Keep learning, keep climbing!</Text>
              <Text style={styles.climbText}>Top 10 unlocks an exclusive badge.</Text>
              <TouchableOpacity style={styles.playButton} activeOpacity={0.86} onPress={playNextLevel}>
                <Text style={styles.playButtonText}>{canPlayNext ? `Play ${nextLevelName}` : 'Back to missions'}</Text>
                <Ionicons name="arrow-forward" size={18} color={NAVY} />
              </TouchableOpacity>
            </View>
            <View style={styles.shieldIcon}>
              <MaterialCommunityIcons name="shield-star" size={44} color={YELLOW} />
            </View>
          </View>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 34,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(0,72,150,0.28)',
  },
  currencyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 4,
  },
  currencyDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
  },
  coinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F5C542',
    borderWidth: 2,
    borderColor: '#FFDD67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '900',
  },
  categoryPill: {
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: 'rgba(0,72,150,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  categoryTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
  },
  trophyBubble: {
    width: 44,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34,197,94,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,72,150,0.32)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: YELLOW,
  },
  tabText: {
    color: '#CDEBFF',
    fontSize: 13,
    fontWeight: '900',
  },
  activeTabText: {
    color: NAVY,
  },
  podiumCard: {
    minHeight: 270,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 32,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  centerPodium: {
    zIndex: 2,
  },
  sidePodium: {
    paddingTop: 46,
  },
  crown: {
    position: 'absolute',
    top: -26,
    zIndex: 3,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userAvatar: {
    borderColor: YELLOW,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  userAvatarText: {
    fontSize: 11,
  },
  rankBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
    zIndex: 3,
  },
  firstRankBubble: {
    backgroundColor: YELLOW,
    borderColor: '#FFFFFF',
  },
  thirdRankBubble: {
    backgroundColor: '#FDBA74',
    borderColor: '#FFFFFF',
  },
  rankBubbleText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: '900',
  },
  podiumBlock: {
    width: '100%',
    minHeight: 126,
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingTop: 28,
  },
  firstBlock: {
    minHeight: 166,
    backgroundColor: '#FDE68A',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  secondBlock: {
    backgroundColor: '#60A5FA',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  thirdBlock: {
    backgroundColor: '#FDA4AF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  podiumName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  firstName: {
    color: NAVY,
    fontSize: 16,
  },
  podiumXp: {
    color: '#EAF4FF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 7,
  },
  firstXp: {
    color: BLUE,
  },
  rankList: {
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    padding: 10,
    marginBottom: 18,
  },
  rankRow: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 7,
  },
  userRankRow: {
    backgroundColor: BLUE,
    borderWidth: 2,
    borderColor: YELLOW,
  },
  rankNumber: {
    width: 25,
    color: NAVY,
    fontSize: 14,
    fontWeight: '900',
  },
  rankName: {
    flex: 1,
    color: NAVY,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 10,
  },
  streakWrap: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  streakText: {
    color: NAVY,
    fontSize: 13,
    fontWeight: '900',
  },
  rankXp: {
    width: 84,
    color: NAVY,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  userRankText: {
    color: '#FFFFFF',
  },
  userXp: {
    color: YELLOW,
  },
  climbCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    shadowColor: '#003E83',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  climbIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF7D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  climbCopy: {
    flex: 1,
  },
  climbTitle: {
    color: '#1454C8',
    fontSize: 16,
    fontWeight: '900',
  },
  climbText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 10,
  },
  playButton: {
    alignSelf: 'flex-start',
    minHeight: 34,
    borderRadius: 999,
    backgroundColor: YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 6,
  },
  playButtonText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '900',
  },
  shieldIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
