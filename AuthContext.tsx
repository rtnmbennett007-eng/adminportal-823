import React, { createContext, useContext, useEffect, useState } from 'react';
import { StaffUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: StaffUser | null;
  staffList: StaffUser[];
  isAuthenticated: boolean;
  isLoading: boolean;
  setCurrentUser: (user: StaffUser | null) => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<StaffUser> & { currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshStaff: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStaff = async () => {
    try {
      const list = await api.getStaff();
      setStaffList(list);

      // Check localStorage for authenticated staff session
      const savedStaffId = localStorage.getItem('maplex_active_staff_id');
      const savedToken = localStorage.getItem('maplex_auth_token');

      if (savedStaffId && savedToken) {
        const found = list.find((s) => s.id === savedStaffId);
        if (found) {
          setCurrentUser(found);
          setIsLoading(false);
          return;
        }
      }

      // If no valid session, remain on login screen
      setCurrentUser(null);
    } catch (err) {
      console.error('Failed to load internal staff list:', err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('maplex_active_staff_id', res.user.id);
        localStorage.setItem('maplex_auth_token', res.token || `token-${res.user.id}`);
        return { success: true };
      }
      return { success: false, error: 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid email or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    data: Partial<StaffUser> & { currentPassword?: string; newPassword?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active user session' };
    try {
      const updated = await api.updateStaffUser(currentUser.id, data);
      setCurrentUser(updated);
      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  const logout = () => {
    localStorage.removeItem('maplex_active_staff_id');
    localStorage.removeItem('maplex_auth_token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        staffList,
        isAuthenticated: !!currentUser,
        isLoading,
        setCurrentUser,
        login,
        logout,
        updateProfile,
        refreshStaff: fetchStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
