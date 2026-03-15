import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Button } from "galio-framework";
import { useNavigation } from "@react-navigation/native";

import Reels from "../components/Reels.js";

export default function HomeScreen({ title = "Home" }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      
      {/* REELS SECTION */}
      <View style={styles.reelsContainer}>
        <Reels />
      </View>

      {/* COURSE SECTION */}
      <ScrollView style={styles.courseContainer}>
        <Text style={styles.courseTitle}>Suggested Courses For You</Text>

        <View style={styles.courseCard}>
          <Text style={styles.courseText}>Digital Marketing Basics</Text>
        </View>

        <View style={styles.courseCard}>
          <Text style={styles.courseText}>Business Content Creation</Text>
        </View>

        <View style={styles.courseCard}>
          <Text style={styles.courseText}>Branding For Entrepreneurs</Text>
        </View>

        <View style={styles.courseCard}>
          <Text style={styles.courseText}>Startup Fundamentals</Text>
        </View>

        {/* QUIZ BUTTON (YOUR ORIGINAL NAVIGATION) */}
        <Button
          style={styles.quizButton}
          onPress={() => navigation.navigate("Quiz")}
        >
          Quiz
        </Button>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  reelsContainer: {
    height: 450,
  },

  courseContainer: {
    backgroundColor: "#e6edf5",
    padding: 15,
  },

  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  courseCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  courseText: {
    fontSize: 16,
  },

  quizButton: {
    marginTop: 20,
  },
});