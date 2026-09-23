import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/Layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import LiveDashboard from './pages/student/LiveDashboard';
import EnrollmentHub from './pages/student/EnrollmentHub';
import Library from './pages/student/Library';
import Recordings from './pages/student/Recordings';
import Homework from './pages/student/Homework';
import Doubts from './pages/student/Doubts';
import Leaderboard from './pages/student/Leaderboard';
import Profile from './pages/student/Profile';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyHomework from './pages/faculty/FacultyHomework';
import FacultyRecordings from './pages/faculty/FacultyRecordings';
import FacultyDoubts from './pages/faculty/FacultyDoubts';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminClasses from './pages/admin/AdminClasses';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-xs text-slate-400">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function RoleDefaultRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected Routes inside AppLayout */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<RoleDefaultRedirect />} />
            
            {/* Student Experience */}
            <Route path="dashboard" element={<LiveDashboard />} />
            <Route path="enrollment" element={<EnrollmentHub />} />
            <Route path="library" element={<Library />} />
            <Route path="recordings" element={<Recordings />} />
            <Route path="homework" element={<Homework />} />
            <Route path="doubts" element={<Doubts />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />

            {/* Faculty Experience */}
            <Route path="faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="faculty/homework" element={<FacultyHomework />} />
            <Route path="faculty/recordings" element={<FacultyRecordings />} />
            <Route path="faculty/doubts" element={<FacultyDoubts />} />

            {/* Admin Experience */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/enrollments" element={<AdminEnrollments />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/classes" element={<AdminClasses />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
