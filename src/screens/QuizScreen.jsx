import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

// ─── Palette ──────────────────────────────────────────────────────────────────
const PURPLE      = "#3B82F6";
const PURPLE_DARK = "#3550DC";
const WHITE       = "#FFFFFF";
const BG          = "#F0EFF7";
const CARD_BG     = "#FFFFFF";
const BORDER_DEF  = "#E3E2F0";
const TEXT_DARK   = "#1A1A2E";
const TEXT_MID    = "#6B6A8E";
const TEXT_LIGHT  = "#A9A8C8";

// ─── Constants ────────────────────────────────────────────────────────────────
const OPTION_LABELS             = ["A", "B", "C", "D", "E"];
const QUIZ_SUBMIT_URL           = "https://nawarny-be.onrender.com/api/v1/quiz/submit";
const USER_EMAIL_KEY            = "userEmail";
const QUIZ_PROGRESS_KEY_PREFIX  = "quizProgress";
const QUIZ_COMPLETED_KEY_PREFIX = "quizCompleted";

const toSafeKeySegment = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_");

const getScopedKey = (prefix, email) =>
  `${prefix}_${toSafeKeySegment(email)}`;

// ─── Questions ────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    question: "How old are you? 🌱",
    options: ["Under 18 👶", "18–21 🎓", "22–25 🚀", "26–30 💼", "31+ 🌟"],
  },
  {
    id: 2,
    question: "What's your main goal right now? 🎯",
    options: [
      "Build better habits 💪",
      "Improve mindset & confidence 🌈",
      "Advance career/studies 📈",
      "Strengthen relationships ❤️",
      "Feel happier & fulfilled 😊",
    ],
    allowMultiple: true,
  },
  {
    id: 3,
    question: "Which topics excite you most? 🔥",
    options: [
      "Personal development 🌱",
      "Psychology & behavior 🧠",
      "Productivity & focus ⏱️",
      "Relationships & communication 💬",
      "Money & success 💰",
    ],
    allowMultiple: true,
  },
  {
    id: 4,
    question: "What motivates you the most? ⚡",
    options: [
      "Growth & learning 📚",
      "Recognition & praise 🏆",
      "Making an impact 🌍",
      "Stability & peace 🕊️",
      "Freedom & adventure ✈️",
    ],
    allowMultiple: true,
  },
  {
    id: 5,
    question: "How do you prefer to learn? 📖",
    options: [
      "Reading summaries 📝",
      "Listening to audio 🎧",
      "Watching short videos 🎥",
      "Practical challenges 🛠️",
      "Reflecting & journaling ✍️",
    ],
    allowMultiple: true,
  },
  {
    id: 6,
    question: "What's your biggest current challenge? 😓",
    options: [
      "Procrastination ⏳",
      "Stress & overthinking 😰",
      "Low confidence 🙇",
      "Building habits 🔄",
      "Distractions & focus 📱",
    ],
    allowMultiple: true,
  },
  {
    id: 7,
    question: "Which hobbies do you enjoy or want to start? 🎨",
    options: [
      "Reading & podcasts 📚",
      "Exercise & movement 🏃",
      "Creative hobbies (art/music) 🎨",
      "Meditation & mindfulness 🧘",
      "Learning new skills online 💻",
    ],
    allowMultiple: true,
  },
  {
    id: 8,
    question: "What kind of daily content would you love? ✨",
    options: [
      "Quick mindset shifts 🧠",
      "Habit & productivity tips ⏰",
      "Inspiring stories 🌟",
      "Psychology insights 🤔",
      "Motivational nudges 🔥",
    ],
    allowMultiple: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function QuizScreen({ onQuizCompleted }) {
  const [currentIndex, setCurrentIndex]           = useState(0);
  const [answers, setAnswers]                     = useState({});
  const [selectedOptions, setSelectedOptions]     = useState([]);
  const [completed, setCompleted]                 = useState(false);
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [fadeAnim]                                = useState(new Animated.Value(1));

  const storageKeysRef = useRef({ progressKey: null, completedKey: null });

  const currentQuestion = QUESTIONS[currentIndex];
  const progress        = ((currentIndex + 1) / QUESTIONS.length) * 100;
  const formatAnswer    = (answer) =>
    Array.isArray(answer) ? answer.join(", ") : answer || "No answer";

  // ── Block Android hardware back button ─────────────────────────────────────
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => handler.remove();
  }, []);

  // ── Load saved progress on mount ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const userEmail    = await SecureStore.getItemAsync(USER_EMAIL_KEY);
        const progressKey  = getScopedKey(QUIZ_PROGRESS_KEY_PREFIX, userEmail);
        const completedKey = getScopedKey(QUIZ_COMPLETED_KEY_PREFIX, userEmail);

        storageKeysRef.current = { progressKey, completedKey };

        const raw = await SecureStore.getItemAsync(progressKey);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        const savedIndex = typeof parsed.currentIndex === "number"
          ? parsed.currentIndex
          : parseInt(parsed.currentIndex, 10);

        if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < QUESTIONS.length) {
          const savedAnswers = parsed.answers || {};
          setCurrentIndex(savedIndex);
          setAnswers(savedAnswers);

          // FIX: JSON keys are always strings — coerce index to string when reading back
          const restored = savedAnswers[String(savedIndex)];
          if (Array.isArray(restored)) {
            setSelectedOptions(restored);
          } else if (typeof restored === "string" && restored.length > 0) {
            setSelectedOptions([restored]);
          } else {
            setSelectedOptions([]);
          }
        }
      } catch (e) {
        console.error("Failed to load quiz progress:", e);
      } finally {
        setIsLoadingProgress(false);
      }
    };
    load();
  }, []);

  // ── Persist progress to SecureStore ────────────────────────────────────────
  const persistProgress = async (index, savedAnswers) => {
    const { progressKey } = storageKeysRef.current;
    if (!progressKey) return;
    try {
      await SecureStore.setItemAsync(
        progressKey,
        JSON.stringify({ currentIndex: index, answers: savedAnswers })
      );
    } catch (e) {
      console.error("Failed to persist quiz progress:", e);
    }
  };

  // ── Fire-and-forget API submit ─────────────────────────────────────────────
  const fireSubmit = (questionId, options, questionOptions = []) => {
    SecureStore.getItemAsync("userToken")
      .then((token) => {
        const headers      = token ? { Authorization: `Bearer ${token}` } : undefined;
        const optionLabels = options
          .map((opt) => {
            const idx = questionOptions.indexOf(opt);
            return idx >= 0 ? OPTION_LABELS[idx] : opt;
          })
          .filter(Boolean);

        return axios.post(
          QUIZ_SUBMIT_URL,
          { questionId, selectedOptions: optionLabels },
          { headers, timeout: 8000 }
        );
      })
      .catch((err) =>
        console.warn("Quiz submit failed (non-blocking):", err?.message)
      );
  };

  // ── Fade-out → swap content → fade-in ─────────────────────────────────────
  const animateTransition = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  // ── Select / deselect an option ────────────────────────────────────────────
  const handleSelect = (option) => {
    if (currentQuestion.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
    }
  };

  // ── Next ───────────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (!selectedOptions.length || isSubmitting) return;

    // FIX: set submitting at the very top so it's always cleared in the
    // outer finally, even if an early return or throw occurs
    setIsSubmitting(true);

    try {
      const answerValue = currentQuestion.allowMultiple
        ? selectedOptions
        : selectedOptions[0];

      // FIX: use String keys so they survive JSON round-trips
      const newAnswers = { ...answers, [String(currentIndex)]: answerValue };
      setAnswers(newAnswers);

      // Non-blocking API call
      fireSubmit(currentIndex, selectedOptions, currentQuestion.options);

      const { completedKey, progressKey } = storageKeysRef.current;

      if (currentIndex === QUESTIONS.length - 1) {
        // Last question
        if (completedKey) await SecureStore.setItemAsync(completedKey, "true");
        if (progressKey)  await SecureStore.deleteItemAsync(progressKey);
        // FIX: reset isSubmitting BEFORE setting completed so the UI
        // doesn't briefly show a spinner on the summary screen
        setIsSubmitting(false);
        setCompleted(true);
        return;
      }

      // Advance to next question
      const nextIndex  = currentIndex + 1;
      // FIX: read next answer with string key
      const nextAnswer = newAnswers[String(nextIndex)];
      const nextSelected = Array.isArray(nextAnswer)
        ? nextAnswer
        : typeof nextAnswer === "string" && nextAnswer.length > 0
          ? [nextAnswer]
          : [];

      await persistProgress(nextIndex, newAnswers);

      // FIX: release the submit lock BEFORE the animation so the button
      // is re-enabled as soon as the transition starts, not 300ms later
      setIsSubmitting(false);

      animateTransition(() => {
        setCurrentIndex(nextIndex);
        setSelectedOptions(nextSelected);
      });
    } catch (e) {
      // FIX: catch any unexpected error so isSubmitting never stays stuck
      console.error("handleNext error:", e);
      setIsSubmitting(false);
    }
  };

  // ── Back ───────────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (currentIndex === 0 || isSubmitting) return;

    const draftValue = currentQuestion.allowMultiple
      ? selectedOptions
      : selectedOptions[0];

    // FIX: string key consistency
    const draftAnswers = selectedOptions.length
      ? { ...answers, [String(currentIndex)]: draftValue }
      : answers;

    const prevIndex  = currentIndex - 1;
    // FIX: string key
    const prevAnswer = draftAnswers[String(prevIndex)];
    const prevSelected = Array.isArray(prevAnswer)
      ? prevAnswer
      : typeof prevAnswer === "string" && prevAnswer.length > 0
        ? [prevAnswer]
        : [];

    animateTransition(() => {
      setAnswers(draftAnswers);
      setCurrentIndex(prevIndex);
      setSelectedOptions(prevSelected);
    });

    persistProgress(prevIndex, draftAnswers);
  };

  // ── Done ───────────────────────────────────────────────────────────────────
  const handleDone = () => {
    if (onQuizCompleted) onQuizCompleted();
  };

  // ── Loading spinner ────────────────────────────────────────────────────────
  if (isLoadingProgress) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Completed / Summary screen ─────────────────────────────────────────────
  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

        <View style={styles.completedHeader}>
          <Text style={styles.completedHeaderLabel}>QUIZ COMPLETE</Text>
          <Text style={styles.completedTitle}>All done! 🎉</Text>
          <Text style={styles.completedSubtitle}>Here's what you shared:</Text>
        </View>

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
                <Text style={styles.summaryQ} numberOfLines={2}>
                  {q.question}
                </Text>
                {/* FIX: read with string key in summary too */}
                <Text style={styles.summaryA}>
                  {formatAnswer(answers[String(idx)])}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.completedFooter}>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Let's go! 🚀</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.stepLabel}>
            {currentIndex + 1}/{QUESTIONS.length}
          </Text>
        </View>

        <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
          <Text style={styles.questionCategoryLabel}>Question</Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.allowMultiple && (
            <Text style={styles.multipleHint}>Select all that apply</Text>
          )}
        </Animated.View>
      </View>

      {/* Options */}
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
              <View style={[styles.letterBadge, isSelected && styles.letterBadgeSelected]}>
                <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                  {OPTION_LABELS[i]}
                </Text>
              </View>

              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {option}
              </Text>

              {isSelected && (
                <View style={styles.checkDot}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.backBtn, currentIndex === 0 && styles.backBtnDisabled]}
          onPress={handleBack}
          disabled={currentIndex === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.backBtnText, currentIndex === 0 && styles.backBtnTextDisabled]}>
            ←
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextBtn,
            (!selectedOptions.length || isSubmitting) && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedOptions.length || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={WHITE} />
          ) : (
            <Text style={styles.nextBtnText}>
              {currentIndex === QUESTIONS.length - 1 ? "Finish ✓" : "Next →"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: BG },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    backgroundColor: PURPLE,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 36,
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
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },

  questionCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  questionCategoryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: PURPLE,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
    textAlign: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_DARK,
    lineHeight: 26,
    textAlign: "center",
  },
  multipleHint: {
    fontSize: 11,
    color: TEXT_LIGHT,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  optionsScroll:  { flex: 1 },
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
  letterBadgeSelected: { backgroundColor: PURPLE, borderColor: PURPLE },
  letterText:          { fontSize: 13, fontWeight: "700", color: PURPLE_DARK },
  letterTextSelected:  { color: WHITE },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
    color: TEXT_DARK,
    flex: 1,
  },
  optionTextSelected: { color: PURPLE_DARK, fontWeight: "600" },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: WHITE, fontSize: 12, fontWeight: "700" },

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
  backBtnDisabled:     { opacity: 0.35 },
  backBtnText:         { fontSize: 20, color: TEXT_DARK, fontWeight: "600" },
  backBtnTextDisabled: { color: TEXT_LIGHT },
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
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.5,
  },

  completedHeader: {
    backgroundColor: PURPLE,
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  completedHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  completedTitle:    { fontSize: 34, fontWeight: "800", color: WHITE, marginBottom: 6 },
  completedSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.75)" },
  summaryScroll:     { flex: 1 },
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
  summaryIndexText: { fontSize: 13, fontWeight: "700", color: WHITE },
  summaryTextBlock: { flex: 1, gap: 4 },
  summaryQ: {
    fontSize: 12,
    fontWeight: "500",
    color: TEXT_MID,
    lineHeight: 17,
  },
  summaryA: {
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
  doneBtn: {
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
  doneBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: WHITE,
    letterSpacing: 0.5,
  },
});