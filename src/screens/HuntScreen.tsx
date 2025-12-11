import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from "react-native";
import MapView, {
  Marker,
  Region,
  UserLocationChangeEvent,
} from "react-native-maps";

type Biome = "urban" | "rural" | "water";

type PokemonSpawn = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  biome: Biome;
};

type SimpleCoord = {
  latitude: number;
  longitude: number;
};

const BIOME_POKEMON: Record<Biome, string[]> = {
  urban: ["Pikachu", "Magnemite", "Grimer", "Koffing"],
  rural: ["Bulbasaur", "Pidgey", "Rattata", "Oddish"],
  water: ["Squirtle", "Magikarp", "Psyduck", "Tentacool"],
};

// Default region so map always shows something (Manila)
const DEFAULT_REGION: Region = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Very simple biome logic
function getBiomeFromCoords(lat: number, lon: number): Biome {
  if (Math.abs(lat) < 10) return "water";
  if (Math.floor(Math.abs(lon)) % 2 === 0) return "urban";
  return "rural";
}

function getRandomNearbyOffset() {
  const maxOffset = 0.003;
  const minOffset = 0.001;
  const offsetLat =
    (Math.random() * (maxOffset - minOffset) + minOffset) *
    (Math.random() > 0.5 ? 1 : -1);
  const offsetLon =
    (Math.random() * (maxOffset - minOffset) + minOffset) *
    (Math.random() > 0.5 ? 1 : -1);
  return { offsetLat, offsetLon };
}

function spawnRandomPokemon(lat: number, lon: number): PokemonSpawn {
  const biome = getBiomeFromCoords(lat, lon);
  const list = BIOME_POKEMON[biome];
  const name = list[Math.floor(Math.random() * list.length)];
  const { offsetLat, offsetLon } = getRandomNearbyOffset();

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name,
    biome,
    latitude: lat + offsetLat,
    longitude: lon + offsetLon,
  };
}

function distanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const HuntScreen: React.FC = () => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<SimpleCoord | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [spawns, setSpawns] = useState<PokemonSpawn[]>([]);
  const hasCenteredOnce = useRef(false);

  // Ask for location permission (Android)
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "PokeExplorer needs your location for Hunt mode!",
            buttonPositive: "OK",
          }
        );
        const ok = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasLocationPermission(ok);
        if (!ok) {
          Alert.alert(
            "Permission denied",
            "Location permission was not granted. Hunt mode will use a default map location."
          );
        }
      } else {
        setHasLocationPermission(true);
      }
    } catch (err) {
      console.warn("Permission error:", err);
      setHasLocationPermission(false);
      Alert.alert(
        "Permission error",
        "Could not request location permission. Using default map region."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Called by MapView when it gets the user’s location
  const handleUserLocationChange = (event: UserLocationChangeEvent) => {
    const coord = event.nativeEvent.coordinate;
    if (!coord) return;

    const current = {
      latitude: coord.latitude,
      longitude: coord.longitude,
    };

    setUserLocation(current);

    // Center on user only the first time we get a location
    if (!hasCenteredOnce.current) {
      hasCenteredOnce.current = true;
      setRegion((prev) => ({
        ...prev,
        latitude: current.latitude,
        longitude: current.longitude,
      }));
    }
  };

  const handleCenterOnUser = () => {
    if (!userLocation) {
      Alert.alert(
        "No location yet",
        "We don't have your current location yet. Try again in a few seconds."
      );
      return;
    }

    setRegion((prev) => ({
      ...prev,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    }));
  };

  const handleScanForPokemon = () => {
    // Use user location if known, otherwise use map center
    const baseLat = userLocation?.latitude ?? region.latitude;
    const baseLon = userLocation?.longitude ?? region.longitude;

    const newSpawns: PokemonSpawn[] = [];
    for (let i = 0; i < 3; i++) {
      newSpawns.push(spawnRandomPokemon(baseLat, baseLon));
    }

    setSpawns((prev) => [...prev, ...newSpawns]);

    const nearby = newSpawns.filter((pkm) => {
      const dist = distanceInMeters(
        baseLat,
        baseLon,
        pkm.latitude,
        pkm.longitude
      );
      return dist < 200;
    });

    if (nearby.length > 0) {
      const first = nearby[0];
      Alert.alert(
        `A wild ${first.name} appeared!`,
        `There is a ${first.name} nearby in the ${first.biome} biome!`
      );
    } else {
      Alert.alert(
        "No nearby Pokémon",
        "No Pokémon spawned within 200m. Try scanning again or moving around!"
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.text}>Preparing Hunt Mode…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={hasLocationPermission}
        onUserLocationChange={handleUserLocationChange}
      >
        {spawns.map((pkm) => (
          <Marker
            key={pkm.id}
            coordinate={{
              latitude: pkm.latitude,
              longitude: pkm.longitude,
            }}
            title={pkm.name}
            description={`Biome: ${pkm.biome}`}
          />
        ))}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.title}>Hunt Mode</Text>
        <Text style={styles.text}>
          Walk around to discover Pokémon. Spawns depend on your biome (urban,
          rural, or water). Use Scan to generate nearby Pokémon.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleCenterOnUser}>
          <Text style={styles.buttonText}>Center on Me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 6 }]}
          onPress={handleScanForPokemon}
        >
          <Text style={styles.buttonText}>Scan for Pokémon</Text>
        </TouchableOpacity>

        <Text style={styles.textSmall}>
          Total Spawns: {spawns.length} Pokémon
        </Text>
      </View>
    </View>
  );
};

export default HuntScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1220",
    paddingHorizontal: 24,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  text: { color: "white", textAlign: "center", marginTop: 6 },
  textSmall: {
    color: "#ddd",
    textAlign: "center",
    marginTop: 6,
    fontSize: 12,
  },
  button: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#f97316",
    alignSelf: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
