

// screens/Welcome.js
import { StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <Image
          source={require("../assets/logo.png")} // replace with your actual logo path
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.appName}>Nawarny</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.signUpButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}  // add later
          >
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: height * 0.09,
  },
  welcomeText: {
    fontSize: 22,
    color: '#666666',
    marginBottom: 6,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#111111',
    letterSpacing: -1,
    marginBottom: height * 0.14,
  },
  buttonsContainer: {
    width: '100%',
    gap: 18,
  },
  signUpButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  signUpText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    borderColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  loginText: {
    color: '#3B82F6',
    fontSize: 20,
    fontWeight: '700',
  },
});