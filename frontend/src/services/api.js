const rawApiUrl = import.meta.env.VITE_API_URL;
const formattedBase = rawApiUrl
  ? (rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`)
  : '';
const API_BASE_URL = formattedBase ? `${formattedBase.replace(/\/+$/, '')}/api` : '/api';

const getHeaders = () => {
  const token = localStorage.getItem('agri_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const apiCall = async (endpoint, method = 'GET', body = null) => {
  try {
    const config = {
      method,
      headers: getHeaders(),
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    if (endpoint !== '/auth/me') {
      console.error(`[API Error] ${method} ${endpoint}:`, error.message);
    }
    throw error;
  }
};
