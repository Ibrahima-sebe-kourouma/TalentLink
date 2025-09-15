import React from 'react';
import { useMockData } from '../../hooks/useMockData';
import { 
  Eye, 
  Send, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Plus,
  Filter,
  Star,
  Users,
  Briefcase
} from 'lucide-react';

interface CandidateDashboardProps {
  onNavigate: (page: string) => void;
}

export function CandidateDashboard({ onNavigate }: CandidateDashboardProps) {
  const { candidate, applications, jobs, analytics } = useMockData();

  const recentJobs = jobs.slice(0, 3);
  const recentApplications = applications.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'interview':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
      case 'interview':
        return 'Entretien';
      default:
        return 'En attente';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={candidate.avatar}
            alt={`${candidate.firstName} ${candidate.lastName}`}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bonjour, {candidate.firstName} !
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Voici un résumé de votre activité récente
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.profileViews}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vues profil</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.applicationsSent}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Candidatures</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.messagesReceived}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Messages</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.successRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taux succès</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Applications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mes candidatures récentes
                </h2>
                <button
                  onClick={() => onNavigate('applications')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  Voir tout
                  <ExternalLink className="ml-1 w-4 h-4" />
                </button>
              </div>

              {recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((application, index) => {
                    const job = jobs.find(j => j.id === application.jobId);
                    if (!job) return null;

                    return (
                      <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {job.company} • {job.location}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Postulé le {new Date(application.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusLabel(application.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Vous n'avez pas encore postulé à d'offres
                  </p>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Découvrir les offres
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  Recommandations pour vous
                </h2>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  Voir plus
                  <ExternalLink className="ml-1 w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {recentJobs.map((job, index) => (
                  <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {job.company}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {job.type}
                          </span>
                          {job.salary && (
                            <span>{job.salary}</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate(`job-${job.id}`)}
                        className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Complétez votre profil
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progression</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Informations de base
                </li>
                <li className="flex items-center text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Compétences
                </li>
                <li className="flex items-center text-yellow-600 dark:text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  Portfolio (2/5 projets)
                </li>
                <li className="flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  Photo de profil
                </li>
              </ul>
              <button
                onClick={() => onNavigate('profile')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Compléter mon profil
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('jobs')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center text-gray-900 dark:text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  Rechercher des offres
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center text-gray-900 dark:text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un projet
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onNavigate('messages')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center text-gray-900 dark:text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Mes messages
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              💡 Conseil du jour
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
              Mettez régulièrement à jour votre portfolio avec vos derniers projets. 
              Les recruteurs apprécient voir l'évolution de vos compétences !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}