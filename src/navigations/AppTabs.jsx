import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import GWelcomeScreen from "../screens/Gamification/GWelcomeScreen";
import CoursesStack from './CoursesStack';
import { Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import AddPostScreen from "../screens/AddPosts/AddPostScreen";
import ProfileStack from "./ProfileStack";
import HomeStack from "./HomeStack";



const Tab = createBottomTabNavigator();

export default function MyTabs({ signOut }) {
  return (
    <Tab.Navigator
      screenOptions={{
        animation: "fade",
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
        children={() => <AddPostScreen/>}
        options={{
          headerShown: false,

          tabBarButton: props => {
            return (
              <TouchableOpacity
                {...props}
                style={{
                  alignSelf: "center",
                  width: 60,
                  backgroundColor: "#D9D9D9",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 30,
                  marginTop: "12%",
                  borderRadius: 5,
                  borderLeftColor: "#0088FF",
                  borderLeftWidth: 4,
                  borderRightColor: "#FFCC00",
                  borderRightWidth: 4,
                }}
              >
                <Entypo name="plus" size={24} color="black" />
              </TouchableOpacity>
            );
          }, // hide from tab bar
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
