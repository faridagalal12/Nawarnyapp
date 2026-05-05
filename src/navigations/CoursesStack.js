// src/navigations/CoursesStack.js
// Stack navigator wiring the 4 course screens together:
//   Browse → CourseDetail → CourseCompletion → Certificate
//
// Plug this into your existing AppTabs.jsx as one of the tabs:
//
//   import CoursesStack from './CoursesStack';
//   <Tab.Screen name="Courses" component={CoursesStack} />
//
// Each screen's header is hidden because every screen renders its own
// custom top bar (SafeAreaView + back button) matching the mockup.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CoursesBrowseScreen    from '../screens/CoursesBrowseScreen';
import CourseDetailScreen     from '../screens/CourseDetailScreen';
import CourseCompletionScreen from '../screens/CourseCompletionScreen';
import CertificateScreen      from '../screens/CertificateScreen';
import PaymentScreen          from '../screens/PaymentScreen';
import CourseContentScreen    from '../screens/CourseContentScreen';
import CreatorProfileScreen from '../screens/CreatorProfileScreen';


const Stack = createNativeStackNavigator();

export default function CoursesStack() {
  return (
    <Stack.Navigator
      initialRouteName="CoursesBrowse"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="CoursesBrowse"    component={CoursesBrowseScreen} />
      <Stack.Screen name="CourseDetail"     component={CourseDetailScreen} />
      <Stack.Screen name="Payment"          component={PaymentScreen} />
      <Stack.Screen name="CourseContent" component={CourseContentScreen} />
      <Stack.Screen name="CourseCompletion" component={CourseCompletionScreen}
        options={{ animation: 'fade' }} />
      <Stack.Screen name="Certificate"      component={CertificateScreen}
        options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen
  name="CreatorProfile"
  component={CreatorProfileScreen}
  options={{ headerShown: false }}
/>
    </Stack.Navigator>
  );
}