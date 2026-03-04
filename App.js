import * as React from "react";

import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import QuizScreen from "./src/screens/QuizScreen";
import { View } from "react-native";
import * as SecureStore from "expo-secure-store";
import ProfileScreen from "./src/screens/ProfileScreen";

const AuthContext = React.createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    },
  );

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await SecureStore.getItemAsync("userToken");
      } catch (e) {}

      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
      },
      signOut: () => dispatch({ type: "SIGN_OUT" }),
      signUp: async data => {
        dispatch({ type: "SIGN_IN", token: "dummy-auth-token" });
      },
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.userToken == null ? (
            <>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{
                  title: "",
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                  title: "Sign in",
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />
              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{
                  title: "Sign up",
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />

              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                  title: "Forgot Password",
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />
              <Stack.Screen
                name="Verify"
                component={VerifyScreen}
                options={{
                  title: "Verify Account",
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />
            </>
          ) : (
            <>
              {/* <Stack.Screen name="Quiz" component={QuizScreen} /> */}
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
