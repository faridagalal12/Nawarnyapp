import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const tabs = [
  { key: "Home", label: "Home", icon: "home-outline" },
  { key: "Courses", label: "Courses", icon: null },
  { key: "Add", label: "", icon: null },
  { key: "Challenge", label: "Challenge", icon: "trophy-outline" },
  { key: "Me", label: "Me", icon: "person-circle-outline" },
];

export default function BottomNavigation({ activeTab = "Me", onTabPress }) {
  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        if (tab.key === "Courses") {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              onPress={() => onTabPress?.(tab.key)}
            >
              <View style={styles.coursesButton}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        if (tab.key === "Add") {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              onPress={() => onTabPress?.(tab.key)}
            >
              <View style={styles.addButtonWrap}>
                <View style={styles.addButtonBlue} />
                <View style={styles.addButtonYellow}>
                  <Text style={styles.addButtonText}>+</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }

        const iconColor =
          tab.key === "Challenge" ? "#2E7D32" : isActive ? "#0066FF" : "#666666";

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => onTabPress?.(tab.key)}
          >
            <Ionicons name={tab.icon} size={24} color={iconColor} />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 78,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E4E4E7",
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
  },
  navLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#666666",
  },
  navLabelActive: {
    color: "#0066FF",
    fontWeight: "600",
  },
  coursesButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2F5BEA",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonWrap: {
    width: 56,
    height: 30,
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#8A8A8A",
  },
  addButtonBlue: {
    flex: 1,
    backgroundColor: "#1E88E5",
  },
  addButtonYellow: {
    flex: 1,
    backgroundColor: "#F7C948",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
});
