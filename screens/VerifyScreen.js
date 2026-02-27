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
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // for back icon
import { useNavigation } from "@react-navigation/native";

export default function VerifyScreen() {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const navigation = useNavigation(); // navigation for back button

  const handleChange = (text, index) => {
    if (text.length > 1) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next box automatically
    if (text !== "" && index < 3) {
      inputs.current[index + 1].focus();
    }

    // Dismiss keyboard when all boxes are filled
    if (text !== "" && index === 3) {
      Keyboard.dismiss();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // Dismiss keyboard when pressing "Done"
  const handleSubmitEditing = () => {
    Keyboard.dismiss();
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

        {/* OTP BOXES */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[
                styles.otpBox,
                digit !== "" && styles.otpBoxFilled,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              returnKeyType="done"
              onSubmitEditing={handleSubmitEditing} // dismiss keyboard on Done
              blurOnSubmit={true}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleBackspace(nativeEvent.key, index)
              }
            />
          ))}
        </View>

        <TouchableOpacity style={styles.verifyButton}>
          <Text style={styles.verifyText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Keyboard.dismiss()}>
          <Text style={styles.resend}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // keeps app theme (white)
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
    backgroundColor: "#4F6FA5", // same blue theme as your app
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
    color: "#4F6FA5", // match app theme blue
  },
  resend: {
    fontSize: 16,
    color: "#4F6FA5",
    fontWeight: "500",
  },
});