import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PublicProfileScreen from "../screens/PublicProfileScreen";
import AvailableSlotsScreen from "../screens/AvailableSlotsScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <Stack.Screen name="AvailableSlots" component={AvailableSlotsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}