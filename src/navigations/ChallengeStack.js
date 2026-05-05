import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GWelcomeScreen from '../screens/Gamification/GWelcomeScreen.js';
import GMissionStartScreen from '../screens/Gamification/GMissionStartScreen.js';
import GMissionScreen from '../screens/Gamification/GMissionScreen.js';
import GMissionLeaderboardScreen from '../screens/Gamification/GMissionLeaderboardScreen.js';

const Stack = createNativeStackNavigator();

export default function ChallengeStack() {
  return (
    <Stack.Navigator
      initialRouteName="ChallengeHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F7F8FA' },
      }}
    >
      <Stack.Screen name="ChallengeHome" component={GWelcomeScreen} />
      <Stack.Screen name="MissionStart" component={GMissionStartScreen} />
      <Stack.Screen name="GMission" component={GMissionScreen} />
      <Stack.Screen name="MissionLeaderboard" component={GMissionLeaderboardScreen} />
    </Stack.Navigator>
  );
}
