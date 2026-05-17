import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GWelcomeScreen from "../screens/Gamification/GWelcomeScreen";
import GMissionScreen from "../screens/Gamification/GMissionScreen";
import GMissionStartScreen from "../screens/Gamification/GMissionStartScreen";
import GMissionLeaderboardScreen from "../screens/Gamification/GMissionLeaderboardScreen";

const Stack = createNativeStackNavigator();

export default function GamificationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GWelcome" component={GWelcomeScreen} />
      <Stack.Screen name="GMission" component={GMissionScreen} />
      <Stack.Screen name="MissionStart" component={GMissionStartScreen} />
      <Stack.Screen name="MissionLeaderboard" component={GMissionLeaderboardScreen} />
    </Stack.Navigator>
  );
}