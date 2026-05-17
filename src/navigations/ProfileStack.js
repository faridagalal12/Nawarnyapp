import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import LearningProfileScreen from "../screens/learningProfileScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";
import cardscreen from "../screens/cardscreen";
import ContactSupportScreen from "../screens/ContactSupportScreen";
import AboutAppScreen from "../screens/AboutAppScreen";
import CreatorApplicationScreen from "../screens/CreatorApplicationScreen";
import AdminScreen from "../screens/AdminScreen";
import PublicProfileScreen from "../screens/PublicProfileScreen";
import UploadCourseScreen from "../screens/AddPosts/UploadCourseScreen";
import EditCourseScreen from "../screens/AddPosts/EditCourseScreen";
import CreatorDashboardScreen from "../screens/CreatorDashboardScreen";
import GMissionLeaderboardScreen from "../screens/Gamification/GMissionLeaderboardScreen";


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
        name="Card"
        component={cardscreen}
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
      <Stack.Screen
        name="CreatorApplication"
        component={CreatorApplicationScreen}
        options={{ headerShown: false }}
      />

<Stack.Screen
  name="Leaderboard"
  component={GMissionLeaderboardScreen}
  options={{ headerShown: false }}
/>
      <Stack.Screen
  name="UploadCourse"
  component={UploadCourseScreen}
  options={{ headerShown: false }}
/>
      <Stack.Screen
        name="CreatorDashboard"
        component={CreatorDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Admin"
        component={AdminScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
  name="EditCourse"
  component={EditCourseScreen}
  options={{ headerShown: false }}
/>
      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
    
  );
}