import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
  ActivityIndicator, Linking, Modal, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { colors, spacing, radius, typography, shadow } from '../constants/theme';
import api from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABS = ['Curriculum', 'Files', 'About'];

export default function CourseDetailScreen({ route, navigation }) {
  const course = route?.params?.course ?? {};
  const courseId = course._id ?? course.id;

 const [tab, setTab]               = useState('Curriculum');
  const [detail, setDetail]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [videoModal, setVideoModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setDetail(res.data);
        setIsEnrolled(res.data.isEnrolled ?? false);
      } catch (err) {
        console.log('Failed to load course detail:', err?.message);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchDetail();
    else setLoading(false);
  }, [courseId]);

  const data = detail ?? course;

  const handleEnroll = () => {
    const price = data.price ?? 0;
    if (price === 0) {
      navigation.navigate('CourseCompletion', { course: data });
    } else {
      navigation.navigate('Payment', { course: data });
    }
  };

  const openVideo = (video) => {
    setActiveVideo(video);
    setVideoModal(true);
  };

  const closeVideo = async () => {
    if (videoRef.current) await videoRef.current.pauseAsync();
    setVideoModal(false);
    setActiveVideo(null);
  };

  const openFile = (fileUrl) => {
    Linking.openURL(fileUrl);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Video Modal */}
      <Modal
        visible={videoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeVideo}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {activeVideo?.title || 'Video'}
            </Text>
            <TouchableOpacity onPress={closeVideo} style={styles.modalClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {activeVideo && (
            <Video
              ref={videoRef}
              source={{ uri: activeVideo.videoUrl }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              onError={(e) => console.log('Video error:', e)}
            />
          )}
          <View style={styles.modalBody}>
            <Text style={styles.modalVideoTitle}>
              {activeVideo?.title || 'Video'}
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Pressable style={styles.heroBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </Pressable>
          <Pressable style={[styles.heroBtn, styles.heroBtnRight]}>
            <Ionicons name="bookmark-outline" size={18} color="#000" />
          </Pressable>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{data.category ?? ''}</Text>
          </View>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={28} color="#fff" />
          </View>
          <View style={styles.heroOverlay} />
        </View>

        <View style={styles.body}>

          {/* Title + instructor */}
          <Text style={styles.title}>{data.title}</Text>
          <View style={styles.instructorRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={14} color="#fff" />
            </View>
            <Text style={styles.instructorName}>
              {data.creator?.name ?? data.creator?.username ?? 'Unknown Instructor'}
            </Text>
          </View>

          {/* Stat row */}
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>⭐ {data.rating > 0 ? data.rating.toFixed(1) : 'New'}</Text>
              <Text style={styles.statLbl}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{detail?.videos?.length ?? 0}</Text>
              <Text style={styles.statLbl}>Videos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{detail?.files?.length ?? 0}</Text>
              <Text style={styles.statLbl}>Files</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statVal}>{data.enrolledCount ?? 0}</Text>
              <Text style={styles.statLbl}>Students</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={styles.tabPill}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                {tab === t && <View style={styles.tabUnderline} />}
              </Pressable>
            ))}
          </View>

          {/* Loading */}
          {loading && (
            <ActivityIndicator color="#2F54EB" size="large" style={{ marginTop: 40 }} />
          )}

          {/* Curriculum — Videos */}
          {!loading && tab === 'Curriculum' && (
            <View>
              {detail?.videos?.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>
                    {detail.videos.length} Video{detail.videos.length > 1 ? 's' : ''}
                  </Text>
                  {detail.videos
                    .sort((a, b) => a.order - b.order)
                    .map((v, i) => (
                      <Pressable
                        key={v._id ?? i}
                        style={styles.itemCard}
                        onPress={() => openVideo(v)}
                      >
                        <View style={styles.itemIconBox}>
                          <Ionicons name="play-circle" size={24} color="#2F54EB" />
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemTitle} numberOfLines={2}>
                            {v.title || `Video ${i + 1}`}
                          </Text>
                          <Text style={styles.itemSub}>Tap to watch</Text>
                        </View>
                        <View style={styles.itemAction}>
                          <Ionicons name="chevron-forward" size={18} color="#2F54EB" />
                        </View>
                      </Pressable>
                    ))}
                </>
              ) : (
                <View style={styles.emptySection}>
                  <Ionicons name="videocam-outline" size={40} color="#ccc" />
                  <Text style={styles.emptyTitle}>No videos yet</Text>
                  <Text style={styles.emptyText}>The instructor hasn't uploaded videos yet</Text>
                </View>
              )}
            </View>
          )}

          {/* Files */}
          {!loading && tab === 'Files' && (
            <View>
              {detail?.files?.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>
                    {detail.files.length} File{detail.files.length > 1 ? 's' : ''}
                  </Text>
                  {detail.files.map((f, i) => (
                    <Pressable
                      key={f._id ?? i}
                      style={styles.itemCard}
                      onPress={() => openFile(f.fileUrl)}
                    >
                      <View style={[styles.itemIconBox, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="document-text" size={24} color="#F57C00" />
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {f.name || `File ${i + 1}`}
                        </Text>
                        <Text style={styles.itemSub}>
                          {f.type ?? 'document'} · Tap to open
                        </Text>
                      </View>
                      <View style={styles.itemAction}>
                        <Ionicons name="download-outline" size={18} color="#F57C00" />
                      </View>
                    </Pressable>
                  ))}
                </>
              ) : (
                <View style={styles.emptySection}>
                  <Ionicons name="document-outline" size={40} color="#ccc" />
                  <Text style={styles.emptyTitle}>No files yet</Text>
                  <Text style={styles.emptyText}>The instructor hasn't uploaded files yet</Text>
                </View>
              )}
            </View>
          )}

          {/* About */}
          {!loading && tab === 'About' && (
            <View>
              <Text style={styles.sectionLabel}>About this course</Text>
              <Text style={styles.aboutText}>
                {data.description?.trim()
                  ? data.description
                  : 'No description provided for this course.'}
              </Text>

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Category</Text>
              <View style={styles.categoryBadge}>
                <Ionicons name="grid-outline" size={14} color="#2F54EB" />
                <Text style={styles.categoryBadgeText}>{data.category}</Text>
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky enroll bar */}
      {!isEnrolled && <View style={styles.enrollBar}>
        <View style={{ flex: 1 }}>
          {(data.price ?? 0) === 0 ? (
            <Text style={styles.priceFree}>Free</Text>
          ) : (
            <>
              <Text style={styles.priceStrike}>EGP {data.originalPrice ?? data.price}</Text>
              <Text style={styles.priceAmount}>EGP {data.price}</Text>
            </>
          )}
        </View>
        <Pressable style={styles.enrollBtn} onPress={handleEnroll}>
          <Text style={styles.enrollText}>
            {(data.price ?? 0) === 0 ? 'Enroll Free →' : 'Buy Now →'}
          </Text>
        </Pressable>
      </View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFF' },
  scroll: { paddingBottom: 120 },

  // Hero
  hero: {
    height: 240, backgroundColor: '#BE185D',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroBtn: {
    position: 'absolute', top: 16, left: 16, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3,
  },
  heroBtnRight: { left: undefined, right: 16 },
  heroBadge: {
    position: 'absolute', top: 16, alignSelf: 'center', zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  playCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
    zIndex: 10,
  },

  // Body
  body: { padding: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A', lineHeight: 28, marginBottom: 10 },

  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  avatarCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#2F54EB',
    justifyContent: 'center', alignItems: 'center',
  },
  instructorName: { fontSize: 13, color: '#475569', fontWeight: '600' },

  statRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 8, elevation: 3,
  },
  stat:        { flex: 1, alignItems: 'center' },
  statVal:     { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  statLbl:     { fontSize: 10, color: '#94A3B8', marginTop: 3, fontWeight: '500' },
  statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },

  tabsRow: {
    flexDirection: 'row', gap: 24,
    borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  tabPill:       { paddingVertical: 10, position: 'relative' },
  tabText:       { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  tabTextActive: { color: '#2F54EB' },
  tabUnderline: {
    height: 2.5, backgroundColor: '#2F54EB', borderRadius: 2,
    position: 'absolute', bottom: -1.5, left: 0, right: 0,
  },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 6, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  itemIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  itemInfo:  { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 3 },
  itemSub:   { fontSize: 12, color: '#94A3B8' },
  itemAction: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#F8FAFF',
    justifyContent: 'center', alignItems: 'center',
  },

  emptySection: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle:   { fontSize: 15, fontWeight: '700', color: '#CBD5E1' },
  emptyText:    { fontSize: 12, color: '#CBD5E1', textAlign: 'center' },

  aboutText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  categoryBadgeText: { fontSize: 13, color: '#2F54EB', fontWeight: '600' },

  // Enroll bar
  enrollBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 12, elevation: 10,
  },
  priceStrike: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },
  priceFree:   { fontSize: 22, fontWeight: '800', color: '#10B981' },
  priceAmount: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  enrollBtn: {
    flex: 1, backgroundColor: '#2F54EB',
    borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2F54EB', shadowOpacity: 0.35,
    shadowRadius: 10, elevation: 5,
  },
  enrollText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Video Modal
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    paddingTop: 50, backgroundColor: '#111',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1, marginRight: 10 },
  modalClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  videoPlayer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * (9 / 16),
    backgroundColor: '#000',
  },
  modalBody: { padding: 20 },
  modalVideoTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
});