// src/screens/CoursesBrowseScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, StatusBar, Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '../services/api';

const CATEGORIES = ['All', 'Design', 'Technology', 'Business', 'Science', 'Mathematics'];

export default function CoursesBrowseScreen({ navigation }) {
  const [activeCat, setActiveCat]             = useState('All');
  const [query, setQuery]                     = useState('');
  const [courses, setCourses]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [creators, setCreators]               = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [followed, setFollowed]               = useState({});

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      const trimmedQuery = query.trim();
      if (activeCat !== 'All') params.category = activeCat;
      if (trimmedQuery.length >= 3) params.search = trimmedQuery;
      const res = await api.get('/courses', { params });
      setCourses(res.data ?? []);
    } catch (err) {
      console.log('Failed to fetch courses:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [activeCat, query]);

  useEffect(() => {
    fetchCourses();
    (async () => {
      try {
        setCreatorsLoading(true);
        const res = await api.get('/creator/trending');
        const creatorList = res.data ?? [];
        setCreators(creatorList);
        setFollowed(
          creatorList.reduce((acc, creator) => {
            const id = creator.id ?? creator._id;
            if (id) acc[id] = !!(creator.isFollowed ?? creator.followed);
            return acc;
          }, {})
        );
      } catch (err) {
        console.log('Failed to fetch creators:', err?.message);
        setCreators([]);
      } finally {
        setCreatorsLoading(false);
      }
    })();
  }, [fetchCourses]);

  const handleFollow = async (creatorId) => {
    const isFollowed = followed[creatorId];
    setFollowed(prev => ({ ...prev, [creatorId]: !isFollowed }));
    try {
      if (isFollowed) await api.delete(`/creators/${creatorId}/follow`);
      else            await api.post(`/creators/${creatorId}/follow`);
    } catch (err) {
      console.log('Follow toggle failed:', err?.response?.data ?? err?.message);
      setFollowed(prev => ({ ...prev, [creatorId]: isFollowed }));
      Alert.alert('Follow failed', 'Please try again.');
    }
  };

  const openCreatorProfile = (creator) => {
    navigation.navigate('PublicProfile', {
      creatorId:    creator.id ?? creator._id,
      creatorName:  creator.name,
      creatorField: creator.field ?? 'Instructor',
    });
  };

  const openCourse = (course) => navigation.navigate('CourseDetail', { course });

  const formatCount = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Browse Courses</Text>
          <Text style={styles.sub}>Find something new to learn</Text>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchRow}>
          <Feather name="search" size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#aaa"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={fetchCourses}
          />
        </View>

        {/* ── Category chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat}
              style={[styles.chip, activeCat === cat && styles.chipActive]}
              onPress={() => setActiveCat(cat)}
            >
              <Text style={[styles.chipText, activeCat === cat && styles.chipTextActive]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Courses list ── */}
        {loading ? (
          <ActivityIndicator size="large" color="#2F54EB" style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {query.trim().length > 0 && query.trim().length < 3
                ? 'Type at least 3 characters to search'
                : 'No courses found'}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {activeCat === 'All' ? 'All Courses' : activeCat} ({courses.length})
            </Text>
            {courses.map(course => (
              <Pressable
                key={course.id ?? course._id}
                style={styles.card}
                onPress={() => openCourse(course)}
              >
                <View style={styles.thumbWrap}>
                  {course.thumbnail ? (
                    <Image source={{ uri: course.thumbnail }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <Ionicons name="play-circle-outline" size={36} color="#2F54EB" />
                    </View>
                  )}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={2}>{course.title}</Text>
                  {course.creator?.name && (
                    <Text style={styles.cardInstructor}>{course.creator.name}</Text>
                  )}
                  <View style={styles.cardMeta}>
                    {course.rating > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons name="star" size={12} color="#f5a623" />
                        <Text style={styles.metaText}>{course.rating.toFixed(1)}</Text>
                      </View>
                    )}
                    {course.enrolledCount > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={12} color="#888" />
                        <Text style={styles.metaText}>{course.enrolledCount}</Text>
                      </View>
                    )}
                    {course.category && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{course.category}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardPrice}>
                    {course.price === 0 ? 'Free' : `EGP ${course.price}`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {/* ── Trending Creators ── */}
        <View style={styles.trendingHeader}>
          <View>
            <Text style={styles.sectionTitle}>Trending Creators</Text>
            <Text style={styles.trendingSub}>Swipe to discover top educators</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('AllCreators')}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {creatorsLoading ? (
          <ActivityIndicator size="small" color="#2F54EB" style={{ marginBottom: 24 }} />
        ) : creators.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="person-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No creators yet</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.creatorsRow}
            decelerationRate="fast"
            snapToInterval={164}
            snapToAlignment="start"
          >
            {creators.map(creator => {
              const id         = creator.id ?? creator._id;
              const isFollowed = !!followed[id];
              return (
                <Pressable
                  key={id}
                  style={styles.creatorCard}
                  onPress={() => openCreatorProfile(creator)}
                >
                  {creator.avatar ? (
                    <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} />
                  ) : (
                    <View style={styles.creatorAvatarFallback}>
                      <Text style={styles.creatorInitials}>
                        {getInitials(creator.name)}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.creatorName} numberOfLines={1}>{creator.name}</Text>
                  <Text style={styles.creatorField} numberOfLines={1}>
                    {creator.field ?? 'Instructor'}
                  </Text>

                  <View style={styles.creatorStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="people-outline" size={11} color="#888" />
                      <Text style={styles.statText}>
                        {formatCount(creator.followersCount ?? 0)}
                      </Text>
                    </View>
                    {(creator.coursesCount ?? 0) > 0 && (
                      <View style={styles.statItem}>
                        <Ionicons name="book-outline" size={11} color="#888" />
                        <Text style={styles.statText}>{creator.coursesCount}</Text>
                      </View>
                    )}
                  </View>

                  <Pressable
                    style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handleFollow(id);
                    }}
                  >
                    <Ionicons
                      name={isFollowed ? 'checkmark' : 'add'}
                      size={14}
                      color={isFollowed ? '#2F54EB' : '#fff'}
                    />
                    <Text style={[styles.followBtnText, isFollowed && styles.followBtnTextActive]}>
                      {isFollowed ? 'Following' : 'Follow'}
                    </Text>
                  </Pressable>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { paddingBottom: 40 },

  header:   { marginTop: 16, marginBottom: 16, paddingHorizontal: 16 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#000' },
  sub:      { fontSize: 14, color: '#666', marginTop: 4 },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16, marginHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#000' },

  chipsRow: { paddingBottom: 16, gap: 8, paddingHorizontal: 16 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  chipActive:     { backgroundColor: '#2F54EB', borderColor: '#2F54EB' },
  chipText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#000',
    marginBottom: 4, paddingHorizontal: 16,
  },

  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  thumbWrap: { width: 110, height: 100 },
  thumb:     { width: '100%', height: '100%' },
  thumbFallback: {
    width: '100%', height: '100%',
    backgroundColor: '#e8eeff',
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo:       { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle:      { fontSize: 14, fontWeight: '700', color: '#000', lineHeight: 20 },
  cardInstructor: { fontSize: 12, color: '#666', marginTop: 2 },
  cardMeta:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  metaItem:       { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText:       { fontSize: 11, color: '#888' },
  categoryBadge: {
    backgroundColor: '#e8eeff', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 10, color: '#2F54EB', fontWeight: '600' },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#2F54EB', marginTop: 4 },

  trendingHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 14,
    paddingHorizontal: 16, marginTop: 28,
  },
  trendingSub: { fontSize: 12, color: '#999', marginTop: 2 },
  seeAll:      { fontSize: 13, color: '#2F54EB', fontWeight: '600' },

  creatorsRow: { paddingLeft: 16, paddingRight: 8, gap: 12, paddingBottom: 4 },

  creatorCard: {
    width: 152, backgroundColor: '#fff',
    borderRadius: 18, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  creatorAvatar: {
    width: 68, height: 68, borderRadius: 34, marginBottom: 10,
    borderWidth: 2, borderColor: '#e8eeff',
  },
  creatorAvatarFallback: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#e8eeff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 10, borderWidth: 2, borderColor: '#d0d9ff',
  },
  creatorInitials: { fontSize: 22, fontWeight: '700', color: '#2F54EB' },
  creatorName: {
    fontSize: 13, fontWeight: '700', color: '#000',
    textAlign: 'center', marginBottom: 3,
  },
  creatorField: {
    fontSize: 11, color: '#999', textAlign: 'center', marginBottom: 8,
  },
  creatorStats: {
    flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'center',
  },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 11, color: '#888' },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#2F54EB', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7,
    borderWidth: 1.5, borderColor: '#2F54EB',
  },
  followBtnActive:     { backgroundColor: '#fff', borderColor: '#2F54EB' },
  followBtnText:       { color: '#fff', fontSize: 12, fontWeight: '600' },
  followBtnTextActive: { color: '#2F54EB' },

  empty:     { alignItems: 'center', marginTop: 40, gap: 12, paddingHorizontal: 16 },
  emptyText: { fontSize: 15, color: '#aaa' },
});
