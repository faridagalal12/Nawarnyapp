import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "../screens/HomeStack";
import ProfileScreen from "../screens/ProfileScreen";
import GWelcomeScreen from "../screens/Gamification/GWelcomeScreen";
import CoursesStack from './CoursesStack';
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AddPostScreen from "../screens/AddPosts/AddPostScreen";
import ProfileStack from "./ProfileStack";


const Tab = createBottomTabNavigator();

export default function MyTabs({ signOut }) {
  return (
    <Tab.Navigator
      screenOptions={{
        animation: "fade",
          tabBarActiveTintColor: "#3054E9",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Courses"
        component={CoursesStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="play-circle" size={size} color={color} />
          ),
        }}
      />
     <Tab.Screen
  name="AddPost"
  children={() => <AddPostScreen />}
  options={{
    headerShown: false,
    tabBarLabel: () => null,
    tabBarButton: (props) => (
      <TouchableOpacity
        {...props}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="add-circle" size={50} color="#3054E9" />
      </TouchableOpacity>
    ),
  }}
/>
      <Tab.Screen
        name="Challenge"
        component={GWelcomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
        
          children={() => <ProfileStack signOut={signOut} />}
          />
    </Tab.Navigator>
  );
}
