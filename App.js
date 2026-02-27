// App.js
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import VerifyScreen from "./src/screens/VerifyScreen";

import ForgetPassword from "./src/screens/ForgotPasswordScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />

      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false, // hide header on all screens
          animation: "fade_from_bottom", // smooth feel
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Verify" component={VerifyScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgetPassword} />
        {/* Later: add <Stack.Screen name="Login" ... /> */}
        {/* Later: add <Stack.Screen name="Login" ... /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
