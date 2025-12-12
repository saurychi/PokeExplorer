// src/screens/ar/ARHabitatScreen.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from "react-native-sensors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import BottomTab, { TabKey } from "../../components/BottomTab";

type Props = NativeStackScreenProps<any>;

const { width: WINDOW_WIDTH } = Dimensions.get("window");

// Panoramic image is wider than the screen so we can move it
const IMAGE_WIDTH = WINDOW_WIDTH * 1.8;
const MAX_PAN = (IMAGE_WIDTH - WINDOW_WIDTH) / 2;

// Map PokeAPI habitat keys to your local 360 images + label text
const HABITAT_CONFIG: Record<
  string,
  { label: string; image: any; description: string }
> = {
  cave: {
    label: "Cave",
    image: require("../../assets/habitats/cave.jpg"),
    description:
      "Dark tunnels and rocky passages where sound echoes and light is scarce. Imagine exploring these caverns with only your partner Pokémon by your side.",
  },
  forest: {
    label: "Forest",
    image: require("../../assets/habitats/forest.jpg"),
    description:
      "Dense trees, soft sunlight, and rustling leaves. Many Grass- and Bug-type Pokémon thrive in this peaceful forest biome.",
  },
  grassland: {
    label: "Grassland",
    image: require("../../assets/habitats/grassland.jpg"),
    description:
      "Open fields and gentle breezes. This habitat is perfect for Pokémon that love to roam wide open spaces.",
  },
  mountain: {
    label: "Mountain",
    image: require("../../assets/habitats/mountain.jpg"),
    description:
      "High cliffs and cold winds. This area represents the typical environment where powerful Pokémon can be found in the wild.",
  },
  rare: {
    label: "Rare",
    image: require("../../assets/habitats/rare.jpg"),
    description:
      "A mysterious location where rare Pokémon occasionally appear. Few trainers ever see this habitat in person.",
  },
  "rough-terrain": {
    label: "Rough Terrain",
    image: require("../../assets/habitats/rough-terrain.jpg"),
    description:
      "Jagged rocks, uneven paths, and harsh conditions. Only the toughest Pokémon are comfortable here.",
  },
  sea: {
    label: "Sea",
    image: require("../../assets/habitats/sea.jpg"),
    description:
      "Endless blue water stretching to the horizon. Water-type Pokémon can often be seen swimming just below the surface.",
  },
  urban: {
    label: "Urban",
    image: require("../../assets/habitats/urban.jpg"),
    description:
      "Busy streets, tall buildings, and neon lights. Some Pokémon have learned to live alongside humans in the city.",
  },
  "water-edge": {
    label: "Water’s Edge",
    image: require("../../assets/habitats/water-edge.jpg"),
    description:
      "Rivers, lakes, and shorelines. Pokémon that enjoy both land and water often gather around these edges.",
  },
};

const ARHabitatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonName, habitatKey, spriteUrl } = route?.params ?? {};

  const safeName: string =
    typeof pokemonName === "string" && pokemonName.length > 0
      ? pokemonName
      : "Pokémon";

  const displayName =
    safeName.charAt(0).toUpperCase() + safeName.slice(1).toLowerCase();

  const habitatConfig =
    (habitatKey && HABITAT_CONFIG[habitatKey]) || HABITAT_CONFIG["mountain"];

  const panX = useRef(new Animated.Value(0)).current;
  const angleRef = useRef(0);

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.gyroscope, 50);

    const sub = gyroscope.subscribe(({ y }) => {
      const prevAngle = angleRef.current;
      const nextAngle = prevAngle + y * 0.06; // sensitivity
      const clamped = Math.max(-1, Math.min(1, nextAngle));
      angleRef.current = clamped;

      const targetOffset = clamped * MAX_PAN;

      Animated.spring(panX, {
        toValue: targetOffset,
        friction: 18,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [panX]);

  // BottomTab handlers (navigation is already handled inside BottomTab)
  const handleTabPress = (tab: TabKey) => {
    // if you ever want custom behavior on habitat you can add it here
  };

  const headerSubtitle = `Gently move your phone left and right to explore the ${habitatConfig.label} habitat.`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{displayName} Habitat</Text>
            <Text style={styles.subtitle}>{headerSubtitle}</Text>
          </View>

          <View style={styles.headerIconWrapper}>
            <Ionicons name="planet-outline" size={20} color="#000" />
          </View>
        </View>

        {/* HABITAT CARD */}
        <View style={styles.card}>
          <View style={styles.habitatMask}>
            <Animated.Image
              source={habitatConfig.image}
              style={[
                styles.habitatImage,
                {
                  transform: [{ translateX: panX }],
                },
              ]}
              resizeMode="cover"
            />

            {/* Pokémon stays fixed in the center bottom */}
            <View style={styles.pokemonCircle}>
              {spriteUrl ? (
                <Image
                  source={{ uri: spriteUrl }}
                  style={styles.pokemonSprite}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={require("../../assets/images/mudkip.png")}
                  style={styles.pokemonSprite}
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </View>

        {/* DESCRIPTION CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{habitatConfig.label} Habitat</Text>
          <Text style={styles.infoText}>{habitatConfig.description}</Text>
        </View>
      </View>

      {/* Shared BottomTab – same style as other AR screens */}
      <View style={styles.bottomTabWrapper}>
        <BottomTab activeTab="hunt" onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
};

export default ARHabitatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050509",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },

  headerRow: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#B0B3C0",
    fontSize: 14,
    marginTop: 6,
    maxWidth: "95%",
  },
  headerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  card: {
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#111318",
    marginBottom: 20,
  },
  habitatMask: {
    width: "100%",
    height: WINDOW_WIDTH * 1.1,
    overflow: "hidden",
    borderRadius: 32,
    backgroundColor: "#111318",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  habitatImage: {
    position: "absolute",
    width: IMAGE_WIDTH,
    height: "100%",
  },

  pokemonCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#22C55E",
    backgroundColor: "rgba(0,0,0,0.8)",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pokemonSprite: {
    width: 110,
    height: 110,
  },

  infoCard: {
    backgroundColor: "#141620",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  infoTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    color: "#B0B3C0",
    fontSize: 14,
    lineHeight: 20,
  },

  bottomTabWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
