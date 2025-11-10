import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActionSheetIOS,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { db } from "../src/firebase/firebaseConfig";

const regions = ["NCR"] as const;
type RegionType = typeof regions[number];

const municipalities: Record<string, string[]> = {
  NCR: [
    "Caloocan City",
    "Las Piñas City",
    "Makati City",
    "Malabon City",
    "Mandaluyong City",
    "Manila",
    "Marikina City",
    "Muntinlupa City",
    "Navotas City",
    "Parañaque City",
    "Pasay City",
    "Pasig City",
    "Pateros",
    "Quezon City",
    "San Juan City",
    "Taguig City",
    "Valenzuela City",
  ],
};

export const barangays: Record<string, string[]> = {
  "Caloocan City": [
    "Bagumbayan", "Baesa", "Bagumbong", "Bagumbayan East", "Bagumbayan West", "Bagumbayan Central",
    "Bagong Barrio", "Bagong Barrio Extension", "Bagong Barrio Norte", "Bagong Barrio Sur", "Bayanihan", 
    "Bayan-Bayanan", "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", 
    "Barangay 7", "Barangay 8", "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", 
    "Barangay 14", "Barangay 15", "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", 
    "Barangay 21", "Barangay 22", "Barangay 23", "Barangay 24", "Barangay 25", "Barangay 26", "Barangay 27", 
    "Barangay 28", "Barangay 29", "Barangay 30", "Barangay 31", "Barangay 32", "Barangay 33", "Barangay 34", 
    "Barangay 35", "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39", "Barangay 40", "Barangay 41", 
    "Barangay 42", "Barangay 43", "Barangay 44", "Barangay 45", "Barangay 46", "Barangay 47", "Barangay 48", 
    "Barangay 49", "Barangay 50", "Barangay 51", "Barangay 52", "Barangay 53", "Barangay 54", "Barangay 55", 
    "Barangay 56", "Barangay 57", "Barangay 58", "Barangay 59", "Barangay 60", "Barangay 61", "Barangay 62", 
    "Barangay 63", "Barangay 64", "Barangay 65", "Barangay 66", "Barangay 67", "Barangay 68", "Barangay 69", 
    "Barangay 70", "Barangay 71", "Barangay 72", "Barangay 73", "Barangay 74", "Barangay 75", "Barangay 76", 
    "Barangay 77", "Barangay 78", "Barangay 79", "Barangay 80", "Barangay 81", "Barangay 82", "Barangay 83", 
    "Barangay 84", "Barangay 85", "Barangay 86", "Barangay 87", "Barangay 88", "Barangay 89", "Barangay 90", 
    "Barangay 91", "Barangay 92", "Barangay 93", "Barangay 94", "Barangay 95", "Barangay 96", "Barangay 97", 
    "Barangay 98", "Barangay 99", "Barangay 100", "Barangay 101", "Barangay 102", "Barangay 103", "Barangay 104", 
    "Barangay 105", "Barangay 106", "Barangay 107", "Barangay 108", "Barangay 109", "Barangay 110", "Barangay 111", 
    "Barangay 112", "Barangay 113", "Barangay 114", "Barangay 115", "Barangay 116", "Barangay 117", "Barangay 118", 
    "Barangay 119", "Barangay 120", "Barangay 121", "Barangay 122", "Barangay 123", "Barangay 124", "Barangay 125", 
    "Barangay 126", "Barangay 127", "Barangay 128", "Barangay 129", "Barangay 130", "Barangay 131", "Barangay 132", 
    "Barangay 133", "Barangay 134", "Barangay 135", "Barangay 136", "Barangay 137", "Barangay 138", "Barangay 139", 
    "Barangay 140", "Barangay 141", "Barangay 142", "Barangay 143", "Barangay 144", "Barangay 145", "Barangay 146", 
    "Barangay 147", "Barangay 148", "Barangay 149", "Barangay 150", "Barangay 151", "Barangay 152", "Barangay 153", 
    "Barangay 154", "Barangay 155", "Barangay 156", "Barangay 157", "Barangay 158", "Barangay 159", "Barangay 160", 
    "Barangay 161", "Barangay 162", "Barangay 163", "Barangay 164", "Barangay 165", "Barangay 166", "Barangay 167", 
    "Barangay 168", "Barangay 169", "Barangay 170", "Barangay 171", "Barangay 172", "Barangay 173", "Barangay 174", 
    "Barangay 175", "Barangay 176", "Barangay 176-A", "Barangay 176-B", "Barangay 176-C", "Barangay 176-D", 
    "Barangay 176-E", "Barangay 176-F", "Barangay 177", "Barangay 178", "Barangay 179", "Barangay 180", "Barangay 181", 
    "Barangay 182", "Barangay 183", "Barangay 184", "Barangay 185", "Barangay 186", "Barangay 187", "Barangay 188"
  ].sort(),
  "Las Piñas City": [
    "Almanza Uno", "Daniel Fajardo", "Elias Aldana", "Ilaya", "Manuyo Uno", "Pamplona Lupa Uno", "Talon Uno", "Zapote", "Almanza Dos",
    "B.F. International Village", "Manuyo Dos", "Pamplona Dos", "Pamplona Tres", "Pilar", "Pulang Lupa Dos", "Talon Dos", "Talon Tres",
    "Talon Kuatro", "Talon Singko"
  ].sort(),
  "Makati City": [
    "Bangkal", "Bel-Air", "Carmona", "Dasmariñas", "Forbes Park", "Guadalupe Nuevo", "Guadalupe Nuevo", "Kasilawan",
    "La Paz", "Magallanes", "Olympia", "Palanan", "Pinagkaisahan", "Pio Del Pilar", "Poblacion", "San Antonio", "San Isidro",
    "San Lorenzo", "Santa Cruz", "Singkamas", "Tejeros", "Urdaneta", "Valenzuela"
  ].sort(),
  "Malabon City": [
    "Acacia", "Baritan", "Bayan-bayanan", "Catmon", "Concepcion", "Dampalit", "Flore", "Hulong Duhat",
    "Ibaba", "Longos", "Maysilo", "Muzon", "Niugan", "Panghulo", "Potrero", "San Agustin", "Santolan", "Tañong", "Tinajeros", "Tonsuya", "Tugatog"
  ].sort(),
  "Mandaluyong City": [
    "Addition Hills", "Bagong Silang", "Barangka Drive", "Barangka Ibaba", "Barangka Ilaya", "Barangka Itaas", "Burol", "Buayang Bato",
    "Daan Bakasl", "Hagdang Bato Itaas", "Hagdang Bato Libis", "Harapin Ang Bukas", "Highway Hills", "Mabini-J. Rizal", "Malamig", "Mauway", "Namayan", 
    "New Zañiga", "Old Zañiga", "Pag-asa", "Plainview", "Pleasant Hills", "Poblacion", "San Jose", "Vergara", "Wack=wack Greenhills",
  ].sort(),
  "Manila":[
  "Tondo I", "Tondo II", "Binondo", "Quiapo", "San Nicolas", "Santa Cruz", "Sampaloc", "San Miguel", "Santa Cruz", "Ermita", "Intramuros", "Malate", 
  "Paco", "Pandacan", "Port Area", "Santa Ana"
  ].sort(),
  "Marikina City": [
    "Barangka", "Calumpang", "Concepcion Dos", "Concepcion Uno", "Fortune", "Industrial Valley Complex",
    "Jesus de la Peña", "Malanday", "Marikina Heights", "Nangka", "Parang", "San Roque", "Santa Elena",
    "Santo Niño", "Tañong", "Tumana"
  ].sort(),
  "Muntinlupa City": [
    "Alabang", "Ayala Alabang", "Bayanan", "Buli", "Cupang", "Poblacion", "Putatan", "Sucat", "Tunasan"
  ].sort(),
  "Navotas City": [
    "Bagumbayan North", "Bagumbayan South", "Bangkulasi", "Daanghari", "Navotas East", "Navotas West",
    "NBBS Dagat-Dagatan"
  ].sort(),
   "Parañaque City": [
    "Baclaran", "BF Homes", "Don Bosco", "Don Galo", "La Huerta", "Marcelo Green", "Merville", "Moonwalk",
    "San Antonio", "San Dionisio", "San Isidro", "San Martin de Porres", "Santo Niño", "Sun Valley", "Tambo", "Vitalez"
  ].sort(),
   "Pasay City": [
    "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5", "Barangay 6", "Barangay 7", "Barangay 8",
    "Barangay 9", "Barangay 10", "Barangay 11", "Barangay 12", "Barangay 13", "Barangay 14", "Barangay 15",
    "Barangay 16", "Barangay 17", "Barangay 18", "Barangay 19", "Barangay 20", "Barangay 21", "Barangay 22", "Barangay 23",
    "Barangay 24", "Barangay 25", "Barangay 26", "Barangay 27", "Barangay 28", "Barangay 29", "Barangay 30", "Barangay 31",
    "Barangay 32", "Barangay 33", "Barangay 34", "Barangay 35", "Barangay 36", "Barangay 37", "Barangay 38", "Barangay 39",
    "Barangay 40", "Barangay 41", "Barangay 42", "Barangay 43", "Barangay 44", "Barangay 45", "Barangay 46", "Barangay 47",
    "Barangay 48", "Barangay 49", "Barangay 50", "Barangay 51", "Barangay 52", "Barangay 53", "Barangay 54", "Barangay 55",
    "Barangay 56", "Barangay 57", "Barangay 58", "Barangay 59", "Barangay 60", "Barangay 61", "Barangay 62", "Barangay 63",
    "Barangay 64", "Barangay 65", "Barangay 66", "Barangay 67", "Barangay 68", "Barangay 69", "Barangay 70", "Barangay 71",
    "Barangay 72", "Barangay 73", "Barangay 74", "Barangay 75", "Barangay 76", "Barangay 77", "Barangay 78", "Barangay 79",
    "Barangay 80", "Barangay 81", "Barangay 82", "Barangay 83", "Barangay 84", "Barangay 85", "Barangay 86", "Barangay 87",
    "Barangay 88", "Barangay 89", "Barangay 90", "Barangay 91", "Barangay 92", "Barangay 93", "Barangay 94", "Barangay 95",
    "Barangay 96", "Barangay 97", "Barangay 98", "Barangay 99", "Barangay 100", "Barangay 101", "Barangay 102", "Barangay 103",
    "Barangay 104", "Barangay 105", "Barangay 106", "Barangay 107", "Barangay 108", "Barangay 109", "Barangay 110", "Barangay 111",
    "Barangay 112", "Barangay 113", "Barangay 114", "Barangay 115", "Barangay 116", "Barangay 117", "Barangay 118", "Barangay 119",
    "Barangay 120", "Barangay 121", "Barangay 122", "Barangay 123", "Barangay 124", "Barangay 125", "Barangay 126", "Barangay 127",
    "Barangay 128", "Barangay 129", "Barangay 130", "Barangay 131", "Barangay 132", "Barangay 133", "Barangay 134", "Barangay 135",
    "Barangay 136", "Barangay 137", "Barangay 138", "Barangay 139", "Barangay 140", "Barangay 141", "Barangay 142", "Barangay 143",
    "Barangay 144", "Barangay 145", "Barangay 146", "Barangay 147", "Barangay 148", "Barangay 149", "Barangay 150", "Barangay 151",
    "Barangay 152", "Barangay 153", "Barangay 154", "Barangay 155", "Barangay 156", "Barangay 157", "Barangay 158", "Barangay 159",
    "Barangay 160", "Barangay 161", "Barangay 162", "Barangay 163", "Barangay 164", "Barangay 165", "Barangay 166", "Barangay 167",
    "Barangay 168", "Barangay 169", "Barangay 170", "Barangay 171", "Barangay 172", "Barangay 173", "Barangay 174", "Barangay 175",
    "Barangay 176", "Barangay 177", "Barangay 178", "Barangay 179", "Barangay 180", "Barangay 181", "Barangay 182", "Barangay 183",
    "Barangay 184", "Barangay 185", "Barangay 186", "Barangay 187", "Barangay 188", "Barangay 189", "Barangay 190", "Barangay 191",
    "Barangay 192", "Barangay 193", "Barangay 194", "Barangay 195", "Barangay 196", "Barangay 197", "Barangay 198", "Barangay 199",
    "Barangay 200", "Barangay 201"
  ].sort(),
  "Pasig City": [
    "Bagong Ilog", "Bagong Katipunan", "Bambang", "Buting", "Dela Paz", "Kalawaan", "Kapitolyo", "Kapasigan",
    "Malinao", "Manggahan", "Maybunga", "Napico", "Oranbo", "Palatiw", "Pinagbuhatan", "San Joaquin"
  ].sort(),
   "Pateros": [
    "Aguho", "Magtanggol", "Martirez del 96", "Poblacion", "San Pedro", "San Roque", "Santa Ana",
    "Santo Rosario–Kanluran", "Santo Rosario–Silangan", "Tabacalera"
  ].sort(),
   "Quezon City": [
    "Alicia", "Amihan", "Apolonio Samson", "Aurora", "Baesa", "Bagbag", "Bagumbahay", "Bagong Lipunan ng Crame", "Bagong Pag-asa", "Bagong Silangan",
    "Bagumbayan", "Bahay Toro", "Balingasa", "Bayanihan", "Blue Ridge A", "Blue Ridge B", "Botocan", "Bungad", "Camp Aguinaldo", "Central", "Claro", "Commonwealth",
    "New Era", "Kristong Hari", "Culiat", "Damar", "Damayang Lagi", "Del Monte", " Dioquino Zobel", "Doña Imelda", "Doña Josefa", "Don Manuel", "Duyan-duyan", "E. Rodriguez",
    "East Kamias", "Escopa I", "Escopa II", "Escopa III", "Escopa IV", "Fairview", "N.S. Amoranto", "Gulod", "Horseshoe", "Immaculate Concepcion", "Kaligayahan", "Kalusugan", "Kamuning", 
    "Katipunan", "Kaunlaran", "Krus na Ligas", "Laging Handa", "Libis", "Lourdes", "Loyola Heights", "Maharlika", "Malaya", "Manresa", "Mangga", "Mariana", "Mariblo", "Marilag", "Masagana",
    "Masambong", "Santo Domingo", "Matangdang Balara", "Milgrosa", "Nagkaisaing Nayon", "Nayong Kaunlaran", "Novaliches Proper", "Obrero", "Old Capitol Site", "Paang Bundok", "Pag-ibig Sa Nayon",
    "Paligsahan", "Paltok", "Pansol", "Paraiso", "Pasong Putik Proper", "Pasong Tamo", "Phil-Am", "Pinyahan", "Pinagkaisahan", "Project 6", "Quirino 2-A", "Quirino 2-B", "Quirino 2-C", "Quirino 3-A",
    "Ramon Magsaysay", "Roxas", "Sacred Heart", "Saint Ignatius", "Saint Peter", "Salvacion", "San Agustin", "San Antonio", "San Bartolome", "San Isidro", "San Isidro Labrador", "San Jose", "San Martin De Porres",
    "San Roques", "San Vicente", "Santa Cruz", "Santa Lucia", "Santa Monica", "Santa Teresita", "Santo Cristo", "Santo Niño", "Santol", "Sauyo", "Sienna", "Sikatuna Village", "Silangan", "Socorro", "South Triangle",
    "Tagumpay", "Talayan", "Talipapa", "Tandang Sora", "Tatalon", "Teachers Village East", "Teachers Village West", "U.P. Campus", "U.P. Village", "Ugong Norte", "Unang Sigaw", "Valencia", "Vasra", "Veternas Village",
    "Villa Maria Clara", "West Kamias", "West Triangle", "White Plains", "Balong Bato", "Capri", "Sangandaan", "Payatas", "Batasan Hills", "Holy Spirit", "Greater Lagro", "North Fairview"
  ].sort(),
  "San Juan City": [
    "Balong-Bato", "Batis", "Corazon de Jesus", "Ermitaño", "Greenhills", "Kabayanan", "Little Baguio",
    "Little Baguio East", "Little Baguio West", "Matimyas", "Pasadena", "Pedro Cruz", "Progreso", "Rizal",
    "Salapan", "San Perfecto", "Santo Niño", "Santo Tomas", "West Crame", "West Greenhills", "West Poblacion"
  ].sort(),
   "Taguig City": [
    "Bagumbayan", "Bambang", "Calzada", "Central Bicutan", "Central Signal Village", "Fort Bonifacio",
    "Hagonoy", "Ibayo-Tipas", "Katuparan", "Ligid-Tipas", "Lower Bicutan", "Maharlika Village", "Napindan",
    "New Lower Bicutan", "Palingon", "Pembo", "Pinagsama", "Pitogo", "Post Proper Northside", "Post Proper Southside",
    "Rizal", "San Miguel", "Santa Ana", "Tuktukan", "Ususan", "Wawa", "Western Bicutan", "Upper Bicutan",
    "South Daang Hari", "South Signal Village", "South Cembo", "South Daang Hari", "South Signal Village",
    "South Cembo", "South Daang Hari", "South Signal Village", "South Cembo"
  ].sort(),
  "Valenzuela City": [
    "Arkong Bato", "Balangkas", "Bignay", "Bisig", "Canumay East", "Canumay West", "Coloong", "Dalandanan",
    "Lingunan", "Malinta", "Mabolo", "Malanday", "Maysan", "Palasan", "Parada", "Pariancillo Villa"
  ].sort(),
}

