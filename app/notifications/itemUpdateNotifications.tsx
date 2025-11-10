import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ItemUpdateCard({ item }: any) {
  const statuses = [
    "To Confirm",
    "Arrange Meet-up",
    "Receive",
    "Return",
    "Completed",
    "Cancelled",
  ];

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="swap-horizontal" size={26} color="#007BFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>
          {item.transactionType?.toUpperCase() || "ITEM UPDATE"}
        </Text>
        <Text style={styles.text}>Status: <Text style={styles.statusText}>{item.status}</Text></Text>
        <Text style={styles.desc}>
          Your {item.transactionType || "item"} transaction has been updated. Stay in touch to finalize details.
        </Text>

        <View style={styles.statusContainer}>
          {statuses.map((status) => (
            <TouchableOpacity key={status} style={styles.statusBtn}>
              <Text style={styles.statusLabel}>{status}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#f8f9ff",
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
    backgroundColor: "#E3EEFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  title: { fontWeight: "700", fontSize: 15, color: "#222" },
  text: { fontSize: 13, color: "#555", marginTop: 2 },
  statusText: { color: "#007BFF", fontWeight: "600" },
  desc: { fontSize: 12, color: "#777", marginTop: 4 },
  statusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  statusBtn: {
    borderWidth: 1,
    borderColor: "#007BFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusLabel: { color: "#007BFF", fontSize: 12, fontWeight: "600" },
});
