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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    Keyboard.dismiss(); // dismiss keyboard on login
    console.log("Email:", email);
    console.log("Password:", password);
    navigation.navigate("Verify");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" />

          {/* Back Button */}
               <TouchableOpacity
                 style={styles.backButton}
                 onPress={() => navigation.navigate("Welcome")}
               >

            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>

          {/* Logo */}
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
          />

          {/* Title */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to Nawarny</Text>

          {/* Email Input */}
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

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
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
    padding: 15,
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