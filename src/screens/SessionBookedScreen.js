// screens/SessionBookedScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

function ConfirmRow({ icon, text }) {
  return (
    <View style={styles.confirmRow}>
      <View style={styles.confirmIconWrap}>
        <Ionicons name={icon} size={16} color="#2F54EB" />
      </View>
      <Text style={styles.confirmText}>{text}</Text>
    </View>
  );
}

export default function SessionBookedScreen({ route, navigation }) {
  const { creator, sessionType, day, slot, finalPrice } = route.params;

  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim   = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, useNativeDriver: true,
        tension: 80, friction: 6,
      }),
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim,   { toValue: 0,  useNativeDriver: true, tension: 60, friction: 8 }),
      ]),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>

        {/* Animated checkmark */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.successInner}>
            <Ionicons name="checkmark" size={44} color="#2F54EB" />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
          <Text style={styles.title}>Session Booked!</Text>
          <Text style={styles.subtitle}>
            Your session with{' '}
            <Text style={styles.creatorHighlight}>
              {creator.name?.split(' ').slice(0, 2).join(' ')}
            </Text>
            {' '}is confirmed.
          </Text>
          <Text style={styles.emailNote}>A confirmation has been sent to your email.</Text>
        </Animated.View>

        {/* Details card */}
        <Animated.View style={[styles.detailsCard, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
          <ConfirmRow icon="person-outline"            text={creator.name} />
          <ConfirmRow icon="layers-outline"            text={`${sessionType.label} · ${sessionType.duration}`} />
          <ConfirmRow icon="calendar-outline"          text={day} />
          <ConfirmRow icon="time-outline"              text={`${slot.time} (Cairo)`} />
          <ConfirmRow icon="videocam-outline"          text="Link sent 10 min before session" />
          <ConfirmRow icon="shield-checkmark-outline"  text={`EGP ${finalPrice ?? sessionType.price}.00 charged securely`} />
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.btnsCol, { opacity: opacityAnim }]}>
          

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </Pressable>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#f8f9fa' },
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, gap: 20,
  },

  successCircle: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: '#e8eeff',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  successInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#d0d9ff',
    justifyContent: 'center', alignItems: 'center',
  },

  title: { fontSize: 26, fontWeight: '700', color: '#000', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  creatorHighlight: { color: '#2F54EB', fontWeight: '700' },
  emailNote: { fontSize: 12, color: '#aaa', marginTop: 6, textAlign: 'center' },

  detailsCard: {
    backgroundColor: '#fff', borderRadius: 18,
    padding: 18, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    gap: 2,
  },
  confirmRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5',
  },
  confirmIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#e8eeff',
    justifyContent: 'center', alignItems: 'center',
  },
  confirmText: { fontSize: 13, color: '#444', flex: 1 },

  btnsCol: { width: '100%', gap: 10 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2F54EB', borderRadius: 14, paddingVertical: 14,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    alignItems: 'center', paddingVertical: 12,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  secondaryBtnText: { fontSize: 14, color: '#555', fontWeight: '600' },
});
