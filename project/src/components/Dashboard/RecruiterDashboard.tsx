import React from 'react';
import { useMockData } from '../../hooks/useMockData';
import { 
  Plus,
  Users,
  Eye,
  Send,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Edit3,
  BarChart3,
  MessageSquare,
  Briefcase
} from 'lucide-react';

interface RecruiterDashboardProps {
  onNavigate: (page: string) => void;
}

export function RecruiterDashboard({ onNavigate }: RecruiterDashboardProps) {
  const { recruiter, jobs, applications, analytics } = useMockData();

  const myJobs = jobs.filter(job => job.recruiterId === recruiter.id);
  const myApplications = applications.filter(app => 
    myJobs.some(job => job.id === app.jobId)
  );

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Bonjour, {recruiter.firstName} !
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {recruiter.company.name} • Tableau de bord recruteur
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('create-job')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Publier une offre
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {myJobs.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Offres actives</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.applicationsReceived}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Candidatures</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.jobViews}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vues totales</p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics.successRate}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taux de réponse</p>
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
                  Candidatures récentes
                </h2>
                <button
                  onClick={() => onNavigate('applications')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  Voir toutes
                  <ExternalLink className="ml-1 w-4 h-4" />
                </button>
              </div>

              {myApplications.length > 0 ? (
                <div className="space-y-4">
                  {myApplications.slice(0, 3).map((application) => {
                    const job = jobs.find(j => j.id === application.jobId);
                    if (!job) return null;

                    return (
                      <div key={application.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  Candidature pour {job.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Candidat ID: {application.candidateId}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(application.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                              {getStatusLabel(application.status)}
                            </span>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Aucune candidature reçue pour le moment
                  </p>
                  <button
                    onClick={() => onNavigate('create-job')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publier une première offre
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* My Job Offers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mes offres d'emploi
                </h2>
                <button
                  onClick={() => onNavigate('my-jobs')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  Gérer toutes
                  <ExternalLink className="ml-1 w-4 h-4" />
                </button>
              </div>

              {myJobs.length > 0 ? (
                <div className="space-y-4">
                  {myJobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {job.type}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(job.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center text-green-600 dark:text-green-400">
                              <Users className="w-4 h-4 mr-1" />
                              {job.applications.length} candidatures
                            </span>
                            <span className="flex items-center text-blue-600 dark:text-blue-400">
                              <Eye className="w-4 h-4 mr-1" />
                              {Math.floor(Math.random() * 500) + 100} vues
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Vous n'avez pas encore publié d'offres
                  </p>
                  <button
                    onClick={() => onNavigate('create-job')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Créer ma première offre
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profil entreprise
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {recruiter.company.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {recruiter.company.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {recruiter.company.industry}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recruiter.company.description}
              </p>
              <button
                onClick={() => onNavigate('company-profile')}
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Modifier le profil
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
                onClick={() => onNavigate('create-job')}
                className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
              >
                <span className="flex items-center text-blue-700 dark:text-blue-300">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle offre
                </span>
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </button>
              <button
                onClick={() => onNavigate('candidates')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center text-gray-900 dark:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Parcourir les candidats
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onNavigate('messages')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center text-gray-900 dark:text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => onNavigate('analytics')}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="flex items-center text-gray-900 dark:text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Performance Tips */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
              💡 Conseil recruteur
            </h3>
            <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
              Les offres avec une description détaillée et des critères précis 
              reçoivent 40% plus de candidatures qualifiées !
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cette semaine
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Nouvelles vues</span>
                <span className="font-medium text-gray-900 dark:text-white">+147</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Candidatures</span>
                <span className="font-medium text-gray-900 dark:text-white">+8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Messages</span>
                <span className="font-medium text-gray-900 dark:text-white">+12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}