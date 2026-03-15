// screens/ForgotPasswordScreen.js
import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";

const BASE_URL = "https://nawarny-be.onrender.com/api/v1/auth";

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = new password

  // Step 1
  const [email, setEmail] = useState("");

  // Step 2 - OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);

  // Step 3 - New password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Handlers ──

  const handleSendResetRequest = async () => {
    setError("");
    setMessage("");
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to send OTP. Try again.");
        return;
      }

      setMessage("If the email exists, OTP has been sent.");
      Alert.alert("OTP Sent", "Check your email.");
      setStep(2);
    } catch (err) {
      setError("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Invalid or expired OTP.");
        return;
      }

      setError("");
      setStep(3);
    } catch (err) {
      setError("Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || password.length < 8) {
      setError(
        "Password must be at least 8 characters & contain uppercase, lowercase, number, and special character",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otp.join(""),
          newPassword: password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to reset password. Try again.");
        return;
      }

      Alert.alert(
        "Password Reset Successful",
        "You can now sign in with your new password.",
        [{ text: "Go to Login", onPress: () => navigation.navigate("Login") }],
      );
    } catch (err) {
      setError("Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ──
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = text => {
    if (/^\d{6}$/.test(text)) {
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Render logic per step ──
  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a reset OTP
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {message ? <Text style={styles.successText}>{message}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendResetRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {email}
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (otpRefs.current[index] = ref)}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={v => handleOtpChange(v, index)}
                onKeyPress={e => handleOtpKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                autoCapitalize="none"
                textAlign="center"
                onPaste={e => handleOtpPaste(e.nativeEvent.text)}
              />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendLink}
            onPress={handleSendResetRequest}
          >
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>Choose a strong password</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 6 characters"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Re-type password"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>
        </>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.inner}>
        {renderStep()}

        {step > 1 && (
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => {
              setError("");
              setStep(step - 1);
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 30 },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 40,
  },

  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "white",
  },

  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    fontSize: 24,
    textAlign: "center",
    backgroundColor: "white",
  },
  otpInputFilled: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },

  button: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  errorText: {
    color: "#ef4444",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
  },
  successText: {
    color: "#15803d",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "#dcfce7",
    padding: 10,
    borderRadius: 8,
  },

  resendLink: { alignItems: "center", marginTop: 20 },
  resendText: { color: "#3b82f6", fontWeight: "500" },

  backLink: { marginTop: 40, alignItems: "center" },
  backText: { color: "#64748b", fontSize: 16 },
});
