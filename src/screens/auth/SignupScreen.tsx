import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any>;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (!agree) {
      Alert.alert(
        "Terms not accepted",
        "You must agree to the Terms and Conditions."
      );
      return;
    }

    try {
      setLoading(true);
      const userCred = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      await userCred.user.updateProfile({ displayName: name });

      navigation.navigate("Signin");
    } catch (error: any) {
      console.log("Sign up error:", error);
      Alert.alert("Sign up failed", error.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/images/pokeball_logo.png")}
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>PokeExplorer</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Get Started</Text>
            <Text style={styles.subtitle}>by creating a free account.</Text>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Full name"
                placeholderTextColor="#B5B5B5"
                style={styles.input}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                placeholder="Valid email"
                placeholderTextColor="#B5B5B5"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                placeholder="Input Password"
                placeholderTextColor="#B5B5B5"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                placeholder="Input Password again"
                placeholderTextColor="#B5B5B5"
                secureTextEntry
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                onPress={() => setAgree(!agree)}
                style={styles.checkbox}
                activeOpacity={0.7}
              >
                {agree && <View style={styles.checkboxTick} />}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>
                By checking the box you agree to our{" "}
                <Text style={styles.link}>Terms</Text> and{" "}
                <Text style={styles.link}>Conditions</Text>.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              activeOpacity={0.8}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.nextBtnText}>
                {loading ? "Signing up..." : "Signup"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already a member? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signin")}
                activeOpacity={0.8}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  form: {
    flex: 1,
    justifyContent: "center",
    gap: 28,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },

  inputContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: "#F3F3F3",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 10,
    fontSize: 15,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: "#555",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxTick: {
    width: 12,
    height: 12,
    backgroundColor: "#E53935",
    borderRadius: 3,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
  },
  link: {
    color: "#E53935",
    fontWeight: "600",
  },

  nextBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 8,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  loginText: {
    fontSize: 15,
    color: "#444",
  },
  loginLink: {
    fontSize: 15,
    color: "#E53935",
    fontWeight: "600",
  },
});
