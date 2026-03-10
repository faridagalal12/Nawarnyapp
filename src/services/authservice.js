const BASE_URL = "https://nawarny-be.onrender.com/api/v1";

// SIGN UP
export const signUp = async (name, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name:name,
        email: email,
        password: password,
        password_confirmation: password,
      }),
    });

    const data = await response.json();

    console.log("Server Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Sign up failed");
    }

    return data;

  } catch (error) {
  console.log("SIGNUP ERROR:", error);
  Alert.alert("Sign Up Failed", error.message || "Unknown error");
}
};


// VERIFY ACCOUNT
export const verifyAccount = async (email, code) => {
  try {
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

    console.log("Verification Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    return data; // should return token

  } catch (error) {
    console.log("Verification Error:", error);
    throw error;
  }
};