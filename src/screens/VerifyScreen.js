import React, { useEffect, useRef, useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { verifyOtp } from "../services/authservice";
import { PENDING_VERIFY_EMAIL_KEY } from "../constants/authKeys";

export default function VerifyScreen({ signIn, pendingEmail, onVerified }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(pendingEmail || "");
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    let isMounted = true;
    const hydrateEmail = async () => {
      if (email) return;
      const routeEmail = route?.params?.email;
      if (routeEmail) {
        setEmail(routeEmail);
        return;
      }
      const storedEmail = await SecureStore.getItemAsync(
        PENDING_VERIFY_EMAIL_KEY,
      );
      if (storedEmail && isMounted) {
        setEmail(storedEmail);
      }
    };
    hydrateEmail();
    return () => {
      isMounted = false;
    };
  }, [email, route?.params?.email]);

  useEffect(() => {
    if (!email && pendingEmail) {
      setEmail(pendingEmail);
    }
  }, [email, pendingEmail]);

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

  const handleVerify = async () => {
    const otp = code.join("");
    if (!email) {
      Alert.alert("Missing email", "Please sign up again.");
      return;
    }
    if (otp.length < 4) {
      Alert.alert("Invalid code", "Please enter the full verification code.");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOtp(email, otp);
      const token =
        data?.access_token ||
        data?.token ||
        data?.data?.access_token ||
        data?.data?.token;
      if (token) {
        if (signIn) {
          await signIn(token, email);
        }
        if (onVerified) {
          await onVerified({ hasToken: true, email });
        }
        return;
      }

      if (onVerified) {
        await onVerified({ hasToken: false, email });
      }
      Alert.alert("Verification complete", "Please sign in again to continue.");
      navigation.reset({
        index: 1,
        routes: [{ name: "Welcome" }, { name: "Login" }],
      });
    } catch (error) {
      Alert.alert(
        "Verification failed",
        error?.response?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back Button */}

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
              ref={ref => (inputs.current[index] = ref)}
              style={[styles.otpBox, digit !== "" && styles.otpBoxFilled]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              returnKeyType="done"
              onSubmitEditing={handleSubmitEditing} // dismiss keyboard on Done
              blurOnSubmit={true}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleBackspace(nativeEvent.key, index)
              }
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          disabled={loading}
        >
          <Text style={styles.verifyText}>
            {loading ? "Verifying..." : "Verify"}
          </Text>
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
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    marginBottom: 40,
  },
  otpBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "#F5F5F5",
    color: "#1E1E1E",
    marginHorizontal: 6,
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

  // ── Next button at bottom ──
  bottomButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  nextButton: {
    width: "100%",
    maxWidth: 340,
    height: 56,
    backgroundColor: "#3B82F6",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
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
