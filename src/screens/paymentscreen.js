import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const BLUE = '#0066FF';

const methods = [
  { id: 'card',   icon: 'card-outline',  label: 'Credit / Debit Card' },
  { id: 'apple',  icon: 'logo-apple',    label: 'Apple Pay' },
  { id: 'paypal', icon: 'logo-paypal',   label: 'PayPal' },
];

export default function PaymentScreen({ navigation, route }) {
  const { course, plan, price } = route.params;

  // Support both course-based and plan-based navigation
  const displayTitle = course?.title ?? `${plan} Plan`;
  const displayPrice = course?.price ? `EGP ${course.price}` : price;

  const [selected, setSelected] = useState('card');

  const handleConfirm = () => {
    if (selected === 'card') {
      navigation.navigate('Card', { course, plan, price });
    } else {
      // Simulate successful payment then go to completion
      Alert.alert('Payment Successful 🎉', `You enrolled in ${displayTitle}!`, [
        {
          text: 'OK',
onPress: () => navigation.navigate('CourseDetail', { course }),        },
      ]);
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
          <Text style={styles.summaryLabel}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryPlan} numberOfLines={1}>{displayTitle}</Text>
            <Text style={styles.summaryPrice}>{displayPrice}</Text>
          </View>
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
  backBtn: { padding: 4 },
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
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryPlan:  { fontSize: 17, fontWeight: '600', color: '#111', flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 17, fontWeight: '700', color: BLUE },
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
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: BLUE },
  payBtn: {
    backgroundColor: BLUE, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    marginTop: 24,
    shadowColor: BLUE, shadowOpacity: 0.3,
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  payText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secure: { textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 16 },
});