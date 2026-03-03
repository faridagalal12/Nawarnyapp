const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {  // ← change to real path
      email: email.trim(),
      password: password.trim(),
    });

    const data = response.data;
    const token = data.token || data.access_token || data.accessToken; // adjust to real field
    const user  = data.user || data.data?.user || null;

    if (!token) {
      throw new Error('No authentication token received');
    }

    await AsyncStorage.setItem('@auth_token', token);
    if (user) await AsyncStorage.setItem('@auth_user', JSON.stringify(user));

    setToken(token);
    setUser(user);

    return { success: true };
  } catch (err) {
    let message = 'Login failed. Please check your credentials.';

    if (err.response?.status === 401) {
      message = 'Invalid email or password';
    } else if (err.response?.status === 400) {
      message = err.response.data?.message || 'Invalid request';
    } else if (err.response?.data?.message) {
      message = err.response.data.message;
    }

    return { success: false, error: message };
  } finally {
    setLoading(false); // if AuthContext has loading state
  }
};
const forgotPassword = async (email) => {
  try {
    setLoading(true);

    const response = await api.post('/api/auth/forgot-password', {   // ← change path if needed
      email: email.trim(),
    });

    // Most forgot-password endpoints return 200 even if email doesn't exist
    return {
      success: true,
      message: response.data.message || 'Reset link sent! Check your email.',
    };
  } catch (err) {
    let errorMessage = 'Failed to send reset link. Try again later.';
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }

    return { success: false, error: errorMessage };
  } finally {
    setLoading(false);
  }
};

// ... rest of AuthContext (logout, useEffect for loading saved token, etc.)