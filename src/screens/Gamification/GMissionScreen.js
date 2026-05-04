import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { buildMission } from './gamificationData.js';

const BLUE = '#1689EA';
const DEEP_BLUE = '#0474D8';
const NAVY = '#08224A';
const YELLOW = '#FFD84D';
const GREEN = '#22C55E';
const RED = '#EF4444';
const QUESTION_SECONDS = 20;
const PASSING_ACCURACY = 70;

const fallbackCategory = {
  label: 'Mission',
  icon: 'graduation-cap',
  family: 'FontAwesome5',
  color: BLUE,
};

function triggerHaptic(type) {
  if (type === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => Vibration.vibrate(70));
    return;
  }

  if (type === 'error') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => Vibration.vibrate([0, 80, 40, 120]));
    return;
  }

  if (type === 'complete') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => Vibration.vibrate([0, 90, 50, 150]));
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => Vibration.vibrate(120));
    }, 180);
    return;
  }

  Haptics.selectionAsync().catch(() => Vibration.vibrate(25));
}

function MissionIcon({ category, size = 28, color = '#FFFFFF' }) {
  if (category?.family === 'Ionicons') {
    return <Ionicons name={category.icon} size={size} color={color} />;
  }

  if (category?.family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={category.icon} size={size} color={color} />;
  }

  return <FontAwesome5 name={category?.icon || 'graduation-cap'} size={size - 4} color={color} />;
}

function CurrencyPill({ points, badges }) {
  return (
    <View style={styles.currencyPill}>
      <Ionicons name="diamond" size={17} color="#A8DFFB" />
      <Text style={styles.currencyText}>{badges * 250}</Text>
      <View style={styles.currencyDivider} />
      <View style={styles.coinIcon}>
        <Text style={styles.coinIconText}>$</Text>
      </View>
      <Text style={styles.currencyText}>{points.toLocaleString()}</Text>
    </View>
  );
}

function OptionCard({ option, selected, checked, correct, wrong, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.answerCard,
        selected && !checked && styles.answerSelected,
        correct && styles.answerCorrect,
        wrong && styles.answerWrong,
      ]}
      activeOpacity={0.84}
      disabled={checked}
      onPress={onPress}
    >
      <Text
        style={[
          styles.answerText,
          selected && !checked && styles.answerSelectedText,
          (correct || wrong) && styles.answerFeedbackText,
        ]}
      >
        {option}
      </Text>
      {correct ? <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" /> : null}
      {wrong ? <Ionicons name="close-circle" size={24} color="#FFFFFF" /> : null}
    </TouchableOpacity>
  );
}

function MiniMockup({ label, active }) {
  return (
    <View style={[styles.mockupTile, active && styles.mockupTileActive]}>
      <Text style={[styles.mockupLabel, active && styles.mockupLabelActive]}>{label}</Text>
      <View style={[styles.mockupHero, active && styles.mockupHeroActive]} />
      <View style={styles.mockupLine} />
      <View style={[styles.mockupLine, { width: '58%' }]} />
      <View style={[styles.mockupButton, active && styles.mockupButtonActive]} />
    </View>
  );
}

