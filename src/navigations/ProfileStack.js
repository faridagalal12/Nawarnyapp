import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import LearningProfileScreen from "../screens/learningProfileScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import PaymentScreen from "../screens/PaymentScreen";
import CardScreen from "../screens/cardscreen";
import ContactSupportScreen from "../screens/ContactSupportScreen";
import AboutAppScreen from "../screens/AboutAppScreen";

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
        name="LearningProfile"
        component={LearningProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Card"
        component={CardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContactSupport"
        component={ContactSupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AboutApp"
        component={AboutAppScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}