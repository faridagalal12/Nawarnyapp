import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import LearningProfileScreen from "../screens/learningProfileScreen";
import ContactSupportScreen from "../screens/ContactSupportScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStack({ signOut }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileMain"
        options={{ headerShown: false }}
      >
        {(props) => <ProfileScreen {...props} signOut={signOut} />}
      </Stack.Screen>
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LearningProfileScreen"
        component={LearningProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactSupport"
        component={ContactSupportScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}