'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '../lib/supabase/client';

// Role definitions with permissions
export const ROLES = {
  ADMIN: 'ADMIN',
  ESTIMATOR: 'ESTIMATOR',
  SALES: 'SALES',
  VIEWER: 'VIEWER'
};

// Role-based permissions
export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canAccessMasters: true,
    canCreateEstimate: true,
    canEditEstimate: true,
    canViewEstimate: true,
    canGenerateQuote: true,
    canViewReports: true,
    canAccessSettings: true,
    canDeleteEstimate: true
  },
  [ROLES.ESTIMATOR]: {
    canAccessMasters: false,
    canCreateEstimate: true,
    canEditEstimate: true,
    canViewEstimate: true,
    canGenerateQuote: false,
    canViewReports: false,
    canAccessSettings: false,
    canDeleteEstimate: false
  },
  [ROLES.SALES]: {
    canAccessMasters: false,
    canCreateEstimate: false,
    canEditEstimate: false,
    canViewEstimate: true,
    canGenerateQuote: true,
    canViewReports: false,
    canAccessSettings: false,
    canDeleteEstimate: false
  },
  [ROLES.VIEWER]: {
    canAccessMasters: false,
    canCreateEstimate: false,
    canEditEstimate: false,
    canViewEstimate: true,
    canGenerateQuote: false,
    canViewReports: false,
    canAccessSettings: false,
    canDeleteEstimate: false
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchProfile(user);
      }
      setLoading(false);
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setCurrentUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar_url
      });
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, name, role = 'VIEWER') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id);
    if (error) throw error;
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    return PERMISSIONS[currentUser.role]?.[permission] ?? false;
  };

  const isRole = (role) => {
    return currentUser?.role === role;
  };

  const value = {
    currentUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    isRole,
    ROLES,
    PERMISSIONS
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
