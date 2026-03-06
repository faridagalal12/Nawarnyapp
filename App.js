import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import QuizScreen from "./src/screens/QuizScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

// ─── Auth Context ─────────────────────────────────────────────────────────────
// Export so any screen can call signIn / signOut via useContext(AuthContext)
export const AuthContext = React.createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return { ...prevState, userToken: action.token, isLoading: false };
        case "SIGN_IN":
          return { ...prevState, isSignout: false, userToken: action.token };
        case "SIGN_OUT":
          return { ...prevState, isSignout: true, userToken: null };
        default:
          return prevState;
      }
    },
    { isLoading: true, isSignout: false, userToken: null },
  );

  // Restore persisted token on app launch
  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = null;
      try {
        userToken = await SecureStore.getItemAsync("userToken");
      } catch (_) {}
      dispatch({ type: "RESTORE_TOKEN", token: userToken });
    };
    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      /**
       * Call after a successful login or OTP verify.
       * Pass the real JWT token returned by your API.
       */
      signIn: async (token) => {
        try {
          await SecureStore.setItemAsync("userToken", token);
        } catch (_) {}
        dispatch({ type: "SIGN_IN", token });
      },

      /**
       * Call after a successful sign-up if your API returns a token directly.
       * Otherwise navigate to Verify first and call signIn after OTP success.
       */
      signUp: async (token) => {
        try {
          await SecureStore.setItemAsync("userToken", token);
        } catch (_) {}
        dispatch({ type: "SIGN_IN", token });
      },

      /**
       * Call from the ProfileScreen logout button.
       * Clears the token from secure storage and resets the stack.
       */
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync("userToken");
        } catch (_) {}
        dispatch({ type: "SIGN_OUT" });
      },
    }),
    [],
  );

  // Render nothing while checking for a stored token (or swap in a SplashScreen)
  if (state.isLoading) return null;

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.userToken == null ? (
            // ── Unauthenticated stack ─────────────────────────────────────
            <>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{
                  title: "",
                  headerShown: false,
                  animationTypeForReplace: state.isSignout ? "pop" : "push",
                }}
              />
              <Stack.Screen
                name="Login"
                component={()=> <LoginScreen signIn={authContext.signIn} />}
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
            // ── Authenticated stack ───────────────────────────────────────
            <>
              {/* <Stack.Screen
                name="Quiz"
                component={QuizScreen}
                options={{ title: "", headerShown: false }}
              /> */}
              <Stack.Screen
                name="Profile"
                component={()=> <ProfileScreen logout={authContext.signOut} />}
                options={{ title: "Profile" }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}