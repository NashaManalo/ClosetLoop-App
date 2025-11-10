import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker"; // ✅ Added for Birthday
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { signUp } from "../src/auth/signup";

// Define allowed regions explicitly
const regions = ["NCR"] as const;
type RegionType = typeof regions[number];

const municipalities: Record<RegionType, string[]> = {
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
  ],
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

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState<RegionType | "">("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");

  // ✅ Added for Birthday
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    if (
      !firstName ||
      !lastName ||
      !username ||
      !region ||
      !municipality ||
      !barangay ||
      !email ||
      !password ||
      !confirmPassword ||
      !birthday // ✅ Added for Birthday validation
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // ✅ Age Validation for 18+
    const age =
      (new Date().getTime() - birthday.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) {
      Alert.alert("Age Restriction", "You must be at least 18 years old to sign up.");
      return;
    }

    setLoading(true);
    try {
      // ✅ Added birthday field in signUp
      const user = await signUp(
        firstName,
        lastName,
        username,
        email.trim(),
        region,
        municipality,
        barangay,
        password,
        birthday.toISOString().split("T")[0] // ✅ Add birthday as string
      );

      Alert.alert(
        "Verify Your Email",
        "A verification link has been sent to your email. Please verify before logging in."
      );

      router.push("/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      {/* Region */}
      <Text style={styles.label}>Region</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={region}
          onValueChange={(value) => {
            setRegion(value as RegionType);
            setMunicipality("");
            setBarangay("");
          }}
        >
          <Picker.Item label="Select Region" value="" />
          {regions.map((r, idx) => (
            <Picker.Item key={idx} label={r} value={r} />
          ))}
        </Picker>
      </View>

      {/* Municipality */}
      {region && (
        <>
          <Text style={styles.label}>Municipality / City</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={municipality}
              onValueChange={(value) => {
                setMunicipality(value);
                setBarangay("");
              }}
            >
              <Picker.Item label="Select Municipality" value="" />
              {municipalities[region]?.map((m, idx) => (
                <Picker.Item key={idx} label={m} value={m} />
              ))}
            </Picker>
          </View>
        </>
      )}

      {/* Barangay */}
      {municipality && (
        <>
          <Text style={styles.label}>Barangay</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={barangay} onValueChange={setBarangay}>
              <Picker.Item label="Select Barangay" value="" />
              {barangays[municipality]?.map((b, idx) => (
                <Picker.Item key={idx} label={b} value={b} />
              ))}
            </Picker>
          </View>
        </>
      )}

      {/* ✅ Birthday Field */}
      <Text style={styles.label}>Birthday</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{birthday ? birthday.toDateString() : "Select Birthday"}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={birthday || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (d) setBirthday(d);
          }}
          maximumDate={new Date()}
        />
      )}

      {/* Email & Password */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye" : "eye-off"}
            size={22}
            color="gray"
          />
        </TouchableOpacity>
      </View>

      <Button
        title={loading ? "Signing up..." : "Sign Up"}
        onPress={handleSignup}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, padding: 20, backgroundColor: "#fff" },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  label: { fontWeight: "bold", marginBottom: 4 },
  link: { marginTop: 15, textAlign: "center", color: "#007BFF" },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  passwordInput: { flex: 1 },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
});
