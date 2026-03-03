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

// ─── Palette ────────────────────────────────────────────────────────────────
const PURPLE = "#3B82F6";
const PURPLE_DARK = "#3550DC";
const PURPLE_LIGHT = "#3550DC";
const WHITE = "#FFFFFF";
const BG = "#F0EFF7";
const CARD_BG = "#FFFFFF";
const BORDER_DEF = "#E3E2F0";
const BORDER_SEL = "#4B4ACF";
const TEXT_DARK = "#1A1A2E";
const TEXT_MID = "#6B6A8E";
const TEXT_LIGHT = "#A9A8C8";
const NEXT_BG = "#4B4ACF";

// ─── Data ────────────────────────────────────────────────────────────────────
const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const QUESTIONS = [
  {
    id: 1,
    question: "How old are you? 🌱",
    options: ["Under 18 👶", "18–21 🎓", "22–25 🚀", "26–30 💼", "31+ 🌟"],
  },
  {
    id: 2,
    question: "What’s your main goal right now? 🎯",
    options: [
      "Build better habits 💪",
      "Improve mindset & confidence 🌈",
      "Advance career/studies 📈",
      "Strengthen relationships ❤️",
      "Feel happier & fulfilled 😊",
    ],
    allowMultiple: true,
  },
  // ... (all other questions remain the same)
  // Add the rest of QUESTIONS array here – I shortened for brevity
];

export default function QuizScreen({ navigation }) {  // ← IMPORTANT: add { navigation }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const formatAnswer = (answer) =>
    Array.isArray(answer) ? answer.join(", ") : answer || "No answer";

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelect = (option) => {
    if (currentQuestion.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(option) ? prev.filter((i) => i !== option) : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  const handleNext = () => {
    if (!selectedOptions.length) return;

    const answerValue = currentQuestion.allowMultiple ? selectedOptions : selectedOptions[0];
    const newAnswers = { ...answers, [currentQuestion.id]: answerValue };
    setAnswers(newAnswers);

    if (currentIndex === QUESTIONS.length - 1) {
      setCompleted(true);
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((i) => i + 1);
      setSelectedOptions([]);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    if (currentIndex === 0) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex((i) => i - 1);
      setSelectedOptions([]);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
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

  // ── Completed Screen ────────────────────────────────────────────────────────
  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedHeader}>
          <Text style={styles.completedHeaderLabel}>QUIZ COMPLETE</Text>
          <Text style={styles.completedTitle}>All done!</Text>
          <Text style={styles.completedSubtitle}>Here's what you shared:</Text>
        </View>

        <ScrollView style={styles.summaryScroll}>
          <View style={styles.summaryContent}>
            {QUESTIONS.map((q, idx) => (
              <View key={q.id} style={styles.summaryRow}>
                <View style={styles.summaryIndexBadge}>
                  <Text style={styles.summaryIndexText}>{idx + 1}</Text>
                </View>
                <View style={styles.summaryTextBlock}>
                  <Text style={styles.summaryQ}>{q.question}</Text>
                  <Text style={styles.summaryA}>{formatAnswer(answers[q.id])}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.completedFooter}>
          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
            <Text style={styles.restartBtnText}>Restart Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Quiz Screen ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* ── Purple Header Block ── */}
      <View style={styles.header}>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.stepLabel}>
            {currentIndex + 1}/{QUESTIONS.length}
          </Text>
        </View>

        {/* Question card floating on header */}
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
          <Text style={styles.questionCategoryLabel}>Question</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.allowMultiple && (
            <Text style={styles.multipleHint}>Select all that apply</Text>
          )}
        </Animated.View>
      </View>

      {/* ── Options ── */}
      <ScrollView style={styles.optionsScroll} contentContainerStyle={styles.optionsContent}>
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedOptions.includes(option);
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionRow,
                isSelected && styles.optionRowSelected,
              ]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.75}
            >
              {/* Letter badge */}
              <View style={[
                styles.letterBadge,
                isSelected && styles.letterBadgeSelected,
              ]}>
                <Text style={[
                  styles.letterText,
                  isSelected && styles.letterTextSelected,
                ]}>
                  {OPTION_LABELS[i]}
                </Text>
              </View>

              <Text style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
              ]}>
                {option}
              </Text>

              {/* Selection indicator */}
              {isSelected && (
                <View style={styles.checkDot}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            currentIndex === 0 && styles.backBtnDisabled,
          ]}
          onPress={handleBack}
          disabled={currentIndex === 0}
        >
          <Text style={[
            styles.backBtnText,
            currentIndex === 0 && styles.backBtnTextDisabled,
          ]}>
            ←
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextBtn,
            !selectedOptions.length && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedOptions.length}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === QUESTIONS.length - 1 ? "Finish" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    backgroundColor: PURPLE,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 36,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  // ... (rest of your styles – keep them as-is)
  // I omitted them here for brevity, but copy your original styles back in
});