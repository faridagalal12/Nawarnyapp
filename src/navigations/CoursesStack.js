import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesBrowseScreen    from '../screens/CoursesBrowseScreen';
import CourseDetailScreen     from '../screens/CourseDetailScreen';
import CourseCompletionScreen from '../screens/CourseCompletionScreen';
import CertificateScreen      from '../screens/CertificateScreen';
import PaymentScreen          from '../screens/paymentscreen';

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
      <Stack.Screen name="CourseCompletion" component={CourseCompletionScreen}
        options={{ animation: 'fade' }} />
      <Stack.Screen name="Certificate"      component={CertificateScreen}
        options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}