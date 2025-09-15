import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  onNavigate: (page: string) => void;
}

export function LoginForm({ onNavigate }: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      onNavigate('dashboard');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-4">
                TL
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bon retour !
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Connectez-vous à votre compte TalentLink
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Se souvenir de moi
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            {/* Demo accounts */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Comptes de démonstration :</p>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'candidate@demo.com', password: 'password' })}
                  className="block w-full text-left text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Candidat : candidate@demo.com
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'recruiter@demo.com', password: 'password' })}
                  className="block w-full text-left text-green-600 dark:text-green-400 hover:underline"
                >
                  Recruteur : recruiter@demo.com
                </button>
              </div>
            </div>
          </form>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Pas encore de compte ?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
              >
                Créez votre compte
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className="hidden lg:block lg:flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <img
          src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"
          alt="Professionals working"
          className="w-full h-full object-cover mix-blend-multiply"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h3 className="text-3xl font-bold mb-4">Rejoignez TalentLink</h3>
            <p className="text-xl text-blue-100 mb-8">
              Connectez votre talent aux meilleures opportunités
            </p>
            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-1">Pour les Candidats</h4>
                <p className="text-sm text-blue-100">Trouvez votre emploi idéal avec notre moteur de recherche avancé</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
                <h4 className="font-semibold mb-1">Pour les Recruteurs</h4>
                <p className="text-sm text-blue-100">Découvrez les meilleurs talents pour votre entreprise</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}