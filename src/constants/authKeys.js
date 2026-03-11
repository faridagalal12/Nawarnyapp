export const TOKEN_KEY = "userToken";
export const USER_EMAIL_KEY = "userEmail";
export const PENDING_VERIFY_EMAIL_KEY = "pendingVerifyEmail";
export const QUIZ_COMPLETED_KEY_PREFIX = "quizCompleted";

export const getQuizCompletedKey = email =>
  `${QUIZ_COMPLETED_KEY_PREFIX}:${(email || "").toLowerCase()}`;
