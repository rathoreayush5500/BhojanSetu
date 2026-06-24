/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address: string;
  ngoDetails?: {
    ngoName: string;
    registrationNumber: string;
    isVerified: boolean;
    isRejected?: boolean;
  };
  volunteerDetails?: {
    assignedDonations: string[];
  };
}

export interface Donation {
  id: string;
  foodName: string;
  foodType: 'Veg' | 'Non-Veg' | 'Vegan' | 'Both';
  quantity: string; // e.g. "10 kg", "2 trays"
  servings: number;
  image?: string; // base64 or URL
  address: string;
  pickupTime: string;
  contactNumber: string;
  status: 'Pending' | 'Accepted' | 'Picked Up' | 'Delivered' | 'Cancelled';
  donorId: string;
  donorName: string;
  ngoId?: string;
  ngoName?: string;
  volunteerId?: string;
  volunteerName?: string;
  qualityScore?: number;
  freshnessEstimate?: string;
  recommendation?: string;
  aiDescription?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface AIAnalysisResult {
  foodType: string;
  description: string;
  estimatedServings: number;
  category: string;
  qualityScore: number;
  freshnessEstimate: string;
  recommendation: string;
  summary: string;
}
