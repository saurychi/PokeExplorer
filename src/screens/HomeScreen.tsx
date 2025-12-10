import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pokemonsDiscovered, setPokemonsDiscovered] = useState();
  const [pokemonsExplored, setPokemonsExplored] = useState();

  useEffect(() => {
    const user = auth().currentUser;

    if (!user) {
      navigation.navigate("Signin");
      return;
    }

    const loadProfile = async () => {
      try {
        const doc = await firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        const data = doc.data() || {};

        setProfile({
          ...data,
          email: user.email,
          displayName: user.displayName,
        });
      } catch (err) {
        console.log("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#E53935" />
        </View>
      </SafeAreaView>
    );
  }

  const displayName =
    profile?.name || profile?.displayName || "Trainer";

  const gender = profile?.gender === "female" ? "female" : "male";

  const isFemale = gender === "female";

  const theme = isFemale
    ? {
        topColor: "#4FA7FF",
        accent: "#4FA7FF",
        trainerImage: require("../assets/images/female_trainer.png"),
      }
    : {
        topColor: "#FF5252",
        accent: "#FF5252",
        trainerImage: require("../assets/images/male_trainer.png"),
      };

  let joinedText = "Unknown";
  const createdAt = profile?.createdAt;
  if (createdAt && createdAt.toDate) {
    joinedText = createdAt.toDate().toLocaleDateString();
  }



  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.topSection, { backgroundColor: theme.topColor }]}>
        <View style={styles.topHeaderRow}>
          <Text style={styles.welcomeText}>Welcome, {displayName}</Text>
          <Image
            source={require("../assets/images/pokeball_logo.png")}
            style={styles.pokeballSmall}
          />
        </View>

        <View style={styles.trainerWrapper}>
          <Image
            source={theme.trainerImage}
            style={styles.trainerImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.profileSection}>
          <Text style={styles.nameText}>{displayName}</Text>
          <Text style={styles.tagText}>
            @{(profile?.email || "trainer").split("@")[0]}
          </Text>

          <Text style={styles.joinedText}>
            Joined on {joinedText}
          </Text>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>
              Total Pokemon Discovered:
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: theme.accent },
              ]}
            >
              {profile?.pokemon_discovered}
            </Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>
              Total Pokemon Captures:
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: theme.accent },
              ]}
            >
              {profile?.pokemon_captured}
            </Text>
          </View>
        </View>

        <View style={styles.tabBar}>
          <View style={styles.tabItem}>
            <Ionicons name="ios-home" size={22} color="#000" />
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="ios-compass" size={22} color="#000" />
          </View>
          <View style={styles.tabItem}>
            <Ionicons name="ios-person" size={22} color="#000" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  /* TOP SECTION */
  topSection: {
    height: 230,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  pokeballSmall: {
    width: 24,
    height: 24,
  },
  trainerWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  trainerImage: {
    width: 140,
    height: 180,
  },

  /* BOTTOM SHEET */
  bottomSheet: {
    flex: 1,
    backgroundColor: "#111111",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },

  profileSection: {
    flex: 1,
  },
  nameText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  tagText: {
    color: "#AAAAAA",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 18,
  },
  joinedText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 32,
  },

  statBlock: {
    marginBottom: 26,
  },
  statLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
  },

  /* BOTTOM TAB BAR */
  tabBar: {
    backgroundColor: "#F5F5F5",
    height: 64,
    borderRadius: 26,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },

  /* LOADING */
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
