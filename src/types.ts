// API TypeScript Types and Interfaces for Competitor Intelligence App

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user_id: string;
  email: string;
}

export interface CompanyDetails {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  setupStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  executiveBrief?: string;
  mainThreats?: string[];
  keyOpportunity?: string;
  description?: string;
  productsOrServices?: string[];
  targetCustomers?: string;
  companyStage?: string;
  companySize?: string;
  briefGeneratedAt?: string;
}

export interface CompanyProfileResponse {
  setupCompleted: boolean;
  company: CompanyDetails | null;
}

export interface CompanySubmitPayload {
  companyName: string;
  website: string;
  industry: string;
  description: string;
  productsOrServices: string[];
  targetCustomers: string;
  companyStage: string;
  companySize: string;
}

export interface SetupStatusResponse {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number; // Integer 0 to 100
  currentStep: string;
  completedAt?: string | null;
  error?: string | null;
}

export interface CompetitorItem {
  id: string;
  name: string;
  website?: string;
  description?: string;
  type: 'DIRECT' | 'INDIRECT' | 'EMERGING' | string;
  source: 'AI_DISCOVERED' | 'MANUAL' | string;
  competitiveScore: number | null;
  confidenceScore?: number;
  productSimilarity?: number;
  customerOverlap?: number;
  marketOverlap?: number;
  businessModelOverlap?: number;
  reason?: string;
  isAccepted: boolean | null;
}

export interface CompetitorsResponse {
  total: number;
  direct: number;
  indirect: number;
  emerging: number;
  competitors: CompetitorItem[];
}

export interface ManualCompetitorPayload {
  name: string;
  website: string;
}
