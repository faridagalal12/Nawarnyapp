import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import api from "../services/api";

const TYPE_CONFIG = {
  like: {
    icon: "heart",
    color: "#ff4d58",
    label: (n) => `${getActorName(n)} liked your video`,
  },
  comment: {
    icon: "chatbubble",
    color: "#a78bfa",
    label: (n) => `${getActorName(n)} commented on your video`,
  },
  follow: {
    icon: "person-add",
    color: "#4ade80",
    label: (n) => `${getActorName(n)} started following you`,
  },
  reply: {
    icon: "return-down-forward",
    color: "#f472b6",
    label: (n) => `${getActorName(n)} replied to your comment`,
  },
  general: {
    icon: "notifications",
    color: "#5ba8ff",
    label: (n) => `${getActorName(n)} ${n.message}`,
  },
};

function getActorName(notification) {
  return notification?.actorName || "Someone";
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function NotificationItem({ item, onRead }) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.general;

  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onRead(item.id)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconCircle, { backgroundColor: cfg.color + "22", borderColor: cfg.color + "55" }]}>
        <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      </View>

      {item.actorAvatar ? (
        <Image source={{ uri: item.actorAvatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Ionicons name="person" size={14} color="#fff" />
        </View>
      )}

      <View style={styles.textBlock}>
        <Text style={styles.label}>{cfg.label(item)}</Text>
        <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
      </View>

      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);

  const fetchNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res?.data?.notifications ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const markRead = async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {}
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.patch("/notifications/read-all");
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1a5ff5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={52} color="rgba(255,255,255,0.12)" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <NotificationItem item={item} onRead={markRead} />
          )}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchNotifications(true);
          }}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0a0a14" },
  loader:         { flex: 1, backgroundColor: "#0a0a14", justifyContent: "center", alignItems: "center" },
  header:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5, borderColor: "rgba(255,255,255,0.08)" },
  headerTitle:    { color: "#fff", fontSize: 22, fontWeight: "800" },
  markAllBtn:     { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "rgba(26,95,245,0.15)", borderRadius: 20, borderWidth: 1, borderColor: "rgba(26,95,245,0.4)" },
  markAllText:    { color: "#5ba8ff", fontSize: 12, fontWeight: "600" },
  card:           { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 0.5, borderColor: "rgba(255,255,255,0.06)" },
  cardUnread:     { backgroundColor: "rgba(26,95,245,0.07)" },
  iconCircle:     { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  avatar:         { width: 34, height: 34, borderRadius: 17, marginLeft: -10 },
  avatarFallback: { backgroundColor: "#1a5ff5", justifyContent: "center", alignItems: "center" },
  textBlock:      { flex: 1 },
  label:          { color: "rgba(255,255,255,0.88)", fontSize: 13.5, lineHeight: 19 },
  time:           { color: "rgba(255,255,255,0.35)", fontSize: 11.5, marginTop: 3 },
  unreadDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1a5ff5" },
  empty:          { flex: 1, justifyContent: "center", alignItems: "center", gap: 14 },
  emptyText:      { color: "rgba(255,255,255,0.25)", fontSize: 15 },
});
