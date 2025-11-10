import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EventCard({ item }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="calendar" size={26} color="#28a745" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title || "Event Reminder"}</Text>
        <Text style={styles.details}>
          📅 {item.eventDate} • 🕒 {item.eventTime} • 📍 {item.eventLocation}
        </Text>
        <Text style={styles.desc}>
          You’re invited! Tap “Join” to confirm your participation or “Cancel” if you can’t make it.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btn, styles.join]}>
            <Text style={styles.joinText}>Join</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.cancel]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#f9fff8",
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    backgroundColor: "#EAF7EA",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  title: { fontWeight: "700", fontSize: 15, color: "#222" },
  details: { fontSize: 13, color: "#555", marginTop: 2 },
  desc: { fontSize: 12, color: "#666", marginTop: 6 },
  actions: { flexDirection: "row", gap: 12, marginTop: 10 },
  btn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  join: { borderColor: "#28a745" },
  cancel: { borderColor: "#dc3545" },
  joinText: { color: "#28a745", fontWeight: "600" },
  cancelText: { color: "#dc3545", fontWeight: "600" },
});
