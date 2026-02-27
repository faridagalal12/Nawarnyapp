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
  StatusBar,
} from "react-native";

const { width } = Dimensions.get("window");

// ─── Palette (from Q1 screenshot) ───────────────────────────────────────────
const PURPLE      = "#4B4ACF";   // header background
const PURPLE_DARK = "#3736A8";   // darker tint for depth
const PURPLE_LIGHT= "#7B7AE8";   // accent dot / letter tint
const WHITE       = "#FFFFFF";
const BG          = "#F0EFF7";   // page background (very light lavender-grey)
const CARD_BG     = "#FFFFFF";
const BORDER_DEF  = "#E3E2F0";
const BORDER_SEL  = "#4B4ACF";
const TEXT_DARK   = "#1A1A2E";
const TEXT_MID    = "#6B6A8E";
const TEXT_LIGHT  = "#A9A8C8";
const NEXT_BG     = "#4B4ACF";

// ─── Data ────────────────────────────────────────────────────────────────────
const OPTION_LABELS = ["A", "B", "C", "D", "E"];

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
    allowMultiple: true,
  },
  {
    id: 3,
    question: "How do you prefer to learn new things?",
    options: ["Reading", "Watching", "Doing it", "Discussing"],
    allowMultiple: true,
  },
  {
    id: 4,
    question: "What motivates you most right now?",
    options: ["Growth", "Stability", "Recognition", "Impact"],
    allowMultiple: true,
  },
  {
    id: 5,
    question: "How do you handle unexpected challenges?",
    options: ["Head-on", "Plan first", "Ask for help", "Step back"],
    allowMultiple: true,
  },
  {
    id: 6,
    question: "What's your ideal way to end the day?",
    options: ["Reflect quietly", "Social time", "Creative outlet", "Rest immediately"],
    allowMultiple: true,
  },
  {
    id: 7,
    question: "Which topics outside of academic studies do you find interesting?",
    options: ["Travel, Exploring New Cultures", "Technology", "Self Improvement", "Entertainment and Internet culture"],
    allowMultiple: true,
  },
  {
    id: 8,
    question: "How do you recharge after a long week?",
    options: ["Reflect quietly", "Social time", "Creative outlet", "Rest immediately"],
    allowMultiple: true,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function QuizScreen() {
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [answers, setAnswers]             = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [completed, setCompleted]         = useState(false);
  const [fadeAnim]                        = useState(new Animated.Value(1));

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const formatAnswer = answer =>
    Array.isArray(answer) ? answer.join(", ") : answer || "No answer";

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelect = option => {
    if (currentQuestion.allowMultiple) {
      setSelectedOptions(prev =>
        prev.includes(option) ? prev.filter(i => i !== option) : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
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

    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setCurrentIndex(i => i + 1);
      setSelectedOptions([]);
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setCurrentIndex(i => i - 1);
      setSelectedOptions([]);
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOptions([]);
    setCompleted(false);
  };

  // ── Completed Screen ─────────────────────────────────────────────────────────
  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

        {/* Purple header */}
        <View style={styles.completedHeader}>
          <Text style={styles.completedHeaderLabel}>QUIZ COMPLETE</Text>
          <Text style={styles.completedTitle}>All done!</Text>
          <Text style={styles.completedSubtitle}>Here's what you shared:</Text>
        </View>

        {/* Summary */}
        <ScrollView
          style={styles.summaryScroll}
          contentContainerStyle={styles.summaryContent}
          showsVerticalScrollIndicator={false}
        >
          {QUESTIONS.map((q, idx) => (
            <View key={q.id} style={styles.summaryRow}>
              <View style={styles.summaryIndexBadge}>
                <Text style={styles.summaryIndexText}>{idx + 1}</Text>
              </View>
              <View style={styles.summaryTextBlock}>
                <Text style={styles.summaryQ} numberOfLines={2}>{q.question}</Text>
                <Text style={styles.summaryA}>{formatAnswer(answers[q.id])}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.completedFooter}>
          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart} activeOpacity={0.85}>
            <Text style={styles.restartBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Quiz Screen ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

      {/* ── Purple Header Block ── */}
      <View style={styles.header}>
        {/* Progress bar inside header */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.stepLabel}>{currentIndex + 1}/{QUESTIONS.length}</Text>
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
      <Animated.ScrollView
        style={[styles.optionsScroll, { opacity: fadeAnim }]}
        contentContainerStyle={styles.optionsContent}
        showsVerticalScrollIndicator={false}
      >
        {currentQuestion.options.map((option, i) => {
          const isSelected = selectedOptions.includes(option);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => handleSelect(option)}
              activeOpacity={0.75}
            >
              {/* Letter badge */}
              <View style={[styles.letterBadge, isSelected && styles.letterBadgeSelected]}>
                <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                  {OPTION_LABELS[i]}
                </Text>
              </View>

              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
              </Text>

              {/* Selection indicator on right */}
              {isSelected && (
                <View style={styles.checkDot}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.backBtn, currentIndex === 0 && styles.backBtnDisabled]}
          onPress={handleBack}
          disabled={currentIndex === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.backBtnText, currentIndex === 0 && styles.backBtnTextDisabled]}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextBtn, !selectedOptions.length && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!selectedOptions.length}
          activeOpacity={0.85}
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
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: PURPLE,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 36,       // extra bottom so card overlaps
    // Rounded bottom corners like the screenshot
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: WHITE,
    borderRadius: 2,
  },
  stepLabel: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },

  // Question card
  questionCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    // Subtle shadow so it floats
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  questionCategoryLabel: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "700",
    color: PURPLE,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "center",
  },
  questionText: {
    fontFamily: "System",
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_DARK,
    lineHeight: 26,
    textAlign: "center",
  },
  multipleHint: {
    fontFamily: "System",
    fontSize: 11,
    color: TEXT_LIGHT,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  // ── Options ─────────────────────────────────────────────────────────────────
  optionsScroll: {
    flex: 1,
  },
  optionsContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: BORDER_DEF,
    gap: 14,
    // subtle shadow
    shadowColor: "#4B4ACF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  optionRowSelected: {
    borderColor: BORDER_SEL,
    backgroundColor: "#EEEEFF",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  // Letter badge (A / B / C / D)
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER_DEF,
    alignItems: "center",
    justifyContent: "center",
  },
  letterBadgeSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  letterText: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "700",
    color: PURPLE_LIGHT,
  },
  letterTextSelected: {
    color: WHITE,
  },

  optionText: {
    fontFamily: "System",
    fontSize: 15,
    fontWeight: "500",
    color: TEXT_DARK,
    flex: 1,
  },
  optionTextSelected: {
    color: PURPLE,
    fontWeight: "600",
  },

  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    gap: 16,
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BORDER_DEF,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backBtnDisabled: {
    opacity: 0.35,
  },
  backBtnText: {
    fontSize: 20,
    color: TEXT_DARK,
    fontWeight: "600",
  },
  backBtnTextDisabled: {
    color: TEXT_LIGHT,
  },
  nextBtn: {
    flex: 1,
    backgroundColor: NEXT_BG,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  nextBtnDisabled: {
    backgroundColor: BORDER_DEF,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.5,
  },

  // ── Completed Screen ─────────────────────────────────────────────────────────
  completedHeader: {
    backgroundColor: PURPLE,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  completedHeaderLabel: {
    fontFamily: "System",
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  completedTitle: {
    fontFamily: "System",
    fontSize: 34,
    fontWeight: "800",
    color: WHITE,
    marginBottom: 6,
  },
  completedSubtitle: {
    fontFamily: "System",
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
  },

  summaryScroll: {
    flex: 1,
  },
  summaryContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER_DEF,
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  summaryIndexBadge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  summaryIndexText: {
    fontFamily: "System",
    fontSize: 13,
    fontWeight: "700",
    color: WHITE,
  },
  summaryTextBlock: {
    flex: 1,
    gap: 4,
  },
  summaryQ: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "500",
    color: TEXT_MID,
    lineHeight: 17,
  },
  summaryA: {
    fontFamily: "System",
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_DARK,
    lineHeight: 21,
  },

  completedFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  restartBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  restartBtnText: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.5,
  },
});