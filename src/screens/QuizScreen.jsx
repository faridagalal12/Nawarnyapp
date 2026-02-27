import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

const QUESTIONS = [
  {
    id: 1,
    question: "How would you describe your current energy level?",
    options: ["Fully charged", "Running okay", "Low battery", "Almost empty"],
    allowMultiple: true,
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
    options: [
      "Reflect quietly",
      "Social time",
      "Creative outlet",
      "Rest immediately",
    ],
  },
  {
    id: 7,
    question: "your ideal way to end the day?",
    options: [
      "Reflect quietly",
      "Social time",
      "Creative outlet",
      "Rest immediately",
    ],
  },
  {
    id: 8,
    question: "No. 8 ideal way to end the day?",
    options: [
      "Reflect quietly",
      "Social time",
      "Creative outlet",
      "Rest immediately",
    ],
    allowMultiple: true,
  },
];

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = (currentIndex / QUESTIONS.length) * 100;
  const formatAnswer = answer =>
    Array.isArray(answer) ? answer.join(", ") : answer || "No answer";

  const handleSelect = option => {
    if (currentQuestion.allowMultiple) {
      setSelectedOptions(prev =>
        prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option],
      );
      return;
    }

    setSelectedOptions([option]);
  };

  const handleNext = () => {
    if (!selectedOptions.length) return;

    const answerValue = currentQuestion.allowMultiple
      ? selectedOptions
      : selectedOptions[0];
    const newAnswers = { ...answers, [currentQuestion.id]: answerValue };
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
      setSelectedOptions([]);
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
    setSelectedOptions([]);
    setCompleted(false);
  };

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedContainer}>
          <View style={styles.completedHeader}>
            <Text style={styles.completedTitle}>All done!</Text>
            <Text style={styles.completedSubtitle}>
              Here's what you shared:
            </Text>
          </View>

          <ScrollView
            style={styles.summaryCard}
            contentContainerStyle={styles.summaryContent}
            showsVerticalScrollIndicator={false}
          >
            {QUESTIONS.map(q => (
              <View key={q.id} style={styles.summaryRow}>
                <Text style={styles.summaryQ} numberOfLines={1}>
                  {q.question}
                </Text>
                <Text style={styles.summaryA}>
                  {formatAnswer(answers[q.id])}
                </Text>
              </View>
            ))}
          </ScrollView>

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
            const isSelected = selectedOptions.includes(option);
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => handleSelect(option)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionDot,
                    isSelected && styles.optionDotSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
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
          style={[
            styles.nextBtn,
            !selectedOptions.length && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedOptions.length}
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
    paddingTop: 28,
    paddingBottom: 20,
  },
  completedHeader: {
    marginBottom: 18,
  },
  completedEmoji: {
    fontSize: 32,
    color: ACCENT,
    marginBottom: 8,
  },
  completedTitle: {
    fontFamily: "Georgia",
    fontSize: 34,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: BORDER,
    flex: 1,
    marginBottom: 16,
  },
  summaryContent: {
    paddingVertical: 8,
    gap: 12,
  },
  summaryRow: {
    backgroundColor: "#FFFBF7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
  },
  summaryQ: {
    fontFamily: "Georgia",
    fontSize: 12,
    color: MUTED,
    letterSpacing: 0.5,
  },
  summaryA: {
    fontFamily: "Georgia",
    fontSize: 15,
    color: INK,
    lineHeight: 22,
  },
  restartBtn: {
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
