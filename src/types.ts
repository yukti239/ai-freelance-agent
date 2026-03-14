export type UserRole = 'employer' | 'freelancer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  name?: string;
  bio?: string;
  role: UserRole;
  pfiScore: number;
  walletBalance: number;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  employerId: string;
  freelancerId?: string;
  totalBudget: number;
  remainingBudget: number;
  status: 'draft' | 'open' | 'active' | 'completed' | 'disputed';
  escrowStatus: 'unfunded' | 'funded' | 'released' | 'refunded';
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  budget: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  aiFeedback?: string;
  order: number;
}

export interface Submission {
  id: string;
  milestoneId: string;
  projectId: string;
  freelancerId: string;
  content: string;
  submittedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'payment' | 'escrow_release' | 'escrow_fund' | 'refund';
  amount: number;
  projectId?: string;
  createdAt: string;
  description: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
