import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "../constants/authKeys";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const hostedBaseUrl = "https://nawarny-be.onrender.com/api/v1";

export const API_BASE_URL = (
  configuredBaseUrl && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : hostedBaseUrl
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

if (__DEV__) {
  console.log("API_BASE_URL:", API_BASE_URL);
}

api.interceptors.request.use(async config => {
  const nextConfig = { ...config };
  nextConfig.headers = nextConfig.headers ?? {};

  if (!nextConfig.headers.Authorization) {
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        nextConfig.headers.Authorization = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.log("Failed to load auth token for request:", error?.message);
    }
  }

  return nextConfig;
});

export const setAuthToken = token => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
