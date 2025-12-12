// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomTab, { TabKey } from "../components/BottomTab";

type CaptureItem = {
  uri: string;
  pokemonName: string;
  createdAt: number;
};

const CAPTURE_STORAGE_KEY = "@pokeexplorer_captures";

const HomeScreen = ({ navigation }: NativeStackScreenProps<any>) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  // Local stats derived from AR captures
  const [totalDiscovered, setTotalDiscovered] = useState(0);
  const [totalCaptures, setTotalCaptures] = useState(0);
  const [recentCaughtNames, setRecentCaughtNames] = useState<string[]>([]);

  // 1) Load profile from Firebase (same as before)
  useEffect(() => {
    const user = auth().currentUser;

    if (!user) {
      navigation.navigate("Signin");
      return;
    }

    const fetchProfile = async () => {
      try {
        const doc = await firestore().collection("users").doc(user.uid).get();
        const data = doc.data() || {};

        setProfile({
          ...data,
          email: user.email,
          displayName: user.displayName,
        });
      } catch (error) {
        console.log("Profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigation]);

  // 2) Load capture stats from AsyncStorage (AR captures)
  const loadCaptureStats = async () => {
    try {
      const stored = await AsyncStorage.getItem(CAPTURE_STORAGE_KEY);
      if (!stored) {
        setTotalCaptures(0);
        setTotalDiscovered(0);
        setRecentCaughtNames([]);
        return;
      }

      const parsed: CaptureItem[] = JSON.parse(stored);

      // Total captures = total photos saved
      setTotalCaptures(parsed.length);

      // Total discovered = unique Pokémon names
      const speciesSet = new Set(
        parsed
          .map((c) => c.pokemonName || "")
          .filter(Boolean)
          .map((name) => name.toLowerCase().trim())
      );
      setTotalDiscovered(speciesSet.size);

      // Recently caught = last few names (most recent first)
      const recent = parsed.slice(0, 4).map((c) => c.pokemonName || "Unknown");
      setRecentCaughtNames(recent);
    } catch (err) {
      console.log("Error loading capture stats:", err);
    }
  };

  // Run once and also whenever Home gains focus (coming back from AR)
  useEffect(() => {
    loadCaptureStats();

    const unsubscribe = navigation.addListener("focus", () => {
      loadCaptureStats();
    });

    return unsubscribe;
  }, [navigation]);

  // Safe fallbacks while loading
  const displayName = profile?.name || profile?.displayName || "Trainer";
  const gender = profile?.gender === "female" ? "female" : "male";

  const theme =
    gender === "female"
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

  const joinedText =
    profile?.createdAt?.toDate
      ? profile.createdAt.toDate().toLocaleDateString()
      : "Unknown";

  const recentCaught = recentCaughtNames;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top hero section (always visible, even while loading) */}
      <View style={[styles.topSection, { backgroundColor: theme.topColor }]}>
        <LinearGradient
          colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0.0)"]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.bottomGlow}
        />

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

      {/* Bottom sheet (this is the part that "loads") */}
      <View style={styles.bottomSheet}>
        {loading ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color="#E53935" />
            <Text style={styles.loadingText}>Loading trainer data…</Text>
          </View>
        ) : (
          <>
            <Text style={styles.nameText}>{displayName}</Text>
            <Text style={styles.tagText}>
              @{(profile?.email || "").split("@")[0]}
            </Text>

            <Text style={styles.joinedText}>Joined on {joinedText}</Text>

            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Total Pokémon Discovered:</Text>
              <Text style={[styles.statValue, { color: theme.accent }]}>
                {totalDiscovered}
              </Text>
            </View>

            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Total Pokémon Captures:</Text>
              <Text style={[styles.statValue, { color: theme.accent }]}>
                {totalCaptures}
              </Text>
            </View>

            <View style={styles.recentSection}>
              <Text style={styles.recentTitle}>Recently Caught Pokémon</Text>
              {recentCaught.length === 0 ? (
                <Text style={styles.recentEmpty}>
                  No recent captures yet. Go explore and catch some!
                </Text>
              ) : (
                <View style={styles.recentList}>
                  {recentCaught.slice(0, 4).map((name, idx) => (
                    <View key={idx} style={styles.recentPill}>
                      <Text style={styles.recentPillText}>{name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Bottom Tab (always visible) */}
      <View style={styles.bottomTabWrapper}>
        <BottomTab
          activeTab={activeTab}
          onTabPress={setActiveTab}
          accentColor={theme.accent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },

  topSection: {
    height: 320,
    paddingHorizontal: 24,
    paddingTop: 10,
  },

  bottomGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
    zIndex: 0,
  },

  topHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    zIndex: 2,
  },
  welcomeText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 6,
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
    width: 240,
    height: 340,
    marginLeft: -40,
    marginBottom: -55,
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: "#111",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -55,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 130,
    elevation: 20,
  },

  loadingSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 24,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
  },

  nameText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  tagText: {
    color: "#AAA",
    fontSize: 13,
    marginTop: 2,
    marginBottom: 18,
  },
  joinedText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 32,
  },

  statBlock: {
    marginBottom: 26,
  },
  statLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
  },

  recentSection: {
    marginTop: 24,
  },
  recentTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  recentEmpty: {
    color: "#bbb",
    fontSize: 13,
  },

  recentList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentPill: {
    backgroundColor: "#1E1E1E",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  recentPillText: {
    color: "#fff",
    fontSize: 12,
  },

  bottomTabWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
