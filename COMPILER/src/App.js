import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Problems = React.lazy(() => import('./pages/Problems'));
const ProblemDetail = React.lazy(() => import('./pages/ProblemDetail'));
const Contests = React.lazy(() => import('./pages/Contests'));
const ContestDetail = React.lazy(() => import('./pages/ContestDetail'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Submissions = React.lazy(() => import('./pages/Submissions'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const Compiler = React.lazy(() => import('./pages/Compiler'));
const Admin = React.lazy(() => import('./pages/Admin'));

// Protected Route Component
const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/problems" element={<Problems />} />
                  <Route path="/problems/:id" element={<ProblemDetail />} />
                  <Route path="/contests" element={<Contests />} />
                  <Route path="/contests/:id" element={<ContestDetail />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/compiler" element={<Compiler />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/submissions" element={
                    <ProtectedRoute>
                      <Submissions />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Admin />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route - 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
            
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;