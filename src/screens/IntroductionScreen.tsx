import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react'

const IntroductionScreen = ({ navigation }: NativeStackScreenProps<any>) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Signin")}>
        <Image
          source={require('../assets/images/pokeball_logo.png')}
          style={{ width: 150, height: 150 }}
        />
      </TouchableOpacity>
      <Text style={styles.title}>PokeExplorer</Text>
    </View>
  )
}

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

export default IntroductionScreen
