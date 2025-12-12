// src/screens/ar/ARCaptureResultScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import BottomTab, { TabKey } from "../../components/BottomTab";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const CAPTURE_STORAGE_KEY = "@pokeexplorer_captures";

type Props = NativeStackScreenProps<any>;

type PokemonSpriteInfo = {
  spriteUrl: string | null;
};

const ARCaptureResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const photoUri: string | undefined = route?.params?.photoUri;
  const pokemonNameRaw: string =
    route?.params?.pokemonName ?? "Unknown Pokémon";
  const pokemonId: number | null =
    route?.params?.pokemonId != null ? Number(route.params.pokemonId) : null;

  const pokemonName =
    pokemonNameRaw.charAt(0).toUpperCase() + pokemonNameRaw.slice(1);

  const [pokemonSprite, setPokemonSprite] = useState<PokemonSpriteInfo>({
    spriteUrl: null,
  });

  // Fetch sprite from PokeAPI so we can show the actual Pokémon
  useEffect(() => {
    const fetchSprite = async () => {
      try {
        const idOrName = pokemonNameRaw.toLowerCase();
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${idOrName}`
        );
        if (!res.ok) {
          throw new Error("Failed to load Pokémon sprite");
        }
        const json = await res.json();
        const spriteUrl =
          json?.sprites?.other?.["official-artwork"]?.front_default ||
          json?.sprites?.front_default ||
          null;

        setPokemonSprite({ spriteUrl });
      } catch (err) {
        console.log("[ARCaptureResult] sprite fetch error:", err);
        setPokemonSprite({ spriteUrl: null });
      }
    };

    fetchSprite();
  }, [pokemonNameRaw]);

  // Save capture into local gallery storage
  const saveToAsyncStorage = async () => {
    if (!photoUri) return;

    try {
      const existing = await AsyncStorage.getItem(CAPTURE_STORAGE_KEY);
      const captures = existing ? JSON.parse(existing) : [];

      const newCapture = {
        uri: photoUri,
        pokemonName,
        createdAt: Date.now(),
      };

      const updated = [newCapture, ...captures];
      await AsyncStorage.setItem(CAPTURE_STORAGE_KEY, JSON.stringify(updated));
      console.log("Capture saved to storage.");
    } catch (err) {
      console.log("Error saving capture:", err);
    }
  };

  // Upsert Pokédex entry in Firestore for this user
  const upsertPokedexEntry = async () => {
    try {
      const user = auth().currentUser;
      if (!user || !pokemonId) {
        return;
      }

      const docId = `${user.uid}_${pokemonId}`; // one species per user

      await firestore()
        .collection("pokemons")
        .doc(docId)
        .set(
          {
            user_id: user.uid,
            pokemon_id: pokemonId,
            name: pokemonNameRaw.toLowerCase(),
            image: photoUri || null,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      console.log("Pokédex entry upserted.");
    } catch (err) {
      console.log("Error upserting Pokédex entry:", err);
    }
  };

  const handleConfirm = async () => {
    if (!photoUri) {
      console.log("No photoUri passed, skipping save and going to gallery.");
      navigation.navigate("ARGallery");
      return;
    }

    await saveToAsyncStorage();
    await upsertPokedexEntry();

    navigation.navigate("ARGallery");
  };

  const handleShare = async () => {
    try {
      if (photoUri) {
        await Share.share({
          message: `Check out my Pokémon capture: ${pokemonName}!`,
          url: photoUri,
        });
      } else {
        await Share.share({
          message: `I just caught ${pokemonName} in PokeExplorer!`,
        });
      }
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const previewSource = photoUri
    ? { uri: photoUri }
    : require("../../assets/images/mudkip.png");

  const spriteSource = pokemonSprite.spriteUrl
    ? { uri: pokemonSprite.spriteUrl }
    : require("../../assets/images/mudkip.png");

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.congrats}>CONGRATULATIONS</Text>
        <Text style={styles.subtitle}>You caught</Text>
        <Text style={styles.pokemonName}>{pokemonName}!</Text>

        {/* Captured photo in purple circle */}
        <View style={styles.previewCircle}>
          <View style={styles.glowCircle} />
          <Image
            source={previewSource}
            style={styles.previewImage}
            resizeMode="cover"
          />
        </View>

        {/* Pokémon sprite badge */}
        <View style={styles.spriteWrapper}>
          <View style={styles.spriteCircle}>
            <Image
              source={spriteSource}
              style={styles.spriteImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.spriteLabel}>Pokémon: {pokemonName}</Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Save to Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Global bottom tab – same style as Home/Hunt/AR */}
      <View style={styles.tabWrapper}>
        <BottomTab
          activeTab="hunt"
          onTabPress={(tab: TabKey) => {
            // navigation logic is handled in BottomTab for this project
          }}
        />
      </View>
    </View>
  );
};

export default ARCaptureResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050509",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  congrats: {
    color: "#FFFFFF",
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    color: "#AAAAAA",
    fontSize: 14,
  },
  pokemonName: {
    color: "#4ADE80",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 24,
  },
  previewCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  glowCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#4C2B89",
    opacity: 0.9,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  spriteWrapper: {
    alignItems: "center",
    marginBottom: 32,
  },
  spriteCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#111318",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  spriteImage: {
    width: 70,
    height: 70,
  },
  spriteLabel: {
    color: "#E5E7EB",
    fontSize: 13,
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#00C853",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
  shareButton: {
    width: "100%",
    borderColor: "#00C853",
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  shareText: {
    color: "#00C853",
    fontWeight: "600",
    fontSize: 16,
  },
  tabWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
