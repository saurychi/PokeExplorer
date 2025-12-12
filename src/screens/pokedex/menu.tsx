// src/screens/menu/menu.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { WebView } from "react-native-webview";
import Ionicons from "react-native-vector-icons/Ionicons";

import BottomTab, { TabKey } from "../../components/BottomTab";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

type SortMode = "number" | "name";

type PokedexEntry = {
  id: number; // Pokédex number (pokemon_id)
  name: string;
  image?: string | null; // captured photo, not shown in UI anymore
};

const PokedexMenu: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("number");
  const [activeTab, setActiveTab] = useState<TabKey>("menu");

  const [captured, setCaptured] = useState<PokedexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // mic / WebView state
  const [listening, setListening] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const webviewRef = useRef<WebView | null>(null);

  useEffect(() => {
    const user = auth().currentUser;

    if (!user) {
      setError("You must be signed in to view your Pokédex.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = firestore()
      .collection("pokemons")
      .where("user_id", "==", user.uid)
      .onSnapshot(
        (snapshot) => {
          const map = new Map<number, PokedexEntry>();

          snapshot.docs.forEach((doc) => {
            const data = doc.data() as any;

            const pokemonId: number =
              typeof data.pokemon_id === "number"
                ? data.pokemon_id
                : Number(data.pokemon_id) || 0;

            if (!pokemonId) return;

            // ensure each id appears only once
            if (!map.has(pokemonId)) {
              map.set(pokemonId, {
                id: pokemonId,
                name: (data.name || `Pokemon #${pokemonId}`).toLowerCase(),
                image: data.image || null,
              });
            }
          });

          setCaptured(Array.from(map.values()));
          setLoading(false);
        },
        (err) => {
          console.log("Pokedex fetch error:", err);
          setError("Failed to load your Pokédex.");
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = captured.filter((p) => p.name.toLowerCase().includes(q));

    list = list.sort((a, b) => {
      if (sortMode === "number") {
        return a.id - b.id;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return list;
  }, [captured, search, sortMode]);

  const renderCard = (p: PokedexEntry) => {
    const numberLabel = `#${p.id.toString().padStart(3, "0")}`;

    // Show official Pokémon artwork instead of captured photo
    const spriteUrl = p.id
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`
      : null;

    return (
      <View key={p.id} style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardNumber}>{numberLabel}</Text>
        </View>
        <View style={styles.cardImageWrapper}>
          {spriteUrl ? (
            <Image source={{ uri: spriteUrl }} style={styles.cardImage} />
          ) : (
            <Text style={{ fontSize: 10, color: "#999" }}>No image</Text>
          )}
        </View>
        <Text style={styles.cardName}>{p.name}</Text>
      </View>
    );
  };

  const handleMicPress = () => {
    if (!speechReady) {
      console.log("Speech WebView not ready yet");
      return;
    }
    setListening(true);
    webviewRef.current?.injectJavaScript(
      "window.startRecognition && window.startRecognition(); true;"
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headingText}>What are you looking for?</Text>

        <View style={styles.searchBox}>
          <MagnifyingGlassIcon size={20} color="#999" />

          <TextInput
            style={styles.searchInput}
            placeholder="Enter name or category"
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />

          {/* MIC BUTTON (voice search) */}
          <TouchableOpacity onPress={handleMicPress} style={styles.micButton}>
            <Ionicons
              name={listening ? "mic" : "mic-outline"}
              size={20}
              color={listening ? "#FF5252" : "#999"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>

          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortMode === "number" && styles.sortOptionActive,
              ]}
              onPress={() => setSortMode("number")}
            >
              <View
                style={[
                  styles.sortRadio,
                  sortMode === "number" && styles.sortRadioActive,
                ]}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortMode === "number" && styles.sortOptionTextActive,
                ]}
              >
                Number
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortOption,
                sortMode === "name" && styles.sortOptionActive,
              ]}
              onPress={() => setSortMode("name")}
            >
              <View
                style={[
                  styles.sortRadio,
                  sortMode === "name" && styles.sortRadioActive,
                ]}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortMode === "name" && styles.sortOptionTextActive,
                ]}
              >
                Name
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.listArea}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <ActivityIndicator
            size="large"
            color="#FF5252"
            style={{ marginTop: 30 }}
          />
        )}

        {!loading && error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {!loading && !error && filteredAndSorted.length === 0 && (
          <Text style={styles.emptyText}>
            You have not captured any Pokémon yet.
          </Text>
        )}

        {!loading && !error && filteredAndSorted.length > 0 && (
          <View style={styles.grid}>
            {filteredAndSorted.map((p) => renderCard(p))}
          </View>
        )}
      </ScrollView>

      {/* Hidden WebView for browser speech recognition */}
      <WebView
        ref={webviewRef}
        source={require("../../assets/speech.html")}
        onMessage={(event) => {
          const msg = event.nativeEvent.data;

          if (msg === "__ready") {
            setSpeechReady(true);
            return;
          }

          if (msg.startsWith("__error")) {
            console.log("Speech error:", msg);
            setListening(false);
            return;
          }

          const spoken = msg.toLowerCase().trim();
          setListening(false);
          setSearch(spoken);
        }}
        style={{ width: 1, height: 1, opacity: 0 }}
      />

      <View style={styles.bottomTabWrapper}>
        <BottomTab
          activeTab={activeTab}
          onTabPress={setActiveTab}
          accentColor="#FF5252"
        />
      </View>
    </View>
  );
};

export default PokedexMenu;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headingText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#222",
  },
  micButton: {
    marginLeft: 8,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    justifyContent: "space-between",
  },
  sortLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  sortOptions: {
    flexDirection: "row",
    gap: 12,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sortOptionActive: {},
  sortRadio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#fff",
    marginRight: 6,
  },
  sortRadioActive: {
    backgroundColor: "#FF5252",
    borderColor: "#FF5252",
  },
  sortOptionText: {
    color: "#ddd",
    fontSize: 13,
  },
  sortOptionTextActive: {
    color: "#FF5252",
    fontWeight: "600",
  },

  listArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90, // a bit less so it doesn't feel like a huge empty block
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardTopRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
  },
  cardImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardImage: {
    width: 60,
    height: 60,
  },
  cardName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  errorText: {
    textAlign: "center",
    marginTop: 24,
    color: "#ff7b7b",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#777",
    fontSize: 14,
  },
  bottomTabWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
