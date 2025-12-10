import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

type Props = NativeStackScreenProps<any>;
type Starter = "mudkip" | "torchic" | "treecko" | null;

const StarterScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedStarter, setSelectedStarter] = useState<Starter>(null);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedStarter) {
      Alert.alert("Choose your Starter", "Please select a Pokémon to continue.");
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Not signed in", "Please sign in again.");
      navigation.navigate("Signin");
      return;
    }

    try {
      setLoading(true);
      await firestore().collection("users").doc(user.uid).update({
        starter: selectedStarter,
      });

      navigation.navigate("Home");
    } catch (error: any) {
      console.log("Error saving starter:", error);
      Alert.alert("Error", error.message || "Unable to save starter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Image
            source={require("../../assets/images/pokeball_logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>PokeExplorer</Text>
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.title}>Choose your Starter</Text>

          <View style={styles.cardsRow}>
            <TouchableOpacity
              style={[
                styles.card,
                selectedStarter === "mudkip" && styles.cardSelected,
              ]}
              onPress={() => setSelectedStarter("mudkip")}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/images/mudkip.png")}
                style={styles.cardImage}
              />
              <Text style={styles.cardLabel}>Mudkip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                selectedStarter === "torchic" && styles.cardSelected,
              ]}
              onPress={() => setSelectedStarter("torchic")}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/images/torchic.png")}
                style={styles.cardImage}
              />
              <Text style={styles.cardLabel}>Torchic</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                selectedStarter === "treecko" && styles.cardSelected,
              ]}
              onPress={() => setSelectedStarter("treecko")}
              activeOpacity={0.8}
            >
              <Image
                source={require("../../assets/images/treecko.png")}
                style={styles.cardImage}
              />
              <Text style={styles.cardLabel}>Treecko</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.nextBtn,
            !selectedStarter && { opacity: 0.5 },
          ]}
          onPress={handleNext}
          disabled={!selectedStarter || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {loading ? "Saving..." : "Next"}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default StarterScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
  },

  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    minHeight: 200,
  },
  cardSelected: {
    borderColor: "#E53935",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardImage: {
    width: 80,
    height: 90,
    marginBottom: 12,
    resizeMode: "contain",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  nextBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 30,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
