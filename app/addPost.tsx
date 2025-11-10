import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { geohashForLocation } from "geofire-common";
import React, { useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

let MapView: any = () => null;
let Marker: any = () => null;
try {
  if (Platform.OS !== "web") {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
  }
} catch (err) {
  console.log("MapView not loaded on web:", err);
}

let MapComponent: any = () => null;
if (Platform.OS === "web") {
  const { MapContainer, TileLayer, Marker } = require("react-leaflet");
  MapComponent = () => (
    <MapContainer center={[14.5995, 120.9842]} zoom={13} style={{ height: 250, width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[14.5995, 120.9842]} />
    </MapContainer>
  );
}

import { auth, db } from "../src/firebase/firebaseConfig";

const CLOTHING_TYPES = [
  "T-Shirt",
  "Shirt/Blouse",
  "Pants/Jeans",
  "Shorts",
  "Dress",
  "Skirt",
  "Jacket/Coat",
  "Hoodie/Sweater",
  "Footwear",
  "Accessories",
  "Other",
] as const;

const CONDITIONS = [
  "New with tags",
  "Like new",
  "Gently used",
  "Used",
  "Well-worn",
] as const;

const CATEGORIES = ["Swap", "Give away"] as const;
const MAX_IMAGES = 8;

export default function AddPostScreen() {
  const navigation = useNavigation<any>();

  const [items, setItems] = useState([
    {
      images: [] as string[],
      description: "",
      clothingType: "",
      otherClothingType: "",
      size: "",
      customSize: "",
      condition: "",
    },
  ]);
  const [category, setCategory] = useState("");
  const [locationMode, setLocationMode] = useState<"gps" | "manual" | "map">("gps");
  const [manualAddress, setManualAddress] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [geohash, setGeohash] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const updateItem = (index: number, field: string, value: string | string[]) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addNewItem = () =>
    setItems([
      ...items,
      {
        images: [],
        description: "",
        clothingType: "",
        otherClothingType: "",
        size: "",
        customSize: "",
        condition: "",
      },
    ]);

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  /* ───── Media Upload ───── */
  const ensureMediaPermissions = async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (lib.status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return false;
    }
    return true;
  };

  const chooseImageSource = async (index: number) => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Camera", "Gallery"], cancelButtonIndex: 0 },
        (buttonIndex) => {
          if (buttonIndex === 1) takePhoto(index);
          if (buttonIndex === 2) addFromGallery(index);
        }
      );
    } else {
      Alert.alert("Add Photos", "", [
        { text: "Camera", onPress: () => takePhoto(index) },
        { text: "Gallery", onPress: () => addFromGallery(index) },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const addFromGallery = async (index: number) => {
    const ok = await ensureMediaPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES,
    });
    if (!result.canceled) {
      const imgs = [...items[index].images, ...result.assets.map((a) => a.uri)];
      updateItem(index, "images", imgs.slice(0, MAX_IMAGES));
    }
  };

  const takePhoto = async (index: number) => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (cam.status !== "granted") {
      Alert.alert("Camera access denied");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      const imgs = [...items[index].images, result.assets[0].uri];
      updateItem(index, "images", imgs.slice(0, MAX_IMAGES));
    }
  };

  /* ───── Location Handling ───── */
  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location denied", "Please allow location access.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const la = pos.coords.latitude;
      const ln = pos.coords.longitude;
      setLat(la);
      setLng(ln);
      setGeohash(geohashForLocation([la, ln]));

      const places = await Location.reverseGeocodeAsync({
        latitude: la,
        longitude: ln,
      });
      if (places.length > 0) {
        const p = places[0];
        const formatted = [p.subregion || p.district || p.name, p.city, p.region]
          .filter(Boolean)
          .join(", ");
        setLocationLabel(formatted);
      } else {
        setLocationLabel(`${la.toFixed(3)}, ${ln.toFixed(3)}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not get your location.");
    }
  };

  /* ───── Upload to Firestore ───── */
  const uploadPost = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Not signed in");

    const finalLocation = manualAddress || locationLabel;
    if (!finalLocation && (!lat || !lng)) {
      return Alert.alert("Missing location", "Please select or enter a location.");
    }

    if (!category) return Alert.alert("Select a category");

    const validItems = items.filter(
      (i) =>
        i.description.trim() &&
        i.clothingType &&
        i.condition &&
        i.images.length > 0
    );

    if (validItems.length === 0)
      return Alert.alert("Missing details", "Add at least one complete item.");

    try {
      setIsUploading(true);

      for (const item of validItems) {
        const uploadedUrls: string[] = [];

        for (const uri of item.images) {
          const formData = new FormData();
          formData.append(
            "file",
            {
              uri,
              type: "image/jpeg",
              name: `photo_${Date.now()}.jpg`,
            } as any
          );
          formData.append("upload_preset", "unsigned_present");
          formData.append("cloud_name", "ds63bguzo");

          const res = await fetch("https://api.cloudinary.com/v1_1/ds63bguzo/image/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (data.secure_url) uploadedUrls.push(data.secure_url);
        }

        await addDoc(collection(db, "posts"), {
          userId: user.uid,
          images: uploadedUrls,
          description: item.description.trim(),
          clothingType:
            item.clothingType === "Other"
              ? item.otherClothingType
              : item.clothingType,
          size:
            item.size === "Custom" ? item.customSize.trim() : item.size || "",
          condition: item.condition,
          category,
          location: finalLocation,
          lat: lat || 14.5995, // fallback coords for Expo Go
          lng: lng || 120.9842,
          geohash: geohash || geohashForLocation([14.5995, 120.9842]),
          likesCount: 0,
          favoritesCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      Alert.alert("Success", "Items added successfully!");
      navigation.goBack();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  /* ───── UI ───── */
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Add Clothing Items</Text>

          {items.map((item, index) => {
            const sizeOptions =
              item.clothingType === "Footwear"
                ? ["5", "6", "7", "8", "9", "10", "11"]
                : item.clothingType === "Accessories"
                ? ["One Size", "Small", "Medium", "Large"]
                : ["XS", "S", "M", "L", "XL", "XXL", "Custom"];

            return (
              <View key={index} style={styles.itemBlock}>
                <Text style={styles.subtitle}>Item {index + 1}</Text>
                <View style={styles.imagesRow}>
                  {item.images.map((uri, idx) => (
                    <View key={idx} style={styles.imageWrap}>
                      <Image source={{ uri }} style={styles.thumb} />
                      <TouchableOpacity
                        style={styles.removeBadge}
                        onPress={() => {
                          const imgs = item.images.filter((_, i) => i !== idx);
                          updateItem(index, "images", imgs);
                        }}
                      >
                        <Ionicons name="close" size={14} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {item.images.length < MAX_IMAGES && (
                    <TouchableOpacity onPress={() => chooseImageSource(index)} style={styles.addThumb}>
                      <Ionicons name="camera" size={28} color="#888" />
                      <Text style={styles.addText}>Add photos</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  placeholder="Description"
                  value={item.description}
                  onChangeText={(t) => updateItem(index, "description", t)}
                  style={[styles.input, { minHeight: 60 }]}
                  multiline
                />

                <View style={styles.pickerWrap}>
                  <Picker
                    selectedValue={item.clothingType}
                    onValueChange={(v) => updateItem(index, "clothingType", v)}
                  >
                    <Picker.Item label="Select clothing type" value="" />
                    {CLOTHING_TYPES.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                </View>

                {item.clothingType === "Other" && (
                  <TextInput
                    placeholder="Enter clothing type"
                    value={item.otherClothingType}
                    onChangeText={(t) => updateItem(index, "otherClothingType", t)}
                    style={styles.input}
                  />
                )}

                {item.clothingType !== "Accessories" && (
                  <>
                    <View style={styles.pickerWrap}>
                      <Picker
                        selectedValue={item.size}
                        onValueChange={(v) => updateItem(index, "size", v)}
                      >
                        <Picker.Item label="Select size" value="" />
                        {sizeOptions.map((s) => (
                          <Picker.Item key={s} label={s} value={s} />
                        ))}
                      </Picker>
                    </View>
                    {item.size === "Custom" && (
                      <TextInput
                        placeholder="Custom size"
                        value={item.customSize}
                        onChangeText={(t) => updateItem(index, "customSize", t)}
                        style={styles.input}
                      />
                    )}
                  </>
                )}

                <View style={styles.pickerWrap}>
                  <Picker
                    selectedValue={item.condition}
                    onValueChange={(v) => updateItem(index, "condition", v)}
                  >
                    <Picker.Item label="Select condition" value="" />
                    {CONDITIONS.map((c) => (
                      <Picker.Item key={c} label={c} value={c} />
                    ))}
                  </Picker>
                </View>

                {items.length > 1 && (
                  <TouchableOpacity onPress={() => removeItem(index)} style={styles.removeItemBtn}>
                    <Text style={{ color: "#d00", fontWeight: "600" }}>Remove Item</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <Button title="+ Add Another Item" onPress={addNewItem} />

          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={category} onValueChange={(v) => setCategory(v)}>
              <Picker.Item label="Select category" value="" />
              {CATEGORIES.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Location Method</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={locationMode} onValueChange={(v) => setLocationMode(v)}>
              <Picker.Item label="Use Current Location" value="gps" />
              <Picker.Item label="Manual Address" value="manual" />
              <Picker.Item label="Pick on Map" value="map" />
            </Picker>
          </View>

          {locationMode === "gps" && (
            <View style={styles.locRow}>
              <Text style={styles.locNote}>
                {lat && lng ? `✓ (${lat.toFixed(4)}, ${lng.toFixed(4)})` : "Not added"}
              </Text>
              <TouchableOpacity onPress={useCurrentLocation} style={styles.locBtn}>
                <Ionicons name="locate" size={16} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 6 }}>Use current</Text>
              </TouchableOpacity>
            </View>
          )}

          {locationMode === "manual" && (
            <TextInput
              placeholder="Enter full address"
              value={manualAddress}
              onChangeText={setManualAddress}
              style={styles.input}
            />
          )}

          {locationMode === "map" && (
            <View style={{ height: 250, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
              {Platform.OS !== "web" ? (
                <MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: lat || 14.5995,
    longitude: lng || 120.9842,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
>
  <Marker
    draggable
    coordinate={{
      latitude: lat || 14.5995,
      longitude: lng || 120.9842,
    }}
    onDragEnd={async (e: {
  nativeEvent: { coordinate: { latitude: number; longitude: number } };
}) => {
  const { latitude, longitude } = e.nativeEvent.coordinate;
  setLat(latitude);
  setLng(longitude);
  setGeohash(geohashForLocation([latitude, longitude]));

  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (places.length > 0) {
      const p = places[0];
      const formatted = [p.subregion || p.district || p.name, p.city, p.region]
        .filter(Boolean)
        .join(", ");
      setLocationLabel(formatted);
    } else {
      setLocationLabel(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
    }
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    setLocationLabel(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
  }
}}

  />
</MapView>

              ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ffeef0" }}>
                  <Text style={{ color: "#888" }}>Map not available on web preview</Text>
                </View>
              )}
            </View>
          )}

          <Button title={isUploading ? "Uploading…" : "Add All Items"} onPress={uploadPost} disabled={isUploading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ───── Styles ───── */
const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingBottom: 40, backgroundColor: "#fff" },
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  itemBlock: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
  },
  imageWrap: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumb: { width: "100%", height: "100%" },
  removeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 4,
  },
  addThumb: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
  },
  addText: { fontSize: 12, color: "#666", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
    color: "#333",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  locNote: { flex: 1, fontSize: 12, color: "#555" },
  locBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeItemBtn: {
    marginTop: 4,
    alignSelf: "flex-end",
    backgroundColor: "#fee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
