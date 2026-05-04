import * as React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./src/screens/WelcomeScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import LoginScreen from "./src/screens/LoginScreen";
import VerifyScreen from "./src/screens/VerifyScreen";
import ForgetPassword from "./src/screens/ForgotPasswordScreen";
import QuizScreen from "./src/screens/QuizScreen";
import SearchScreen from "./src/screens/SearchScreen";
import VideoPlayerScreen from "./src/screens/VideoPlayerScreen";
import CoursesSearchScreen from "./src/screens/CoursesSearchScreen";

import * as SecureStore from "expo-secure-store";
import MyTabs from "./src/navigations/AppTabs";
import api, { setAuthToken } from "./src/services/api";
import {
  TOKEN_KEY,
  USER_EMAIL_KEY,
  PENDING_VERIFY_EMAIL_KEY,
  getQuizCompletedKey,
} from "./src/constants/authKeys";

const AuthContext = React.createContext();
const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = React.useRef(null);
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return { ...prevState, userToken: action.token, isLoading: false };
        case "SIGN_IN":
          return { ...prevState, isSignout: false, userToken: action.token };
        case "SIGN_OUT":
          return { ...prevState, isSignout: true, userToken: null };
        case "SET_QUIZ_COMPLETED":
          return { ...prevState, quizCompleted: action.value };
        case "SET_VERIFIED":
          return { ...prevState, isVerified: action.value };
        case "SET_PENDING_VERIFY_EMAIL":
          return { ...prevState, pendingVerificationEmail: action.value };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      quizCompleted: false,
      isVerified: false,
      pendingVerificationEmail: null,
    },
  );

  const extractQuizCompleted = profile => {
    if (!profile || typeof profile !== "object") return null;
    if (typeof profile.quizCompleted === "boolean")
      return profile.quizCompleted;
    if (profile.quizCompleted === "true") return true;
    if (profile.quizCompleted === "false") return false;
    if (typeof profile.quiz_completed === "boolean")
      return profile.quiz_completed;
    if (profile.quiz_completed === "true") return true;
    if (profile.quiz_completed === "false") return false;
    return null;
  };

  const extractVerified = profile => {
    if (!profile || typeof profile !== "object") return null;
    if (typeof profile.verified === "boolean") return profile.verified;
    if (profile.verified === "true") return true;
    if (profile.verified === "false") return false;
    if (typeof profile.isVerified === "boolean") return profile.isVerified;
    if (profile.isVerified === "true") return true;
    if (profile.isVerified === "false") return false;
    if (typeof profile.emailVerified === "boolean")
      return profile.emailVerified;
    if (profile.emailVerified === "true") return true;
    if (profile.emailVerified === "false") return false;
    if (typeof profile.is_verified === "boolean") return profile.is_verified;
    if (profile.is_verified === "true") return true;
    if (profile.is_verified === "false") return false;
    return null;
  };

  const extractEmail = profile => {
    if (!profile || typeof profile !== "object") return null;
    return profile.email || profile.userEmail || profile.username || null;
  };

  const refreshProfile = React.useCallback(async () => {
    try {
      const response = await api.get("/auth/profile");
      const profile = response?.data?.data ?? response?.data ?? {};
      const verified = extractVerified(profile);
      const quizCompleted = extractQuizCompleted(profile);
      const profileEmail = extractEmail(profile);
      const storedEmail =
        (await SecureStore.getItemAsync(USER_EMAIL_KEY)) || profileEmail;

      if (profileEmail && profileEmail !== storedEmail) {
        await SecureStore.setItemAsync(
          USER_EMAIL_KEY,
          profileEmail.toLowerCase(),
        );
      }

      if (quizCompleted !== null) {
        if (storedEmail) {
          await SecureStore.setItemAsync(
            getQuizCompletedKey(storedEmail),
            String(quizCompleted),
          );
        }
        dispatch({ type: "SET_QUIZ_COMPLETED", value: quizCompleted });
      }

      if (verified !== null) {
        dispatch({ type: "SET_VERIFIED", value: verified });
        if (verified) {
          await SecureStore.deleteItemAsync(PENDING_VERIFY_EMAIL_KEY);
          dispatch({ type: "SET_PENDING_VERIFY_EMAIL", value: null });
        } else if (profileEmail) {
          await SecureStore.setItemAsync(
            PENDING_VERIFY_EMAIL_KEY,
            profileEmail.toLowerCase(),
          );
          dispatch({
            type: "SET_PENDING_VERIFY_EMAIL",
            value: profileEmail.toLowerCase(),
          });
        }
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, []);

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let quizCompleted = false;
      let pendingVerificationEmail;

      try {
        userToken = await SecureStore.getItemAsync(TOKEN_KEY);
        console.log("====================================");
        console.log(userToken);
        console.log("====================================");
        const userEmail = await SecureStore.getItemAsync(USER_EMAIL_KEY);
        pendingVerificationEmail = await SecureStore.getItemAsync(
          PENDING_VERIFY_EMAIL_KEY,
        );
        if (userEmail) {
          const storedQuizCompleted = await SecureStore.getItemAsync(
            getQuizCompletedKey(userEmail),
          );
          quizCompleted = storedQuizCompleted === "true";
        }
      } catch (e) {}

      dispatch({ type: "RESTORE_TOKEN", token: userToken });
      dispatch({ type: "SET_QUIZ_COMPLETED", value: quizCompleted });
      dispatch({
        type: "SET_PENDING_VERIFY_EMAIL",
        value: pendingVerificationEmail || null,
      });
      setAuthToken(userToken);
      if (userToken) {
        await refreshProfile();
        api.post("/learning-profile/award-xp", { action: "DAILY_LOGIN" }).catch(() => {});
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (token, email) => {
        const normalizedEmail = (email || "").toLowerCase();
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync("userEmail", normalizedEmail);
        setAuthToken(token);
        dispatch({ type: "SIGN_IN", token });
        await refreshProfile();
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
        setAuthToken(null);
        dispatch({ type: "SIGN_OUT" });
        dispatch({ type: "SET_QUIZ_COMPLETED", value: false });
        dispatch({ type: "SET_VERIFIED", value: false });
      },
      setQuizCompleted: async value => {
        dispatch({ type: "SET_QUIZ_COMPLETED", value });
        try {
          const userEmail = await SecureStore.getItemAsync(USER_EMAIL_KEY);
          if (userEmail) {
            await SecureStore.setItemAsync(
              getQuizCompletedKey(userEmail),
              String(value),
            );
          }
        } catch (error) {
          console.warn("Failed to persist quizCompleted:", error);
        }
      },
      setPendingVerificationEmail: async email => {
        const normalizedEmail = (email || "").toLowerCase();
        if (normalizedEmail) {
          await SecureStore.setItemAsync(
            PENDING_VERIFY_EMAIL_KEY,
            normalizedEmail,
          );
          dispatch({
            type: "SET_PENDING_VERIFY_EMAIL",
            value: normalizedEmail,
          });
        }
      },
      completeVerification: async () => {
        await SecureStore.deleteItemAsync(PENDING_VERIFY_EMAIL_KEY);
        dispatch({ type: "SET_PENDING_VERIFY_EMAIL", value: null });
        dispatch({ type: "SET_VERIFIED", value: true });
      },
      signUp: async token => {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        setAuthToken(token);
        dispatch({ type: "SIGN_IN", token });
      },
      refreshProfile,
    }),
    [refreshProfile],
  );

  // ✅ Stable callback using dispatch directly — no stale closure possible
  const handleQuizCompleted = React.useCallback(async () => {
    // 1. Update state immediately so navigation can switch right away
    dispatch({ type: "SET_QUIZ_COMPLETED", value: true });

    // 2. Persist to SecureStore (do not block UI)
    try {
      const userEmail = await SecureStore.getItemAsync(USER_EMAIL_KEY);
      if (userEmail) {
        await SecureStore.setItemAsync(getQuizCompletedKey(userEmail), "true");
      }
    } catch (e) {
      console.warn("Failed to persist quizCompleted:", e);
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (state.userToken && state.isVerified && state.quizCompleted) {
      const nav = navigationRef.current;
      if (nav?.resetRoot) {
        nav.resetRoot({ index: 0, routes: [{ name: "Tabs" }] });
      } else if (nav?.reset) {
        nav.reset({ index: 0, routes: [{ name: "Tabs" }] });
      }
    }
  }, [state.userToken, state.isVerified, state.quizCompleted]);

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          key={
            state.userToken == null
              ? state.pendingVerificationEmail
                ? "auth-verify-pending"
                : "auth"
              : !state.isVerified
                ? "verify"
                : !state.quizCompleted
                  ? "quiz"
                  : "app"
          }
        >
          {state.userToken == null ? (
            state.pendingVerificationEmail ? (
              <Stack.Screen
                name="Verify"
                children={() => (
                  <VerifyScreen
                    signIn={authContext.signIn}
                    pendingEmail={state.pendingVerificationEmail}
                    onVerified={async ({ hasToken } = {}) => {
                      await authContext.completeVerification();
                      if (hasToken) await authContext.refreshProfile();
                    }}
                  />
                )}
                options={{
                  title: "Verify Account",
                  headerBackVisible: false,
                  gestureEnabled: false,
                }}
              />
            ) : (
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
                  children={() => (
                    <SignUpScreen
                      setPendingVerificationEmail={
                        authContext.setPendingVerificationEmail
                      }
                    />
                  )}
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
                  children={() => (
                    <VerifyScreen
                      signIn={authContext.signIn}
                      pendingEmail={state.pendingVerificationEmail}
                      onVerified={async ({ hasToken } = {}) => {
                        await authContext.completeVerification();
                        if (hasToken) await authContext.refreshProfile();
                      }}
                    />
                  )}
                  options={{
                    title: "Verify Account",
                    animationTypeForReplace: state.isSignout ? "pop" : "push",
                  }}
                />
              </>
            )
          ) : !state.isVerified ? (
            <Stack.Screen
              name="Verify"
              children={() => (
                <VerifyScreen
                  signIn={authContext.signIn}
                  pendingEmail={state.pendingVerificationEmail}
                  onVerified={async ({ hasToken } = {}) => {
                    await authContext.completeVerification();
                    if (hasToken) await authContext.refreshProfile();
                  }}
                />
              )}
              options={{
                title: "Verify Account",
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
          ) : !state.quizCompleted ? (
            <Stack.Screen
              name="Quiz"
              // ✅ Pass the stable handleQuizCompleted that calls dispatch directly
              children={() => (
                <QuizScreen onQuizCompleted={handleQuizCompleted} />
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
                  <QuizScreen onQuizCompleted={handleQuizCompleted} />
                )}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="VideoPlayer"
                component={VideoPlayerScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CoursesSearch"
                component={CoursesSearchScreen}
                options={{ headerShown: false }}
/>

            </>


          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
