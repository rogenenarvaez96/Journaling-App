import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import JournalDashboard from './pages/JournalDashboard';
import JournalEditor from './pages/JournalEditor';
import Gallery from './pages/Gallery';
import Analytics from './pages/Analytics';
import Archive from './pages/Archive';
import UserSettings from './pages/UserSettings';
import Layout from './components/Layout';

const App = () => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      {/* Admin Route */}
                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      } />

                      {/* Standard User Routes */}
                      <Route path="/journal" element={<JournalDashboard />} />
                      <Route path="/journal/new" element={<JournalEditor />} />
                      <Route path="/journal/:id" element={<JournalEditor />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/archive" element={<Archive />} />
                      <Route path="/settings" element={<UserSettings />} />
                      
                      {/* Default redirect to journal dashboard */}
                      <Route path="*" element={<Navigate to="/journal" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
