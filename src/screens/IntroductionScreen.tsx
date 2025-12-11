import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import auth from '@react-native-firebase/auth';

const IntroductionScreen = ({ navigation }: NativeStackScreenProps<any>) => {

  const redirect = () => {
    const user = auth().currentUser;

    if (user) {
      navigation.replace("Home");
    } else {
      navigation.navigate("Signin")
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={redirect}>
        <Image
          source={require('../assets/images/pokeball_logo.png')}
          style={{ width: 150, height: 150 }}
        />
      </TouchableOpacity>

      <Text style={styles.title}>PokeExplorer</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 30,
  },
});

export default IntroductionScreen;
