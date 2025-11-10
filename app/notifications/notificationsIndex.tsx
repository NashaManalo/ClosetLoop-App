import { getAuth } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../src/firebase/firebaseConfig";

import AlertCard from "./alertNotifications";
import EventCard from "./eventNotifications";
import ItemUpdateCard from "./itemUpdateNotifications";

export default function NotificationsScreen() {
  const [tab, setTab] = useState<"item" | "event" | "alert">("item");
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const notifType =
          tab === "item" ? "item-update" : tab === "event" ? "event" : "alert";

        const q = query(
          collection(db, "notifications"),
          where("userId", "==", uid),
          where("type", "==", notifType),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        setNotifs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [tab, uid]);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.menu}>
        {["item", "event", "alert"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t as any)}
            style={[styles.menuBtn, tab === t && styles.menuActive]}
          >
            <Text style={[styles.menuText, tab === t && styles.menuTextActive]}>
              {t === "item"
                ? "Item Updates"
                : t === "event"
                ? "Reminders"
                : "Community Alerts"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notification List */}
      {loading ? (
        <Text style={styles.center}>Loading...</Text>
      ) : notifs.length === 0 ? (
        <Text style={styles.center}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            tab === "item" ? (
              <ItemUpdateCard item={item} />
            ) : tab === "event" ? (
              <EventCard item={item} />
            ) : (
              <AlertCard item={item} />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { textAlign: "center", marginTop: 20, color: "#777" },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  menuBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  menuText: { fontSize: 14, color: "#666" },
  menuActive: { borderBottomWidth: 2, borderBottomColor: "#007BFF" },
  menuTextActive: { color: "#007BFF", fontWeight: "700" },
});
