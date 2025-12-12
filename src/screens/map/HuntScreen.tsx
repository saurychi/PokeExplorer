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
import MapView, { Marker, Region, UserLocationChangeEvent } from "react-native-maps";

import BottomTab from "../../components/BottomTab";
import type { TabKey } from "../../components/BottomTab";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getRandomPokemon } from "../../utils/pokemonUtils";

type PokemonSpawn = {
  id: number;          // pokemon id (from PokéAPI)
  name: string;        // pokemon name (from PokéAPI)
  latitude: number;    // fixed
  longitude: number;   // fixed
  image?: string | null; // optional, if your Capture screen wants it
  types?: string[];      // optional
};

type SimpleCoord = {
  latitude: number;
  longitude: number;
};

type SpawnPoint = {
  latitude: number;
  longitude: number;
};

const FIXED_SPAWN_POINTS: SpawnPoint[] = [
  { latitude: 10.35169070676011, longitude: 123.9135216047996 },
  { latitude: 10.351712474809442, longitude: 123.91347600725064 },
];

const DEFAULT_REGION: Region = {
  latitude: 10.3517,
  longitude: 123.9135,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function distanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const HuntScreen = ({ navigation }: NativeStackScreenProps<any>) => {
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const [userLocation, setUserLocation] = useState<SimpleCoord | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [spawns, setSpawns] = useState<PokemonSpawn[]>([]);

  const hasCenteredOnce = useRef(false);
  const mapRef = useRef<MapView | null>(null);

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
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasLocationPermission(true);
      }
    } catch (err) {
      console.warn("Permission error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const handleUserLocationChange = (event: UserLocationChangeEvent) => {
    const coord = event.nativeEvent.coordinate;
    if (!coord) return;

    const current = { latitude: coord.latitude, longitude: coord.longitude };
    setUserLocation(current);

    if (!hasCenteredOnce.current) {
      hasCenteredOnce.current = true;
      mapRef.current?.animateToRegion(
        {
          latitude: current.latitude,
          longitude: current.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    }
  };

  const handleCenterOnUser = () => {
    if (!userLocation) {
      Alert.alert("No location yet", "We don't have your current location yet.");
      return;
    }

    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      600
    );
  };

  // ✅ Scan: randomize pokemon per fixed point, but keep lat/lng the same
  const handleScanForPokemon = async () => {
    if (scanning) return;

    if (!userLocation) {
      Alert.alert("Location not ready", "Move around or wait a moment.");
      return;
    }

    try {
      setScanning(true);

      // Fetch a random Pokémon for each fixed spawn point
      const results = await Promise.all(
        FIXED_SPAWN_POINTS.map(async (point) => {
          const p = await getRandomPokemon();
          return {
            id: p.id,
            name: p.name,
            image: p.image,
            types: p.types,
            latitude: point.latitude,
            longitude: point.longitude,
          } as PokemonSpawn;
        })
      );

      setSpawns(results);

      const { latitude: baseLat, longitude: baseLon } = userLocation;

      const nearby = results.filter((pkm) => {
        const dist = distanceInMeters(baseLat, baseLon, pkm.latitude, pkm.longitude);
        return dist < 200;
      });

      if (nearby.length > 0) {
        const target = nearby[0];

        navigation.navigate("CapturePokemon", {
          pokemon: target, // includes id/name/image/types + fixed lat/lng
        });
      } else {
        Alert.alert("No Pokémon nearby", "Walk towards a spawn point and try again.");
      }
    } catch (e: any) {
      console.log("Scan error:", e);
      Alert.alert("Scan failed", "Could not randomize Pokémon. Please try again.");
    } finally {
      setScanning(false);
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
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={hasLocationPermission}
        onUserLocationChange={handleUserLocationChange}
      >
        {spawns.map((pkm, idx) => (
          <Marker
            key={`${pkm.id}-${idx}`}
            coordinate={{ latitude: pkm.latitude, longitude: pkm.longitude }}
            title={pkm.name}
            description={`#${pkm.id}`}
          />
        ))}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.title}>Hunt Mode</Text>
        <Text style={styles.text}>
          Scan randomizes the Pokémon, but keeps spawn locations fixed.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleCenterOnUser}>
          <Text style={styles.buttonText}>Center on Me</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 6 }, scanning && { opacity: 0.7 }]}
          onPress={handleScanForPokemon}
          disabled={scanning}
        >
          <Text style={styles.buttonText}>
            {scanning ? "Scanning..." : "Scan for Pokémon"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.textSmall}>
          Fixed Spawn Points: {FIXED_SPAWN_POINTS.length} | Spawned: {spawns.length}
        </Text>
      </View>

      <View style={styles.tabWrapper}>
        <BottomTab activeTab="hunt" onTabPress={(tab: TabKey) => {}} />
      </View>
    </View>
  );
};

export default HuntScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FDFDFD",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: "absolute",
    bottom: 100,
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
  },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  text: { color: "white", textAlign: "center", marginTop: 6 },
  textSmall: { color: "#ddd", textAlign: "center", marginTop: 6, fontSize: 12 },
  button: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#f97316",
    alignSelf: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
  tabWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
