import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";
import {
  PENDING_VERIFY_EMAIL_KEY,
  USER_EMAIL_KEY,
} from "../constants/authKeys";

export default function SignUpScreen({ setPendingVerificationEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    Keyboard.dismiss();

    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      await api.post("/auth/signup", {
        name,
        email: normalizedEmail,
        password,
      });
      await SecureStore.setItemAsync(USER_EMAIL_KEY, normalizedEmail);
      if (setPendingVerificationEmail) {
        await setPendingVerificationEmail(normalizedEmail);
      } else {
        await SecureStore.setItemAsync(
          PENDING_VERIFY_EMAIL_KEY,
          normalizedEmail,
        );
      }
      Alert.alert(
        "Success",
        "Account created successfully! Please verify your email.",
      );
      navigation.navigate("Verify", { email: normalizedEmail });
    } catch (error) {
      Alert.alert(
        "Sign Up Failed",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to sign up. Please try again.",
      );
    }

    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <View style={styles.content}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Create Account</Text>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
              {/* EMAIL */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* PASSWORD */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {/* CONFIRM PASSWORD */}
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>

              {/* SIGN UP BUTTON */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>

              {/* LOGIN LINK */}
              <View style={styles.footer}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    height: 55,
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  passwordContainer: {
    width: "100%",
    height: 55,
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  signUpButton: {
    width: "100%",
    backgroundColor: "#3B82F6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
  },
  loginLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
