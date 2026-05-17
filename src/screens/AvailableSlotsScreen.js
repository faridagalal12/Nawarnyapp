// screens/AvailableSlotsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const SESSION_TYPES = [
  { id: 'review',   label: 'Code Review',      duration: '30 min', price: 15, icon: 'code-slash-outline' },
  { id: 'concept',  label: 'Concept Deep-dive', duration: '45 min', price: 22, icon: 'book-outline' },
  { id: 'exam',     label: 'Exam Prep',         duration: '60 min', price: 30, icon: 'school-outline' },
];

const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildCalendar() {
  const today = new Date();
  const days  = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function AvailableSlotsScreen({ route, navigation }) {
  const { creator } = route.params;
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const days = buildCalendar();

  useEffect(() => {
    if (!selectedDay) return;
    setSelectedSlot(null);
    setSlots([]);
    (async () => {
      setLoadingSlots(true);
      try {
        const dateStr = selectedDay.toISOString().split('T')[0];
        const res = await api.get(
          `/creators/${creator.id ?? creator._id}/availability`,
          { params: { date: dateStr } }
        );
        setSlots(res.data?.slots ?? []);
      } catch {
        // fallback demo slots
        setSlots([
          { time: '9:00 AM',  available: true  },
          { time: '10:30 AM', available: true  },
          { time: '12:00 PM', available: false },
          { time: '2:00 PM',  available: true  },
          { time: '3:30 PM',  available: true  },
          { time: '5:00 PM',  available: false },
        ]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [selectedDay, creator]);

  const canContinue = selectedDay && selectedSlot;
const handleContinue = () => {
  navigation.navigate('Payment', {
    plan:  `${sessionType.label} with ${creator.name}`,
    price: `$${sessionType.price}`,
    session: {
      creator,
      sessionType,
      day:  selectedDay.toDateString(),
      slot: selectedSlot,
    },
  });
};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Nav */}
      <View style={styles.nav}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </Pressable>
        <Text style={styles.navTitle}>Available Slots</Text>
        <Text style={styles.stepLabel}>1 of 2</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: '50%' }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Creator pill */}
        <View style={styles.creatorPill}>
          <View style={[styles.pillAvatar, { backgroundColor: creator.color ?? '#e8eeff' }]}>
            <Text style={[styles.pillAvatarText, { color: creator.textColor ?? '#2F54EB' }]}>
              {(creator.name ?? 'U').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.pillName}>{creator.name}</Text>
            <Text style={styles.pillField}>{creator.field ?? 'Instructor'}</Text>
          </View>
        </View>

        {/* Session type */}
        <Text style={styles.sectionLabel}>Session type</Text>
        <View style={styles.typesCol}>
          {SESSION_TYPES.map(t => (
            <Pressable
              key={t.id}
              style={[styles.typeCard, sessionType.id === t.id && styles.typeCardActive]}
              onPress={() => { setSessionType(t); setSelectedSlot(null); }}
            >
              <View style={[styles.typeIcon, sessionType.id === t.id && styles.typeIconActive]}>
                <Ionicons name={t.icon} size={20} color={sessionType.id === t.id ? '#2F54EB' : '#888'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.typeLabel, sessionType.id === t.id && styles.typeLabelActive]}>
                  {t.label}
                </Text>
                <Text style={styles.typeDur}>{t.duration}</Text>
              </View>
              <Text style={[styles.typePrice, sessionType.id === t.id && styles.typePriceActive]}>
                ${t.price}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Date picker */}
        <Text style={styles.sectionLabel}>Pick a date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {days.map((d, i) => {
            const isSelected = selectedDay?.toDateString() === d.toDateString();
            const isToday    = i === 0;
            return (
              <Pressable
                key={i}
                style={[styles.dayCard, isSelected && styles.dayCardActive]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[styles.dayName, isSelected && styles.dayTextActive]}>
                  {isToday ? 'Today' : DAYS_OF_WEEK[d.getDay()]}
                </Text>
                <Text style={[styles.dayNum, isSelected && styles.dayTextActive]}>
                  {d.getDate()}
                </Text>
                <Text style={[styles.dayMonth, isSelected && styles.dayTextActive]}>
                  {MONTHS[d.getMonth()]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Time slots */}
        {selectedDay && (
          <>
            <Text style={styles.sectionLabel}>
              Available times · {selectedDay.toDateString()}
            </Text>
            {loadingSlots ? (
              <ActivityIndicator color="#2F54EB" style={{ marginVertical: 20 }} />
            ) : slots.length === 0 ? (
              <View style={styles.noSlots}>
                <Ionicons name="calendar-outline" size={36} color="#ccc" />
                <Text style={styles.noSlotsText}>No slots available this day</Text>
              </View>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((s, i) => {
                  const isSelected = selectedSlot?.time === s.time;
                  return (
                    <Pressable
                      key={i}
                      style={[
                        styles.slotCard,
                        isSelected && styles.slotCardActive,
                        !s.available && styles.slotCardDisabled,
                      ]}
                      onPress={() => s.available && setSelectedSlot(s)}
                      disabled={!s.available}
                    >
                      <Text style={[
                        styles.slotTime,
                        isSelected && styles.slotTimeActive,
                        !s.available && styles.slotTimeDisabled,
                      ]}>
                        {s.time}
                      </Text>
                      <Text style={[
                        styles.slotAvail,
                        !s.available && styles.slotAvailDisabled,
                      ]}>
                        {s.available ? 'Available' : 'Booked'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}

        {!selectedDay && (
          <View style={styles.hint}>
            <Ionicons name="hand-left-outline" size={28} color="#ccc" />
            <Text style={styles.hintText}>Select a date to see available slots</Text>
          </View>
        )}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        {selectedSlot && (
          <View style={styles.selectionSummary}>
            <Ionicons name="time-outline" size={15} color="#2F54EB" />
            <Text style={styles.selectionText}>
              {sessionType.label} · {selectedSlot.time} · ${sessionType.price}
            </Text>
          </View>
        )}
        <Pressable
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.continueBtnText}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#f8f9fa' },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  navTitle:  { fontSize: 16, fontWeight: '700', color: '#000' },
  stepLabel: { fontSize: 13, color: '#888' },

  progressTrack: { height: 3, backgroundColor: '#e8eeff', marginHorizontal: 16, borderRadius: 2 },
  progressFill:  { height: 3, backgroundColor: '#2F54EB', borderRadius: 2 },

  scroll: { padding: 20, paddingBottom: 120 },

  creatorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 12,
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pillAvatar: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  pillAvatarText: { fontSize: 15, fontWeight: '700' },
  pillName:  { fontSize: 14, fontWeight: '700', color: '#000' },
  pillField: { fontSize: 12, color: '#888' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 10 },

  typesCol: { gap: 8, marginBottom: 24 },
  typeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#f0f0f0',
  },
  typeCardActive: { borderColor: '#2F54EB', backgroundColor: '#f5f7ff' },
  typeIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center', alignItems: 'center',
  },
  typeIconActive:  { backgroundColor: '#e8eeff' },
  typeLabel:       { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  typeLabelActive: { color: '#2F54EB' },
  typeDur:         { fontSize: 11, color: '#999' },
  typePrice:       { fontSize: 16, fontWeight: '700', color: '#333' },
  typePriceActive: { color: '#2F54EB' },

  daysRow: { gap: 8, paddingBottom: 4, marginBottom: 24 },
  dayCard: {
    width: 58, alignItems: 'center', paddingVertical: 10,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#f0f0f0',
  },
  dayCardActive: { backgroundColor: '#2F54EB', borderColor: '#2F54EB' },
  dayName:       { fontSize: 10, color: '#999', marginBottom: 4 },
  dayNum:        { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 2 },
  dayMonth:      { fontSize: 10, color: '#bbb' },
  dayTextActive: { color: '#fff' },

  slotsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  slotCard: {
    width: '47%', backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#f0f0f0',
    padding: 12, alignItems: 'center',
  },
  slotCardActive:   { borderColor: '#2F54EB', backgroundColor: '#f5f7ff' },
  slotCardDisabled: { backgroundColor: '#fafafa', borderColor: '#f0f0f0' },
  slotTime:         { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 3 },
  slotTimeActive:   { color: '#2F54EB' },
  slotTimeDisabled: { color: '#ccc' },
  slotAvail:        { fontSize: 11, color: '#52c41a' },
  slotAvailDisabled:{ color: '#ccc' },

  noSlots: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  noSlotsText: { fontSize: 14, color: '#aaa' },

  hint: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  hintText: { fontSize: 14, color: '#bbb' },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#f8f9fa', padding: 20,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  selectionSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 10,
  },
  selectionText: { fontSize: 13, color: '#2F54EB', fontWeight: '500' },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2F54EB', borderRadius: 14, paddingVertical: 14,
  },
  continueBtnDisabled: { backgroundColor: '#b0beeb' },
  continueBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});