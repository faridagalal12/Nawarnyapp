const BASE_URL = "https://your-api-url.com"; // 

export const signUp = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const text = await response.text();
  console.log("Server Response:", text);

  if (!response.ok) {
    throw new Error("Sign up failed");
  }

  return JSON.parse(text);
};

export const verifyAccount = async (email, code) => {
  const response = await fetch(`${BASE_URL}/auth/verify-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Verification failed");
  }

  return data; // must return token
};