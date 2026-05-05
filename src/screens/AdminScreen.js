import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, FlatList, Image, ActivityIndicator,
  Alert, TextInput, Modal,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

function ApplicationCard({ item, onApprove, onReject }) {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          {item.avatarUrl
            ? <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
            : <Ionicons name="person" size={22} color="#2F54EB" />}
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>Pending</Text>
        </View>
      </View>

      {/* Application details */}
      <View style={styles.detailsBox}>
        <DetailRow icon="person-outline"    label="Full Name"     value={item.application?.fullName} />
        <DetailRow icon="tv-outline"        label="Channel"       value={item.application?.channelName} />
        <DetailRow icon="grid-outline"      label="Category"      value={item.application?.category} />
        <DetailRow icon="link-outline"      label="Social"        value={item.application?.socialLink ?? "—"} />
        <View style={styles.bioRow}>
          <Ionicons name="document-text-outline" size={14} color="#64748B" style={styles.detailIcon} />
          <Text style={styles.bioText}>{item.application?.bio}</Text>
        </View>
      </View>

      {/* Applied date */}
      <Text style={styles.appliedDate}>
        Applied {new Date(item.application?.appliedAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })}
      </Text>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => onReject(item)}
        >
          <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => onApprove(item)}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={14} color="#64748B" style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value ?? "—"}</Text>
    </View>
  );
}

function RejectModal({ visible, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm(reason.trim());
    setReason("");
    setSubmitting(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Reject Application</Text>
          <Text style={styles.modalSub}>Optionally provide a reason for rejection:</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Reason (optional)..."
            value={reason}
            onChangeText={setReason}
            multiline
            maxLength={300}
          />
          <View style={styles.modalBtnRow}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalRejectBtn, submitting && { opacity: 0.6 }]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.modalRejectText}>Confirm Reject</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminScreen({ navigation }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/creators/creator-applications");
      setApplications(res?.data ?? []);
    } catch (err) {
      console.log("Failed to load applications:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchApplications(); }, []));

  const handleApprove = (item) => {
    Alert.alert(
      "Approve Creator",
      `Approve ${item.name} as a content creator?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await api.put(`/admin/creators/creator-applications/${item.id}/approve`);
              setApplications(prev => prev.filter(a => a.id !== item.id));
              Alert.alert("✅ Approved", `${item.name} is now a creator!`);
            } catch (err) {
              Alert.alert("Error", err?.response?.data?.error ?? "Failed to approve.");
            }
          },
        },
      ]
    );
  };

  const handleReject = (item) => {
    setRejectTarget(item);
  };

  const confirmReject = async (reason) => {
    try {
      await api.put(`/admin/creators/creator-applications/${rejectTarget.id}/reject`, { reason });
      setApplications(prev => prev.filter(a => a.id !== rejectTarget.id));
      setRejectTarget(null);
      Alert.alert("Rejected", `${rejectTarget.name}'s application has been rejected.`);
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.error ?? "Failed to reject.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFF" />

      {/* Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Creator Applications</Text>
        <TouchableOpacity onPress={fetchApplications} style={styles.refreshBtn}>
          <Ionicons name="refresh-outline" size={22} color="#2F54EB" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2F54EB" style={{ marginTop: 60 }} />
      ) : applications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="checkmark-done-circle-outline" size={56} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No pending applications</Text>
          <Text style={styles.emptySub}>All creator applications have been reviewed.</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ApplicationCard
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.countBanner}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
              <Text style={styles.countText}>
                {applications.length} pending application{applications.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        />
      )}

      <RejectModal
        visible={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFF" },

  navBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 8, paddingVertical: 12, backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee",
  },
  backBtn:    { padding: 8 },
  refreshBtn: { padding: 8 },
  navTitle:   { fontSize: 17, fontWeight: "700", color: "#000" },

  list:  { padding: 16, gap: 16 },

  countBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF9C3", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  countText: { fontSize: 13, fontWeight: "600", color: "#92400E" },

  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#EEF2FF",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImg:      { width: 44, height: 44 },
  cardHeaderInfo: { flex: 1 },
  cardName:       { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  cardEmail:      { fontSize: 12, color: "#64748B", marginTop: 1 },
  pendingBadge: {
    backgroundColor: "#FEF9C3", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  pendingBadgeText: { fontSize: 11, color: "#92400E", fontWeight: "700" },

  detailsBox: {
    backgroundColor: "#F8FAFF", borderRadius: 12, padding: 12,
    gap: 6, marginBottom: 10,
  },
  detailRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  detailIcon:  { width: 16 },
  detailLabel: { fontSize: 12, color: "#64748B", width: 70 },
  detailValue: { flex: 1, fontSize: 12, fontWeight: "600", color: "#1E293B" },
  bioRow:      { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 4 },
  bioText:     { flex: 1, fontSize: 12, color: "#475569", lineHeight: 17 },

  appliedDate: { fontSize: 11, color: "#94A3B8", marginBottom: 12 },

  actionRow:      { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, borderWidth: 1.5, borderColor: "#EF4444",
    borderRadius: 12, paddingVertical: 10,
  },
  rejectBtnText:  { color: "#EF4444", fontSize: 14, fontWeight: "700" },
  approveBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#2F54EB", borderRadius: 12, paddingVertical: 10,
  },
  approveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  empty:      { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  emptySub:   { fontSize: 13, color: "#94A3B8", textAlign: "center" },

  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  modalSub:   { fontSize: 13, color: "#64748B" },
  modalInput: {
    backgroundColor: "#F8FAFF", borderRadius: 12, borderWidth: 1.5,
    borderColor: "#E2E8F0", paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: "#1E293B", height: 100, textAlignVertical: "top",
  },
  modalBtnRow:     { flexDirection: "row", gap: 10, marginTop: 4 },
  modalCancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, paddingVertical: 12, alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  modalRejectBtn: {
    flex: 1, backgroundColor: "#EF4444",
    borderRadius: 12, paddingVertical: 12, alignItems: "center",
  },
  modalRejectText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});