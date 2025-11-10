import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc } from "firebase/firestore";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../src/firebase/firebaseConfig";

export default function AlertCard({ item }: any) {
  const markAsRead = async () => {
    try {
      await updateDoc(doc(db, "notifications", item.id), { isRead: true });
    } catch (err) {
      console.error("Error marking alert as read:", err);
    }
  };

  return (
    <View style={[styles.card, !item.isRead && { backgroundColor: "#fff5f5" }]}>
      <View style={styles.iconWrap}>
        <Ionicons name="alert-circle" size={26} color="#dc3545" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Community Alert</Text>
        <Text style={styles.text}>{item.message}</Text>
        <Text style={styles.desc}>
          Stay informed! Please check your local announcements for updates or safety guidelines.
        </Text>
        {!item.isRead && (
          <TouchableOpacity onPress={markAsRead}>
            <Text style={styles.markRead}>Mark as Read</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 10,
    padding: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f2dede",
  },
  iconWrap: {
    width: 40,
    height: 40,
    backgroundColor: "#fde8e8",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  title: { fontWeight: "700", fontSize: 15, color: "#dc3545" },
  text: { fontSize: 13, color: "#333", marginTop: 4 },
  desc: { fontSize: 12, color: "#666", marginTop: 4 },
  markRead: { color: "#007BFF", fontSize: 12, marginTop: 8, fontWeight: "600" },
});
