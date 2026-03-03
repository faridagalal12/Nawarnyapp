console.log('WelcomeScreen imported:', !!WelcomeScreen);
console.log('SignUpScreen imported:', !!SignUpScreen);
console.log('QuizScreen imported:', !!QuizScreen);
console.log('VerifyScreen imported:', !!VerifyScreen);
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import QuizScreen from "./src/screens/QuizScreen";
import { View, Text } from "react-native";
console.log('=== Component Imports Check ===');
console.log('WelcomeScreen:', WelcomeScreen ? 'OK' : 'UNDEFINED');
console.log('SignUpScreen:', SignUpScreen ? 'OK' : 'UNDEFINED');
console.log('LoginScreen:', LoginScreen ? 'OK' : 'UNDEFINED');
console.log('ForgotPasswordScreen:', ForgotPasswordScreen ? 'OK' : 'UNDEFINED');
console.log('VerifyScreen:', VerifyScreen ? 'OK' : 'UNDEFINED');
console.log('QuizScreen:', QuizScreen ? 'OK' : 'UNDEFINED');
const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Quiz" component={QuizScreen} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="Verify" component={VerifyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
