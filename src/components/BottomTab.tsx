import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import {
  HomeIcon,
  UserIcon,
  ArrowsRightLeftIcon,
  MapIcon,
  BookOpenIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';

export type TabKey = 'home' | 'randomize' | 'hunt' | 'menu' | 'profile';

type Props = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  accentColor?: string;
};

const BottomTab = ({
  activeTab,
  onTabPress,
  accentColor = '#FF5252',
}: Props) => {
  const navigation = useNavigation<any>();

  const getColor = (tab: TabKey) => (activeTab === tab ? accentColor : '#000');

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Home')}
      >
        <HomeIcon size={24} strokeWidth={2} color={getColor('home')} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Hunt')}
      >
        <MapIcon size={24} strokeWidth={2} color={getColor('hunt')} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Randomize')}
      >
        <ArrowsRightLeftIcon
          size={24}
          strokeWidth={2}
          color={getColor('randomize')}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Menu')}
      >
        <BookOpenIcon size={24} strokeWidth={2} color={getColor('menu')} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('Profile')}
      >
        <UserIcon size={24} strokeWidth={2} color={getColor('profile')} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
    backgroundColor: '#FDFDFD',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomTab;
