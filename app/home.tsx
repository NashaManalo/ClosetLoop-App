// app/home.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  orderBy,
  query,
  startAt,
  where,
} from "firebase/firestore";
import * as geofire from "geofire-common";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { db } from "../src/firebase/firebaseConfig";

/* ─────────────────────────────
   LIKE + SAVE TOGGLE HELPERS
───────────────────────────── */
async function toggleLike(postId: string) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return;
  const q = query(
    collection(db, "likes"),
    where("userId", "==", uid),
    where("postId", "==", postId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await deleteDoc(doc(db, "likes", snap.docs[0].id));
  } else {
    await addDoc(collection(db, "likes"), {
      userId: uid,
      postId,
      createdAt: new Date(),
    });
  }
}

async function toggleSave(postId: string) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) return;
  const q = query(
    collection(db, "saves"),
    where("userId", "==", uid),
    where("postId", "==", postId)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    await deleteDoc(doc(db, "saves", snap.docs[0].id));
  } else {
    await addDoc(collection(db, "saves"), {
      userId: uid,
      postId,
      createdAt: new Date(),
    });
  }
}

/* ─────────────────────────────
   TYPES
───────────────────────────── */
type PostDoc = {
  id: string;
  userId?: string;
  username?: string;
  description?: string;
  images?: string[];
  location?: string;
  clothingType?: string;
  size?: string;
  condition?: string;
  category?: string;
  lat?: number;
  lng?: number;
  geohash?: string;
  createdAt?: any;
};

type UserDoc = { username?: string; displayName?: string; photoURL?: string };

/* ─────────────────────────────
   LOCATION FILTER OPTIONS
───────────────────────────── */
const RADIUS_OPTIONS: { label: string; value: number | null }[] = [
  { label: "5 km", value: 5 },
  { label: "10 km", value: 10 },
  { label: "20 km", value: 20 },
  { label: "All NCR", value: null },
];

