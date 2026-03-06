import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";

import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

function PlaceholderScreen({ title }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{title}</Text>
    </View>
  );
}

function HomeScreen() {
  return <PlaceholderScreen title="Home" />;
}

function CoursesScreen() {
  return <PlaceholderScreen title="Courses" />;
}

function CreateScreen() {
  return <PlaceholderScreen title="Create" />;
}

function ChallengeScreen() {
  return <PlaceholderScreen title="Challenge" />;
}

function CoursesTabIcon({ focused }) {
  return (
    <View
      style={[
        styles.coursesButton,
        { backgroundColor: focused ? "#2F5BEA" : "#AAB5C9" },
      ]}
    >
      <Ionicons name="play" size={14} color="#FFFFFF" />
    </View>
  );
}

function AddTabIcon() {
  return (
    <View style={styles.addButtonWrap}>
      <View style={styles.addButtonBlue} />
      <View style={styles.addButtonYellow} />
      <Text style={styles.addButtonText}>+</Text>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Me"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#1E74FF",
        tabBarInactiveTintColor: "#656A74",
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          tabBarIcon: ({ focused }) => <CoursesTabIcon focused={focused} />,
        }}
      />

      <Tab.Screen
        name="Add"
        component={CreateScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => <AddTabIcon />,
        }}
      />

      <Tab.Screen
        name="Challenge"
        component={ChallengeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "trophy" : "trophy-outline"}
              size={24}
              color={focused ? "#1E74FF" : "#204F25"}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Me"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E4E4E7",
    paddingBottom: 10,
    paddingTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "500",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  placeholderText: {
    fontSize: 20,
    color: "#333333",
  },
  coursesButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonWrap: {
    width: 56,
    height: 30,
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#8A8A8A",
    position: "relative",
    alignItems: "center",
  },
  addButtonBlue: {
    flex: 1,
    height: "100%",
    backgroundColor: "#1E88E5",
  },
  addButtonYellow: {
    flex: 1,
    height: "100%",
    backgroundColor: "#F7C948",
  },
  addButtonText: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#1F2937",
    fontSize: 23,
    fontWeight: "700",
    lineHeight: 24,
  },
});
