import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Users, 
  Briefcase, 
  MessageSquare, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Globe,
  Shield,
  Zap
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Recherche Avancée',
      description: 'Trouvez l\'emploi parfait avec nos filtres intelligents par domaine, localisation et compétences.'
    },
    {
      icon: Users,
      title: 'Matching Intelligent',
      description: 'Notre algorithme vous met en relation avec les opportunités qui correspondent à votre profil.'
    },
    {
      icon: MessageSquare,
      title: 'Communication Directe',
      description: 'Échangez directement avec les recruteurs grâce à notre système de messagerie intégré.'
    },
    {
      icon: TrendingUp,
      title: 'Suivi Analytics',
      description: 'Analysez vos performances et optimisez votre stratégie de recherche d\'emploi.'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Développeuse Frontend',
      company: 'TechCorp',
      avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'TalentLink m\'a permis de trouver mon emploi idéal en moins d\'un mois. L\'interface est intuitive et le matching vraiment précis.'
    },
    {
      name: 'Pierre Martin',
      role: 'Recruteur Senior',
      company: 'InnovateLab',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Excellent outil pour dénicher les meilleurs talents. Le système de filtrage nous fait gagner un temps précieux.'
    },
    {
      name: 'Sophie Laurent',
      role: 'Data Scientist',
      company: 'DataFlow',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'Interface moderne et fonctionnalités complètes. J\'ai pu créer un portfolio attrayant et recevoir plusieurs propositions.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Utilisateurs actifs' },
    { value: '5,000+', label: 'Offres d\'emploi' },
    { value: '2,500+', label: 'Entreprises partenaires' },
    { value: '95%', label: 'Taux de satisfaction' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Connectez votre{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  talent
                </span>{' '}
                aux meilleures opportunités
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                TalentLink révolutionne le recrutement en ligne. Trouvez l'emploi idéal ou 
                le candidat parfait grâce à notre plateforme intelligente et moderne.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {!user ? (
                  <>
                    <button
                      onClick={() => onNavigate('register')}
                      className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                    >
                      Commencer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                    >
                      Découvrir les offres
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    Accéder au dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Professional team"
                className="rounded-lg shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Une plateforme complète pour votre réussite
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Découvrez tous les outils dont vous avez besoin pour trouver l'opportunité parfaite 
              ou recruter le talent idéal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon size={24} className="text-blue-600 dark:text-blue-400 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Trois étapes simples pour transformer votre carrière
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Créez votre profil
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Renseignez vos informations, compétences et ajoutez votre portfolio pour vous démarquer.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Trouvez des opportunités
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Utilisez notre moteur de recherche avancé pour découvrir les offres qui correspondent à votre profil.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Connectez-vous
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Échangez directement avec les recruteurs et suivez l'évolution de vos candidatures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Découvrez les témoignages de nos utilisateurs satisfaits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role} chez {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à transformer votre carrière ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui ont déjà trouvé leur voie grâce à TalentLink.
            L'inscription est gratuite et ne prend que quelques minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {!user && (
              <>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  Créer un compte candidat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Recruter des talents
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}