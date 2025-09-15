import { useState, useEffect } from 'react';
import { JobOffer, Application, Message, Notification, Analytics, Candidate, Recruiter, PortfolioItem } from '../types';

// Mock data
const mockJobs: JobOffer[] = [
  {
    id: '1',
    title: 'Développeur Frontend React',
    description: 'Rejoignez notre équipe pour développer des interfaces utilisateur modernes avec React et TypeScript.',
    company: 'TechCorp',
    location: 'Paris, France',
    type: 'emploi',
    domain: 'Développement Web',
    skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
    requirements: ['3+ années d\'expérience', 'Maîtrise de React', 'Connaissance en UI/UX'],
    salary: '45-55k€',
    publishedAt: '2024-01-15',
    recruiterId: '1',
    applications: [],
    isActive: true
  },
  {
    id: '2',
    title: 'Stage Marketing Digital',
    description: 'Opportunité de stage de 6 mois dans une startup innovante pour développer vos compétences en marketing digital.',
    company: 'StartupPro',
    location: 'Lyon, France',
    type: 'stage',
    domain: 'Marketing',
    skills: ['SEO', 'Google Analytics', 'Social Media', 'Content Marketing'],
    requirements: ['Étudiant en marketing', 'Créativité', 'Autonomie'],
    salary: '600€/mois',
    publishedAt: '2024-01-12',
    recruiterId: '2',
    applications: [],
    isActive: true
  },
  {
    id: '3',
    title: 'Alternance Data Science',
    description: 'Formation en alternance pour devenir Data Scientist avec des projets concrets sur l\'IA et le Machine Learning.',
    company: 'DataFlow',
    location: 'Bordeaux, France',
    type: 'alternance',
    domain: 'Data Science',
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    requirements: ['Formation en cours', 'Bases en programmation', 'Mathématiques'],
    salary: '1200€/mois',
    publishedAt: '2024-01-10',
    recruiterId: '3',
    applications: [],
    isActive: true
  }
];

const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    candidateId: '1',
    status: 'pending',
    appliedAt: '2024-01-16',
    coverLetter: 'Je suis très intéressé par ce poste...'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    receiverId: '1',
    content: 'Bonjour, nous avons examiné votre candidature et souhaitons organiser un entretien.',
    timestamp: '2024-01-16T10:30:00Z',
    read: false,
    applicationId: '1'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Nouvelle candidature',
    message: 'Vous avez reçu une réponse pour votre candidature chez TechCorp',
    type: 'application',
    read: false,
    createdAt: '2024-01-16T10:30:00Z'
  }
];

const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'Application E-commerce React',
    description: 'Application complète de e-commerce développée avec React, Node.js et MongoDB',
    link: 'https://github.com/user/ecommerce-app',
    image: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'github',
    tags: ['React', 'Node.js', 'MongoDB', 'E-commerce']
  },
  {
    id: '2',
    title: 'Design System UI/UX',
    description: 'Création d\'un système de design complet pour une startup fintech',
    link: 'https://behance.net/project/design-system',
    image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'behance',
    tags: ['UI/UX', 'Design System', 'Figma', 'Prototyping']
  }
];

export function useMockData() {
  const [jobs, setJobs] = useState<JobOffer[]>(mockJobs);
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  
  const analytics: Analytics = {
    profileViews: 127,
    applicationsSent: 8,
    applicationsReceived: 24,
    jobViews: 1205,
    messagesReceived: 12,
    successRate: 25
  };

  const mockCandidate: Candidate = {
    id: '1',
    email: 'candidate@example.com',
    firstName: 'Marie',
    lastName: 'Dubois',
    role: 'candidate',
    avatar: 'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
    profile: {
      phone: '+33 6 12 34 56 78',
      location: 'Paris, France',
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX Design'],
      experience: '2 années d\'expérience en développement web',
      education: 'Master en Informatique - Université Paris-Saclay',
      portfolio: mockPortfolioItems,
      resume: 'cv-marie-dubois.pdf',
      bio: 'Développeuse passionnée par les nouvelles technologies et l\'expérience utilisateur.'
    },
    applications: mockApplications
  };

  const mockRecruiter: Recruiter = {
    id: '2',
    email: 'recruiter@techcorp.com',
    firstName: 'Pierre',
    lastName: 'Martin',
    role: 'recruiter',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
    company: {
      name: 'TechCorp',
      description: 'Entreprise leader dans le développement de solutions technologiques innovantes',
      website: 'https://techcorp.com',
      logo: 'https://images.pexels.com/photos/267371/pexels-photo-267371.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      industry: 'Technologie'
    },
    jobs: [mockJobs[0]]
  };

  const addApplication = (application: Omit<Application, 'id'>) => {
    const newApplication = {
      ...application,
      id: Math.random().toString(36).substr(2, 9)
    };
    setApplications(prev => [...prev, newApplication]);
    
    // Update job applications count
    setJobs(prev => prev.map(job => 
      job.id === application.jobId 
        ? { ...job, applications: [...job.applications, newApplication] }
        : job
    ));
    
    return newApplication;
  };

  const updateApplicationStatus = (applicationId: string, status: Application['status']) => {
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      )
    );
  };

  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9)
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  return {
    jobs,
    applications,
    messages,
    notifications,
    analytics,
    candidate: mockCandidate,
    recruiter: mockRecruiter,
    addApplication,
    updateApplicationStatus,
    addMessage,
    setJobs,
    setMessages,
    setNotifications
  };
}