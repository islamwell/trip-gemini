import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { Footer } from './components/common/Footer';
import { Registration } from './components/common/Registration';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from './services/firebase';

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  requireLanguage = true,
  requireRules = true
}: { 
  children: React.ReactNode, 
  requiredRole?: 'admin' | 'participant',
  requireLanguage?: boolean,
  requireRules?: boolean
}) => {
  const { user, role, loading, languageSet, hasSignedRules } = useAuth();
  const location = window.location.pathname;

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin-login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Enforce Onboarding Flow for non-admins (or admins acting as participants)
  // Admins can probably bypass, but let's make everyone sign the rules for compliance.
  if (requireLanguage && !languageSet && location !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  if (requireRules && !hasSignedRules && location !== '/rules' && location !== '/welcome') {
    return <Navigate to="/rules" replace />;
  }

  return <>{children}</>;
};

const AuthenticatedLayout = ({ children, hideNav = false }: { children: React.ReactNode, hideNav?: boolean }) => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {!hideNav && <Navigation />}
        <main className={`flex-1 p-4 lg:p-8 pb-32 md:pb-8 flex flex-col ${hideNav ? 'w-full' : ''}`}>
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
        <Footer />
      </main>
    </div>
  );
};

const Dashboard = React.lazy(() => import('./components/participant/Dashboard').then(m => ({ default: m.Dashboard })));
const TripRules = React.lazy(() => import('./components/participant/TripRules').then(m => ({ default: m.TripRules })));
const Itinerary = React.lazy(() => import('./components/participant/Itinerary').then(m => ({ default: m.Itinerary })));

const Complaints = React.lazy(() => import('./components/participant/Complaints').then(m => ({ default: m.Complaints })));
const Welcome = React.lazy(() => import('./components/participant/Welcome').then(m => ({ default: m.Welcome })));
const Checklist = React.lazy(() => import('./components/participant/Checklist').then(m => ({ default: m.Checklist })));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AutoUpdater } from './components/common/AutoUpdater';

// Main App Component
function AppContent() {
  const { user, completeSignIn } = useAuth();

  useEffect(() => {
    // Check if user is returning from a magic link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        // User opened link on a different device. Prompt for email.
        email = window.prompt('Please provide your email for confirmation');
      }
      if (email) {
        completeSignIn(email, window.location.href).catch(console.error);
      }
    }
  }, [completeSignIn]);

  return (
    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500 font-medium">Loading Application...</div>}>
      <AutoUpdater />
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <PublicLayout><Registration /></PublicLayout>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/welcome" element={
          <ProtectedRoute requireLanguage={false} requireRules={false}>
            <AuthenticatedLayout hideNav={true}>
              <Welcome />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/rules" element={
          <ProtectedRoute requireRules={false}>
            <AuthenticatedLayout hideNav={true}>
              <TripRules />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/itinerary" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Itinerary />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/checklist" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Checklist />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />


        <Route path="/complaints" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <Complaints />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AuthenticatedLayout>
              <AdminDashboard />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin-login" element={
          <ProtectedRoute requireLanguage={false} requireRules={false}>
            <AuthenticatedLayout>
              <AdminLogin />
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;