function QuestionVisual({ question }) {
  if (question.type === 'imageChoice') {
    return (
      <View style={styles.imageChoiceRow}>
        <MiniMockup label="A" active={false} />
        <MiniMockup label="B" active />
      </View>
    );
  }

  if (question.type === 'matching') {
    return (
      <View style={styles.matchingPreview}>
        {['Term', 'Meaning', 'Reward'].map((item, index) => (
          <View key={item} style={styles.matchingRow}>
            <View style={styles.matchChip}>
              <Text style={styles.matchChipText}>{item}</Text>
            </View>
            <View style={styles.matchLine} />
            <View style={[styles.matchChip, styles.matchChipRight]}>
              <Text style={styles.matchChipText}>{index === 0 ? 'Action' : index === 1 ? 'Result' : 'XP'}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (question.type === 'sorting') {
    return (
      <View style={styles.sortPreview}>
        {['1  Learn', '2  Practice', '3  Check', '4  Improve'].map((item) => (
          <View key={item} style={styles.sortRow}>
            <Ionicons name="reorder-three" size={20} color="#94A3B8" />
            <Text style={styles.sortText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (question.type === 'checkpoint') {
    return (
      <View style={styles.chestPreview}>
        <View style={styles.chestLid} />
        <View style={styles.chestBody}>
          <Ionicons name="lock-open" size={32} color={NAVY} />
        </View>
        <Text style={styles.chestPreviewText}>Unlock next level</Text>
      </View>
    );
  }

  return null;
}

function getAccuracy(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function getQuestionReward({ question, secondsLeft, nextStreak, isCorrect }) {
  if (!isCorrect) {
    return { baseXp: 0, timeBonus: 0, streakBonus: 0, totalXp: 0 };
  }

  const timeBonus = Math.max(0, Math.floor(secondsLeft / 5) * 2);
  const streakBonus = nextStreak >= 2 ? Math.min(24, nextStreak * 3) : 0;

  return {
    baseXp: question.reward,
    timeBonus,
    streakBonus,
    totalXp: question.reward + timeBonus + streakBonus,
  };
}

function getAchievementLabel({ accuracy, bestStreak, passed }) {
  if (!passed) return 'Practice Run';
  if (accuracy === 100) return 'Perfect Round';
  if (bestStreak >= 5) return 'Hot Streak';
  if (accuracy >= 85) return 'Sharp Solver';
  return 'Level Clear';
}

export default function GMissionScreen({ navigation, route }) {
  const category = route?.params?.category || fallbackCategory;
  const mission = useMemo(() => {
    const builtMission = buildMission(category);
    const routeLevels = route?.params?.levels;

    if (!Array.isArray(routeLevels) || routeLevels.length === 0) {
      return builtMission;
    }

    return {
      ...builtMission,
      levels: builtMission.levels.map((level, index) => ({
        ...level,
        title: routeLevels[index] || level.title,
      })),
    };
  }, [category, route?.params?.levels]);
  const initialLevel = Math.min(Math.max((route?.params?.currentLevel || 1) - 1, 0), mission.levels.length - 1);
  const [levelIndex, setLevelIndex] = useState(initialLevel);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [timeBonusXp, setTimeBonusXp] = useState(0);
  const [streakBonusXp, setStreakBonusXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [questionResults, setQuestionResults] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [levelPassed, setLevelPassed] = useState(false);
  const [totalPoints, setTotalPoints] = useState(route?.params?.totalPoints ?? 20);
  const [earnedBadges, setEarnedBadges] = useState(route?.params?.earnedBadges ?? 4);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);

  const badgeScale = useRef(new Animated.Value(0.68)).current;
  const badgeGlow = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  const level = mission.levels[levelIndex];
  const isLastQuestion = questionIndex >= level.questions.length - 1;
  const question = level.questions[Math.min(questionIndex, level.questions.length - 1)];
  const progressPct = ((Math.min(questionIndex, level.questions.length - 1) + 1) / level.questions.length) * 100;
  const selectedCorrect = question ? selectedAnswer === question.correctAnswer : false;
  const accuracyPreview = getAccuracy(correctCount, questionResults.length);

  useEffect(() => {
    setSecondsLeft(QUESTION_SECONDS);
  }, [question.id]);

  useEffect(() => {
    if (checked || completed) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          resolveQuestion(null, true);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [checked, completed, question.id]);

  useEffect(() => {
    if (!completed) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(badgeGlow, {
          toValue: 1,
          duration: 720,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(badgeGlow, {
          toValue: 0,
          duration: 720,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.spring(badgeScale, {
      toValue: 1,
      friction: 5,
      tension: 95,
      useNativeDriver: true,
    }).start();
  }, [badgeGlow, badgeScale, completed]);

  const handleSelect = (option) => {
    if (checked || completed) return;

    setSelectedAnswer(option);
    triggerHaptic('selection');
  };

  const completeLevel = ({ nextCorrectCount, nextEarnedXp, nextBestStreak, nextResults }) => {
    const accuracy = getAccuracy(nextCorrectCount, level.questions.length);
    const passed = accuracy >= PASSING_ACCURACY;
    const perfectBonus = nextCorrectCount === level.questions.length ? 100 : 0;
    const clearBonus = passed ? level.reward : Math.floor(level.reward * 0.25);
    const streakMasteryBonus = nextBestStreak >= 5 ? 50 : 0;
    const totalAward = nextEarnedXp + clearBonus + perfectBonus + streakMasteryBonus;

    setTotalPoints((points) => points + totalAward);
    setEarnedBadges((badges) => badges + (passed ? 1 : 0));
    setQuestionResults(nextResults);
    setLevelPassed(passed);
    setCompleted(true);
    triggerHaptic('complete');
  };

  const resolveQuestion = (answer, timedOut = false) => {
    if (checked || completed) return;

    const isCorrect = answer === question.correctAnswer;
    const nextStreak = isCorrect ? currentStreak + 1 : 0;
    const nextBestStreak = Math.max(bestStreak, nextStreak);
    const reward = getQuestionReward({
      question,
      secondsLeft: timedOut ? 0 : secondsLeft,
      nextStreak,
      isCorrect,
    });
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const nextEarnedXp = earnedXp + reward.totalXp;
    const nextTimeBonusXp = timeBonusXp + reward.timeBonus;
    const nextStreakBonusXp = streakBonusXp + reward.streakBonus;
    const result = {
      questionId: question.id,
      answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timedOut,
      secondsLeft: timedOut ? 0 : secondsLeft,
      streak: nextStreak,
      ...reward,
    };
    const nextResults = [...questionResults, result];

    setSelectedAnswer(answer);
    setChecked(true);
    setCurrentStreak(nextStreak);
    setBestStreak(nextBestStreak);
    setLastResult(result);
    setQuestionResults(nextResults);

    if (isCorrect) {
      setCorrectCount(nextCorrectCount);
      setEarnedXp(nextEarnedXp);
      setTimeBonusXp(nextTimeBonusXp);
      setStreakBonusXp(nextStreakBonusXp);
      triggerHaptic('success');
    } else {
      triggerHaptic('error');
    }

    if (isLastQuestion) {
      setTimeout(() => completeLevel({
        nextCorrectCount,
        nextEarnedXp,
        nextBestStreak,
        nextResults,
      }), 850);
    }
  };

  const handleCheck = () => {
    if (!selectedAnswer || checked || completed) return;
    resolveQuestion(selectedAnswer);
  };

  const handleNext = () => {
    if (!checked || completed) return;
    if (isLastQuestion) return;

    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setChecked(false);
    setLastResult(null);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
  };

  const handleNextLevel = () => {
    if (!levelPassed) {
      setQuestionIndex(0);
      setSelectedAnswer(null);
      setChecked(false);
      setCorrectCount(0);
      setEarnedXp(0);
      setTimeBonusXp(0);
      setStreakBonusXp(0);
      setCurrentStreak(0);
      setBestStreak(0);
      setQuestionResults([]);
      setLastResult(null);
      setCompleted(false);
      setLevelPassed(false);
      badgeScale.setValue(0.68);
      badgeGlow.setValue(0);
      return;
    }

    if (levelIndex >= mission.levels.length - 1) {
      navigation.goBack();
      return;
    }

    setLevelIndex((index) => index + 1);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setCorrectCount(0);
    setEarnedXp(0);
    setTimeBonusXp(0);
    setStreakBonusXp(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setQuestionResults([]);
    setLastResult(null);
    setCompleted(false);
    setLevelPassed(false);
    badgeScale.setValue(0.68);
    badgeGlow.setValue(0);
  };

  const handleLeaderboardPress = () => {
    triggerHaptic('selection');
  };

  const buttonLabel = checked
    ? isLastQuestion
      ? 'Finishing...'
      : 'Next Question'
    : 'Check Answer';

  if (completed) {
    const accuracy = Math.round((correctCount / level.questions.length) * 100);
    const perfectBonus = correctCount === level.questions.length ? 100 : 0;
    const clearBonus = levelPassed ? level.reward : Math.floor(level.reward * 0.25);
    const streakMasteryBonus = bestStreak >= 5 ? 50 : 0;
    const totalAward = earnedXp + clearBonus + perfectBonus + streakMasteryBonus;
    const achievementLabel = getAchievementLabel({ accuracy, bestStreak, passed: levelPassed });
    const nextLevelTitle = levelPassed
      ? mission.levels[levelIndex + 1]?.title || 'All missions complete'
      : `Retry ${level.title}`;

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={DEEP_BLUE} />
        <LinearGradient colors={['#1E9BFF', DEEP_BLUE, '#056FC9']} style={styles.screen}>
          <ScrollView
            style={styles.completeScroll}
            contentContainerStyle={styles.completeContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.completeBackButton} activeOpacity={0.76} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                <Text style={styles.completeBackText}>Back</Text>
              </TouchableOpacity>
              <CurrencyPill points={totalPoints + 6320} badges={earnedBadges} />
            </View>

            <Animated.View
              style={[
                styles.badgeGlow,
                {
                  opacity: badgeGlow.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.62] }),
                  transform: [
                    {
                      scale: badgeGlow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] }),
                    },
                  ],
                },
              ]}
            />

            <Animated.View style={[styles.levelBadge, { transform: [{ scale: badgeScale }] }]}>
              <View style={[styles.levelBadgeCore, { backgroundColor: mission.topic.color }]}>
                <MissionIcon category={mission.topic} size={52} />
              </View>
              <View style={styles.levelBadgeRibbon}>
                <Ionicons name="trophy" size={22} color={NAVY} />
              </View>
            </Animated.View>

            <Text style={styles.completeTitle}>{levelPassed ? `Level ${level.id} Completed` : 'Practice Round Finished'}</Text>
            <Text style={styles.completeSubtitle}>
              {levelPassed ? `${achievementLabel} badge unlocked` : `Reach ${PASSING_ACCURACY}% to unlock the next level`}
            </Text>

            <View style={styles.resultCard}>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{accuracy}%</Text>
                <Text style={styles.resultLabel}>Accuracy</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>+{totalAward}</Text>
                <Text style={styles.resultLabel}>XP earned</Text>
              </View>
              <View style={styles.resultDivider} />
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{bestStreak}</Text>
                <Text style={styles.resultLabel}>Best streak</Text>
              </View>
            </View>

            <View style={styles.bonusRow}>
              <View style={styles.bonusChip}>
                <Ionicons name="timer" size={15} color={YELLOW} />
                <Text style={styles.bonusText}>+{timeBonusXp} time</Text>
              </View>
              <View style={styles.bonusChip}>
                <Ionicons name="flame" size={15} color="#F97316" />
                <Text style={styles.bonusText}>+{streakBonusXp} streak</Text>
              </View>
              <View style={styles.bonusChip}>
                <Ionicons name={levelPassed ? 'medal' : 'refresh'} size={15} color={levelPassed ? YELLOW : '#BFDBFE'} />
                <Text style={styles.bonusText}>{levelPassed ? '+1 badge' : 'Try again'}</Text>
              </View>
            </View>

            <View style={styles.unlockCard}>
              <Text style={styles.unlockLabel}>{levelPassed ? 'Unlocked next' : 'Next goal'}</Text>
              <Text style={styles.unlockTitle}>{nextLevelTitle}</Text>
            </View>

            <View style={styles.completeActions}>
              <TouchableOpacity style={[styles.primaryButton, styles.moveOnButton]} activeOpacity={0.86} onPress={handleNextLevel}>
                <Text style={[styles.primaryButtonText, styles.moveOnButtonText]}>
                  {!levelPassed
                    ? 'Retry'
                    : levelIndex >= mission.levels.length - 1
                      ? 'Finish'
                      : 'Next Level'}
                </Text>
                <Ionicons name="arrow-forward" size={24} color={NAVY} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.leaderboardButton} activeOpacity={0.84} onPress={handleLeaderboardPress}>
                <Ionicons name="podium" size={22} color="#FFFFFF" />
                <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={DEEP_BLUE} />
      <LinearGradient colors={['#1E9BFF', DEEP_BLUE, '#056FC9']} style={styles.screen}>
        <View style={styles.playLayout}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.76} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <CurrencyPill points={totalPoints + 6320} badges={earnedBadges} />
          </View>

          <View style={styles.header}>
            <View style={[styles.heroIcon, { backgroundColor: mission.topic.color }]}>
              <MissionIcon category={mission.topic} size={34} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.heroEyebrow}>{mission.topic.label}</Text>
              <Text style={styles.heroTitle}>Level {level.id}: {level.title}</Text>
              <Text style={styles.heroSubtitle}>{mission.topic.subtitle}</Text>
            </View>
          </View>

          <View style={styles.progressPanel}>
            <View style={styles.progressTop}>
              <Text style={styles.progressLabel}>Question {questionIndex + 1}/10</Text>
              <View style={[styles.difficultyPill, level.difficulty === 'Boss' && styles.bossPill]}>
                <Text style={styles.difficultyText}>{level.difficulty}</Text>
              </View>
              <View style={styles.timerPill}>
                <Ionicons name="timer" size={15} color={secondsLeft <= 5 ? RED : NAVY} />
                <Text style={[styles.timerText, secondsLeft <= 5 && styles.timerDanger]}>{secondsLeft}s</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <View style={styles.engineStatsRow}>
              <View style={styles.engineStat}>
                <Ionicons name="checkmark-circle" size={15} color={GREEN} />
                <Text style={styles.engineStatText}>{accuracyPreview}%</Text>
              </View>
              <View style={styles.engineStat}>
                <Ionicons name="flame" size={15} color="#F97316" />
                <Text style={styles.engineStatText}>x{currentStreak}</Text>
              </View>
              <View style={styles.engineStat}>
                <Ionicons name="flash" size={15} color={YELLOW} />
                <Text style={styles.engineStatText}>+{earnedXp}</Text>
              </View>
            </View>
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionTypePill}>
              <Ionicons name={question.type === 'checkpoint' ? 'trophy' : 'game-controller'} size={15} color={BLUE} />
              <Text style={styles.questionTypeText}>{question.type.replace(/([A-Z])/g, ' $1')}</Text>
            </View>
            <Text style={styles.questionText}>{question.prompt}</Text>
            <QuestionVisual question={question} />
          </View>

          <View style={styles.answers}>
            {question.options.map((option) => {
              const selected = selectedAnswer === option;
              const correct = checked && option === question.correctAnswer;
              const wrong = checked && selected && option !== question.correctAnswer;

              return (
                <OptionCard
                  key={option}
                  option={option}
                  selected={selected}
                  checked={checked}
                  correct={correct}
                  wrong={wrong}
                  onPress={() => handleSelect(option)}
                />
              );
            })}
          </View>

          {checked ? (
            <View style={[styles.feedbackCard, selectedCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Ionicons
                name={selectedCorrect ? 'sparkles' : 'alert-circle'}
                size={22}
                color={selectedCorrect ? GREEN : RED}
              />
              <View style={styles.feedbackCopy}>
                <Text style={[styles.feedbackTitle, selectedCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong]}>
                  {selectedCorrect
                    ? `Nice! +${lastResult?.totalXp || question.reward} XP`
                    : lastResult?.timedOut
                      ? 'Time ran out.'
                      : 'Not quite. Try the next one.'}
                </Text>
                <Text style={styles.feedbackText}>
                  {selectedCorrect
                    ? `Base +${lastResult?.baseXp || question.reward} | Time +${lastResult?.timeBonus || 0} | Streak +${lastResult?.streakBonus || 0}`
                    : `Correct answer: ${question.correctAnswer}`}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.rewardPreview}>
              <Ionicons name="flash" size={18} color={YELLOW} />
              <Text style={styles.rewardPreviewText}>Correct answer gives +{question.reward} XP</Text>
            </View>
          )}

        </ScrollView>
        <View style={styles.stickyFooter}>
          <TouchableOpacity
            style={[styles.primaryButton, (!selectedAnswer && !checked) && styles.primaryButtonDisabled]}
            activeOpacity={0.86}
            disabled={(!selectedAnswer && !checked) || (checked && isLastQuestion)}
            onPress={checked && isLastQuestion ? undefined : checked ? handleNext : handleCheck}
          >
            <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
            <Ionicons name={checked ? 'arrow-forward' : 'checkmark'} size={24} color={NAVY} />
          </TouchableOpacity>
        </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DEEP_BLUE,
  },
  screen: {
    flex: 1,
  },
  playLayout: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBackButton: {
    minWidth: 82,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.32)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 12,
  },
  completeBackText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,72,150,0.28)',
  },
  currencyText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginLeft: 6,
  },
  currencyDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 11,
  },
  coinIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F5C542',
    borderWidth: 2,
    borderColor: '#FFDD67',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconText: {
    color: '#B45309',
    fontSize: 15,
    fontWeight: '900',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
    borderColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerCopy: {
    flex: 1,
  },
  heroEyebrow: {
    color: '#BFE4FF',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  heroSubtitle: {
    color: '#D7EDFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  progressPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  progressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 9,
  },
  progressLabel: {
    flex: 1,
    color: NAVY,
    fontSize: 15,
    fontWeight: '900',
  },
  difficultyPill: {
    backgroundColor: '#EAF4FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bossPill: {
    backgroundColor: '#FEF3C7',
  },
  difficultyText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '900',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  timerText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '900',
  },
  timerDanger: {
    color: RED,
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    backgroundColor: '#E8EEF8',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: YELLOW,
  },
  engineStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  engineStat: {
    flex: 1,
    minHeight: 30,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  engineStatText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '900',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#003E83',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  questionTypePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 5,
    marginBottom: 10,
  },
  questionTypeText: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  questionText: {
    color: NAVY,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 27,
  },
  imageChoiceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  mockupTile: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  mockupTileActive: {
    borderColor: GREEN,
    backgroundColor: '#ECFDF5',
  },
  mockupLabel: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  mockupLabelActive: {
    color: '#16A34A',
  },
  mockupHero: {
    height: 38,
    borderRadius: 10,
    backgroundColor: '#CBD5E1',
    marginBottom: 9,
  },
  mockupHeroActive: {
    backgroundColor: '#93C5FD',
  },
  mockupLine: {
    width: '82%',
    height: 7,
    borderRadius: 999,
    backgroundColor: '#CBD5E1',
    marginBottom: 6,
  },
  mockupButton: {
    width: 54,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#94A3B8',
    marginTop: 4,
  },
  mockupButtonActive: {
    backgroundColor: YELLOW,
  },
  matchingPreview: {
    gap: 10,
    marginTop: 18,
  },
  matchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchChip: {
    minWidth: 78,
    borderRadius: 999,
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  matchChipRight: {
    backgroundColor: '#FFF7D6',
  },
  matchChipText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  matchLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  sortPreview: {
    gap: 8,
    marginTop: 18,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 9,
  },
  sortText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '900',
  },
  chestPreview: {
    alignItems: 'center',
    marginTop: 18,
  },
  chestLid: {
    width: 96,
    height: 28,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: YELLOW,
  },
  chestBody: {
    width: 114,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F5B428',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chestPreviewText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
  },
  answers: {
    gap: 8,
  },
  answerCard: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerSelected: {
    borderColor: YELLOW,
    backgroundColor: '#FFF9DB',
  },
  answerCorrect: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  answerWrong: {
    backgroundColor: RED,
    borderColor: '#FCA5A5',
  },
  answerText: {
    flex: 1,
    color: NAVY,
    fontSize: 16,
    fontWeight: '900',
    paddingRight: 10,
  },
  answerSelectedText: {
    color: '#92400E',
  },
  answerFeedbackText: {
    color: '#FFFFFF',
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
    gap: 11,
  },
  feedbackCorrect: {
    backgroundColor: '#ECFDF5',
  },
  feedbackWrong: {
    backgroundColor: '#FEF2F2',
  },
  feedbackCopy: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  feedbackTitleCorrect: {
    color: '#16A34A',
  },
  feedbackTitleWrong: {
    color: RED,
  },
  feedbackText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  rewardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 7,
  },
  rewardPreviewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  primaryButton: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: YELLOW,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 0,
    paddingHorizontal: 18,
  },
  stickyFooter: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: 'rgba(5,111,201,0.96)',
  },
  primaryButtonDisabled: {
    opacity: 0.58,
  },
  primaryButtonText: {
    color: NAVY,
    fontSize: 21,
    fontWeight: '900',
  },
  completeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  moveOnButton: {
    flex: 1.35,
    marginTop: 0,
    minHeight: 62,
    paddingHorizontal: 12,
  },
  moveOnButtonText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  leaderboardButton: {
    flex: 1,
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.38)',
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
  },
  leaderboardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.36)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 12,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  completeScroll: {
    flex: 1,
  },
  completeContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 120,
  },
  badgeGlow: {
    position: 'absolute',
    top: 164,
    alignSelf: 'center',
    width: 198,
    height: 198,
    borderRadius: 99,
    backgroundColor: YELLOW,
  },
  levelBadge: {
    alignSelf: 'center',
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: YELLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 78,
    shadowColor: '#003E83',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 26,
    elevation: 12,
  },
  levelBadgeCore: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFFFFF',
  },
  levelBadgeRibbon: {
    position: 'absolute',
    right: 22,
    bottom: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: YELLOW,
  },
  completeTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 32,
  },
  completeSubtitle: {
    color: '#D7EDFF',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultItem: {
    flex: 1,
    alignItems: 'center',
  },
  resultValue: {
    color: NAVY,
    fontSize: 24,
    fontWeight: '900',
  },
  resultLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 5,
  },
  resultDivider: {
    width: 1,
    height: 66,
    backgroundColor: '#E2E8F0',
  },
  bonusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  bonusChip: {
    flex: 1,
    minHeight: 38,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  bonusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  unlockCard: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.26)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 6,
  },
  unlockLabel: {
    color: '#BFE4FF',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  unlockTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
});
