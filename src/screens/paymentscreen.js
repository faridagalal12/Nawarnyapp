import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const BLUE = '#0066FF';

const methods = [
  { id: 'card', icon: 'card-outline', label: 'Credit / Debit Card' },
];

export default function PaymentScreen({ navigation, route }) {
  const { course, plan, price, session } = route.params;

  // session = { creator, sessionType, day, slot } when coming from booking flow
  const isSession = !!session;

  const displayTitle = isSession
    ? `${session.sessionType.label} · ${session.sessionType.duration}`
    : (course?.title ?? `${plan} Plan`);

  const displaySubtitle = isSession
    ? `with ${session.creator?.name ?? 'Instructor'} · ${session.day} at ${session.slot?.time}`
    : null;

  const displayPrice = isSession
    ? `$${session.sessionType.price}.00`
    : (course?.price ? `EGP ${course.price}` : price);

  const [selected, setSelected] = useState('card');

  const handleConfirm = () => {
    if (selected === 'card') {
      navigation.navigate('Card', { course, plan, price, session });
    } else {
      if (isSession) {
        Alert.alert('Session Booked! 🎉', `Your session has been confirmed.`, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('SessionBooked', { ...session }),
          },
        ]);
      } else {
        Alert.alert('Payment Successful 🎉', `You enrolled in ${displayTitle}!`, [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CourseCompletion', { course }),
          },
        ]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.container}>

        {/* Order Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>
            {isSession ? 'Session Summary' : 'Order Summary'}
          </Text>
          <View style={styles.summaryRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.summaryPlan} numberOfLines={1}>
                {displayTitle}
              </Text>
              {!!displaySubtitle && (
                <Text style={styles.summarySub} numberOfLines={2}>
                  {displaySubtitle}
                </Text>
              )}
            </View>
            <Text style={styles.summaryPrice}>{displayPrice}</Text>
          </View>

          {/* Extra session detail rows */}
          {isSession && (
            <View style={styles.sessionDetails}>
              <View style={styles.sessionDetailRow}>
                <Ionicons name="person-outline" size={13} color="#888" />
                <Text style={styles.sessionDetailText}>
                  {session.creator?.name ?? 'Instructor'}
                </Text>
              </View>
              <View style={styles.sessionDetailRow}>
                <Ionicons name="calendar-outline" size={13} color="#888" />
                <Text style={styles.sessionDetailText}>{session.day}</Text>
              </View>
              <View style={styles.sessionDetailRow}>
                <Ionicons name="time-outline" size={13} color="#888" />
                <Text style={styles.sessionDetailText}>{session.slot?.time}</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {methods.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[styles.method, selected === m.id && styles.methodSelected]}
            onPress={() => setSelected(m.id)}
          >
            <Ionicons name={m.icon} size={24} color={selected === m.id ? BLUE : '#555'} />
            <Text style={[styles.methodLabel, selected === m.id && { color: BLUE }]}>
              {m.label}
            </Text>
            <View style={[styles.radio, selected === m.id && styles.radioActive]}>
              {selected === m.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.payBtn} onPress={handleConfirm}>
          <Text style={styles.payText}>Confirm & Pay</Text>
        </TouchableOpacity>

        <Text style={styles.secure}>
          <Ionicons name="lock-closed" size={13} color="#aaa" /> Secured with 256-bit encryption
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BLUE },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },

  container: {
    flex: 1, backgroundColor: '#F4F6FB',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20,
  },

  summary: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: '#eee',
  },
  summaryLabel: { fontSize: 13, color: '#999', marginBottom: 8 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  summaryPlan:  { fontSize: 16, fontWeight: '700', color: '#111' },
  summarySub:   { fontSize: 12, color: '#888', marginTop: 3, lineHeight: 17 },
  summaryPrice: { fontSize: 17, fontWeight: '700', color: BLUE },

  sessionDetails: { marginTop: 12, gap: 6, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  sessionDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionDetailText: { fontSize: 13, color: '#555' },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 12 },

  method: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 2, borderColor: 'transparent',
  },
  methodSelected: { borderColor: BLUE },
  methodLabel: { flex: 1, fontSize: 16, color: '#333', fontWeight: '500' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: BLUE },
  radioDot:    { width: 9, height: 9, borderRadius: 5, backgroundColor: BLUE },

  payBtn: {
    backgroundColor: BLUE, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 24,
    shadowColor: BLUE, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  payText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secure:  { textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 16 },
});