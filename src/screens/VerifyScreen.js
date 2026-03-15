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
import { verifyOtp, resendOtp } from "../services/authservice";
import { PENDING_VERIFY_EMAIL_KEY } from "../constants/authKeys";

export default function VerifyScreen({ signIn, pendingEmail, onVerified }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState(pendingEmail || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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
        PENDING_VERIFY_EMAIL_KEY
      );
      if (storedEmail && isMounted) {
        setEmail(storedEmail);
      }
    };
    hydrateEmail();
    return () => { isMounted = false; };
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

    // ✅ Fix: move to next box for 6 digits (was index < 3, now index < 5)
    if (text !== "" && index < 5) {
      inputs.current[index + 1].focus();
    }

    // ✅ Fix: dismiss keyboard when all 6 boxes filled
    if (text !== "" && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleBackspace = (key, index) => {
    if (key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otp = code.join("");

    if (!email) {
      Alert.alert("Missing email", "Please sign up again.");
      return;
    }

    // ✅ Fix: check for 6 digits (was 4)
    if (otp.length < 6) {
      Alert.alert("Invalid code", "Please enter all 6 digits.");
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
        if (signIn) await signIn(token, email);
        if (onVerified) await onVerified({ hasToken: true, email });
        return;
      }

      if (onVerified) await onVerified({ hasToken: false, email });

      Alert.alert("Verification complete", "Please sign in to continue.");
      navigation.reset({
        index: 1,
        routes: [{ name: "Welcome" }, { name: "Login" }],
      });

    } catch (error) {
      Alert.alert(
        "Verification failed",
        error?.response?.data?.message || error?.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix: actually call resend API
  const handleResend = async () => {
    if (!email) {
      Alert.alert("Error", "No email found. Please sign up again.");
      return;
    }
    setResending(true);
    try {
      await resendOtp(email);
      Alert.alert("Success", "A new code has been sent to your email!");
      setCode(["", "", "", "", "", ""]); // clear old code
      inputs.current[0].focus();        // focus first box
    } catch (error) {
      Alert.alert(
        "Failed to resend",
        error?.response?.data?.message || error?.message || "Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
              style={[styles.otpBox, digit !== "" && styles.otpBoxFilled]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              blurOnSubmit={true}
              onChangeText={(text) => handleChange(text, index)}
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

        {/* ✅ Fix: actually calls resend API */}
        <TouchableOpacity onPress={handleResend} disabled={resending}>
          <Text style={styles.resend}>
            {resending ? "Sending..." : "Resend Code"}
          </Text>
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
    width: "100%",
    marginBottom: 40,
  },
  otpBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlign: "center",
    fontSize: 22,
    backgroundColor: "#F5F5F5",
    color: "#1E1E1E",
    marginHorizontal: 5,
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