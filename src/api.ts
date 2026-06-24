/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Donation, Notification, AIAnalysisResult } from './types';

// Standard base URL
const API_URL = '';

function getHeaders() {
  const token = localStorage.getItem('bhojansetu_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // AUTH
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('bhojansetu_token', data.token);
    return data;
  },

  async register(params: any): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('bhojansetu_token', data.token);
    return data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      throw new Error('Session expired');
    }
    const data = await res.json();
    return data.user;
  },

  logout() {
    localStorage.removeItem('bhojansetu_token');
  },

  // DONATIONS
  async getDonations(): Promise<Donation[]> {
    const res = await fetch(`${API_URL}/api/donations`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch donations');
    return res.json();
  },

  async getDonationDetails(id: string): Promise<Donation> {
    const res = await fetch(`${API_URL}/api/donations/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Donation not found');
    return res.json();
  },

  async createDonation(params: {
    foodName: string;
    foodType: string;
    quantity: string;
    servings: number;
    address: string;
    pickupTime: string;
    contactNumber: string;
    image?: string;
  }): Promise<Donation> {
    const res = await fetch(`${API_URL}/api/donations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit donation');
    }
    return res.json();
  },

  async acceptDonation(id: string): Promise<Donation> {
    const res = await fetch(`${API_URL}/api/donations/${id}/accept`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to accept donation');
    }
    return res.json();
  },

  async assignVolunteer(donationId: string, volunteerId?: string): Promise<Donation> {
    const res = await fetch(`${API_URL}/api/donations/${donationId}/assign-volunteer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ volunteerId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to assign volunteer');
    }
    return res.json();
  },

  async updateDonationStatus(id: string, status: 'Picked Up' | 'Delivered'): Promise<Donation> {
    const res = await fetch(`${API_URL}/api/donations/${id}/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update status');
    }
    return res.json();
  },

  async cancelDonation(id: string): Promise<Donation> {
    const res = await fetch(`${API_URL}/api/donations/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to cancel donation');
    }
    return res.json();
  },

  // NOTIFICATIONS
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_URL}/api/notifications`, {
      headers: getHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders()
    });
  },

  // ADMIN OPERATIONS
  async verifyNgo(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/ngos/${id}/verify`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Verification failed');
    }
  },

  async rejectNgo(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/ngos/${id}/reject`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Rejection failed');
    }
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/api/users/${id}/delete`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Removal failed');
    }
  },

  async getAdminAnalytics(): Promise<{ metrics: any; monthlyData: any[]; users: any[] }> {
    const res = await fetch(`${API_URL}/api/admin/analytics`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load admin analytics');
    return res.json();
  },

  // AI CHAT & Logistical Recommendations
  async sendAiChatMessage(messages: { role: 'user' | 'model'; content: string }[]): Promise<string> {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messages })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI coordinator offline');
    }
    const data = await res.json();
    return data.reply;
  },

  async getNgoRecommendations(params: {
    foodName: string;
    quantity: string;
    servings: number;
    address: string;
  }): Promise<{ ngoId: string; ngoName: string; matchReason: string; confidenceScore: number }[]> {
    const res = await fetch(`${API_URL}/api/ai/recommend-ngo`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) return [];
    return res.json();
  }
};
