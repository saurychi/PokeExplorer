// src/screens/ar/ARCameraScreen.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import type { PhotoFile } from "react-native-vision-camera";

import BottomTab, { TabKey } from "../../components/BottomTab";

type Props = NativeStackScreenProps<any>;

type PokemonInfo = {
  id: number;                 // <── Pokédex number
  name: string;
  spriteUrl: string | null;
  types: string[];
  habitat: string | null;
};

const ARCameraScreen: React.FC<Props> = ({ route, navigation }) => {
  // from HuntScreen: navigation.navigate("ARCamera", { pokemonId, pokemonName })
  const { pokemonId, pokemonName } = route?.params ?? {};

  const [hasPermission, setHasPermission] = useState(false);
  const [pokemonData, setPokemonData] = useState<PokemonInfo | null>(null);
  const [loadingPokemon, setLoadingPokemon] = useState(true);
  const [pokemonError, setPokemonError] = useState<string | null>(null);

  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera | null>(null);

  // ask for camera permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    };

    requestPermission();
  }, []);

  // fetch Pokémon details from PokeAPI
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        setLoadingPokemon(true);
        setPokemonError(null);

        const idOrName =
          pokemonId ?? (pokemonName ? String(pokemonName).toLowerCase() : null);

        if (!idOrName) {
          setPokemonError("No Pokémon selected.");
          setPokemonData(null);
          return;
        }

        // 1) /pokemon/{id or name} for sprite + types + species URL
        const pokemonRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${idOrName}`
        );

        if (!pokemonRes.ok) {
          throw new Error("Failed to load Pokémon data");
        }

        const pokemonJson = await pokemonRes.json();

        const spriteUrl =
          pokemonJson?.sprites?.other?.["official-artwork"]?.front_default ||
          pokemonJson?.sprites?.front_default ||
          null;

        const types: string[] =
          pokemonJson?.types?.map((t: any) => t?.type?.name) ?? [];

        // 2) species endpoint for habitat
        let habitat: string | null = null;
        if (pokemonJson?.species?.url) {
          try {
            const speciesRes = await fetch(pokemonJson.species.url);
            if (speciesRes.ok) {
              const speciesJson = await speciesRes.json();
              habitat = speciesJson?.habitat?.name ?? null;
            }
          } catch (err) {
            console.log("Failed to load species data:", err);
          }
        }

        setPokemonData({
          id: pokemonJson.id,           // <── save id
          name: pokemonJson.name,
          spriteUrl,
          types,
          habitat,
        });
      } catch (err) {
        console.log("[ARCamera] PokeAPI error:", err);
        setPokemonError("Could not load Pokémon data.");
        setPokemonData(null);
      } finally {
        setLoadingPokemon(false);
      }
    };

    fetchPokemon();
  }, [pokemonId, pokemonName]);

  const handleCameraError = useCallback((error: unknown) => {
    const code = (error as any)?.code as string | undefined;

    // ignore “restricted” spam, only log once
    if (
      code === "system/camera-is-restricted" ||
      code === "system/camera-unavailable"
    ) {
      console.warn("[Camera] Restricted/unavailable:", code);
      return;
    }

    console.error("[Camera] Unexpected error:", error);
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || !hasPermission || !device) {
      return;
    }

    try {
      const photo: PhotoFile = await cameraRef.current.takePhoto({});

      if (!photo?.path) {
        console.log("No photo path returned");
        return;
      }

      const uri = `file://${photo.path}`;

      navigation.navigate("ARCaptureResult", {
        photoUri: uri,
        pokemonName: pokemonData?.name ?? pokemonName ?? "pokemon",
        pokemonId: pokemonData?.id ?? pokemonId ?? null, // <── pass id forward
      });
    } catch (error) {
      console.warn("Failed to take photo", error);
    }
  };

  // VR-lite habitat button navigation
  const handleViewHabitat = () => {
    const displayNameRaw =
      pokemonData?.name ?? pokemonName ?? "Unknown Pokémon";
    const displayName =
      displayNameRaw.charAt(0).toUpperCase() + displayNameRaw.slice(1);

    navigation.navigate("ARHabitat", {
      pokemonName: displayName,
      habitat: pokemonData?.habitat ?? null,
      spriteUrl: pokemonData?.spriteUrl ?? null,
    });
  };

  const displayNameRaw =
    pokemonData?.name ?? pokemonName ?? "Unknown Pokémon";
  const displayName =
    displayNameRaw.charAt(0).toUpperCase() + displayNameRaw.slice(1);

  const typesLabel =
    pokemonData?.types && pokemonData.types.length > 0
      ? pokemonData.types.map(t => t.toUpperCase()).join(" • ")
      : "Loading types…";

  const habitatLabel =
    pokemonData?.habitat != null
      ? pokemonData.habitat.charAt(0).toUpperCase() +
        pokemonData.habitat.slice(1)
      : "Unknown habitat";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* CAMERA AREA */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraPreviewWrapper}>
            {device && hasPermission ? (
              <Camera
                ref={cameraRef}
                style={RNStyleSheet.absoluteFill}
                device={device}
                isActive={hasPermission}
                photo={true}
                onError={handleCameraError}
              />
            ) : (
              <View style={styles.cameraFallback}>
                <Text style={styles.cameraHint}>
                  {hasPermission
                    ? "Loading camera..."
                    : "Camera permission is required"}
                </Text>
              </View>
            )}

            {/* TOP INFO BADGE (name, types, habitat) */}
            <View style={styles.infoPanel}>
              <Text style={styles.infoName}>
                {displayName}{" "}
                {pokemonId ? <Text style={styles.infoId}>#{pokemonId}</Text> : null}
              </Text>

              {loadingPokemon ? (
                <Text style={styles.infoSub}>Fetching PokeAPI data…</Text>
              ) : pokemonError ? (
                <Text style={styles.infoSub}>{pokemonError}</Text>
              ) : (
                <>
                  <Text style={styles.infoSub}>{typesLabel}</Text>
                  <Text style={styles.infoSub}>Habitat: {habitatLabel}</Text>
                </>
              )}
            </View>

            {/* TAP POKÉMON TO CAPTURE */}
            <TouchableOpacity
              style={styles.pokemonTapArea}
              onPress={handleCapture}
              activeOpacity={0.85}
            >
              {pokemonData?.spriteUrl ? (
                <Image
                  source={{ uri: pokemonData.spriteUrl }}
                  style={styles.pokemonOverlay}
                  resizeMode="contain"
                />
              ) : (
                <Image
                  // fallback sprite in case PokeAPI sprite is missing
                  source={require("../../assets/images/mudkip.png")}
                  style={styles.pokemonOverlay}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            {/* VIEW HABITAT BUTTON */}
            <TouchableOpacity
              style={styles.habitatButton}
              onPress={handleViewHabitat}
            >
              <Text style={styles.habitatButtonText}>View Habitat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Global BottomTab to match Home / Hunt style */}
      <View style={styles.tabWrapper}>
        <BottomTab
          activeTab="hunt"
          onTabPress={(tab: TabKey) => {
            // BottomTab already handles navigation internally in this project.
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ARCameraScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050608",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // CAMERA
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cameraPreviewWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#111318",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  cameraFallback: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111318",
  },
  cameraHint: {
    color: "#B0B3C0",
    fontSize: 14,
  },

  // POKEMON OVERLAY
  pokemonTapArea: {
    paddingBottom: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  pokemonOverlay: {
    width: 160,
    height: 140,
  },

  // INFO PANEL
  infoPanel: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  infoName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  infoId: {
    color: "#FFEB3B",
    fontSize: 14,
    fontWeight: "600",
  },
  infoSub: {
    color: "#E0E0E0",
    fontSize: 12,
    marginTop: 2,
  },

  // VIEW HABITAT BUTTON
  habitatButton: {
    marginBottom: 80,
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
  },

  habitatButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },

  // BottomTab wrapper (same pattern as HuntScreen)
  tabWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
