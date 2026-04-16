import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import PaymentScreen from "../screens/paymentscreen";

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
        name="Subscription"
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
  name="Payment"
  component={PaymentScreen}
  options={{ headerShown: false }}
/>
    </Stack.Navigator>
    
  );
}