export default function HomeScreen() {
  const router = useRouter();
  const [feeds, setFeeds] = useState<PostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState<number | null>(5);
  const [userLatLng, setUserLatLng] = useState<{ lat: number; lng: number } | null>(null);

  const uid = getAuth().currentUser?.uid || null;

  /* ── Fetch Location ── */
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;
        const loc = await Location.getCurrentPositionAsync({});
        setUserLatLng({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch (e) {
        console.warn("Location error:", e);
      }
    })();
  }, []);

  /* ── Fetch Posts ── */
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        if (radiusKm == null || !userLatLng) {
          const qAll = query(collection(db, "posts"), orderBy("createdAt", "desc"));
          const snap = await getDocs(qAll);
          setFeeds(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
          return;
        }

        const center: [number, number] = [userLatLng.lat, userLatLng.lng];
        const radiusM = radiusKm * 1000;
        const bounds = geofire.geohashQueryBounds(center, radiusM);
        const tasks = bounds.map(([start, end]) =>
          getDocs(query(collection(db, "posts"), orderBy("geohash"), startAt(start), endAt(end)))
        );
        const snaps = await Promise.all(tasks);

        const matched: PostDoc[] = [];
        snaps.forEach((s) => {
          s.docs.forEach((docSnap) => {
            const data = docSnap.data() as any;
            if (typeof data.lat !== "number" || typeof data.lng !== "number") return;
            const distKm = geofire.distanceBetween([data.lat, data.lng], center);
            if (distKm <= radiusKm + 0.05) matched.push({ id: docSnap.id, ...data });
          });
        });

        matched.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
        setFeeds(matched);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to load posts.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, [radiusKm, userLatLng]);

  /* ── Filter Chips ── */
  const ChipsHeader = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
      {RADIUS_OPTIONS.map((opt) => {
        const active = radiusKm === opt.value;
        return (
          <TouchableOpacity
            key={opt.label}
            onPress={() => setRadiusKm(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.85}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Search Button */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => router.push("/search")}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color="#555" />
        <Text style={styles.searchPlaceholder}>Search posts, users, clothing type...</Text>
      </TouchableOpacity>

      {loading ? (
        <Text style={styles.centerMsg}>Loading posts...</Text>
      ) : (
        <FlatList
          data={feeds}
          keyExtractor={(item) => item.id}
          style={styles.feedList}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListHeaderComponent={ChipsHeader}
          stickyHeaderIndices={[0]}
          renderItem={({ item }) => <PostCard post={item} />}
          ListEmptyComponent={<Text style={styles.centerMsg}>No posts found.</Text>}
        />
      )}

      {/* Bottom Nav */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={28} color="#007BFF" />
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
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("./notificationsIndex")}>
          <Ionicons name="notifications" size={28} color="#444" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("./profile")}>
          <Ionicons name="person" size={28} color="#444" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─────────────────────────────
   POST CARD COMPONENT
───────────────────────────── */
function PostCard({ post }: { post: PostDoc }) {
  const { width } = useWindowDimensions();
  const uid = getAuth().currentUser?.uid;
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [user, setUser] = useState<UserDoc | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      if (post.userId) {
        const uSnap = await getDoc(doc(db, "users", post.userId));
        if (uSnap.exists()) setUser(uSnap.data() as UserDoc);
      }
      if (!uid || !post.id) return;
      const likeQ = query(collection(db, "likes"), where("userId", "==", uid), where("postId", "==", post.id));
      const saveQ = query(collection(db, "saves"), where("userId", "==", uid), where("postId", "==", post.id));
      const [likeSnap, saveSnap] = await Promise.all([getDocs(likeQ), getDocs(saveQ)]);
      setLiked(!likeSnap.empty);
      setSaved(!saveSnap.empty);
    })();
  }, [uid, post.id]);

  const images = post.images?.length ? post.images : [];

  return (
    <View style={styles.feedItem}>
      {/* Header with clickable user */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() =>
            post.userId && router.push({ pathname: "../profile/[userId]", params: { userId: post.userId } })
          }
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: "#ccc", alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name="person" size={18} color="#777" />
            </View>
          )}
          <View>
            <Text style={styles.username}>{user?.username || "User"}</Text>
            <Text style={styles.locationText}>{post.location || "Unknown location"}</Text>
          </View>
        </TouchableOpacity>

        {post.category && (
          <View style={[styles.categoryBadge, post.category.toLowerCase().includes("give") ? styles.pillGive : styles.pillSwap]}>
            <Text style={styles.categoryText}>{post.category}</Text>
          </View>
        )}
      </View>

      {/* Images */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={16}
      >
        {images.map((u, i) => (
          <Image key={i} source={{ uri: u }} style={{ width, height: width, backgroundColor: "#ddd" }} resizeMode="cover" />
        ))}
      </ScrollView>
      {images.length > 1 && (
        <View style={styles.counterBox}>
          <Text style={styles.counterText}>{index + 1}/{images.length}</Text>
        </View>
      )}

      {/* Description & Actions */}
      <View style={styles.detailsBox}>
        {!!post.description && <Text style={styles.description}>{post.description}</Text>}
        <Text style={styles.metaText}>
          👕 {post.clothingType || "N/A"} | 📏 {post.size || "N/A"} | 🧵 {post.condition || "N/A"}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity onPress={async () => { await toggleLike(post.id); setLiked(!liked); }}>
            <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? "#ff3b30" : "#444"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={async () => { await toggleSave(post.id); setSaved(!saved); }}>
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={24} color={saved ? "#007bff" : "#444"} />
          </TouchableOpacity>

          {/* Trade Button */}
          <TouchableOpacity
            style={styles.tradeBtn}
            onPress={() => Alert.alert("Interest sent!", "User will be notified about your interest to trade.")}
          >
            <Ionicons name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.tradeText}>Trade</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ─────────────────────────────
   STYLES
───────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // ✅ new search button styles
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    margin: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchPlaceholder: {
    color: "#777",
    marginLeft: 8,
    fontSize: 16,
  },

  centerMsg: { textAlign: "center", marginTop: 20 },
  chipsRow: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: "#fff", gap: 8 },
  chip: { backgroundColor: "#eee", borderColor: "#ddd", borderWidth: 1, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  chipActive: { backgroundColor: "#0b72ff", borderColor: "#0b72ff" },
  chipText: { color: "#444", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  feedList: { flex: 1, paddingHorizontal: 10 },
  feedItem: { backgroundColor: "#fff", marginBottom: 16, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#e6e6e6" },
  headerRow: { flexDirection: "row", alignItems: "center", padding: 10 },
  profileImage: { width: 42, height: 42, borderRadius: 21, marginRight: 10 },
  username: { fontWeight: "700", fontSize: 15, color: "#222" },
  locationText: { color: "#666", fontSize: 12, marginTop: 2 },
  categoryBadge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  pillGive: { backgroundColor: "#0b72ff" },
  pillSwap: { backgroundColor: "#10b981" },
  categoryText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  counterBox: { position: "absolute", right: 8, bottom: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  counterText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  detailsBox: { paddingHorizontal: 12, paddingVertical: 10 },
  description: { fontSize: 14, color: "#222" },
  metaText: { fontSize: 13, color: "#555", marginTop: 4 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 8 },
  tradeBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#28a745", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tradeText: { color: "#fff", marginLeft: 4, fontWeight: "600" },
  navBar: { height: 60, flexDirection: "row", borderTopWidth: 1, borderColor: "#ddd", backgroundColor: "#fff" },
  navItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  navText: { fontSize: 12, marginTop: 2, color: "#444" },
});
