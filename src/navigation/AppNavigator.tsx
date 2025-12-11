import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroductionScreen from '../screens/IntroductionScreen';
import HomeScreen from '../screens/HomeScreen';
import SigninScreen from '../screens/auth/SigninScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import StarterScreen from '../screens/start/StarterScreen';
import GenderScreen from '../screens/start/GenderScreen';
import RandomizePokemon from '../screens/pokedex/RandomizePokemon';
import HuntScreen from '../screens/map/HuntScreen';
import CapturePokemon from '../screens/map/CapturePokemon';
import Menu from '../screens/pokedex/menu';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Introduction"
          component={IntroductionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signin"
          component={SigninScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Starter"
          component={StarterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Gender"
          component={GenderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Randomize"
          component={RandomizePokemon}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Hunt"
          component={HuntScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CapturePokemon"
          component={CapturePokemon}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
