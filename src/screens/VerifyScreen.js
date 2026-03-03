// screens/VerifyScreen.js
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function VerifyScreen() {
  const navigation = useNavigation(); // ← now imported and used

  const [code, setCode] = useState(["", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (text.length > 1) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next box
    if (text !== "" && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-dismiss keyboard when full
    if (text !== "" && index === 3) {
      Keyboard.dismiss();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otp = code.join("");
    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      Alert.alert("Invalid Code", "Please enter a 4-digit code");
      return;
    }

    // TODO: Replace with real API call
    // e.g. await api.post('/api/auth/verify', { code: otp });
    
    // For now: simulate success
    Alert.alert("Success", "Account verified!", [
      {
        text: "Continue",
        onPress: () => navigation.replace("Quiz"), // or your main screen
      },
    ]);
  };

  const handleResend = () => {
    Alert.alert("Code Resent", "A new code has been sent to your email.");
    // TODO: Call resend API
    setCode(["", "", "", ""]);
    inputs.current[0]?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Login")}
      >
        <Ionicons name="chevron-back" size={26} color="#1E1E1E" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verify Account</Text>
        <Text style={styles.subtitle}>
          Enter the verification code sent to your email
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[styles.otpBox, digit !== "" && styles.otpBoxFilled]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              returnKeyType="done"
              onSubmitEditing={handleVerify} // verify on "Done"
              blurOnSubmit={false}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
              autoFocus={index === 0} // auto-focus first box
            />
          ))}
        </View>

        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resend}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 25,
    zIndex: 10,
  },
  content: {
    width: "85%",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E1E1E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  otpBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "#F5F5F5",
    color: "#1E1E1E",
  },
  otpBoxFilled: {
    backgroundColor: "#4F6FA5",
    color: "#FFFFFF",
    borderColor: "#4F6FA5",
  },
  verifyButton: {
    width: "100%",
    height: 55,
    backgroundColor: "#EDEDED",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  verifyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4F6FA5",
  },
  resend: {
    fontSize: 16,
    color: "#4F6FA5",
    fontWeight: "500",
  },
});