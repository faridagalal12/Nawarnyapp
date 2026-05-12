// src/screens/CoursesBrowseScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '../services/api';

const CATEGORIES = ['All', 'Design', 'Technology', 'Business', 'Science', 'Mathematics'];

export default function CoursesBrowseScreen({ navigation }) {
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCat !== 'All') params.category = activeCat;
      if (query.trim()) params.search = query.trim();

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
  }, [fetchCourses]);

  const openCourse = (course) => navigation.navigate('CourseDetail', { course });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Browse Courses</Text>
          <Text style={styles.sub}>Find something new to learn</Text>
        </View>

        {/* Search */}
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

        {/* Category chips */}
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

        {/* Courses list */}
        {loading ? (
          <ActivityIndicator size="large" color="#2F54EB" style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No courses found</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {activeCat === 'All' ? 'All Courses' : activeCat} ({courses.length})
            </Text>
            {courses.map(course => (
              <Pressable
                key={course.id}
                style={styles.card}
                onPress={() => openCourse(course)}
              >
                {/* Thumbnail */}
                <View style={styles.thumbWrap}>
                  {course.thumbnail ? (
                    <Image source={{ uri: course.thumbnail }} style={styles.thumb} />
                  ) : (
                    <View style={styles.thumbFallback}>
                      <Ionicons name="play-circle-outline" size={36} color="#2F54EB" />
                    </View>
                  )}
                </View>

                {/* Info */}
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
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  header: { marginTop: 16, marginBottom: 16 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#000' },
  sub: { fontSize: 14, color: '#666', marginTop: 4 },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#000' },

  chipsRow: { paddingBottom: 16, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  chipActive: { backgroundColor: '#2F54EB', borderColor: '#2F54EB' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#000',
    marginBottom: 12,
  },

  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  thumbWrap: { width: 110, height: 100 },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: {
    width: '100%', height: '100%',
    backgroundColor: '#e8eeff',
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#000', lineHeight: 20 },
  cardInstructor: { fontSize: 12, color: '#666', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: '#888' },
  categoryBadge: {
    backgroundColor: '#e8eeff', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  categoryBadgeText: { fontSize: 10, color: '#2F54EB', fontWeight: '600' },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#2F54EB', marginTop: 4 },

  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#aaa' },
});