import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../services/api";

const { width } = Dimensions.get("window");

// ─── Palette (from Q1 screenshot) ───────────────────────────────────────────
const PURPLE = "#3B82F6"; // header background
const PURPLE_DARK = "#3550DC"; // darker tint for depth
const PURPLE_LIGHT = "#3550DC"; // accent dot / letter tint
const WHITE = "#FFFFFF";
const BG = "#F0EFF7"; // page background (very light lavender-grey)
const CARD_BG = "#FFFFFF";
const BORDER_DEF = "#E3E2F0";
const BORDER_SEL = "#4B4ACF";
const TEXT_DARK = "#1A1A2E";
const TEXT_MID = "#6B6A8E";
const TEXT_LIGHT = "#A9A8C8";
const NEXT_BG = "#4B4ACF";

// ─── Data ────────────────────────────────────────────────────────────────────
const OPTION_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// ─── Component ───────────────────────────────────────────────────────────────
export default function QuizScreen({ onQuizCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = questions[currentIndex];
  const progress = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;
  const formatAnswer = (question, answer) => {
    const values = Array.isArray(answer) ? answer : [answer];
    const options = Array.isArray(question?.options) ? question.options : [];
    const labelMap = new Map(
      options.map(option => [String(option.value), option.label]),
    );
    const labels = values
      .filter(value => value !== undefined && value !== null && value !== "")
      .map(value => labelMap.get(String(value)) || String(value));
    return labels.length ? labels.join(", ") : "No answer";
  };

  const normalizeQuestions = raw => {
    const list = Array.isArray(raw)
      ? raw
      : raw?.questions || raw?.data || raw?.items || [];
    return list
      .map((q, index) => {
        const options = Array.isArray(q?.options)
          ? q.options
          : Array.isArray(q?.choices)
            ? q.choices
            : [];
        const normalizedOptions = options.map(option => {
          if (typeof option === "string") {
            return { value: option, label: option };
          }
          if (typeof option === "number") {
            return { value: option, label: String(option) };
          }
          if (option?.id !== undefined && option?.id !== null) {
            return {
              value: option.id,
              label:
                option.label ??
                option.text ??
                option.title ??
                String(option.id),
            };
          }
          if (option?.value !== undefined && option?.value !== null) {
            return {
              value: option.value,
              label:
                option.label ??
                option.text ??
                option.title ??
                String(option.value),
            };
          }
          const fallback =
            option?.label ?? option?.text ?? option?.title ?? String(option);
          return { value: fallback, label: fallback };
        });
        return {
          id: q?.id ?? q?._id ?? q?.questionId ?? index + 1,
          text: q?.question ?? q?.text ?? q?.title ?? "",
          options: normalizedOptions,
          allowMultiple: Boolean(
            q?.allowMultiple ?? q?.multiple ?? q?.isMultiple ?? false,
          ),
        };
      })
      .filter(q => q.text && q.options.length);
  };

  useEffect(() => {
    let isMounted = true;
    const loadQuestions = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/quiz/questions");
        const normalized = normalizeQuestions(response?.data ?? []);
        if (!normalized.length) {
          throw new Error("No quiz questions available.");
        }
        if (isMounted) {
          setQuestions(normalized);
          setCurrentIndex(0);
          setAnswers({});
          setSelectedOptions([]);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "Failed to load quiz questions.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadQuestions();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentQuestion) return;
    setSelectedOptions(answers[currentQuestion.id] || []);
  }, [currentQuestion?.id, answers]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelect = option => {
    if (!currentQuestion) return;
    if (currentQuestion.allowMultiple) {
      setSelectedOptions(prev =>
        prev.includes(option)
          ? prev.filter(i => i !== option)
          : [...prev, option],
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  const handleNext = () => {
    if (!currentQuestion || !selectedOptions.length) return;

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: currentQuestion.allowMultiple
        ? selectedOptions
        : [selectedOptions[0]],
    };
    setAnswers(nextAnswers);

    if (currentIndex === questions.length - 1) {
      submitQuiz(nextAnswers);
      return;
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(i => i + 1);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleBack = () => {
    if (currentIndex === 0 || !currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: currentQuestion.allowMultiple
        ? selectedOptions
        : selectedOptions.slice(0, 1),
    }));
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(i => i - 1);
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

  const handleDone = () => {
    if (onQuizCompleted) {
      onQuizCompleted();
      return;
    }
    handleRestart();
  };

  const submitQuiz = async nextAnswers => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const questionTextById = new Map(
        questions.map(q => [String(q.id), q.text]),
      );
      const payload = Object.entries(nextAnswers).map(([questionId, value]) => {
        const numericId = Number(questionId);
        const questionText = questionTextById.get(String(questionId));
        return {
          questionId: Number.isNaN(numericId) ? questionId : numericId,
          question: questionText || "",
          selectedOptions: (Array.isArray(value) ? value : [value]).map(
            option => String(option),
          ),
        };
      });
      const requestBody = { answers: payload };
      console.log("Quiz submit payload:", requestBody);
      const response = await api.post("/quiz/submit", requestBody);
      console.log("Quiz submitted successfully", response.data);
      setCompleted(true);
    } catch (err) {
      console.error(
        "Quiz submission error:",
        err?.response?.data || err?.message || err,
      );
      Alert.alert(
        "Quiz submission failed",
        err?.response?.data?.message || err?.message || "Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.stateText}>Loading quiz…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Couldn't load quiz</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setError("");
              setLoading(true);
              setQuestions([]);
              setCurrentIndex(0);
              setAnswers({});
              setSelectedOptions([]);
              setCompleted(false);
              setSubmitting(false);
              api
                .get("/quiz/questions")
                .then(response => {
                  const normalized = normalizeQuestions(response?.data ?? []);
                  if (!normalized.length) {
                    throw new Error("No quiz questions available.");
                  }
                  setQuestions(normalized);
                })
                .catch(err => {
                  setError(err?.message || "Failed to load quiz questions.");
                })
                .finally(() => setLoading(false));
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>No quiz available</Text>
          <Text style={styles.stateText}>Please try again later.</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {questions.map((q, idx) => (
            <View key={q.id} style={styles.summaryRow}>
              <View style={styles.summaryIndexBadge}>
                <Text style={styles.summaryIndexText}>{idx + 1}</Text>
              </View>
              <View style={styles.summaryTextBlock}>
                <Text style={styles.summaryQ} numberOfLines={2}>
                  {q.text}
                </Text>
                <Text style={styles.summaryA}>
                  {formatAnswer(q, answers[q.id])}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.completedFooter}>
          <TouchableOpacity
            style={styles.restartBtn}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <Text style={styles.restartBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Quiz Screen ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />

      {/* ── Purple Header Block ── */}
      <View style={styles.header}>
        {/* Progress bar inside header */}
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.stepLabel}>
            {currentIndex + 1}/{questions.length}
          </Text>
        </View>

        {/* Question card floating on header */}
        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
          <Text style={styles.questionCategoryLabel}>Question</Text>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
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
          const isSelected = selectedOptions.includes(option.value);
          const label = OPTION_LABELS[i] || String(i + 1);
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionRow, isSelected && styles.optionRowSelected]}
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.75}
            >
              {/* Letter badge */}
              <View
                style={[
                  styles.letterBadge,
                  isSelected && styles.letterBadgeSelected,
                ]}
              >
                <Text
                  style={[
                    styles.letterText,
                    isSelected && styles.letterTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </View>

              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.label}
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
          style={[
            styles.backBtn,
            (currentIndex === 0 || submitting) && styles.backBtnDisabled,
          ]}
          onPress={handleBack}
          disabled={currentIndex === 0 || submitting}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.backBtnText,
              currentIndex === 0 && styles.backBtnTextDisabled,
            ]}
          >
            ←
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextBtn,
            (!selectedOptions.length || submitting) && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedOptions.length || submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {submitting
              ? "Submitting..."
              : currentIndex === questions.length - 1
                ? "Finish"
                : "Next"}
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
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  stateTitle: {
    fontFamily: "System",
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
  },
  stateText: {
    fontFamily: "System",
    fontSize: 14,
    color: TEXT_MID,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    backgroundColor: PURPLE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "700",
    color: WHITE,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: "#3B82F6",
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 36, // extra bottom so card overlaps
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
    borderColor: PURPLE_DARK,
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
    color: PURPLE_DARK,
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
    backgroundColor: PURPLE_DARK,
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