/* ─────────────────────────────
   MAIN COMPONENT
───────────────────────────── */
export default function EditProfileScreen() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [region, setRegion] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangayValue, setBarangayValue] = useState("");
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ─── Load current profile ─── */
  useEffect(() => {
    const loadProfile = async () => {
      if (!uid) return;
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          setUsername(data.username || "");
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setRegion(data.location?.region || data.region || "");
          setMunicipality(data.location?.municipality || data.municipality || "");
          setBarangayValue(data.location?.barangay || "");
          setBirthday(data.birthday ? new Date(data.birthday) : null);
          setPhotoURL(data.photoURL || null);
        }
      } catch (e) {
        console.error("Error loading profile:", e);
      }
    };
    loadProfile();
  }, [uid]);

  /* ─── Image Picker ─── */
  const ensureMediaPermissions = async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (lib.status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return false;
    }
    return true;
  };

  const chooseImageSource = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ["Cancel", "Camera", "Gallery"], cancelButtonIndex: 0 },
        (buttonIndex) => {
          if (buttonIndex === 1) takePhoto();
          if (buttonIndex === 2) pickFromGallery();
        }
      );
    } else {
      Alert.alert("Select Photo", "", [
        { text: "Camera", onPress: () => takePhoto() },
        { text: "Gallery", onPress: () => pickFromGallery() },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const takePhoto = async () => {
    const cam = await ImagePicker.requestCameraPermissionsAsync();
    if (cam.status !== "granted") {
      Alert.alert("Camera permission denied");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const ok = await ensureMediaPermissions();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append(
        "file",
        {
          uri,
          type: "image/jpeg",
          name: `profile_${Date.now()}.jpg`,
        } as any
      );
      formData.append("upload_preset", "unsigned_present");
      formData.append("cloud_name", "ds63bguzo");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/ds63bguzo/image/upload",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.secure_url) {
        setPhotoURL(data.secure_url);
      } else {
        Alert.alert("Upload failed", "Could not upload image.");
      }
    } catch (e) {
      console.error("Upload error:", e);
      Alert.alert("Error", "Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Save Profile ─── */
  const saveProfile = async () => {
    if (!uid) return;
    Alert.alert("Save Changes?", "Do you want to save your profile updates?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: async () => {
          try {
            setLoading(true);
            await updateDoc(doc(db, "users", uid), {
              username,
              firstName,
              lastName,
              photoURL,
              location: {
                region,
                municipality,
                barangay: barangayValue,
              },
              birthday: birthday ? birthday.toISOString().split("T")[0] : null,
            });
            Alert.alert("Success", "Profile updated!");
            router.push("/profile");
          } catch (e) {
            console.error("Save error:", e);
            Alert.alert("Error", "Could not save changes.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  /* ───────────────────────────────
     UI RENDER
  ─────────────────────────────── */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>

        {/* Profile Photo */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <TouchableOpacity onPress={chooseImageSource}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={60} color="#999" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Inputs with visible labels */}
        <View style={{ marginBottom: 12 }}>
        <Text style={styles.label}>Username</Text>
        <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            style={styles.input}
        />
        </View>

        <View style={{ marginBottom: 12 }}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            style={styles.input}
        />
        </View>

        <View style={{ marginBottom: 12 }}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            style={styles.input}
        />
        </View>


        {/* Birthday */}
        <Text style={styles.label}>Birthday</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>
            {birthday ? birthday.toDateString() : "Select your birthday"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthday || new Date(2000, 0, 1)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setBirthday(selectedDate);
            }}
          />
        )}

        {/* Region Picker */}
        <Text style={styles.label}>Region</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={region}
            onValueChange={(value) => {
              setRegion(value);
              setMunicipality("");
              setBarangayValue("");
            }}
          >
            <Picker.Item label="Select Region" value="" />
            {regions.map((r: string, idx: number) => (
              <Picker.Item key={idx} label={r} value={r} />
            ))}
          </Picker>
        </View>

        {/* Municipality Picker */}
        {region ? (
          <>
            <Text style={styles.label}>Municipality / City</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={municipality}
                onValueChange={(value) => {
                  setMunicipality(value);
                  setBarangayValue("");
                }}
              >
                <Picker.Item label="Select Municipality" value="" />
                {municipalities[region]?.map((m: string, idx: number) => (
                  <Picker.Item key={idx} label={m} value={m} />
                ))}
              </Picker>
            </View>
          </>
        ) : null}

        {/* Barangay Picker */}
        {municipality ? (
          <>
            <Text style={styles.label}>Barangay</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={barangayValue}
                onValueChange={setBarangayValue}
              >
                <Picker.Item label="Select Barangay" value="" />
                {barangays[municipality]?.map((b: string, idx: number) => (
                  <Picker.Item key={idx} label={b} value={b} />
                ))}
              </Picker>
            </View>
          </>
        ) : null}

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={saveProfile}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="home" size={28} color="#444" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="construct" size={28} color="#444" />
          <Text style={styles.navText}>DIY</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/addPost")}
        >
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
    </KeyboardAvoidingView>
  );
}

/* ─────────────────────────────
   STYLES
───────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff",
    borderRadius: 15,
    padding: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  label: { fontWeight: "bold", marginBottom: 4 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  saveButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  saveText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  exitButton: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  exitText: {
    textAlign: "center",
    color: "#444",
    fontWeight: "600",
  },
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
