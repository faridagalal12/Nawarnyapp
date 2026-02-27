import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const QUESTIONS = [
  {
    id: 1,
    question: "How would you describe your current energy level?",
    options: ["Fully charged", "Running okay", "Low battery", "Almost empty"],
  },
  {
    id: 2,
    question: "What best describes your work style?",
    options: ["Deep focus", "Quick bursts", "Collaborative", "Flexible flow"],
  },
  {
    id: 3,
    question: "How do you prefer to learn new things?",
    options: ["Reading", "Watching", "Doing it", "Discussing"],
  },
  {
    id: 4,
    question: "What motivates you most right now?",
    options: ["Growth", "Stability", "Recognition", "Impact"],
  },
  {
    id: 5,
    question: "How do you handle unexpected challenges?",
    options: ["Head-on", "Plan first", "Ask for help", "Step back"],
  },
  {
    id: 6,
    question: "What's your ideal way to end the day?",
    options: ["Reflect quietly", "Social time", "Creative outlet", "Rest immediately"],
  },
];

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = (currentIndex / QUESTIONS.length) * 100;

  const handleSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption };
    setAnswers(newAnswers);

    if (currentIndex === QUESTIONS.length - 1) {
      setCompleted(true);
      return;
    }

    // Fade out → update → fade in
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setCompleted(false);
  };

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>✦</Text>
          <Text style={styles.completedTitle}>All done!</Text>
          <Text style={styles.completedSubtitle}>Here's what you shared:</Text>

          <View style={styles.summaryCard}>
            {QUESTIONS.map((q) => (
              <View key={q.id} style={styles.summaryRow}>
                <Text style={styles.summaryQ} numberOfLines={1}>
                  {q.question}
                </Text>
                <Text style={styles.summaryA}>{answers[q.id]}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
            <Text style={styles.restartBtnText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>
          {currentIndex + 1} / {QUESTIONS.length}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Question + Options */}
      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <Text style={styles.questionNumber}>Q{currentIndex + 1}</Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedOption === option;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
              >
                <View style={[styles.optionDot, isSelected && styles.optionDotSelected]} />
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !selectedOption && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selectedOption}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === QUESTIONS.length - 1 ? "Finish" : "Next →"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CREAM = "#F9F5EF";
const INK = "#1A1612";
const ACCENT = "#D4522A";
const MUTED = "#9A8F85";
const CARD = "#FFFFFF";
const BORDER = "#E8E0D8";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },

  // Header
  header: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 10,
  },
  stepLabel: {
    fontFamily: "Georgia",
    fontSize: 13,
    color: MUTED,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  progressTrack: {
    height: 3,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: ACCENT,
    borderRadius: 2,
  },

  // Body
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  questionNumber: {
    fontFamily: "Georgia",
    fontSize: 13,
    color: ACCENT,
    letterSpacing: 2,
    marginBottom: 10,
  },
  questionText: {
    fontFamily: "Georgia",
    fontSize: 26,
    color: INK,
    lineHeight: 36,
    marginBottom: 36,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
    shadowColor: INK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: ACCENT,
    backgroundColor: "#FDF1EC",
  },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: BORDER,
  },
  optionDotSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT,
  },
  optionText: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: INK,
    flex: 1,
  },
  optionTextSelected: {
    color: ACCENT,
  },

  // Footer
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 36,
    paddingTop: 16,
  },
  nextBtn: {
    backgroundColor: INK,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  nextBtnDisabled: {
    backgroundColor: BORDER,
  },
  nextBtnText: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: CREAM,
    letterSpacing: 0.5,
  },

  // Completed
  completedContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  completedEmoji: {
    fontSize: 32,
    color: ACCENT,
    marginBottom: 12,
  },
  completedTitle: {
    fontFamily: "Georgia",
    fontSize: 36,
    color: INK,
    marginBottom: 6,
  },
  completedSubtitle: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: MUTED,
    marginBottom: 28,
  },
  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    flex: 1,
    maxHeight: 380,
  },
  summaryRow: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 12,
    gap: 4,
  },
  summaryQ: {
    fontFamily: "Georgia",
    fontSize: 12,
    color: MUTED,
    letterSpacing: 0.5,
  },
  summaryA: {
    fontFamily: "Georgia",
    fontSize: 16,
    color: INK,
  },
  restartBtn: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  restartBtnText: {
    fontFamily: "Georgia",
    fontSize: 15,
    color: INK,
    letterSpacing: 0.5,
  },
});
