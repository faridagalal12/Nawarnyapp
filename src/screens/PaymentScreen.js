// src/screens/PaymentScreen.js
// Step 02b — Payment
// Receives the course object via route.params.course.
// On successful payment, navigates to CourseContent (keeps history).
// In production, replace the setTimeout in handlePay with a real call to services/api.js.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadow } from '../constants/theme';

const METHODS = [
  { id: 'card',   label: 'Credit / Debit card', icon: 'credit-card', sub: 'Visa, Mastercard, Meeza' },
  { id: 'wallet', label: 'Mobile wallet',       icon: 'smartphone',  sub: 'Vodafone Cash, InstaPay' },
  { id: 'fawry',  label: 'Fawry',               icon: 'shopping-bag',sub: 'Pay at any Fawry outlet' },
];

export default function PaymentScreen({ route, navigation }) {
  const course = route?.params?.course ?? {
    title: 'Intro to UI/UX Design',
    instructor: 'Sara Khalil',
    price: 499,
  };
  const price = course.price ?? 499;
  const tax = Math.round(price * 0.14);
  const total = price + tax;

  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ name: '', number: '', exp: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  // Card form is only validated when 'card' is selected; wallet/fawry pass through.
  const valid =
    method !== 'card' ||
    (card.name.trim().length > 2 &&
     card.number.replace(/\s/g, '').length === 16 &&
     /^\d{2}\/\d{2}$/.test(card.exp) &&
     /^\d{3,4}$/.test(card.cvv));

  const handlePay = () => {
    if (!valid || processing) return;
    setProcessing(true);
    // TODO: call services/api.js -> processPayment({ course, method, card })
    setTimeout(() => {
      setProcessing(false);
      navigation.navigate('CourseContent', { course });
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Course summary */}
        <View style={styles.summary}>
          <View style={styles.summaryThumb}>
            <Text style={styles.summaryThumbEmoji}>🎨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle} numberOfLines={2}>{course.title}</Text>
            <Text style={styles.summarySub}>{course.instructor}</Text>
          </View>
          <Text style={styles.summaryPrice}>EGP {price}</Text>
        </View>

        {/* Payment methods */}
        <Text style={styles.section}>Payment method</Text>
        {METHODS.map((m) => {
          const active = m.id === method;
          return (
            <Pressable
              key={m.id}
              style={[styles.method, active && styles.methodActive]}
              onPress={() => setMethod(m.id)}
            >
              <Feather
                name={m.icon}
                size={18}
                color={active ? colors.primary700 : colors.ink2}
              />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]}>
                {active && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}

        {/* Card form (conditional) */}
        {method === 'card' && (
          <View style={styles.form}>
            <Text style={styles.label}>Cardholder name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jana Osama"
              placeholderTextColor={colors.ink3}
              value={card.name}
              onChangeText={(v) => setCard({ ...card, name: v })}
            />

            <Text style={styles.label}>Card number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={colors.ink3}
              keyboardType="number-pad"
              maxLength={19}
              value={card.number}
              onChangeText={(v) => {
                const digits = v.replace(/\D/g, '').slice(0, 16);
                const grouped = digits.replace(/(.{4})/g, '$1 ').trim();
                setCard({ ...card, number: grouped });
              }}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Expiry</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.ink3}
                  keyboardType="number-pad"
                  maxLength={5}
                  value={card.exp}
                  onChangeText={(v) => {
                    const digits = v.replace(/\D/g, '').slice(0, 4);
                    const formatted =
                      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                    setCard({ ...card, exp: formatted });
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={colors.ink3}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={card.cvv}
                  onChangeText={(v) => setCard({ ...card, cvv: v.replace(/\D/g, '') })}
                />
              </View>
            </View>
          </View>
        )}

        {/* Order summary */}
        <Text style={styles.section}>Order summary</Text>
        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLbl}>Subtotal</Text>
            <Text style={styles.totalsVal}>EGP {price}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLbl}>VAT (14%)</Text>
            <Text style={styles.totalsVal}>EGP {tax}</Text>
          </View>
          <View style={[styles.totalsRow, styles.totalsTotal]}>
            <Text style={styles.totalsLblBold}>Total</Text>
            <Text style={styles.totalsValBold}>EGP {total}</Text>
          </View>
        </View>

        <View style={styles.secureNote}>
          <MaterialCommunityIcons name="lock-outline" size={14} color={colors.ink3} />
          <Text style={styles.secureText}>
            Secured by 256-bit encryption. We never store CVV.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky pay bar */}
      <View style={styles.payBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.payBarLbl}>Total</Text>
          <Text style={styles.payBarVal}>EGP {total}</Text>
        </View>
        <Pressable
          style={[styles.payBtn, (!valid || processing) && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={!valid || processing}
        >
          <Text style={styles.payBtnText}>
            {processing ? 'Processing…' : 'Pay now →'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: 140 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  backBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title, fontSize: 16, color: colors.ink },

  summary: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md,
    backgroundColor: colors.surface2,
    marginBottom: spacing.lg,
  },
  summaryThumb: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: '#F472B6',
    alignItems: 'center', justifyContent: 'center',
  },
  summaryThumbEmoji: { fontSize: 22 },
  summaryTitle: { fontSize: 13, fontWeight: '600', color: colors.ink },
  summarySub: { fontSize: 11, color: colors.ink3, marginTop: 2 },
  summaryPrice: { fontSize: 13, fontWeight: '700', color: colors.ink, marginLeft: spacing.sm },

  section: {
    fontSize: 12, fontWeight: '700', color: colors.ink2,
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: spacing.sm, marginTop: spacing.sm,
  },

  method: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line,
    marginBottom: spacing.sm,
  },
  methodActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface2,
  },
  methodLabel: { fontSize: 13, fontWeight: '600', color: colors.ink },
  methodSub: { fontSize: 11, color: colors.ink3, marginTop: 2 },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },

  form: { marginBottom: spacing.md },
  label: {
    fontSize: 11, color: colors.ink3, fontWeight: '600',
    marginBottom: 6, marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    fontSize: 14, color: colors.ink,
  },
  formRow: { flexDirection: 'row', gap: spacing.md },

  totals: {
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.line,
    marginBottom: spacing.md,
  },
  totalsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLbl: { fontSize: 12, color: colors.ink3 },
  totalsVal: { fontSize: 12, color: colors.ink2, fontWeight: '500' },
  totalsTotal: {
    borderTopWidth: 1, borderTopColor: colors.line,
    marginTop: 6, paddingTop: 10,
  },
  totalsLblBold: { fontSize: 14, color: colors.ink, fontWeight: '700' },
  totalsValBold: { fontSize: 14, color: colors.ink, fontWeight: '700' },

  secureNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 4,
  },
  secureText: { fontSize: 10, color: colors.ink3 },

  payBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.line,
  },
  payBarLbl: { fontSize: 10, color: colors.ink3 },
  payBarVal: { fontSize: 18, fontWeight: '700', color: colors.ink },
  payBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl, paddingVertical: 12,
    borderRadius: radius.md,
    ...shadow.primary,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});