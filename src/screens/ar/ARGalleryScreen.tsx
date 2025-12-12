// src/screens/ar/ARGalleryScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import BottomTab, { TabKey } from "../../components/BottomTab";

const CAPTURE_STORAGE_KEY = "@pokeexplorer_captures";

type CaptureItem = {
  uri: string;
  pokemonName: string;
  createdAt: number;
};

type Props = NativeStackScreenProps<any>;

const ARGalleryScreen: React.FC<Props> = ({ navigation }) => {
  const [captures, setCaptures] = useState<CaptureItem[]>([]);

  useEffect(() => {
    const loadCaptures = async () => {
      try {
        const stored = await AsyncStorage.getItem(CAPTURE_STORAGE_KEY);
        if (stored) {
          const parsed: CaptureItem[] = JSON.parse(stored);
          setCaptures(parsed);
        }
      } catch (err) {
        console.log("Error loading captures:", err);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadCaptures);
    loadCaptures();

    return unsubscribe;
  }, [navigation]);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: CaptureItem }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate("ARPhotoDetail", {
          capture: item,
        })
      }
    >
      <View style={styles.card}>
        <Image source={{ uri: item.uri }} style={styles.cardImage} />
        <View style={styles.cardFooter}>
          <Text style={styles.cardTitle}>
            {item.pokemonName || "Unknown Pokémon"}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>My Captures</Text>

        {captures.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              You have no captures yet. Go to AR and catch your first Pokémon!
            </Text>
          </View>
        ) : (
          <FlatList
            data={captures}
            keyExtractor={(_, index) => String(index)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Global BottomTab – Gallery active */}
      <View style={styles.tabWrapper}>
        <BottomTab
          activeTab="hunt"
          onTabPress={(tab: TabKey) => {
            // navigation is handled inside BottomTab in this project
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default ARGalleryScreen;

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
  header: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#13151C",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 220,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cardDate: {
    color: "#B0B3C0",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#B0B3C0",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  tabWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
