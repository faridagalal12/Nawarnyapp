import React from "react";
import { View, Text, StyleSheet } from "react-native";

import ProfileScreen from "../screens/ProfileScreen";
import BottomNavigation from "../components/BottomNavigation";

const HomeScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Home</Text>
  </View>
);

const CoursesScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Courses</Text>
  </View>
);

const CreateScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Create</Text>
  </View>
);

const ChallengeScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Challenge</Text>
  </View>
);

const tabOrder = ["Home", "Courses", "Add", "Challenge", "Me"];

export default function AppTabs({ navigation }) {
  const [activeTab, setActiveTab] = React.useState("Me");

  const handleTabPress = React.useCallback(
    (tab) => {
      setActiveTab(tab);
    },
    [setActiveTab],
  );

  const tabNavigation = React.useMemo(
    () => ({
      navigate: (name, params) => {
        if (tabOrder.includes(name)) {
          setActiveTab(name);
          return;
        }

        navigation?.navigate?.(name, params);
      },
    }),
    [navigation],
  );

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return <HomeScreen />;
      case "Courses":
        return <CoursesScreen />;
      case "Add":
        return <CreateScreen />;
      case "Challenge":
        return <ChallengeScreen />;
      case "Me":
      default:
        return <ProfileScreen navigation={tabNavigation} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
      <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 20,
    color: "#333333",
  },
});
