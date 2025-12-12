import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import BottomTab, { TabKey } from "../../components/BottomTab";

const ProfileScreen = ({ navigation }: NativeStackScreenProps<any>) => {
  const user = auth().currentUser;
  const [activeTab, setActiveTab] = React.useState<TabKey>("profile");

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: "Signin" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>
          {user?.displayName || "Trainer"}
        </Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>
          {user?.email || "No email"}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Bottom Tab */}
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

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 100,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
  },
  card: {
    width: "85%",
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#222",
  },
  label: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 10,
  },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 999,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomTabWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
