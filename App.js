import * as React from "react";

import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import ForgetPassword from "./src/screens/ForgotPasswordScreen";
import QuizScreen from "./src/screens/QuizScreen";

import * as SecureStore from "expo-secure-store";
import ProfileScreen from "./src/screens/ProfileScreen";
import MyTabs from "./src/navigations/AppTabs";
import axios from "axios";

const AuthContext = React.createContext();
const TOKEN_KEY = "userToken";
const USER_EMAIL_KEY = "userEmail";
const QUIZ_COMPLETED_KEY_PREFIX = "quizCompleted";
const getQuizCompletedKey = email =>
  `${QUIZ_COMPLETED_KEY_PREFIX}:${(email || "").toLowerCase()}`;

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
        case "SET_QUIZ_COMPLETED":
          return {
            ...prevState,
            quizCompleted: action.value,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      quizCompleted: false,
    },
  );

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let quizCompleted = false;

      try {
        userToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const userEmail = await SecureStore.getItemAsync(USER_EMAIL_KEY);
        if (userEmail) {
          const storedQuizCompleted = await SecureStore.getItemAsync(
            getQuizCompletedKey(userEmail),
          );
          quizCompleted = storedQuizCompleted === "true";
        }
      } catch (e) {}

      dispatch({ type: "RESTORE_TOKEN", token: userToken });
      dispatch({ type: "SET_QUIZ_COMPLETED", value: quizCompleted });
      if (userToken) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (token, email) => {
        const normalizedEmail = (email || "").toLowerCase();
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_EMAIL_KEY, normalizedEmail);
        const storedQuizCompleted = await SecureStore.getItemAsync(
          getQuizCompletedKey(normalizedEmail),
        );
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch({ type: "SIGN_IN", token });
        dispatch({
          type: "SET_QUIZ_COMPLETED",
          value: storedQuizCompleted === "true",
        });
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
        delete axios.defaults.headers.common["Authorization"];
        dispatch({ type: "SIGN_OUT" });
        dispatch({ type: "SET_QUIZ_COMPLETED", value: false });
      },
      setQuizCompleted: async value => {
        const userEmail = await SecureStore.getItemAsync(USER_EMAIL_KEY);
        if (userEmail) {
          await SecureStore.setItemAsync(
            getQuizCompletedKey(userEmail),
            String(value),
          );
        }
        dispatch({ type: "SET_QUIZ_COMPLETED", value });
      },
      signUp: async token => {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        dispatch({ type: "SIGN_IN", token });
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
                children={() => <LoginScreen signIn={authContext.signIn} />}
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
                component={ForgetPassword}
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
              {!state.quizCompleted ? (
                <Stack.Screen
                  name="Quiz"
                  children={() => (
                    <QuizScreen
                      onQuizCompleted={() => authContext.setQuizCompleted(true)}
                    />
                  )}
                  options={{ headerShown: false }}
                />
              ) : (
                <>
                  <Stack.Screen
                    name="Tabs"
                    children={() => <MyTabs signOut={authContext.signOut} />}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="Quiz"
                    children={() => (
                      <QuizScreen
                        onQuizCompleted={() =>
                          authContext.setQuizCompleted(true)
                        }
                      />
                    )}
                    options={{ headerShown: false }}
                  />
                </>
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
