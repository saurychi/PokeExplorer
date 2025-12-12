import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import type { PhotoFile } from "react-native-vision-camera";
import { ChevronLeftIcon, CameraIcon } from "react-native-heroicons/outline";

type PokemonPayload = {
  id: number;
  name: string;
  image?: string | null;
  types?: string[];
  latitude?: number;
  longitude?: number;
};

type Props = NativeStackScreenProps<any>;

const CapturePokemon: React.FC<Props> = ({ navigation, route }) => {
  const pokemon: PokemonPayload | undefined = route.params?.pokemon;

  const device = useCameraDevice("back");
  const cameraRef = useRef<Camera | null>(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [requesting, setRequesting] = useState(true);
  const [taking, setTaking] = useState(false);

  const displayName = useMemo(() => {
    if (!pokemon?.name) return "Wild Pokémon";
    return pokemon.name.toUpperCase();
  }, [pokemon?.name]);

  useEffect(() => {
    const request = async () => {
      try {
        const cam = await Camera.requestCameraPermission();
        setHasPermission(cam === "granted");
      } catch (e) {
        console.log("Camera permission error:", e);
        setHasPermission(false);
      } finally {
        setRequesting(false);
      }
    };
    request();
  }, []);

  const handleTakePhoto = async () => {
    if (!cameraRef.current || taking) return;

    try {
      setTaking(true);
      const photo: PhotoFile = await cameraRef.current.takePhoto({
        flash: "off",
      });

      Alert.alert("Photo captured!", "Now you can proceed to the capture step.", [
        {
          text: "Proceed",
          onPress: () => navigation.goBack(),
        },
      ]);

      console.log("Captured photo path:", photo.path);
    } catch (e) {
      console.log("Take photo error:", e);
      Alert.alert("Error", "Failed to take photo.");
    } finally {
      setTaking(false);
    }
  };

  const handleOpenMinigame = () => {
    if (!pokemon) {
      Alert.alert("No Pokémon", "No Pokémon was provided to this screen.");
      return;
    }
    navigation.navigate("Randomize", { pokemon });
  };

  if (requesting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF5252" />
        <Text style={styles.centerText}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerTitle}>Camera Permission Needed</Text>
        <Text style={styles.centerText}>
          Please allow camera access to capture Pokémon.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={async () => {
            setRequesting(true);
            const cam = await Camera.requestCameraPermission();
            setHasPermission(cam === "granted");
            setRequesting(false);
          }}
        >
          <Text style={styles.primaryBtnText}>Allow Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerTitle}>No Camera Device</Text>
        <Text style={styles.centerText}>
          Could not find a back camera on this device/emulator.
        </Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeftIcon size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Capture Pokémon</Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.pokemonOverlay}>
        <Text style={styles.pokemonLabel}>A wild Pokémon appeared!</Text>
        <Text style={styles.pokemonName}>
          {pokemon ? `#${pokemon.id} ${displayName}` : "Unknown"}
        </Text>

        {pokemon?.image ? (
          <Image source={{ uri: pokemon.image }} style={styles.pokemonSprite} />
        ) : (
          <Text style={styles.noSprite}>No sprite available</Text>
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.roundBtn, taking && { opacity: 0.7 }]}
          onPress={handleTakePhoto}
          disabled={taking}
        >
          <CameraIcon size={22} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtnWide} onPress={handleOpenMinigame}>
          <Text style={styles.primaryBtnText}>Start Capture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CapturePokemon;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },

  topBar: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  pokemonOverlay: {
    position: "absolute",
    top: 100,
    left: 16,
    right: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
  },
  pokemonLabel: { color: "#ddd", fontSize: 12 },
  pokemonName: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 6 },
  pokemonSprite: { width: 140, height: 140, marginTop: 10 },
  noSprite: { color: "#aaa", fontSize: 12, marginTop: 10 },

  bottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  roundBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnWide: {
    flex: 1,
    backgroundColor: "#FF5252",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    backgroundColor: "#FF5252",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  secondaryBtn: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  center: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  centerTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 10 },
  centerText: { color: "#bbb", fontSize: 13, textAlign: "center" },
});
