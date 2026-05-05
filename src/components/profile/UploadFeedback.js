import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function UploadFeedback({ message, onClose }) {
  if (!message) return null;
  return (
    <View style={styles.toast}>
      <Ionicons name="checkmark-circle" size={18} color="#34C759" />
      <Text style={styles.toastText}>{message}</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={16} color="#888" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute", bottom: 90, left: 16, right: 16,
    backgroundColor: "#fff", borderRadius: 12, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 8, zIndex: 999,
  },
  toastText: { flex: 1, fontSize: 13, fontWeight: "600", color: "#111" },
});