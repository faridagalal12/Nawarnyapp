import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const BASE_URL = "https://nawarny-be.onrender.com/api/v1";

// ─── Step 1: Enter Email ─────────────────────────────────────────────────────
function StepEmail({ onNext }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!email.trim()) { setError("Please enter your email address"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address"); return; }

    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: email.trim().toLowerCase(),
      });
      onNext(email.trim().toLowerCase());
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to send reset code. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="mail" size={34} color="#3B82F6" />
      </View>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email and we'll send you a reset code.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <View style={[styles.inputContainer, error && styles.inputError]}>
          <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            placeholder="your.email@example.com"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={email}
            onChangeText={(t) => { setEmail(t); setError(""); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Send Reset Code</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 2: Enter OTP ───────────────────────────────────────────────────────
function StepOTP({ email, onNext, onResend }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const inputs = React.useRef([]);

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
    if (otp.length < 6) { setError("Please enter the full 6-digit code"); return; }

    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/auth/verify-reset-code`, {
        email,
        code: otp,
      });
      onNext(otp);
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
      await axios.post(`${BASE_URL}/auth/forgot-password`, { email });
      Alert.alert("Code Resent", "A new reset code has been sent to your email.");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch {
      setError("Could not resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="keypad" size={34} color="#3B82F6" />
      </View>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit code to{"\n"}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.otpRow}>
        {code.map((digit, i) => (
          <TextInput
            key={i}
            ref={(r) => (inputs.current[i] = r)}
            style={[styles.otpBox, digit !== "" && styles.otpBoxFilled, error && styles.otpBoxError]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, i)}
          />
        ))}
      </View>

      {error ? <Text style={[styles.fieldError, { textAlign: "center", marginBottom: 12 }]}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleVerify}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Verify Code</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendContainer}>
        <Text style={styles.resendText}>
          {resending ? "Resending..." : "Didn't receive it? "}
          {!resending && <Text style={styles.resendLink}>Resend Code</Text>}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 3: New Password ────────────────────────────────────────────────────
function StepNewPassword({ email, code, onDone }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "At least 8 characters required";
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/auth/reset-password`, {
        email,
        code,
        password,
      });
      onDone();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to reset password. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed" size={34} color="#3B82F6" />
      </View>
      <Text style={styles.title}>New Password</Text>
      <Text style={styles.subtitle}>Create a strong password for your account.</Text>

      {errors.general ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{errors.general}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            placeholder="Min. 8 characters"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={password}
            onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: "" })); }}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPass((v) => !v)}>
            <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
          <TextInput
            placeholder="Re-enter password"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setErrors((e) => ({ ...e, confirmPassword: "" })); }}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleReset}
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
            <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#888" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleReset}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Reset Password</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 4: Success ─────────────────────────────────────────────────────────
function StepSuccess({ onGoToLogin }) {
  return (
    <View style={[styles.stepContainer, { alignItems: "center" }]}>
      <View style={[styles.iconCircle, { backgroundColor: "#dcfce7", width: 80, height: 80, borderRadius: 40 }]}>
        <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
      </View>
      <Text style={styles.title}>Password Reset!</Text>
      <Text style={[styles.subtitle, { textAlign: "center" }]}>
        Your password has been reset successfully. You can now log in with your new password.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onGoToLogin} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password, 4: success
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const stepLabel = ["Enter Email", "Verify Code", "New Password", "Done"];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <View style={styles.stepDotWrapper}>
                <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
                  {step > s ? (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  ) : (
                    <Text style={[styles.stepDotText, step >= s && styles.stepDotTextActive]}>{s}</Text>
                  )}
                </View>
                <Text style={[styles.stepDotLabel, step >= s && styles.stepDotLabelActive]}>
                  {stepLabel[s - 1]}
                </Text>
              </View>
              {s < 4 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Steps */}
        {step === 1 && (
          <StepEmail
            onNext={(e) => { setEmail(e); setStep(2); }}
          />
        )}
        {step === 2 && (
          <StepOTP
            email={email}
            onNext={(code) => { setOtpCode(code); setStep(3); }}
          />
        )}
        {step === 3 && (
          <StepNewPassword
            email={email}
            code={otpCode}
            onDone={() => setStep(4)}
          />
        )}
        {step === 4 && (
          <StepSuccess onGoToLogin={() => navigation.navigate("Login")} />
        )}
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Step indicator bar
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  stepDotWrapper: {
    alignItems: "center",
    gap: 4,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: "#3B82F6",
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
  },
  stepDotTextActive: {
    color: "#fff",
  },
  stepDotLabel: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "500",
  },
  stepDotLabelActive: {
    color: "#3B82F6",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 6,
    marginBottom: 18,
  },
  stepLineActive: {
    backgroundColor: "#3B82F6",
  },

  // Step content
  stepContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 40,
    justifyContent: "center",
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  emailHighlight: {
    fontWeight: "600",
    color: "#3B82F6",
  },

  // Inputs
  inputGroup: {
    width: "100%",
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  errorBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#b91c1c",
    fontSize: 14,
    textAlign: "center",
  },

  // OTP
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  otpBoxFilled: {
    borderColor: "#3B82F6",
    backgroundColor: "#eff6ff",
    color: "#3B82F6",
  },
  otpBoxError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  resendContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#666",
  },
  resendLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },

  // Button
  primaryButton: {
    width: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});