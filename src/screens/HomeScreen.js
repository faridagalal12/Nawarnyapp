import { useNavigation } from "@react-navigation/native";
import { Button } from "galio-framework";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen({ title = "Home" }) {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Your personal safety companion</Text>
      <Button onPress={() => navigation.navigate("Quiz")}>Quiz</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
  },
});
