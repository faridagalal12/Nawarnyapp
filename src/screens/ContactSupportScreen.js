import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ContactSupportScreen({ navigation }) {
  const WEBSITE_URL = "https://www.nawarny.com";
  const SUPPORT_EMAIL = "Nawarnyy@gmail.com";
  const SUPPORT_PHONE = "01112223333";
  const [message, setMessage] = useState("");
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);

  const faqs = [
    {
      title: "How do I reset my password?",
      body: "Go to Login > Forgot Password, then follow the steps to receive a reset code.",
    },
    {
      title: "How do I update my profile?",
      body: "Open Profile > tap the pencil icon, update your info, then press Save.",
    },
    {
      title: "Why can't I upload a photo?",
      body: "Make sure you allowed photo permissions, then try again with a smaller image.",
    },
    {
      title: "How do I contact support?",
      body: "Use the message box below, or email/call us from Customer Support.",
    },
    {
      title: "How do I change my email?",
      body: "Go to Profile > Edit Profile, update your email, then press Save.",
    },
    {
      title: "How do I change my username?",
      body: "Go to Profile > Edit Profile, update your username, then press Save.",
    },
    {
      title: "My profile changes aren't saving — what should I do?",
      body: "Check your internet connection, try again, then log out and log in if it still fails.",
    },
    {
      title: "I didn't receive a verification code",
      body: "Wait 1–2 minutes, check spam, then request a new code and make sure your email is correct.",
    },
    {
      title: "The app is slow or crashing",
      body: "Close and reopen the app. If the issue continues, update the app and restart your phone.",
    },
    {
      title: "How do I delete my account?",
      body: "Contact support using the message box below and include the email on your account.",
    },
  ];

  const openUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      // no-op (Linking can fail on simulators without handlers)
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert("Message required", "Please write your concern before sending.");
      return;
    }

    const subject = "Nawarny Support";
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(trimmed)}`;

    await openUrl(mailto);
    setMessage("");
  };

  const handleMessageFocus = () => {
    // Make sure the message box scrolls into view above the keyboard.
    setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 50);
  };

  const Wrapper = Platform.OS === "ios" ? KeyboardAvoidingView : View;
  const wrapperProps =
    Platform.OS === "ios" ? { behavior: "padding", keyboardVerticalOffset: 0 } : {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Wrapper style={styles.flex} {...wrapperProps}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingBottom: 26 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heroTitle}>How can we help you today?</Text>

          <Text style={styles.sectionLabel}>FAQs</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.faqRow}
            keyboardShouldPersistTaps="handled"
          >
            {faqs.map((faq, idx) => (
              <TouchableOpacity
                key={`${faq.title}-${idx}`}
                style={styles.faqCard}
                activeOpacity={0.9}
                onPress={() => Alert.alert(faq.title, faq.body)}
              >
                <View style={styles.faqAccent} />
                <Text style={styles.faqTitle} numberOfLines={2}>
                  {faq.title}
                </Text>
                <Text style={styles.faqBody} numberOfLines={3}>
                  {faq.body}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.blueCard}
            onPress={() => openUrl(WEBSITE_URL)}
            activeOpacity={0.85}
          >
            <Text style={styles.cardTitle}>Website</Text>
            <Text style={styles.cardBody}>
              Visit our website {WEBSITE_URL.replace(/^https?:\/\//, "")} for more information about our App.
            </Text>
          </TouchableOpacity>

          <View style={styles.blueCard}>
            <Text style={styles.cardTitle}>Customer Support</Text>
            <Text style={styles.cardBody}>
              Email us at{" "}
              <Text style={styles.linkInline} onPress={() => openUrl(`mailto:${SUPPORT_EMAIL}`)}>
                {SUPPORT_EMAIL}
              </Text>
              {"\n"}or dial{" "}
              <Text style={styles.linkInline} onPress={() => openUrl(`tel:${SUPPORT_PHONE}`)}>
                {SUPPORT_PHONE}
              </Text>{" "}
              for Customer Support
            </Text>
          </View>

          <View style={styles.yellowCard}>
            <Text style={styles.yellowTitle}>
              Leave your message here and we will contact you shortly!
            </Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Write your Concern Here.."
              placeholderTextColor="#6b7280"
              multiline
              textAlignVertical="top"
              scrollEnabled={false}
              value={message}
              onChangeText={setMessage}
              onFocus={handleMessageFocus}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend} activeOpacity={0.85}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: "#ffffff",
  },
  backBtn: { width: 32, height: 32, alignItems: "flex-start", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 6,
  },
  headerSpacer: { width: 32, height: 32 },
  content: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 26 },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 34,
    marginBottom: 14,
  },
  sectionLabel: { fontSize: 22, color: "#F4B000", fontWeight: "900", marginBottom: 10 },
  faqRow: { paddingBottom: 16 },
  faqCard: {
    width: 240,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 14,
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  faqAccent: { height: 3, width: 64, backgroundColor: "#2F54EB", borderRadius: 999, marginBottom: 10 },
  faqTitle: { fontSize: 14.5, fontWeight: "800", color: "#111827", marginBottom: 6 },
  faqBody: { fontSize: 12.8, color: "#6b7280", lineHeight: 18 },
  blueCard: {
    borderWidth: 1.2,
    borderColor: "#2F54EB",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 8 },
  cardBody: { fontSize: 13.5, color: "#111827", lineHeight: 18.5 },
  linkInline: { color: "#2F54EB", fontWeight: "800" },
  yellowCard: {
    borderWidth: 1.2,
    borderColor: "#F4B000",
    borderRadius: 10,
    backgroundColor: "#FFFDF5",
    padding: 14,
  },
  yellowTitle: { fontSize: 13.5, fontWeight: "800", color: "#111827", marginBottom: 10 },
  messageInput: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: "#F4B000",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  sendBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#D99B00",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendBtnText: { color: "#ffffff", fontSize: 14, fontWeight: "800" },
});
