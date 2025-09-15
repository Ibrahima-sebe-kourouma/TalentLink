import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { HomePage } from './components/Home/HomePage';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { CandidateDashboard } from './components/Dashboard/CandidateDashboard';
import { RecruiterDashboard } from './components/Dashboard/RecruiterDashboard';
import { JobsPage } from './components/Jobs/JobsPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!user) {
      switch (currentPage) {
        case 'login':
          return <LoginForm onNavigate={setCurrentPage} />;
        case 'register':
          return <RegisterForm onNavigate={setCurrentPage} />;
        case 'jobs':
          return <JobsPage onNavigate={setCurrentPage} />;
        default:
          return <HomePage onNavigate={setCurrentPage} />;
      }
    }

    switch (currentPage) {
      case 'dashboard':
        if (user.role === 'candidate') {
          return <CandidateDashboard onNavigate={setCurrentPage} />;
        } else if (user.role === 'recruiter') {
          return <RecruiterDashboard onNavigate={setCurrentPage} />;
        }
        return <div>Admin Dashboard (Coming Soon)</div>;
      case 'jobs':
        return <JobsPage onNavigate={setCurrentPage} />;
      case 'messages':
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-600 dark:text-gray-400">Messages - Coming Soon</p></div>;
      case 'notifications':
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-600 dark:text-gray-400">Notifications - Coming Soon</p></div>;
      case 'profile':
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-600 dark:text-gray-400">Profile - Coming Soon</p></div>;
      case 'settings':
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-600 dark:text-gray-400">Settings - Coming Soon</p></div>;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  const showNavbar = currentPage !== 'login' && currentPage !== 'register';
  const showFooter = !user || currentPage === 'home';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {showNavbar && <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />}
      <main className={showNavbar ? '' : 'min-h-screen'}>
        {renderContent()}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;