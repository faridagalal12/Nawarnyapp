import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import ForgetPassword from "./src/screens/ForgotPasswordScreen";
import QuizScreen from "./src/screens/QuizScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);

  // 🔥 Load token on app start
  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        setUserToken(token);
      }
    };
    loadToken();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <Stack.Screen name="Quiz">
            {(props) => (
              <QuizScreen {...props} setUserToken={setUserToken} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />

            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen {...props} setUserToken={setUserToken} />
              )}
            </Stack.Screen>

            <Stack.Screen name="SignUp" component={SignUpScreen} />

            <Stack.Screen name="Verify">
              {(props) => (
                <VerifyScreen {...props} setUserToken={setUserToken} />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="ForgotPassword"
              component={ForgetPassword}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}