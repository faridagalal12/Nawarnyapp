export const TOKEN_KEY = "userToken";
export const USER_EMAIL_KEY = "userEmail";
export const PENDING_VERIFY_EMAIL_KEY = "pendingVerifyEmail";
export const QUIZ_COMPLETED_KEY_PREFIX = "quizCompleted";

const sanitizeKeyPart = value =>
  (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_");

export const getQuizCompletedKey = email => {
  const safeEmail = sanitizeKeyPart(email);
  return safeEmail
    ? `${QUIZ_COMPLETED_KEY_PREFIX}_${safeEmail}`
    : QUIZ_COMPLETED_KEY_PREFIX;
};
