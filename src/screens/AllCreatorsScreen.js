// src/screens/AllCreatorsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Image, ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import api from '../services/api';

export default function AllCreatorsScreen({ navigation }) {
  const [creators, setCreators]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');
  const [followed, setFollowed]   = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/creator/all');
        setCreators(res.data ?? []);
        setFiltered(res.data ?? []);
      } catch (err) {
        console.log('Failed to fetch creators:', err?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(creators);
    } else {
      const q = query.toLowerCase();
      setFiltered(creators.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.field?.toLowerCase().includes(q)
      ));
    }
  }, [query, creators]);

  const handleFollow = async (creatorId) => {
    const isFollowed = followed[creatorId];
    setFollowed(prev => ({ ...prev, [creatorId]: !isFollowed }));
    try {
      if (isFollowed) await api.delete(`/creators/${creatorId}/follow`);
      else            await api.post(`/creators/${creatorId}/follow`);
    } catch {
      setFollowed(prev => ({ ...prev, [creatorId]: isFollowed }));
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const formatCount = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const renderCreator = ({ item, index }) => {
    const id         = item.id ?? item._id;
    const isFollowed = !!followed[id];
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('PublicProfile', {
          creatorId:    id,
          creatorName:  item.name,
          creatorField: item.field ?? 'Instructor',
        })}
      >
        {/* Rank badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>

        {/* Avatar */}
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{getInitials(item.name)}</Text>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.field} numberOfLines={1}>{item.field ?? 'Instructor'}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flash-outline" size={11} color="#f5a623" />
              <Text style={styles.statText}>{(item.xp ?? 0).toLocaleString()} XP</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={11} color="#888" />
              <Text style={styles.statText}>{formatCount(item.followersCount ?? 0)}</Text>
            </View>
            {(item.coursesCount ?? 0) > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="book-outline" size={11} color="#888" />
                <Text style={styles.statText}>{item.coursesCount}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Follow button */}
        <Pressable
          style={[styles.followBtn, isFollowed && styles.followBtnActive]}
          onPress={() => handleFollow(id)}
        >
          <Text style={[styles.followBtnText, isFollowed && styles.followBtnTextActive]}>
            {isFollowed ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Nav */}
      <View style={styles.nav}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </Pressable>
        <Text style={styles.navTitle}>All Creators</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search creators..."
          placeholderTextColor="#aaa"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </Pressable>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2F54EB" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="person-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No creators found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id ?? item._id)}
          renderItem={renderCreator}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8f9fa' },

  nav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  navTitle: { fontSize: 17, fontWeight: '700', color: '#000' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginHorizontal: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#000' },

  list: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },

  rankBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#e8eeff',
    justifyContent: 'center', alignItems: 'center',
  },
  rankText: { fontSize: 11, fontWeight: '700', color: '#2F54EB' },

  avatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: '#e8eeff',
  },
  avatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#e8eeff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#d0d9ff',
  },
  avatarInitials: { fontSize: 17, fontWeight: '700', color: '#2F54EB' },

  info:  { flex: 1 },
  name:  { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 2 },
  field: { fontSize: 12, color: '#888', marginBottom: 6 },

  statsRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 11, color: '#888' },

  followBtn: {
    backgroundColor: '#2F54EB', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1.5, borderColor: '#2F54EB',
  },
  followBtnActive:     { backgroundColor: '#fff' },
  followBtnText:       { color: '#fff', fontSize: 12, fontWeight: '600' },
  followBtnTextActive: { color: '#2F54EB' },

  empty:     { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#aaa' },
});