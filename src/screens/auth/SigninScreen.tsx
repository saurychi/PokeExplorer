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

const SigninScreen: React.FC<Props> = ({ navigation }) => {
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await auth().signInWithEmailAndPassword(email.trim(), password);
      navigation.navigate("Home");
    } catch (error: any) {
      console.log("Sign in error:", error);
      Alert.alert("Sign in failed", error.message || "Please try again.");
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
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>sign in to access your account</Text>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#B5B5B5"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#B5B5B5"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>

            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.checkbox}
                activeOpacity={0.7}
                onPress={() => setRemember(!remember)}
              >
                {remember && <View style={styles.checkboxTick} />}
              </TouchableOpacity>
              <Text style={styles.rememberText}>Remember me</Text>

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forget password ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.nextBtn}
              activeOpacity={0.8}
              onPress={handleSignin}
              disabled={loading}
            >
              <Text style={styles.nextBtnText}>
                {loading ? "Signing in..." : "Next"}
              </Text>
            </TouchableOpacity>

            {/* Register row */}
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>New Member? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup")}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.bottomLink}>Register now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SigninScreen;

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
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
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
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 28,
  },

  inputContainer: {
    gap: 16,
    marginBottom: 25,
  },

  input: {
    backgroundColor: "#F3F3F3",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 10,
    fontSize: 14,
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: "#555",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxTick: {
    width: 10,
    height: 10,
    backgroundColor: "#E53935",
    borderRadius: 2,
  },

  rememberText: {
    fontSize: 13,
    color: "#444",
  },
  forgotBtn: {
    marginLeft: "auto",
  },
  forgotText: {
    fontSize: 13,
    color: "#E53935",
  },

  nextBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 15,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  bottomText: {
    fontSize: 14,
    color: "#444",
  },
  bottomLink: {
    fontSize: 14,
    color: "#E53935",
    fontWeight: "600",
  },
});
