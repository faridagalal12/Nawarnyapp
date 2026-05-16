import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar, TextInput, Alert, ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../services/api';

const BLUE = '#0066FF';

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
  return clean;
}

export default function CardScreen({ navigation, route }) {
  const { course, plan, price } = route?.params ?? {};

  const displayTitle = course?.title ?? (plan ? `${plan} Plan` : 'Order');
  const displayPrice = course?.price ? `EGP ${course.price}` : (price ?? '');

  const [cardNumber, setCardNumber] = useState('');
  const [cardName,   setCardName]   = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [focused,    setFocused]    = useState(null);

  const isValid =
    cardNumber.replace(/\s/g, '').length === 16 &&
    cardName.trim().length > 2 &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const handlePay = async () => {
    if (!isValid) {
      Alert.alert('Invalid Details', 'Please fill in all card details correctly.');
      return;
    }
    try {
      if (course) {
        await api.post('/courses/enroll', { courseId: course._id ?? course.id });
        Alert.alert('Payment Successful 🎉', `You enrolled in ${course.title}!`, [
          { text: 'Done', onPress: () => navigation.navigate('CourseDetail', { course }) },
        ]);
      } else {
        const planId = plan.toLowerCase();
        await api.post('/subscriptions/subscribe', { plan: planId });
        Alert.alert('Payment Successful 🎉', `You are now subscribed to the ${plan} plan!`, [
          { text: 'Done', onPress: () => navigation.popToTop() },
        ]);
      }
    } catch (err) {
      console.log('Payment error status:', err?.response?.status);
      console.log('Payment error detail:', JSON.stringify(err?.response?.data));
      Alert.alert('Error', err?.response?.data?.error ?? err?.message ?? 'Payment failed.');
    }
  };

  const getCardBrand = () => {
    const num = cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'VISA';
    if (num.startsWith('5')) return 'MASTERCARD';
    if (num.startsWith('3')) return 'AMEX';
    return null;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Card Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <View style={styles.cardPreview}>
          <View style={styles.cardPreviewTop}>
            <Ionicons name="wifi-outline" size={22} color="rgba(255,255,255,0.7)"
              style={{ transform: [{ rotate: '90deg' }] }} />
            {getCardBrand() && <Text style={styles.cardBrand}>{getCardBrand()}</Text>}
          </View>
          <Text style={styles.cardPreviewNumber}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cardPreviewBottom}>
            <View>
              <Text style={styles.cardPreviewLabel}>CARD HOLDER</Text>
              <Text style={styles.cardPreviewValue}>{cardName || 'FULL NAME'}</Text>
            </View>
            <View>
              <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
              <Text style={styles.cardPreviewValue}>{expiry || 'MM/YY'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.orderStrip}>
          <Text style={styles.orderPlan} numberOfLines={1}>{displayTitle}</Text>
          <Text style={styles.orderPrice}>{displayPrice}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Card Number</Text>
          <View style={[styles.inputBox, focused === 'number' && styles.inputFocused]}>
            <Ionicons name="card-outline" size={20} color={focused === 'number' ? BLUE : '#aaa'} />
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#bbb"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={v => setCardNumber(formatCardNumber(v))}
              onFocus={() => setFocused('number')}
              onBlur={() => setFocused(null)}
              maxLength={19}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cardholder Name</Text>
          <View style={[styles.inputBox, focused === 'name' && styles.inputFocused]}>
            <Ionicons name="person-outline" size={20} color={focused === 'name' ? BLUE : '#aaa'} />
            <TextInput
              style={styles.input}
              placeholder="Name on card"
              placeholderTextColor="#bbb"
              autoCapitalize="characters"
              value={cardName}
              onChangeText={setCardName}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={[styles.inputBox, focused === 'expiry' && styles.inputFocused]}>
              <Ionicons name="calendar-outline" size={20} color={focused === 'expiry' ? BLUE : '#aaa'} />
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#bbb"
                keyboardType="numeric"
                value={expiry}
                onChangeText={v => setExpiry(formatExpiry(v))}
                onFocus={() => setFocused('expiry')}
                onBlur={() => setFocused(null)}
                maxLength={5}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <View style={[styles.inputBox, focused === 'cvv' && styles.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color={focused === 'cvv' ? BLUE : '#aaa'} />
              <TextInput
                style={styles.input}
                placeholder="•••"
                placeholderTextColor="#bbb"
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={v => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                onFocus={() => setFocused('cvv')}
                onBlur={() => setFocused(null)}
                maxLength={4}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, !isValid && styles.payBtnDisabled]}
          onPress={handlePay}
          activeOpacity={0.85}
        >
          <Ionicons name="lock-closed" size={18} color="#fff" />
          <Text style={styles.payText}>Pay {displayPrice}</Text>
        </TouchableOpacity>

        <Text style={styles.secure}>
          🔒 256-bit SSL encrypted · Secured payment
        </Text>

      </ScrollView>
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
    backgroundColor: '#F4F6FB',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 40, flexGrow: 1,
  },
  cardPreview: {
    backgroundColor: BLUE,
    borderRadius: 20, padding: 24, marginBottom: 20,
    shadowColor: BLUE, shadowOpacity: 0.4,
    shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardPreviewTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  cardBrand: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  cardPreviewNumber: {
    fontSize: 20, fontWeight: '600', color: '#fff',
    letterSpacing: 3, marginBottom: 24,
  },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginBottom: 4 },
  cardPreviewValue: { fontSize: 14, color: '#fff', fontWeight: '600', letterSpacing: 1 },
  orderStrip: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#E8F0FF', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  orderPlan:  { fontSize: 15, fontWeight: '600', color: '#333', flex: 1, marginRight: 8 },
  orderPrice: { fontSize: 15, fontWeight: '700', color: BLUE },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOpacity: 0.04,
    shadowRadius: 4, elevation: 1,
  },
  inputFocused: { borderColor: BLUE },
  input: { flex: 1, fontSize: 16, color: '#111' },
  row: { flexDirection: 'row' },
  payBtn: {
    backgroundColor: BLUE, borderRadius: 14,
    paddingVertical: 16, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 8,
    marginTop: 8,
    shadowColor: BLUE, shadowOpacity: 0.35,
    shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  payBtnDisabled: { backgroundColor: '#a0b4d6', shadowOpacity: 0 },
  payText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secure: { textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 16 },
});