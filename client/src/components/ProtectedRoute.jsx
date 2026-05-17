import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If not authorized for this role, send to their appropriate dashboard
    return <Navigate to={user.role === 'admin' ? '/admin' : '/journal'} replace />;
  }

  return children;
};

export default ProtectedRoute;
