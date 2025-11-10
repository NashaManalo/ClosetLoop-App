import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../src/firebase/firebaseConfig";

export default function ProfileScreen() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"posts" | "likes" | "saves">("posts");

  // Fetch user info + their posts + liked/saved
  useEffect(() => {
    if (!uid) return;
    const fetchData = async () => {
      try {
        setLoading(true);

        // Load user info
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) setProfile(userSnap.data());

        // Load user's posts
        const postSnap = await getDocs(
          query(collection(db, "posts"), where("userId", "==", uid))
        );
        setPosts(postSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Load liked posts
        const likeSnap = await getDocs(
          query(collection(db, "likes"), where("userId", "==", uid))
        );
        const likedIds = likeSnap.docs.map((d) => d.data().postId);
        const liked = await Promise.all(
          likedIds.map(async (pid) => {
            const pSnap = await getDoc(doc(db, "posts", pid));
            return pSnap.exists() ? { id: pSnap.id, ...pSnap.data() } : null;
          })
        );
        setLikedPosts(liked.filter(Boolean) as any[]);

        // Load saved posts
        const saveSnap = await getDocs(
          query(collection(db, "saves"), where("userId", "==", uid))
        );
        const savedIds = saveSnap.docs.map((d) => d.data().postId);
        const saved = await Promise.all(
          savedIds.map(async (pid) => {
            const pSnap = await getDoc(doc(db, "posts", pid));
            return pSnap.exists() ? { id: pSnap.id, ...pSnap.data() } : null;
          })
        );
        setSavedPosts(saved.filter(Boolean) as any[]);
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  const activeData =
    tab === "posts" ? posts : tab === "likes" ? likedPosts : savedPosts;

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );

  if (!profile)
    return (
      <View style={styles.centered}>
        <Text>No profile found.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* ─── Header ─────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {profile.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={40} color="#777" />
            </View>
          )}
        </View>
        <Text style={styles.username}>@{profile.username || "user"}</Text>
        <Text style={styles.name}>
          {profile.firstName} {profile.lastName}
        </Text>
        <Text style={styles.location}>
          {profile.municipality}, {profile.region}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{likedPosts.length}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{savedPosts.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push("./editProfile")}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Tabs ─────────────────────────────── */}
      <View style={styles.tabRow}>
        {["posts", "likes", "saves"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabItem, tab === t && styles.tabItemActive]}
            onPress={() => setTab(t as any)}
          >
            <Text
              style={[styles.tabText, tab === t && styles.tabTextActive]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Post Grid ─────────────────────────────── */}
      <FlatList
        data={activeData}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push(`./postDetail?id=${item.id}`)}
          >
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
            ) : (
              <View style={styles.gridPlaceholder}>
                <Ionicons name="image" size={30} color="#999" />
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.noPosts}>
            {tab === "posts"
              ? "You haven’t posted anything yet."
              : tab === "likes"
              ? "No liked posts yet."
              : "No saved posts yet."}
          </Text>
        }
      />

      {/* ─── Bottom Navigation ─────────────────────────────── */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/home")}>
          <Ionicons name="home" size={28} color="#444" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="construct" size={28} color="#444" />
          <Text style={styles.navText}>DIY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/addPost")}>
          <Ionicons name="add-circle" size={28} color="#444" />
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("./notificationsIndex")}
        >
          <Ionicons name="notifications" size={28} color="#444" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={28} color="#007BFF" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─────────────────────────────
   STYLES
───────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  avatarWrap: { marginBottom: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  username: { fontSize: 16, fontWeight: "700", color: "#222" },
  name: { fontSize: 15, color: "#555" },
  location: { fontSize: 13, color: "#777", marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginVertical: 15,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#000" },
  statLabel: { color: "#555", fontSize: 13 },
  editBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  editBtnText: { color: "#007bff", fontWeight: "600" },

  // Tabs
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  tabItem: {
    paddingVertical: 10,
    flex: 1,
    alignItems: "center",
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderColor: "#007bff",
  },
  tabText: { fontSize: 14, color: "#555" },
  tabTextActive: { color: "#007bff", fontWeight: "700" },

  // Grid
  gridContainer: { paddingHorizontal: 1, paddingBottom: 90 },
  gridItem: { flex: 1 / 3, aspectRatio: 1, margin: 1 },
  gridImage: { width: "100%", height: "100%" },
  gridPlaceholder: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  noPosts: { textAlign: "center", marginTop: 20, color: "#666" },

  // Navigation bar
  navBar: {
    height: 60,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  navItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2, color: "#444" },
});
