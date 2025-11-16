import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CandidateApp from './modules/candidate';
import RecruiterApp from './modules/recruiter';
import AdminApp from './modules/admin';
import CookieBanner from './components/CookieBanner';
import ChatBotEnhanced from './components/chatbot/ChatBotEnhanced';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restaurer l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('talentlink_user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Vérifier que la structure utilisateur est correcte
        if (userData && userData.id && userData.email) {
          setUser(userData);
        } else {
          // Structure incorrecte, nettoyer le localStorage
          console.log('Structure utilisateur incorrecte, nettoyage du localStorage');
          localStorage.removeItem('talentlink_user');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la restauration de l\'utilisateur:', error);
      localStorage.removeItem('talentlink_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour sauvegarder l'utilisateur
  const saveUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('talentlink_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('talentlink_user');
    }
  };

  const handleLogout = () => {
    saveUser(null);
    navigate('/');
  };

  // Afficher un loader pendant la restauration
  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <CookieBanner />
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<LoginPage setUser={saveUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
        {/* Entity workspaces */}
  <Route path="/candidate/*" element={<CandidateApp user={user} onLogout={handleLogout} />} />
  <Route path="/recruiter/*" element={<RecruiterApp user={user} onLogout={handleLogout} />} />
        <Route path="/admin/*" element={<AdminApp user={user} />} />
      </Routes>
      
      {/* Chatbot - Disponible sur toutes les pages si utilisateur connecté */}
      {user && (
        <ChatBotEnhanced 
          userId={user.id} 
          initialOpen={false}
        />
      )}
    </div>
  );
};

export default App;
