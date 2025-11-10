import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => router.push({ pathname: "/search", params: { q: query } })}
      >
        <Ionicons name="search" size={20} color="#555" />
        <TextInput
          style={styles.input}
          placeholder="Search items..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() =>
            router.push({ pathname: "/search", params: { q: query } })
          }
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: "#fff",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
  },
});
