import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar,
  ActivityIndicator, Linking, Modal, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import api from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABS = ['About', 'Curriculum', 'Files'];

export default function CourseDetailScreen({ route, navigation }) {
  const course = route?.params?.course ?? {};
  const courseId = course._id ?? course.id;

  const [tab, setTab] = useState('About');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [progress, setProgress] = useState({ watched: 0, total: 0, percent: 0, watchedVideoIds: [] });
  const videoRef = useRef(null);

  const buildCourseSummary = (courseData, progressData = progress) => ({
    ...courseData,
    lessons: progressData?.total ?? courseData?.videos?.length ?? 0,
    duration: courseData?.duration ?? `${progressData?.total ?? courseData?.videos?.length ?? 0} lessons`,
    progressPercent: progressData?.percent ?? 0,
  });

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get(`/courses/${courseId}`);
      setDetail(res.data);
      const enrolled = res.data.isEnrolled ?? false;
      setIsEnrolled(enrolled);
      setIsSaved(res.data.isSaved ?? false);
      if (enrolled) {
        const prog = await api.get(`/courses/${courseId}/progress`);
        setProgress(prog.data);
      }
    } catch (err) {
      console.log('Failed to load course detail:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchDetail();
    else setLoading(false);
  }, [courseId, fetchDetail]);

  useFocusEffect(
    useCallback(() => {
      if (courseId && isEnrolled) {
        fetchDetail();
      }
    }, [courseId, isEnrolled, fetchDetail])
  );

  useEffect(() => {
    const completedCourse = route?.params?.completedCourse;
    if (!completedCourse || completedCourse.id !== courseId) return;

    navigation.setParams({ completedCourse: null });
    navigation.navigate('CourseCompletion', {
      course: buildCourseSummary(detail ?? data, {
        ...progress,
        percent: completedCourse.progressPercent ?? progress.percent ?? 100,
      }),
    });
  }, [route?.params?.completedCourse, courseId, navigation, detail, data, progress]);

  const data = detail ?? course;

  const handleEnroll = async () => {
    const price = data.price ?? 0;
    if (price === 0 || data.canUseProFreeCourse) {
      try {
        await api.post('/courses/enroll', { courseId });
        setIsEnrolled(true);
      } catch (err) {
        console.log('Enroll error:', err?.message);
      }
    } else {
      navigation.navigate('Payment', { course: data });
    }
  };

  const openVideo = async (video) => {
    navigation.navigate('VideoPlayer', {
      video,
      courseId,
    });
  };

  const closeVideo = async () => {
    if (videoRef.current) await videoRef.current.pauseAsync();
    setVideoModal(false);
    setActiveVideo(null);
  };

  const openFile = (fileUrl) => Linking.openURL(fileUrl);

  const isWatched = (videoId) =>
    progress.watchedVideoIds?.includes(videoId?.toString());

  const handleToggleSave = async () => {
    if (!courseId || savingCourse) return;
    setSavingCourse(true);
    try {
      const res = await api.post(`/courses/${courseId}/save`);
      const nextSaved = res?.data?.saved ?? !isSaved;
      setIsSaved(nextSaved);
    } catch (err) {
      console.log("Save course error:", err?.response?.data ?? err?.message);
    } finally {
      setSavingCourse(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <Modal visible={videoModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeVideo}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={1}>{activeVideo?.title || 'Video'}</Text>
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
            <Text style={styles.modalVideoTitle}>{activeVideo?.title || 'Video'}</Text>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable style={styles.topBarBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color="#000" />
          </Pressable>
          <View style={styles.topBarMeta}>
            {!!data.category && (
              <View style={styles.inlineBadge}>
                <Text style={styles.inlineBadgeText}>{data.category}</Text>
              </View>
            )}
          </View>
          <Pressable
            style={styles.topBarBtn}
            onPress={handleToggleSave}
            disabled={savingCourse}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? '#2F54EB' : '#000'}
            />
          </Pressable>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{data.title}</Text>
          <View style={styles.instructorRow}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={14} color="#fff" />
            </View>
            <Text style={styles.instructorName}>
              {data.creator?.name ?? data.creator?.username ?? 'Unknown Instructor'}
            </Text>
          </View>

          {isEnrolled && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressPercent}>{progress.percent}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
              </View>
              <Text style={styles.progressSub}>
                {progress.watched} of {progress.total} videos watched
              </Text>
            </View>
          )}

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

          <View style={styles.tabsRow}>
            {TABS.map((t) => (
              <Pressable key={t} onPress={() => setTab(t)} style={styles.tabPill}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                {tab === t && <View style={styles.tabUnderline} />}
              </Pressable>
            ))}
          </View>

          {loading && <ActivityIndicator color="#2F54EB" size="large" style={{ marginTop: 40 }} />}

          {!loading && tab === 'Curriculum' && (
            <View>
              {detail?.videos?.length > 0 ? (
                <>
                  <Text style={styles.sectionLabel}>
                    {detail.videos.length} Video{detail.videos.length > 1 ? 's' : ''}
                  </Text>
                  {detail.videos
                    .sort((a, b) => a.order - b.order)
                    .map((v, i) => {
                      const watched = isWatched(v._id);
                      return (
                        <Pressable
                          key={v._id ?? i}
                          style={[styles.itemCard, watched && styles.itemCardWatched]}
                          onPress={() => isEnrolled ? openVideo(v) : null}
                        >
                          <View style={[styles.itemIconBox, !isEnrolled && styles.itemIconLocked, watched && styles.itemIconWatched]}>
                            <Ionicons
                              name={!isEnrolled ? 'lock-closed' : watched ? 'checkmark-circle' : 'play-circle'}
                              size={24}
                              color={!isEnrolled ? '#94A3B8' : watched ? '#10B981' : '#2F54EB'}
                            />
                          </View>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={2}>
                              {v.title || `Video ${i + 1}`}
                            </Text>
                            <Text style={styles.itemSub}>
                              {!isEnrolled ? 'Purchase to unlock' : watched ? 'Watched ✓' : 'Tap to watch'}
                            </Text>
                          </View>
                          <View style={styles.itemAction}>
                            <Ionicons
                              name={!isEnrolled ? 'lock-closed-outline' : 'chevron-forward'}
                              size={18}
                              color={!isEnrolled ? '#CBD5E1' : '#2F54EB'}
                            />
                          </View>
                        </Pressable>
                      );
                    })}
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
                      onPress={() => isEnrolled ? openFile(f.fileUrl) : null}
                    >
                      <View style={[styles.itemIconBox, { backgroundColor: !isEnrolled ? '#F8FAFC' : '#FFF3E0' }]}>
                        <Ionicons
                          name={!isEnrolled ? 'lock-closed' : 'document-text'}
                          size={24}
                          color={!isEnrolled ? '#94A3B8' : '#F57C00'}
                        />
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {f.name || `File ${i + 1}`}
                        </Text>
                        <Text style={styles.itemSub}>
                          {!isEnrolled ? 'Purchase to unlock' : `${f.type ?? 'document'} · Tap to open`}
                        </Text>
                      </View>
                      <View style={styles.itemAction}>
                        <Ionicons
                          name={!isEnrolled ? 'lock-closed-outline' : 'download-outline'}
                          size={18}
                          color={!isEnrolled ? '#CBD5E1' : '#F57C00'}
                        />
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

          {!loading && tab === 'About' && (
            <View>
              <Text style={styles.sectionLabel}>About this course</Text>
              <Text style={styles.aboutText}>
                {data.description?.trim() ? data.description : 'No description provided for this course.'}
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

      {isEnrolled && (
        <View style={styles.enrolledBar}>
          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          <Text style={styles.enrolledText}>You are enrolled · {progress.percent}% complete</Text>
          {progress.percent >= 100 && (
            <Pressable
              style={styles.certificateBtn}
              onPress={() => navigation.navigate('Certificate', {
                course: buildCourseSummary(detail ?? data),
              })}
            >
              <Text style={styles.certificateBtnText}>Get Certificate</Text>
            </Pressable>
          )}
        </View>
      )}

      {!isEnrolled && (
        <View style={styles.enrollBar}>
          <View style={{ flex: 1 }}>
            {(data.price ?? 0) === 0 ? (
              <Text style={styles.priceFree}>Free</Text>
            ) : data.canUseProFreeCourse ? (
              <>
                <Text style={styles.priceStrike}>EGP {data.originalPrice ?? data.price}</Text>
                <Text style={styles.priceAmount}>Free with Pro</Text>
              </>
            ) : (
              <>
                <Text style={styles.priceStrike}>EGP {data.originalPrice ?? data.price}</Text>
                <Text style={styles.priceAmount}>EGP {data.price}</Text>
              </>
            )}
          </View>
          <Pressable style={styles.enrollBtn} onPress={handleEnroll}>
            <Text style={styles.enrollText}>
              {(data.price ?? 0) === 0
                ? 'Enroll Free →'
                : data.canUseProFreeCourse
                  ? 'Use Pro Free Course →'
                  : 'Buy Now →'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F8FAFF' },
  scroll: { paddingBottom: 120 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 12 },
  topBarBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  topBarMeta: { flex: 1, alignItems: 'center' },
  inlineBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  inlineBadgeText: { color: '#2F54EB', fontSize: 12, fontWeight: '700' },
  body: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A', lineHeight: 28, marginBottom: 10 },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  avatarCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2F54EB', justifyContent: 'center', alignItems: 'center' },
  instructorName: { fontSize: 13, color: '#475569', fontWeight: '600' },
  progressContainer: { backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14, marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '700', color: '#2F54EB' },
  progressPercent: { fontSize: 13, fontWeight: '800', color: '#2F54EB' },
  progressTrack: { height: 8, backgroundColor: '#C7D2FE', borderRadius: 999, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#2F54EB', borderRadius: 999 },
  progressSub: { fontSize: 11, color: '#6366F1', fontWeight: '500' },
  statRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  statLbl: { fontSize: 10, color: '#94A3B8', marginTop: 3, fontWeight: '500' },
  statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
  tabsRow: { flexDirection: 'row', gap: 24, borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', marginBottom: 20 },
  tabPill: { paddingVertical: 10, position: 'relative' },
  tabText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  tabTextActive: { color: '#2F54EB' },
  tabUnderline: { height: 2.5, backgroundColor: '#2F54EB', borderRadius: 2, position: 'absolute', bottom: -1.5, left: 0, right: 0 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' },
  itemCardWatched: { borderColor: '#D1FAE5', backgroundColor: '#F0FDF4' },
  itemIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemIconLocked: { backgroundColor: '#F8FAFC' },
  itemIconWatched: { backgroundColor: '#D1FAE5' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 3 },
  itemSub: { fontSize: 12, color: '#94A3B8' },
  itemAction: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#F8FAFF', justifyContent: 'center', alignItems: 'center' },
  emptySection: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#CBD5E1' },
  emptyText: { fontSize: 12, color: '#CBD5E1', textAlign: 'center' },
  aboutText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryBadgeText: { fontSize: 13, color: '#2F54EB', fontWeight: '600' },
  enrollBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  priceStrike: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },
  priceFree: { fontSize: 22, fontWeight: '800', color: '#10B981' },
  priceAmount: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  enrollBtn: { flex: 1, backgroundColor: '#2F54EB', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#2F54EB', shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  enrollText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50, backgroundColor: '#111' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#fff', flex: 1, marginRight: 10 },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  videoPlayer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * (9 / 16), backgroundColor: '#000' },
  modalBody: { padding: 20 },
  modalVideoTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  enrolledBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 28, backgroundColor: '#F0FDF4', borderTopWidth: 1, borderTopColor: '#BBF7D0' },
  enrolledText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#10B981' },
  certificateBtn: { backgroundColor: '#2F54EB', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  certificateBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
