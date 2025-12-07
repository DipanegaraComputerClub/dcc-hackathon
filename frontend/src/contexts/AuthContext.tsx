'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '@/config/api';

interface User {
  id: string;
  email: string;
  name: string;
  profile_id: string | null;
  business_name: string | null;
  category: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  business_name: string | null;
  business_code: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  generateBusinessCode: () => Promise<string>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  business_name?: string;
  category?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            
            // Load profile data
            const profileResponse = await fetch(`${API_URL}/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setProfile(profileData);
            }
          } else {
            // Token invalid, clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          console.error('Auth check error:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      // Save tokens
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
      
      setUser(data.user);
    } catch (error: any) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/google`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memulai login dengan Google');
      }

      // Redirect to Google OAuth
      window.location.href = data.url;
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      // Return response data (contains needsConfirmation flag)
      return data;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // Refresh profile too
          const profileResponse = await fetch(`${API_URL}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Refresh user error:', error);
      }
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Tidak ada token autentikasi');
    }

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengupdate profil');
      }

      setProfile(result);
      return result;
    } catch (error: any) {
      throw error;
    }
  };

  const generateBusinessCode = async (): Promise<string> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Tidak ada token autentikasi');
    }

    try {
      const response = await fetch(`${API_URL}/profile/generate-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal generate kode bisnis');
      }

      // Refresh profile to get updated business_code
      await refreshUser();
      
      return result.business_code;
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, loginWithGoogle, register, logout, refreshUser, updateProfile, generateBusinessCode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
