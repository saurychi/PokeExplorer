// src/screens/ar/ARPhotoDetailScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import BottomTab, { TabKey } from "../../components/BottomTab";

type CaptureItem = {
  uri: string;
  pokemonName: string;
  createdAt: number;
};

type Props = NativeStackScreenProps<any>;

const ARPhotoDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const capture: CaptureItem | undefined = route?.params?.capture;

  const uri = capture?.uri;
  const pokemonNameRaw = capture?.pokemonName ?? "Unknown Pokémon";
  const pokemonName =
    pokemonNameRaw.charAt(0).toUpperCase() + pokemonNameRaw.slice(1);

  const createdAt = capture?.createdAt ?? Date.now();
  const dateLabel = new Date(createdAt).toLocaleString();

  // Pokémon sprite for overlay
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);

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
        const url =
          json?.sprites?.other?.["official-artwork"]?.front_default ||
          json?.sprites?.front_default ||
          null;
        setSpriteUrl(url);
      } catch (err) {
        console.log("[ARPhotoDetail] sprite fetch error:", err);
        setSpriteUrl(null);
      }
    };

    fetchSprite();
  }, [pokemonNameRaw]);

  const handleShare = async () => {
    try {
      if (uri) {
        await Share.share({
          message: `My AR capture of ${pokemonName}!`,
          url: uri,
        });
      } else {
        await Share.share({
          message: `My AR capture of ${pokemonName}!`,
        });
      }
    } catch (err) {
      console.log("[ARPhotoDetail] share error:", err);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Custom header in dark area */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            {/* Plain text arrow so we never get a weird glyph */}
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{pokemonName}</Text>
          {/* spacer so title stays centered */}
          <View style={{ width: 24 }} />
        </View>

        {/* Photo card + centered Pokémon badge */}
        <View style={styles.photoCard}>
          {uri ? (
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri }}
                style={styles.photo}
                resizeMode="cover"
              />

              {spriteUrl && (
                <View style={styles.spriteOverlayCenter}>
                  <View style={styles.spriteBadge}>
                    <Image
                      source={{ uri: spriteUrl }}
                      style={styles.spriteImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.photoFallback}>
              <Text style={styles.photoFallbackText}>No photo available</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoName}>{pokemonName}</Text>
          <Text style={styles.infoDate}>{dateLabel}</Text>
        </View>

        {/* Share button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share Capture</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom global nav */}
      <View style={styles.tabWrapper}>
        <BottomTab
          activeTab="hunt"
          onTabPress={(tab: TabKey) => {
            // navigation handled by BottomTab
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ARPhotoDetailScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050509",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "400",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  photoCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111318",
    marginTop: 4,
  },
  photoWrapper: {
    width: "100%",
    height: 420,
    position: "relative",
    backgroundColor: "#000",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoFallback: {
    width: "100%",
    height: 420,
    justifyContent: "center",
    alignItems: "center",
  },
  photoFallbackText: {
    color: "#9CA3AF",
  },

  // CENTERED Pokémon badge overlay
  spriteOverlayCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -48 }], // half of badge size
  },
  spriteBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  spriteImage: {
    width: 80,
    height: 80,
  },

  infoSection: {
    marginTop: 16,
  },
  infoName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  infoDate: {
    color: "#9CA3AF",
    marginTop: 4,
    fontSize: 13,
  },

  shareButton: {
    marginTop: 24,
    backgroundColor: "#00C853",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  shareButtonText: {
    color: "#000000",
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
