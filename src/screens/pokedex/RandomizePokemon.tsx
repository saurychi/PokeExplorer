import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import BottomTab, { TabKey } from '../../components/BottomTab';
import { getRandomPokemon, FetchedPokemon } from '../../utils/pokemonUtils';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RandomizePokemon = () => {
  const [pokemon, setPokemon] = useState<FetchedPokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captureMessage, setCaptureMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('randomize');

  const handleRandomize = async () => {
    try {
      setLoading(true);
      setError(null);
      setCaptureMessage(null);
      setPokemon(null);

      const result = await getRandomPokemon();
      setPokemon(result);
    } catch (e: any) {
      setError('Failed to reach PokéAPI. Check your network.');
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = async () => {
    if (!pokemon) return;

    try {
      setCapturing(true);
      setError(null);
      setCaptureMessage(null);

      const user = auth().currentUser;
      if (!user) {
        setError('You must be signed in to capture a Pokémon.');
        return;
      }

      const userRef = firestore().collection('users').doc(user.uid);

      // 1) Get existing user data to manage recent_caught
      const snap = await userRef.get();
      const data = snap.data() || {};
      const existingRecent = Array.isArray(data.recent_caught)
        ? (data.recent_caught as string[])
        : [];

      const updatedRecent = [
        pokemon.name,
        ...existingRecent.filter(name => name !== pokemon.name),
      ].slice(0, 3);

      await userRef.set(
        {
          pokemon_captured: firestore.FieldValue.increment(1),
          recent_caught: updatedRecent,
        },
        { merge: true },
      );

      const docRef = firestore().collection('pokemons').doc();

      await docRef.set({
        primary_key: docRef.id,
        pokemon_id: pokemon.id,
        user_id: user.uid,
        captured_datetime: firestore.FieldValue.serverTimestamp(),
        name: pokemon.name,
        types: pokemon.types,
        image: pokemon.image,
      });

      setCaptureMessage(`You captured ${pokemon.name.toUpperCase()}!`);
    } catch (e: any) {
      console.log('Capture error:', e);
      setError('Failed to capture Pokémon. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Random Pokémon</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRandomize}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Randomize'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#FF5252"
          style={{ marginTop: 20 }}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
      {captureMessage && !error && (
        <Text style={styles.successText}>{captureMessage}</Text>
      )}

      {pokemon && !loading && (
        <View style={styles.pokemonBox}>
          {pokemon.image && (
            <Image
              source={{ uri: pokemon.image }}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
          )}

          <Text style={styles.pokemonName}>
            #{pokemon.id} {pokemon.name.toUpperCase()}
          </Text>
          <Text style={styles.types}>Type: {pokemon.types.join(', ')}</Text>

          <TouchableOpacity
            style={[styles.captureButton, capturing && { opacity: 0.7 }]}
            onPress={handleCapture}
            disabled={capturing}
          >
            <Text style={styles.captureButtonText}>
              {capturing ? 'Capturing...' : 'Capture'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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

export default RandomizePokemon;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 100,
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  errorText: {
    color: '#ff7b7b',
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  successText: {
    color: '#7CFC7C',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  pokemonBox: {
    marginTop: 30,
    alignItems: 'center',
  },
  pokemonImage: {
    width: 210,
    height: 210,
  },
  pokemonName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  types: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 6,
  },
  captureButton: {
    marginTop: 18,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomTabWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
