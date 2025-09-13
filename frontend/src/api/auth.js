const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

export const loginUser = async (email, password) => {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to login');
  }
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
   if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to sign up');
  }
  return response.json();
};

