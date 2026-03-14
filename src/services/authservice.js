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
