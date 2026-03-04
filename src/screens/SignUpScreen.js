// screens/Sign Up.js
import { useState } from "react";
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
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const handleSignUp = async () => {
    await axios
      .post("https://nawarny-be.onrender.com/api/v1/auth/signup", {
        name: fullName,
        email: email,
        password: password,
      })
      .then(response => {
        console.log(response.data);
      })
      .catch(err => {
        console.log(err);
      });
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
              {/* Logo – same as welcome */}
              <View style={styles.logoContainer}>
                {/* Back Button */}

                <Image
                  source={require("../assets/logo.png")} // replace with your actual logo path
                  style={styles.iconPlaceholder}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>Sign Up</Text>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: John Doe"
                  placeholderTextColor="#999"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: jon.smith@email.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
        

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                activeOpacity={0.85}
                onPress={handleSignUp}
                
              >
                <Text style={styles.buttonText}>Sign up</Text>
              </TouchableOpacity>

              {/* Already have account? */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.signInLink}>SIGN IN</Text>
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
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 5,
  },
  logoContainer: {
    marginBottom: 50,
  },
  iconPlaceholder: {
    width: 200,
    height: 200,
    alignSelf: "center",
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 50,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 54,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#111",
  },
  signUpButton: {
    width: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 16,
  },
  signInLink: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
});
