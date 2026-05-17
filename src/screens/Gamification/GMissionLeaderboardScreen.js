import React, { useState, useEffect } from 'react';
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';

const BLUE      = '#1689EA';
const DEEP_BLUE = '#0474D8';
const NAVY      = '#08224A';
const YELLOW    = '#FFD84D';

const fallbackCategory = { label: 'Mission', icon: 'graduation-cap', family: 'FontAwesome5', color: '#EF4444' };

function CourseIcon({ category, size = 22, color = '#FFFFFF' }) {
  if (category?.family === 'Ionicons') return <Ionicons name={category.icon} size={size} color={color} />;
  if (category?.family === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={category.icon} size={size} color={color} />;
  return <FontAwesome5 name={category?.icon || 'graduation-cap'} size={size - 3} color={color} />;
}

function CurrencyPill({ gems, coins }) {
  return (
    <View style={styles.currencyPill}>
      <Ionicons name="diamond" size={15} color="#A8DFFB" />
      <Text style={styles.currencyText}>{gems}</Text>
      <View style={styles.currencyDivider} />
      <View style={styles.coinIcon}><Text style={styles.coinIconText}>$</Text></View>
      <Text style={styles.currencyText}>{coins.toLocaleString()}</Text>
    </View>
  );
}

function Avatar({ item, size = 40, user = false }) {
  const initials = item.name ? item.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: item.color || BLUE }, user && styles.userAvatar]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.35 }, user && styles.userAvatarText]}>{initials}</Text>
    </View>
  );
}

function Podium({ leaders }) {
  if (leaders.length < 3) return null;
  const first  = leaders[0];
  const second = leaders[1];
  const third  = leaders[2];
  const PODIUM_COLORS = ['#F59E0B', '#60A5FA', '#FB7185', '#A855F7', '#10B981', '#3B82F6', '#EC4899'];
  first.color  = first.color  || PODIUM_COLORS[0];
  second.color = second.color || PODIUM_COLORS[1];
  third.color  = third.color  || PODIUM_COLORS[2];

  return (
    <View style={styles.podiumCard}>
      <View style={[styles.podiumColumn, styles.sidePodium]}>
        <Avatar item={second} size={64} />
        <View style={styles.rankBubble}><Text style={styles.rankBubbleText}>2</Text></View>
        <View style={[styles.podiumBlock, styles.secondBlock]}>
          <Text style={styles.podiumName}>{second.name}</Text>
          <Text style={styles.podiumXp}>{(second.xp || second.totalXP || 0).toLocaleString()} XP</Text>
        </View>
      </View>
      <View style={[styles.podiumColumn, styles.centerPodium]}>
        <View style={styles.crown}><MaterialCommunityIcons name="crown" size={38} color="#F5B428" /></View>
        <Avatar item={first} size={78} />
        <View style={[styles.rankBubble, styles.firstRankBubble]}><Text style={styles.rankBubbleText}>1</Text></View>
        <View style={[styles.podiumBlock, styles.firstBlock]}>
          <Text style={[styles.podiumName, styles.firstName]}>{first.name}</Text>
          <Text style={[styles.podiumXp, styles.firstXp]}>{(first.xp || first.totalXP || 0).toLocaleString()} XP</Text>
        </View>
      </View>
      <View style={[styles.podiumColumn, styles.sidePodium]}>
        <Avatar item={third} size={64} />
        <View style={[styles.rankBubble, styles.thirdRankBubble]}><Text style={styles.rankBubbleText}>3</Text></View>
        <View style={[styles.podiumBlock, styles.thirdBlock]}>
          <Text style={styles.podiumName}>{third.name}</Text>
          <Text style={styles.podiumXp}>{(third.xp || third.totalXP || 0).toLocaleString()} XP</Text>
        </View>
      </View>
    </View>
  );
}

