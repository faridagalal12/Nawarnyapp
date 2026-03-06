import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../App";

const BASE_URL = "https://nawarny-be.onrender.com/api/v1";

export default function VerifyScreen({ route }) {
  // email may be passed from LoginScreen or SignUpScreen
  const email = route?.params?.email || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef([]);
  const { signIn } = useContext(AuthContext);

  const handleChange = (text, index) => {
    if (text.length > 1) return;
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setError("");
    if (text && index < 5) inputs.current[index + 1]?.focus();
    if (text && index === 5) Keyboard.dismiss();
  };

  const handleBackspace = (key, index) => {
    if (key === "Backspace" && code[index] === "" && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const otp = code.join("");
    if (otp.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${BASE_URL}/auth/verify`, {
        email,
        code: otp,
      });

      const token = response?.data?.token || response?.data?.data?.token;
      // signIn saves the token and flips the nav stack to authenticated screens
      await signIn(token || "verified-token");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid or expired code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/auth/resend-verification`, { email });
      Alert.alert("Code Resent", "A new verification code has been sent to your email.");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch {
      setError("Could not resend code. Please try again.");
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
          Enter the 6-digit code sent to{"\n"}
          {email ? <Text style={styles.emailText}>{email}</Text> : "your email"}
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(r) => (inputs.current[index] = r)}
              style={[
                styles.otpBox,
                digit !== "" && styles.otpBoxFilled,
                error && styles.otpBoxError,
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={true}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={resending}
          style={styles.resendContainer}
        >
          <Text style={styles.resendText}>
            {resending ? "Resending..." : "Didn't receive it? "}
            {!resending && <Text style={styles.resendLink}>Resend Code</Text>}
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
    lineHeight: 24,
    marginBottom: 40,
  },
  emailText: {
    fontWeight: "600",
    color: "#3B82F6",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    backgroundColor: "#F5F5F5",
    color: "#1E1E1E",
  },
  otpBoxFilled: {
    backgroundColor: "#eff6ff",
    borderColor: "#3B82F6",
    color: "#3B82F6",
  },
  otpBoxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
  },
  verifyButton: {
    width: "100%",
    height: 55,
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  resendContainer: {
    marginTop: 4,
  },
  resendText: {
    fontSize: 15,
    color: "#777",
  },
  resendLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});