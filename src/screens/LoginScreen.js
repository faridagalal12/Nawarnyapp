import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Button } from "galio-framework";

export default function LoginScreen({ signIn }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    Keyboard.dismiss(); // dismiss keyboard on login
    setLoading(true);
    await axios
      .post("https://nawarny-be.onrender.com/api/v1/auth/login", {
        email,
        password,
      })
      .then(async response => {
        setLoading(false);
        if (response.data.access_token) {
          await signIn(response.data.access_token, email);
        } else {
          alert("Login failed: " + response.data.message);
        }
      })
      .catch(error => {
        setLoading(false);
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again.");
      });
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  const goToForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />
          <Image source={require("../assets/logo.png")} style={styles.logo} />

          {/* Title */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to Nawarny</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#555" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss} // dismiss keyboard on done
              blurOnSubmit={true}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#555" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss} // dismiss keyboard on done
              blurOnSubmit={true}
            />
          </View>
          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={goToForgotPassword}
            style={styles.forgotContainer}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            style={styles.loginButton}
            onPress={handleLogin}
            textStyle={styles.loginText}
            loading={loading}
          >
            Login
          </Button>
          {/* <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity> */}
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center", // keeps layout centered
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 25,
    zIndex: 10,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 32,
    marginRight: 20,
  },
  forgotText: {
    color: "#3B82F6",
    fontSize: 15,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    width: "90%",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#000000",
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    width: "90%",
    // padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