function RankRow({ item, index }) {
  const COLORS = ['#F59E0B', '#60A5FA', '#FB7185', '#A855F7', '#10B981', '#3B82F6', '#EC4899', '#14B8A6'];
  item.color = item.color || COLORS[index % COLORS.length];
  return (
    <View style={[styles.rankRow, item.isCurrentUser && styles.userRankRow]}>
      <Text style={[styles.rankNumber, item.isCurrentUser && styles.userRankText]}>{item.rank}</Text>
      <Avatar item={item} size={36} user={item.isCurrentUser} />
      <Text style={[styles.rankName, item.isCurrentUser && styles.userRankText]} numberOfLines={1}>{item.name}</Text>
      <View style={styles.streakWrap}>
        <Ionicons name="flame" size={17} color="#F97316" />
        <Text style={[styles.streakText, item.isCurrentUser && styles.userRankText]}>{item.streak || 0}</Text>
      </View>
      <Text style={[styles.rankXp, item.isCurrentUser && styles.userXp]}>{(item.xp || item.totalXP || 0).toLocaleString()} XP</Text>
    </View>
  );
}

export default function GMissionLeaderboardScreen({ navigation, route }) {
  const category     = route?.params?.category     || fallbackCategory;
  const currentLevel = route?.params?.currentLevel || 1;
  const nextLevel    = route?.params?.nextLevel    || currentLevel + 1;
  const totalPoints  = route?.params?.totalPoints  ?? 0;
  const earnedBadges = route?.params?.earnedBadges ?? 0;

  const [activeTab,  setActiveTab]  = useState('weekly');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/gamification/leaderboard?period=${activeTab}`);
        setLeaderboard(res?.data?.leaderboard ?? []);
      } catch (err) {
        console.log('Leaderboard error:', err?.message);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTab]);

  const leaders  = leaderboard.slice(0, 3);
  const rankRows = leaderboard.slice(3);
  const canPlayNext = nextLevel <= 8;

  const playNextLevel = () => {
    if (!canPlayNext) { navigation.goBack(); return; }
    navigation.navigate('GMission', { category, totalPoints, earnedBadges, currentLevel: nextLevel });
  };

  const tabs = [
    { key: 'daily',   label: 'Today' },
    { key: 'weekly',  label: 'This Week' },
    { key: 'allTime', label: 'All Time' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={DEEP_BLUE} />
      <LinearGradient colors={['#1E9BFF', DEEP_BLUE, '#056FC9']} style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.78} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Leaderboard</Text>
            <CurrencyPill gems={earnedBadges} coins={totalPoints} />
          </View>

          <View style={styles.categoryPill}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color || '#EF4444' }]}>
              <CourseIcon category={category} size={22} />
            </View>
            <Text style={styles.categoryTitle}>{category.label} · Level {currentLevel}</Text>
            <View style={styles.trophyBubble}>
              <Ionicons name="trophy" size={22} color={YELLOW} />
            </View>
          </View>

          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity key={tab.key} style={[styles.tab, active && styles.activeTab]} activeOpacity={0.82} onPress={() => setActiveTab(tab.key)}>
                  <Text style={[styles.tabText, active && styles.activeTabText]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={YELLOW} style={{ marginTop: 60 }} />
          ) : leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="podium-outline" size={48} color="rgba(255,255,255,0.4)" />
              <Text style={styles.emptyText}>No data yet — be the first!</Text>
            </View>
          ) : (
            <>
              {leaders.length >= 3 && <Podium leaders={leaders} />}
              <View style={styles.rankList}>
                {rankRows.map((item, i) => (
                  <RankRow key={`${activeTab}-${item.rank}-${item.name}`} item={item} index={i + 3} />
                ))}
              </View>
            </>
          )}

          <View style={styles.climbCard}>
            <View style={styles.climbIcon}><Ionicons name="star" size={32} color={YELLOW} /></View>
            <View style={styles.climbCopy}>
              <Text style={styles.climbTitle}>Keep learning, keep climbing!</Text>
              <Text style={styles.climbText}>Top 10 unlocks an exclusive badge.</Text>
              <TouchableOpacity style={styles.playButton} activeOpacity={0.86} onPress={playNextLevel}>
                <Text style={styles.playButtonText}>{canPlayNext ? `Play Level ${nextLevel}` : 'Back to missions'}</Text>
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
  safe: { flex: 1, backgroundColor: DEEP_BLUE },
  screen: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 34 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: 'rgba(255,255,255,0.34)', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: '#FFFFFF', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  currencyPill: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: 'rgba(0,72,150,0.28)' },
  currencyText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', marginLeft: 4 },
  currencyDivider: { width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 8 },
  coinIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#F5C542', borderWidth: 2, borderColor: '#FFDD67', alignItems: 'center', justifyContent: 'center' },
  coinIconText: { color: '#B45309', fontSize: 12, fontWeight: '900' },
  categoryPill: { minHeight: 58, borderRadius: 22, backgroundColor: 'rgba(0,72,150,0.32)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', flexDirection: 'row', alignItems: 'center', padding: 8, marginBottom: 12 },
  categoryIcon: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  categoryTitle: { flex: 1, color: '#FFFFFF', fontSize: 19, fontWeight: '900' },
  trophyBubble: { width: 44, height: 36, borderRadius: 18, backgroundColor: 'rgba(34,197,94,0.24)', alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(0,72,150,0.32)', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', padding: 4, marginBottom: 18 },
  tab: { flex: 1, minHeight: 38, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  activeTab: { backgroundColor: YELLOW },
  tabText: { color: '#CDEBFF', fontSize: 13, fontWeight: '900' },
  activeTabText: { color: NAVY },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '700' },
  podiumCard: { minHeight: 270, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', paddingTop: 32, paddingHorizontal: 12, overflow: 'hidden' },
  podiumColumn: { flex: 1, alignItems: 'center' },
  centerPodium: { zIndex: 2 },
  sidePodium: { paddingTop: 46 },
  crown: { position: 'absolute', top: -26, zIndex: 3 },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  userAvatar: { borderColor: YELLOW },
  avatarText: { color: '#FFFFFF', fontWeight: '900' },
  userAvatarText: {},
  rankBubble: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center', marginTop: -15, zIndex: 3 },
  firstRankBubble: { backgroundColor: YELLOW, borderColor: '#FFFFFF' },
  thirdRankBubble: { backgroundColor: '#FDBA74', borderColor: '#FFFFFF' },
  rankBubbleText: { color: NAVY, fontSize: 15, fontWeight: '900' },
  podiumBlock: { width: '100%', minHeight: 126, alignItems: 'center', paddingHorizontal: 6, paddingTop: 28 },
  firstBlock: { minHeight: 166, backgroundColor: '#FDE68A', borderTopLeftRadius: 34, borderTopRightRadius: 34 },
  secondBlock: { backgroundColor: '#60A5FA', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  thirdBlock: { backgroundColor: '#FDA4AF', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  podiumName: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', textAlign: 'center' },
  firstName: { color: NAVY, fontSize: 16 },
  podiumXp: { color: '#EAF4FF', fontSize: 12, fontWeight: '900', marginTop: 7 },
  firstXp: { color: BLUE },
  rankList: { backgroundColor: '#F8FAFC', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, padding: 10, marginBottom: 18 },
  rankRow: { minHeight: 54, borderRadius: 15, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 7 },
  userRankRow: { backgroundColor: BLUE, borderWidth: 2, borderColor: YELLOW },
  rankNumber: { width: 25, color: NAVY, fontSize: 14, fontWeight: '900' },
  rankName: { flex: 1, color: NAVY, fontSize: 14, fontWeight: '900', marginLeft: 10 },
  streakWrap: { width: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  streakText: { color: NAVY, fontSize: 13, fontWeight: '900' },
  rankXp: { width: 84, color: NAVY, fontSize: 13, fontWeight: '900', textAlign: 'right' },
  userRankText: { color: '#FFFFFF' },
  userXp: { color: YELLOW },
  climbCard: { borderRadius: 24, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, shadowColor: '#003E83', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 18, elevation: 8 },
  climbIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFF7D6', alignItems: 'center', justifyContent: 'center' },
  climbCopy: { flex: 1 },
  climbTitle: { color: '#1454C8', fontSize: 16, fontWeight: '900' },
  climbText: { color: '#64748B', fontSize: 12, fontWeight: '800', marginTop: 4, marginBottom: 10 },
  playButton: { alignSelf: 'flex-start', minHeight: 34, borderRadius: 999, backgroundColor: YELLOW, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 6 },
  playButtonText: { color: NAVY, fontSize: 12, fontWeight: '900' },
  shieldIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#EAF4FF', alignItems: 'center', justifyContent: 'center' },
});