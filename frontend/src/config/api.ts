export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dcc-hackathon-backend.vercel.app'

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function for authenticated fetch
export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  });
};