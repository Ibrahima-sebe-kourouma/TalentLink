import React, { useState } from 'react';
import { useMockData } from '../../hooks/useMockData';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Filter, 
  X, 
  Briefcase,
  Building,
  Euro,
  Users,
  ChevronDown,
  Star,
  Bookmark,
  ExternalLink
} from 'lucide-react';

interface JobsPageProps {
  onNavigate: (page: string) => void;
}

export function JobsPage({ onNavigate }: JobsPageProps) {
  const { jobs, addApplication } = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    domain: '',
    salary: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');

  const domains = [...new Set(jobs.map(job => job.domain))];
  const locations = [...new Set(jobs.map(job => job.location.split(',')[1]?.trim() || job.location))];
  const types = [...new Set(jobs.map(job => job.type))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = !filters.type || job.type === filters.type;
    const matchesLocation = !filters.location || job.location.includes(filters.location);
    const matchesDomain = !filters.domain || job.domain === filters.domain;

    return matchesSearch && matchesType && matchesLocation && matchesDomain;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'company':
        return a.company.localeCompare(b.company);
      case 'location':
        return a.location.localeCompare(b.location);
      default:
        return 0;
    }
  });

  const handleApply = (jobId: string) => {
    addApplication({
      jobId,
      candidateId: '1', // Current user ID
      status: 'pending',
      appliedAt: new Date().toISOString(),
      coverLetter: 'Candidature soumise via la plateforme'
    });
    
    // Show success message (in a real app, use a toast/notification system)
    alert('Candidature envoyée avec succès !');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stage':
        return <Users className="w-4 h-4" />;
      case 'emploi':
        return <Briefcase className="w-4 h-4" />;
      case 'alternance':
        return <Clock className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stage':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'emploi':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'alternance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      location: '',
      domain: '',
      salary: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '') || searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Découvrez les opportunités
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredJobs.length} offres disponibles sur {jobs.length} au total
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par poste, entreprise, compétences..."
            className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                {Object.values(filters).filter(f => f !== '').length + (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-4">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4 mr-1" />
                Effacer les filtres
              </button>
            )}
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Plus récentes</option>
                <option value="company">Par entreprise</option>
                <option value="location">Par lieu</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de contrat
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les types</option>
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Localisation
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Toutes les villes</option>
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Domaine
                </label>
                <select
                  value={filters.domain}
                  onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les domaines</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salaire
                </label>
                <select
                  value={filters.salary}
                  onChange={(e) => setFilters(prev => ({ ...prev, salary: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les salaires</option>
                  <option value="0-30k">Moins de 30k€</option>
                  <option value="30-50k">30k€ - 50k€</option>
                  <option value="50k+">Plus de 50k€</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {job.company.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {job.title}
                          </h2>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                            {getTypeIcon(job.type)}
                            <span className="ml-1">{job.type}</span>
                          </span>
                          {Math.random() > 0.7 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {job.company}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </span>
                          {job.salary && (
                            <span className="flex items-center">
                              <Euro className="w-4 h-4 mr-1" />
                              {job.salary}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(job.publishedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills.slice(0, 4).map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                              +{job.skills.length - 4}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {job.applications.length} candidatures
                          </span>
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Sauvegarder"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onNavigate(`job-${job.id}`)}
                              className="flex items-center px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Voir détails
                            </button>
                            <button
                              onClick={() => handleApply(job.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Postuler
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Load More (if pagination needed) */}
      {sortedJobs.length > 10 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            Charger plus d'offres
          </button>
        </div>
      )}
    </div>
  );
}