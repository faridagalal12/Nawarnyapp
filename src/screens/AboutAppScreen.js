import React from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const APP_RATING = "4.9 rating";
const APP_LEARNERS = "20k learners";

const STORY =
  "LearnApp was founded in 2020 with a simple belief — that world-class education should be available to everyone, everywhere. Today we serve over 2 million learners across 80+ countries with courses built by real industry experts.";

const coreValues = [
  {
    title: "Accessibility",
    body: "Learning for everyone, everywhere.",
    iconLib: "ion",
    iconName: "accessibility-outline",
  },
  {
    title: "Excellence",
    body: "Curated by top industry experts.",
    iconLib: "mci",
    iconName: "trophy-outline",
  },
  {
    title: "Community",
    body: "Grow together with peers.",
    iconLib: "ion",
    iconName: "people-outline",
  },
  {
    title: "Progress",
    body: "Track and celebrate growth.",
    iconLib: "mci",
    iconName: "chart-line",
  },
];

const team = [
  { name: "Sara Asser", role: "Founder & CEO" },
  { name: "Maya Mohamed", role: "Co-Founder & CTO" },
  { name: "Lina Hossam", role: "Head of Content" },
];

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase() || "NA";
}

function Chip({ icon, text }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={14} color="#111827" style={{ marginRight: 6 }} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function ValueCard({ item }) {
  const Icon =
    item.iconLib === "mci"
      ? (props) => <MaterialCommunityIcons {...props} name={item.iconName} />
      : (props) => <Ionicons {...props} name={item.iconName} />;

  return (
    <View style={styles.valueCard}>
      <View style={styles.valueIconWrap}>
        <Icon size={18} color="#2F54EB" />
      </View>
      <Text style={styles.valueTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.valueBody} numberOfLines={2}>
        {item.body}
      </Text>
    </View>
  );
}

function PolicyRow({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.policyRow} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.policyTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
}

export default function AboutAppScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const comingSoon = (title) => Alert.alert("Coming soon", `${title} is not available yet.`);

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
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 22 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroInner}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.appLogo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Nawarny</Text>
          </View>

          <View style={styles.heroChips}>
            <Chip icon="star" text={APP_RATING} />
            <Chip icon="people" text={APP_LEARNERS} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Our Story</Text>
        <View style={styles.storyCard}>
          <Text style={styles.storyText}>{STORY}</Text>
        </View>

        <Text style={styles.sectionTitle}>Core Values</Text>
        <View style={styles.valuesGrid}>
          {coreValues.map((item) => (
            <ValueCard key={item.title} item={item} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>The Team</Text>
        <View style={styles.teamCard}>
          {team.map((member, idx) => (
            <View
              key={`${member.name}-${idx}`}
              style={[styles.teamRow, idx !== team.length - 1 && styles.teamRowDivider]}
            >
              <View style={styles.teamAvatar}>
                <Text style={styles.teamAvatarText}>{initials(member.name)}</Text>
              </View>
              <View style={styles.teamText}>
                <Text style={styles.teamName} numberOfLines={1}>
                  {member.name}
                </Text>
                <Text style={styles.teamRole} numberOfLines={1}>
                  {member.role}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.policies}>
          <PolicyRow title="Privacy Policy" onPress={() => comingSoon("Privacy Policy")} />
          <PolicyRow title="Terms of Service" onPress={() => comingSoon("Terms of Service")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
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
    fontWeight: "800",
    color: "#111827",
    marginLeft: 6,
  },
  headerSpacer: { width: 32, height: 32 },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 18 },

  heroCard: {
    backgroundColor: "#2F54EB",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroInner: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  appLogo: { width: 64, height: 64, borderRadius: 12, marginBottom: 8 },
  appName: { fontSize: 16, fontWeight: "900", color: "#111827" },
  heroChips: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    marginHorizontal: 6,
  },
  chipText: { fontSize: 12.5, color: "#111827", fontWeight: "700" },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  storyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  storyText: { fontSize: 13.2, lineHeight: 19, color: "#111827" },

  valuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  valueCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  valueIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  valueTitle: { fontSize: 13.5, fontWeight: "900", color: "#111827", marginBottom: 4 },
  valueBody: { fontSize: 12.2, color: "#6b7280", lineHeight: 16.5 },

  teamCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#6287FF",
  },
  teamRowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.35)" },
  teamAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  teamAvatarText: { fontSize: 12.5, fontWeight: "900", color: "#2F54EB" },
  teamText: { flex: 1, minWidth: 0 },
  teamName: { fontSize: 14.5, fontWeight: "900", color: "#ffffff" },
  teamRole: { fontSize: 12.2, fontWeight: "700", color: "rgba(255,255,255,0.85)", marginTop: 2 },

  policies: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  policyTitle: { flex: 1, fontSize: 13.2, color: "#6b7280", fontWeight: "700" },
});

