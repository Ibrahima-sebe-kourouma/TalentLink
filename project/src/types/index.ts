export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface Candidate extends User {
  role: 'candidate';
  profile: {
    phone?: string;
    location?: string;
    skills: string[];
    experience: string;
    education: string;
    portfolio: PortfolioItem[];
    resume?: string;
    bio?: string;
  };
  applications: Application[];
}

export interface Recruiter extends User {
  role: 'recruiter';
  company: {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    industry?: string;
  };
  jobs: JobOffer[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  link?: string;
  image?: string;
  type: 'project' | 'github' | 'behance' | 'video';
  tags: string[];
}

export interface JobOffer {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: 'stage' | 'emploi' | 'alternance';
  domain: string;
  skills: string[];
  requirements: string[];
  salary?: string;
  publishedAt: string;
  recruiterId: string;
  applications: Application[];
  isActive: boolean;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'interview';
  appliedAt: string;
  coverLetter?: string;
  portfolio?: PortfolioItem[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  applicationId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'message' | 'job' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Analytics {
  profileViews?: number;
  applicationsSent?: number;
  applicationsReceived?: number;
  jobViews?: number;
  messagesReceived?: number;
  successRate?: number;
}