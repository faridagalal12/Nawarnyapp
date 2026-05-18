import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY } from "../constants/authKeys";
import { API_BASE_URL } from "./api";

const LOCAL_DEV_BASE_URL = "http://192.168.1.63:3000/api/v1";
const LEGACY_HOSTED_BASE_URL = "https://nawarny-be.onrender.com/api/v1";

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function getAuthHeaders() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function tryRequest(buildConfigs) {
  const headers = await getAuthHeaders();
  let lastError = null;
  let firstNon404Error = null;

  for (const config of buildConfigs) {
    try {
      return await axios({
        timeout: 15000,
        headers,
        ...config,
      });
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      if (status !== 404 && !firstNon404Error) {
        firstNon404Error = error;
      }
    }
  }

  throw firstNon404Error ?? lastError;
}

function subscriptionBaseUrls() {
  return unique([LOCAL_DEV_BASE_URL, API_BASE_URL, LEGACY_HOSTED_BASE_URL]);
}

export async function getCurrentSubscription() {
  const configs = subscriptionBaseUrls().flatMap(baseURL => ([
    { method: "get", url: `${baseURL}/subscriptions/current` },
    { method: "get", url: `${baseURL}/subscription/current` },
  ]));
  return tryRequest(configs);
}

export async function subscribeToPlan(plan) {
  const configs = subscriptionBaseUrls().flatMap(baseURL => ([
    { method: "post", url: `${baseURL}/subscriptions/subscribe`, data: { plan } },
    { method: "post", url: `${baseURL}/subscription/subscribe`, data: { plan } },
  ]));
  return tryRequest(configs);
}
