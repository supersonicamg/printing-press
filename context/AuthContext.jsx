'use client';

import React, { createContext, useContext, useState } from 'react';

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

// Mock users for demo
const MOCK_USERS = {
  admin: {
    id: 1,
    name: 'John Anderson',
    email: 'john@printpress.com',
    role: ROLES.ADMIN,
    avatar: null
  },
  estimator: {
    id: 2,
    name: 'Sarah Mitchell',
    email: 'sarah@printpress.com',
    role: ROLES.ESTIMATOR,
    avatar: null
  },
  sales: {
    id: 3,
    name: 'Mike Roberts',
    email: 'mike@printpress.com',
    role: ROLES.SALES,
    avatar: null
  },
  viewer: {
    id: 4,
    name: 'Emily Chen',
    email: 'emily@printpress.com',
    role: ROLES.VIEWER,
    avatar: null
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Default to admin for demo purposes
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.admin);

  const switchUser = (userType) => {
    setCurrentUser(MOCK_USERS[userType]);
  };

  const hasPermission = (permission) => {
    return PERMISSIONS[currentUser.role]?.[permission] ?? false;
  };

  const isRole = (role) => {
    return currentUser.role === role;
  };

  const value = {
    currentUser,
    switchUser,
    hasPermission,
    isRole,
    allUsers: MOCK_USERS,
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
