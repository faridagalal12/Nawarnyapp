import api from "./api";

export const signUp = async (name, email, password) => {
  const response = await api.post("/auth/signup", {
    name,
    email,
    password,
  });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post("/auth/verify-otp", {
    email,
    otp,
  });
  return response.data;
};
export const getGamificationStats = async () => {
  const response = await api.get("/gamification/stats");
  return response.data;
};

export const getDailyQuests = async () => {
  const response = await api.get("/gamification/daily-quests");
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/gamification/categories");
  return response.data;
};

export const getLevelQuestions = async (category, level) => {
  const response = await api.get(`/gamification/categories/${category}/levels/${level}/questions`);
  return response.data;
};

export const submitAnswer = async (questionId, selectedIndex) => {
  const response = await api.post("/gamification/submit-answer", { questionId, selectedIndex });
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get("/gamification/leaderboard");
  return response.data;
};