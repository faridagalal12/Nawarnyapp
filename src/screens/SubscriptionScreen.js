import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '../services/api';

const BLUE = '#0066FF';

const plans = [
  {
    id: 'basic',
    title: 'Basic',
    price: 'Free',
    subtitle: 'Good for beginners',
    features: ['1 free course', 'Basic AI chatbot', 'Priority learner support'],
    isFree: true,
  },
  {
    id: 'starter',
    title: 'Starter',
    price: '$44.99',
    period: '/ month',
    subtitle: 'Best for active learners',
    popular: true,
    features: [
      '50 credits',
      '2 free courses',
      'Unlimited AI learning chatbot access',
      'Priority learner support',
      'Discount on additional credits',
    ],
  },
  {
    id: 'pro',
    title: 'Pro',
    price: '$99.99',
    period: '/ month',
    subtitle: 'Best for full access',
    features: [
      'Unlimited course access',
      'Unlimited 1-to-1 learning sessions',
      'Unlimited AI chatbot access',
      'Priority learner support',
      'Advanced gamification access',
    ],
  },
];

export default function SubscriptionScreen({ navigation }) {
  const [selected, setSelected] = useState('starter');
  const [currentPlan, setCurrentPlan] = useState(null);

  React.useEffect(() => {
    api.get('/subscriptions/current').then(res => {
      const plan = res?.data?.plan ?? 'basic';
      setCurrentPlan(plan);
      setSelected(plan);
    }).catch(() => {});
  }, []);

  const handleChoose = (plan) => {
    if (plan.isFree) {
      navigation.goBack();
    } else {
      navigation.navigate('Payment', { plan: plan.title, price: plan.price });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={BLUE} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pricing Plans</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the subscription that matches your learning needs.
        </Text>

        {plans.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(plan.id)}
              activeOpacity={0.85}
            >
              {plan.popular && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>MOST POPULAR</Text>
                </View>
              )}
              {currentPlan === plan.id && (
                <View style={[styles.badge, { backgroundColor: '#E8FFE8' }]}>
                  <Text style={[styles.badgeText, { color: '#10B981' }]}>CURRENT PLAN</Text>
                </View>
              )}

              <View style={styles.cardTop}>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={[styles.price, isSelected && { color: BLUE }]}>
                    {plan.price}
                  </Text>
                  {plan.period && (
                    <Text style={styles.period}>{plan.period}</Text>
                  )}
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.featureList}>
                {plan.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={isSelected ? BLUE : '#bbb'}
                    />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => handleChoose(plans.find(p => p.id === selected))}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>
            {selected === 'basic' ? 'Continue with Basic' : 'Continue to Payment'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Cancel anytime. No hidden fees.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BLUE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BLUE,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  container: {
    backgroundColor: '#F4F6FB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardSelected: {
    borderColor: BLUE,
    shadowOpacity: 0.12,
    elevation: 4,
  },
  badge: {
    backgroundColor: '#E8F0FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: BLUE, letterSpacing: 0.5 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterActive: { borderColor: BLUE },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: BLUE },
  planTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  planSubtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 20, fontWeight: '700', color: '#111' },
  period: { fontSize: 12, color: '#999', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 12 },
  featureList: { gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, color: '#444', flex: 1 },
  ctaButton: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: BLUE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  footerNote: { textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: 16 },
});