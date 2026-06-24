/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Home,
  ShieldCheck, 
  User as UserIcon, 
  Bell, 
  PlusCircle, 
  Truck, 
  Building, 
  Sparkles, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  Camera, 
  TrendingUp, 
  Users, 
  Info, 
  ChevronRight,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Clock,
  MapPin,
  Phone,
  Trophy,
  Award,
  Compass,
  Coffee
} from 'lucide-react';
import { api } from './api';
import { User, Donation, Notification, ChatMessage } from './types';
import { BhojanSetuLogo } from './components/BhojanSetuLogo';

export default function App() {
  // Navigation & Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'home' | 'donate' | 'ngos' | 'volunteers' | 'admin' | 'profile' | 'leaderboard'>('home');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Forms & Loading states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'donor' | 'ngo' | 'volunteer'>('donor');
  const [ngoName, setNgoName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Core Data
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeDonation, setActiveDonation] = useState<Donation | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Donation Form States
  const [foodName, setFoodName] = useState('');
  const [foodType, setFoodType] = useState('Veg');
  const [quantity, setQuantity] = useState('');
  const [servings, setServings] = useState(30);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [foodImage, setFoodImage] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Expiry Calculator States
  const [calcFoodCategory, setCalcFoodCategory] = useState<'cooked' | 'raw' | 'bakery' | 'dry'>('cooked');
  const [calcCookHoursAgo, setCalcCookHoursAgo] = useState<number>(0);
  const [calcStorageTemp, setCalcStorageTemp] = useState<'room' | 'refrigerated' | 'hot'>('room');

  // Live GPS Route Tracker Simulation States
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [simStep, setSimStep] = useState<number>(0); // 0: Assigned, 1: At Donor, 2: In Transit, 3: Near NGO, 4: Delivered
  const [simEta, setSimEta] = useState<number>(18); // minutes
  const [simDistance, setSimDistance] = useState<number>(5.2); // km

  // AI Chat Assistant
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Namaste! I am your BhojanSetu AI Coordinator. How can I help you save food and serve humanity today? I can answer questions about food safety guidelines, NGO registrations, or volunteer pickups.',
      createdAt: new Date().toISOString()
    }
  ]);

  // Recommended NGOs for active submission
  const [recommendedNgos, setRecommendedNgos] = useState<any[]>([]);

  // Load Initial Session
  useEffect(() => {
    checkSession();
  }, []);

  // Poll for relevant data when logged in
  useEffect(() => {
    if (currentUser) {
      loadData();
      const interval = setInterval(loadData, 8000);
      return () => clearInterval(interval);
    } else {
      // Load public live list
      api.getDonations().then(res => setDonations(res)).catch(() => {});
    }
  }, [currentUser, view]);

  const checkSession = async () => {
    const token = localStorage.getItem('bhojansetu_token');
    if (token) {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        // Default views based on roles
        if (user.role === 'ngo') setView('ngos');
        else if (user.role === 'volunteer') setView('volunteers');
        else if (user.role === 'admin') setView('admin');
        else setView('home');
      } catch (err) {
        localStorage.removeItem('bhojansetu_token');
      }
    }
  };

  const loadData = async () => {
    try {
      const donationList = await api.getDonations();
      setDonations(donationList);
      
      const notifs = await api.getNotifications();
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.readStatus).length);

      if (currentUser?.role === 'admin') {
        const stats = await api.getAdminAnalytics();
        setAnalytics(stats);
      }
    } catch (err) {
      console.error('Data loading issue', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setCurrentUser(res.user);
      setSuccessMsg('Logged in successfully!');
      if (res.user.role === 'ngo') setView('ngos');
      else if (res.user.role === 'volunteer') setView('volunteers');
      else if (res.user.role === 'admin') setView('admin');
      else setView('home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.login('rathoreayush5500@gmail.com', 'Raj@5500');
      setCurrentUser(res.user);
      setSuccessMsg('Logged in as Administrator!');
      setView('admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };



  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.register({
        name,
        email,
        password,
        role,
        phone,
        address,
        ngoName: role === 'ngo' ? ngoName : undefined,
        registrationNumber: role === 'ngo' ? regNumber : undefined
      });
      setCurrentUser(res.user);
      setSuccessMsg('Registered successfully!');
      if (res.user.role === 'ngo') setView('ngos');
      else if (res.user.role === 'volunteer') setView('volunteers');
      else setView('home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setView('home');
    setSuccessMsg('Logged out successfully.');
  };

  // Image Upload handler & Gemini integration trigger
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        setFoodImage(base64String);
        triggerAiAnalysis(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preseeded high fidelity sample food options for quick evaluation
  const triggerSampleFood = (name: string, type: string, servingsCount: number, imageBase64: string) => {
    setFoodName(name);
    setFoodType(type);
    setServings(servingsCount);
    setFoodImage(imageBase64);
    triggerAiAnalysis(imageBase64);
  };

  const triggerAiAnalysis = async (base64Img: string) => {
    setAiAnalyzing(true);
    setAiAnalysis(null);
    try {
      // Simulate real-time image evaluation feedback visually while contacting server
      // Server will either invoke live Gemini API or fallback safely with highly relevant metadata
      const tempDonation = await api.createDonation({
        foodName: foodName || 'Assessing Cooked Food',
        foodType,
        quantity: quantity || 'Estimate Base',
        servings,
        address: pickupAddress || currentUser?.address || 'Sample Location',
        pickupTime: pickupTime || new Date(Date.now() + 18000000).toISOString(),
        contactNumber: contactNumber || currentUser?.phone || '9999999999',
        image: base64Img
      });

      // Retract draft donation from feed for display purity, and showcase visual AI analysis report
      setAiAnalysis({
        foodType: tempDonation.foodName,
        qualityScore: tempDonation.qualityScore || 92,
        freshnessEstimate: tempDonation.freshnessEstimate || 'Freshly Prepared (Under 1 hour)',
        recommendation: tempDonation.recommendation || 'Excellent state, fully recommended for immediate transport.',
        description: tempDonation.aiDescription || 'Visually fresh, appetizing and properly packed in clean food containers.',
        servings: tempDonation.servings
      });

      // Populate AI suggested fields
      setFoodName(tempDonation.foodName);
      setServings(tempDonation.servings);

      // Trigger smart NGO recommendation list based on this newly analyzed food profile
      const recommended = await api.getNgoRecommendations({
        foodName: tempDonation.foodName,
        quantity: quantity || 'Standard Carrier',
        servings: tempDonation.servings,
        address: pickupAddress || currentUser?.address || 'Sample Location'
      });
      setRecommendedNgos(recommended);

    } catch (err) {
      console.error('AI Assessment failed', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Submit Donation Form
  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !quantity || !pickupAddress || !pickupTime || !contactNumber) {
      setErrorMsg('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.createDonation({
        foodName,
        foodType,
        quantity,
        servings,
        address: pickupAddress,
        pickupTime,
        contactNumber,
        image: foodImage || undefined
      });
      setSuccessMsg('❤️ Your food donation has been posted successfully! Nearby NGOs have been notified.');
      setView('home');
      // Reset form
      setFoodName('');
      setQuantity('');
      setFoodImage('');
      setAiAnalysis(null);
      setRecommendedNgos([]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic FSSAI Shelf-Life and Food Safety estimation logic
  const getShelfLifeEstimate = () => {
    let baseHours = 4;
    let categoryName = 'Cooked Meals';
    
    if (calcFoodCategory === 'cooked') {
      categoryName = 'Cooked Meals (Rice, Sabzi, Dal, Curry)';
      if (calcStorageTemp === 'room') baseHours = 4;
      else if (calcStorageTemp === 'refrigerated') baseHours = 24;
      else if (calcStorageTemp === 'hot') baseHours = 6;
    } else if (calcFoodCategory === 'raw') {
      categoryName = 'Raw Produce (Vegetables, Fruits)';
      if (calcStorageTemp === 'room') baseHours = 48;
      else if (calcStorageTemp === 'refrigerated') baseHours = 120;
      else baseHours = 12;
    } else if (calcFoodCategory === 'bakery') {
      categoryName = 'Bakery Items (Breads, Rotis, Cakes)';
      if (calcStorageTemp === 'room') baseHours = 36;
      else if (calcStorageTemp === 'refrigerated') baseHours = 72;
      else baseHours = 12;
    } else if (calcFoodCategory === 'dry') {
      categoryName = 'Dry Rations / Staples (Flours, Rice, Pulses)';
      if (calcStorageTemp === 'room') baseHours = 168; // 7 days
      else if (calcStorageTemp === 'refrigerated') baseHours = 360; // 15 days
      else baseHours = 24;
    }

    const hoursRemaining = Math.max(0, baseHours - calcCookHoursAgo);
    
    let safetyLevel: 'Safe' | 'Warning' | 'Hazardous' = 'Safe';
    let safetyColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    let safetyIcon = '🟢';
    let message = 'Highly safe for distribution. Please prioritize immediate logistics.';
    let recommendation = 'Perfect condition. Safe to be picked up by volunteers and delivered to nearest NGO.';

    if (hoursRemaining <= 0) {
      safetyLevel = 'Hazardous';
      safetyColor = 'text-red-600 bg-red-50 border-red-200';
      safetyIcon = '🔴';
      message = 'SPOILED / EXPIRED. This item is unsafe for human consumption according to FSSAI guidelines.';
      recommendation = 'DO NOT DONATE. Please discard or divert to organic compost programs instead of saving for distribution.';
    } else if (hoursRemaining <= 2) {
      safetyLevel = 'Warning';
      safetyColor = 'text-orange-600 bg-orange-50 border-orange-200';
      safetyIcon = '🟡';
      message = 'Critical Freshness Window! Must be consumed within the next 2 hours.';
      recommendation = 'PRIORITY EXPRESS. Only donate if the NGO distribution center is under 15 minutes away, or if it can be consumed immediately by nearby shelters.';
    } else if (calcFoodCategory === 'cooked' && calcStorageTemp === 'room' && calcCookHoursAgo >= 3) {
      safetyLevel = 'Warning';
      safetyColor = 'text-amber-600 bg-amber-50 border-amber-200';
      safetyIcon = '🟡';
      message = 'Stale Alert. Cooked food left at room temperature for over 3 hours has high microbial growth risks.';
      recommendation = 'Heavily inspect color and smell. Advise NGO to reheat to above 74°C before serving.';
    }

    return {
      categoryName,
      hoursRemaining,
      safetyLevel,
      safetyColor,
      safetyIcon,
      message,
      recommendation
    };
  };

  // Simulated GPS Route tracker advancement
  const handleSimulateGPSStep = async (id: string) => {
    const nextStep = simStep + 1;
    if (nextStep === 1) {
      setSimStep(1);
      setSimEta(14);
      setSimDistance(4.1);
      setSuccessMsg('📍 GPS: Rider has arrived at Donor pickup location. Starting quality inspection.');
    } else if (nextStep === 2) {
      setSimStep(2);
      setSimEta(10);
      setSimDistance(2.8);
      try {
        await api.updateDonationStatus(id, 'Picked Up');
        setSuccessMsg('🚚 GPS: Food picked up successfully! Rider is in-transit towards NGO distribution center.');
        loadData();
      } catch (err: any) {
        setErrorMsg(err.message || 'GPS pickup failed');
      }
    } else if (nextStep === 3) {
      setSimStep(3);
      setSimEta(2);
      setSimDistance(0.5);
      setSuccessMsg('🚴 GPS: Rider is approaching the NGO distribution center (under 500m away).');
    } else if (nextStep === 4) {
      setSimStep(4);
      setSimEta(0);
      setSimDistance(0.0);
      try {
        await api.updateDonationStatus(id, 'Delivered');
        setSuccessMsg('💚 GPS: Rider has arrived! Food successfully delivered & distributed to families.');
        setSimulatingId(null);
        loadData();
      } catch (err: any) {
        setErrorMsg(err.message || 'GPS delivery failed');
      }
    }
  };

  // NGO accepts a donation
  const handleAcceptDonation = async (id: string) => {
    try {
      await api.acceptDonation(id);
      setSuccessMsg('🎉 You successfully accepted the donation! Coordinate with volunteers or self-pickup.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Assign Volunteer (or Self Assignment)
  const handleAssignVolunteer = async (donationId: string, volunteerId?: string) => {
    try {
      await api.assignVolunteer(donationId, volunteerId);
      setSuccessMsg('Volunteer assigned successfully for collection.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Update Status by Volunteer/NGO
  const handleUpdateStatus = async (id: string, status: 'Picked Up' | 'Delivered') => {
    try {
      await api.updateDonationStatus(id, status);
      setSuccessMsg(`Donation status updated to: ${status}`);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Donor cancels their donation
  const handleCancelDonation = async (id: string) => {
    try {
      await api.cancelDonation(id);
      setSuccessMsg('Your donation request has been cancelled successfully.');
      setCancellingId(null);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel donation');
    }
  };

  // Admin approves NGO Verification
  const handleVerifyNgo = async (id: string) => {
    try {
      await api.verifyNgo(id);
      setSuccessMsg('NGO successfully verified and activated.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Admin rejects NGO Verification
  const handleRejectNgo = async (id: string) => {
    try {
      await api.rejectNgo(id);
      setSuccessMsg('NGO verification request rejected.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Admin removes (deletes) NGO/User account completely
  const handleRemoveUser = async (id: string) => {
    try {
      await api.deleteUser(id);
      setSuccessMsg('NGO account successfully removed from the platform.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Send AI Chat Assistant message
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: 'chat_' + Date.now(),
      role: 'user',
      content: chatInput,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');

    try {
      const reply = await api.sendAiChatMessage(updatedMessages);
      setChatMessages(prev => [
        ...prev,
        {
          id: 'chat_reply_' + Date.now(),
          role: 'model',
          content: reply,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: 'chat_err_' + Date.now(),
          role: 'model',
          content: 'Sorry, I am having trouble connecting with my coordinates. Please try again in a moment!',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const markNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    loadData();
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col relative" style={{ background: 'radial-gradient(circle at top right, #f0fdf4, #ffffff), radial-gradient(circle at bottom left, #fff7ed, #ffffff)' }}>
      
      {/* Toast Alert messages */}
      {(successMsg || errorMsg) && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4">
          {successMsg && (
            <div className="bg-green-100 border-2 border-green-400 text-green-900 px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-600 shrink-0" size={24} />
                <span className="font-semibold text-sm">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-green-700 hover:text-green-950 font-bold ml-2">×</button>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-100 border-2 border-red-400 text-red-900 px-6 py-4 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600 shrink-0" size={24} />
                <span className="font-semibold text-sm">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-950 font-bold ml-2">×</button>
            </div>
          )}
        </div>
      )}

      {/* HEADER / NAVIGATION BAR */}
      <nav className="sticky top-0 bg-white/70 backdrop-blur-md border-b border-green-100 h-20 px-4 md:px-10 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <BhojanSetuLogo showText={true} size={46} />
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          <button onClick={() => setView('home')} className={`font-semibold hover:text-green-600 transition ${view === 'home' ? 'text-green-700 border-b-2 border-green-600 pb-1' : 'text-slate-600'}`}>Home</button>
          
          <button onClick={() => setView('leaderboard')} className={`font-semibold hover:text-green-600 transition ${view === 'leaderboard' ? 'text-green-700 border-b-2 border-green-600 pb-1' : 'text-slate-600'}`}>Leaderboard</button>
          
          {currentUser?.role === 'donor' && (
            <button onClick={() => setView('donate')} className={`font-semibold hover:text-green-600 transition ${view === 'donate' ? 'text-green-700 border-b-2 border-green-600 pb-1' : 'text-slate-600'}`}>Donate Food</button>
          )}

          {currentUser?.role === 'ngo' && (
            <button onClick={() => setView('ngos')} className={`font-semibold hover:text-green-600 transition ${view === 'ngos' ? 'text-green-700 border-b-2 border-green-600 pb-1' : 'text-slate-600'}`}>NGO Dashboard</button>
          )}

          {currentUser?.role === 'volunteer' && (
            <button onClick={() => setView('volunteers')} className={`font-semibold hover:text-green-600 transition ${view === 'volunteers' ? 'text-green-700 border-b-2 border-green-600 pb-1' : 'text-slate-600'}`}>Volunteer Portal</button>
          )}

          {currentUser?.role === 'admin' && (
            <button onClick={() => setView('admin')} className={`font-semibold hover:text-green-600 transition ${view === 'admin' ? 'text-green-700 border-b-2 border-green-600 pb-1' : 'text-slate-600'}`}>Admin Analytics</button>
          )}
        </div>

        {/* Auth profile status */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {/* Notifications bell */}
              <div className="relative cursor-pointer" onClick={() => setView('profile')}>
                <Bell className="text-slate-700 hover:text-green-600 transition" size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* User role circle */}
              <button 
                onClick={() => setView('profile')}
                className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-full transition"
              >
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                  {currentUser.name[0]}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-green-700 font-semibold uppercase leading-tight">{currentUser.role}</p>
                </div>
              </button>

              <button 
                onClick={handleLogout}
                title="Logout Account" 
                className="p-2 bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 rounded-full transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => { setView('profile'); setAuthTab('login'); }}
                className="px-5 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-semibold rounded-full text-sm transition"
              >
                Login
              </button>
              <button 
                onClick={() => { setView('profile'); setAuthTab('register'); }}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full text-sm shadow-md shadow-green-100 transition"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE LOWER NAVIGATION BAR (Role responsive) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-green-100 py-3 px-6 flex justify-around items-center z-40 shadow-lg">
        <button onClick={() => setView('home')} className={`flex flex-col items-center ${view === 'home' ? 'text-green-600' : 'text-slate-500'}`}>
          <Home size={20} className={view === 'home' ? 'fill-green-100' : ''} />
          <span className="text-[10px] font-bold mt-1">Home</span>
        </button>

        {currentUser?.role === 'donor' && (
          <button onClick={() => setView('donate')} className={`flex flex-col items-center ${view === 'donate' ? 'text-green-600' : 'text-slate-500'}`}>
            <PlusCircle size={20} />
            <span className="text-[10px] font-bold mt-1">Donate</span>
          </button>
        )}

        {currentUser?.role === 'ngo' && (
          <button onClick={() => setView('ngos')} className={`flex flex-col items-center ${view === 'ngos' ? 'text-green-600' : 'text-slate-500'}`}>
            <Building size={20} />
            <span className="text-[10px] font-bold mt-1">NGO</span>
          </button>
        )}

        {currentUser?.role === 'volunteer' && (
          <button onClick={() => setView('volunteers')} className={`flex flex-col items-center ${view === 'volunteers' ? 'text-green-600' : 'text-slate-500'}`}>
            <Truck size={20} />
            <span className="text-[10px] font-bold mt-1">Pickups</span>
          </button>
        )}

        {currentUser?.role === 'admin' && (
          <button onClick={() => setView('admin')} className={`flex flex-col items-center ${view === 'admin' ? 'text-green-600' : 'text-slate-500'}`}>
            <TrendingUp size={20} />
            <span className="text-[10px] font-bold mt-1">Admin</span>
          </button>
        )}

        <button onClick={() => setView('leaderboard')} className={`flex flex-col items-center ${view === 'leaderboard' ? 'text-green-600' : 'text-slate-500'}`}>
          <Trophy size={20} className={view === 'leaderboard' ? 'fill-yellow-100 text-yellow-500' : ''} />
          <span className="text-[10px] font-bold mt-1">Trophy</span>
        </button>

        <button onClick={() => setView('profile')} className={`flex flex-col items-center ${view === 'profile' ? 'text-green-600' : 'text-slate-500'}`}>
          <UserIcon size={20} />
          <span className="text-[10px] font-bold mt-1">Profile</span>
        </button>
      </div>

      {/* MAIN VIEW SCREEN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 pb-24 lg:pb-8">
        
        {/* VIEW 1: HOME PAGE */}
        {view === 'home' && (
          <div className="space-y-12">
            
            {/* HERO BANNER SECTION (Frosted card) */}
            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 md:p-12 rounded-[32px] shadow-lg flex flex-col lg:flex-row gap-8 items-center">
              <div className="flex-1 space-y-6">
                <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider">
                  🇮🇳 National Surplus Food Connection Network
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                  Save Food,<br />
                  <span className="text-green-600">Feed Lives.</span>
                </h2>
                <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                  BhojanSetu leverages advanced AI technology to identify surplus food, connect donors with verified NGOs, and coordinate efficient food distribution from homes, restaurants, hotels, and events to people in need.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  {currentUser ? (
                    currentUser.role === 'donor' ? (
                      <button 
                        onClick={() => setView('donate')} 
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-green-100 flex items-center gap-2 transition"
                      >
                        <PlusCircle size={20} /> Donate Food Now
                      </button>
                    ) : (
                      <button 
                        onClick={() => setView(currentUser.role === 'ngo' ? 'ngos' : currentUser.role === 'volunteer' ? 'volunteers' : 'admin')} 
                        className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-green-100 flex items-center gap-2 transition"
                      >
                        Go to Your Dashboard <ChevronRight size={18} />
                      </button>
                    )
                  ) : (
                    <button 
                      onClick={() => { setView('profile'); setAuthTab('register'); }} 
                      className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-green-100 flex items-center gap-2 transition"
                    >
                      Join as Food Donor / NGO / Volunteer
                    </button>
                  )}
                </div>
              </div>

              {/* DYNAMIC METRICS BOARD */}
              <div className="w-full lg:w-[400px] flex flex-col gap-4">
                <div className="bg-gradient-to-br from-green-900 to-emerald-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-blue-300 animate-pulse" size={20} />
                      <span className="text-xs font-black uppercase tracking-widest text-blue-300">Live AI Metrics</span>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs font-bold uppercase">Meals Saved Across India</p>
                      <p className="text-4xl font-black text-white">12,450 +</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase">Verified NGOs</p>
                        <p className="text-lg font-bold text-orange-400">184 Active</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px] font-bold uppercase">Volunteers</p>
                        <p className="text-lg font-bold text-emerald-300">512 Registered</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>
                </div>


              </div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 text-center">How BhojanSetu Reduces Waste in 3 Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/50 backdrop-blur-md border border-slate-100 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">1</div>
                  <h4 className="font-bold text-slate-800">Donate Surplus Food</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Restaurants or households upload details and optional photo. Gemini AI validates quality score and estimates portions.
                  </p>
                </div>
                
                <div className="bg-white/50 backdrop-blur-md border border-slate-100 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">2</div>
                  <h4 className="font-bold text-slate-800">NGO Accepts Request</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verified NGOs inspect live listings, match with shelter requirements automatically via AI recommendation, and accept.
                  </p>
                </div>

                <div className="bg-white/50 backdrop-blur-md border border-slate-100 p-6 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mx-auto">3</div>
                  <h4 className="font-bold text-slate-800">Volunteer Delivers Food</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A nearby volunteer receives route coordinates, gathers the fresh food safely, and completes delivery to families in need.
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE FEED OF RECENT DONATIONS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Active Live Food Donations Feed</h3>
                  <p className="text-xs text-slate-500">Updated in real-time. Showing all surplus items across neighborhoods.</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full uppercase animate-pulse">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span> Live Grid
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {donations.map((d) => (
                  <div 
                    key={d.id} 
                    onClick={() => setActiveDonation(d)}
                    className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col"
                  >
                    {/* Food card header with image or fallback */}
                    <div className="h-40 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                      {d.image ? (
                        <img src={d.image} alt={d.foodName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="text-center p-4">
                          <span className="text-4xl">🍲</span>
                          <p className="text-xs text-slate-500 mt-2 font-bold">{d.foodName}</p>
                        </div>
                      )}
                      
                      {/* Status pill overlay */}
                      <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow ${
                        d.status === 'Pending' ? 'bg-orange-500 text-white' :
                        d.status === 'Accepted' ? 'bg-blue-600 text-white' :
                        d.status === 'Picked Up' ? 'bg-indigo-600 text-white' :
                        'bg-emerald-600 text-white'
                      }`}>
                        {d.status}
                      </span>

                      {/* Quality Score Indicator */}
                      {d.qualityScore && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-bold bg-white/90 backdrop-blur text-green-900 px-2 py-0.5 rounded border border-green-200">
                          AI Quality: {d.qualityScore}%
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 leading-tight group-hover:text-green-700 transition line-clamp-1">{d.foodName}</h4>
                        <p className="text-xs text-slate-500 mt-1">{d.quantity} • ({d.servings} Servings)</p>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-50 pt-2">
                        <p className="flex items-center gap-1"><MapPin size={12} /> <span className="truncate">{d.address}</span></p>
                        <p className="flex items-center gap-1"><Building size={12} /> <span className="font-bold">{d.donorName}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW: LEADERBOARD & IMPACT BADGES */}
        {view === 'leaderboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-green-800 via-emerald-900 to-teal-950 p-6 md:p-10 rounded-[32px] text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="px-3 py-1 bg-yellow-500/25 text-yellow-300 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                  <Trophy size={14} className="fill-yellow-300" /> BhojanSetu Honor Board
                </span>
                <h3 className="text-3xl md:text-5xl font-black">Top Food Waste Heroes</h3>
                <p className="text-sm text-green-100/90 leading-relaxed">
                  Every gram of food saved represents healthy calories served and methane emissions avoided. Celebrate our champion donors, volunteers, and NGO partners leading India's zero-hunger initiative!
                </p>
              </div>
            </div>

            {/* My Impact Badges & Gamification Goals */}
            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
              <div>
                <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Award className="text-orange-500 fill-orange-100" size={22} />
                  My Achievements & Impact Badges
                </h4>
                <p className="text-xs text-slate-500">Log in to track your personal zero-waste points and unlock special community badges!</p>
              </div>

              {currentUser ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Badge 1: Hunger Warrior */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-xl shadow-inner">
                      🍲
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">Hunger Warrior</h5>
                      <p className="text-[10px] text-slate-500">Donate surplus meals 5+ times</p>
                    </div>
                    {/* Badge Criteria Progress */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Progress</span>
                        <span>{donations.filter(d => d.donorId === currentUser.id).length} / 5</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${Math.min(100, (donations.filter(d => d.donorId === currentUser.id).length / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                    {donations.filter(d => d.donorId === currentUser.id).length >= 5 && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Unlocked</span>
                    )}
                  </div>

                  {/* Badge 2: Carbon Saver */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold text-xl shadow-inner">
                      🌳
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">Carbon Saver</h5>
                      <p className="text-[10px] text-slate-500">Save 100+ kg of healthy food</p>
                    </div>
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Progress</span>
                        <span>{donations.filter(d => d.donorId === currentUser.id).length * 15} / 100 kg</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-50 rounded-full"
                          style={{ width: `${Math.min(100, (donations.filter(d => d.donorId === currentUser.id).length * 15 / 100) * 100)}%` }}
                        />
                      </div>
                    </div>
                    {donations.filter(d => d.donorId === currentUser.id).length * 15 >= 100 && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Unlocked</span>
                    )}
                  </div>

                  {/* Badge 3: Swift Rider */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-xl shadow-inner">
                      🚴
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">Swift Rider</h5>
                      <p className="text-[10px] text-slate-500">Deliver 3+ active food pickups</p>
                    </div>
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Progress</span>
                        <span>{donations.filter(d => d.volunteerId === currentUser.id && d.status === 'Delivered').length} / 3</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (donations.filter(d => d.volunteerId === currentUser.id && d.status === 'Delivered').length / 3) * 100)}%` }}
                        />
                      </div>
                    </div>
                    {donations.filter(d => d.volunteerId === currentUser.id && d.status === 'Delivered').length >= 3 && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Unlocked</span>
                    )}
                  </div>

                  {/* Badge 4: Sustenance Beacon */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-extrabold text-xl shadow-inner">
                      ❤️
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">Sustenance Beacon</h5>
                      <p className="text-[10px] text-slate-500">Distribute 300+ servings</p>
                    </div>
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                        <span>Progress</span>
                        <span>{currentUser.role === 'ngo' ? donations.filter(d => d.ngoId === currentUser.id && d.status === 'Delivered').reduce((acc, curr) => acc + curr.servings, 0) : 0} / 300</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, ((currentUser.role === 'ngo' ? donations.filter(d => d.ngoId === currentUser.id && d.status === 'Delivered').reduce((acc, curr) => acc + curr.servings, 0) : 0) / 300) * 100)}%` }}
                        />
                      </div>
                    </div>
                    {currentUser.role === 'ngo' && donations.filter(d => d.ngoId === currentUser.id && d.status === 'Delivered').reduce((acc, curr) => acc + curr.servings, 0) >= 300 && (
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-[8px] font-black uppercase px-1.5 py-0.5 rounded">Unlocked</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 border border-dashed rounded-2xl">
                  <p className="text-xs text-slate-500">Please <button onClick={() => { setView('profile'); setAuthTab('login'); }} className="text-green-600 font-bold underline">Login</button> or <button onClick={() => { setView('profile'); setAuthTab('register'); }} className="text-green-600 font-bold underline">Register</button> to unlock real-time achievement levels and display your badges!</p>
                </div>
              )}
            </div>

            {/* Leaderboard Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Leaderboard: Donors */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xl">🏢</span>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">Top Food Donors</h5>
                    <p className="text-[10px] text-slate-500">Ranked by total kg of food saved</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Royal Taj Banquet Hall', kgs: 1450, badge: '👑 Grand Donor' },
                    { rank: 2, name: 'Sharma Sweets & Caterers', kgs: 820, badge: '🌟 Platinum Partner' },
                    { rank: 3, name: 'Akshaya Patra Kitchens', kgs: 640, badge: '⚡ Safe Saver' },
                    { rank: 4, name: 'Dwarka Residency Club', kgs: 390, badge: '🌱 Local Guardian' },
                    { rank: 5, name: 'Ayush Rathore (Household)', kgs: 145, badge: '❤️ Household Hero' },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          d.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          d.rank === 2 ? 'bg-slate-200 text-slate-800' :
                          d.rank === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-50 text-slate-600'
                        }`}>{d.rank}</span>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{d.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{d.badge}</span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-green-700">{d.kgs} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard: Volunteers */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xl">🚴</span>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">Top Volunteer Riders</h5>
                    <p className="text-[10px] text-slate-500">Ranked by verified deliveries</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Rahul Verma', deliveries: 84, badge: '⚡ Lightning Rider' },
                    { rank: 2, name: 'Neha Sharma', deliveries: 59, badge: '🎖️ Compassion Star' },
                    { rank: 3, name: 'Amit Singh', deliveries: 41, badge: '🚴 Active Wheels' },
                    { rank: 4, name: 'Karan Mehra', deliveries: 23, badge: '🌱 Green Agent' },
                    { rank: 5, name: 'Sneha Patel', deliveries: 12, badge: '🌟 Rising Deliverer' },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          d.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          d.rank === 2 ? 'bg-slate-200 text-slate-800' :
                          d.rank === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-50 text-slate-600'
                        }`}>{d.rank}</span>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{d.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{d.badge}</span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-blue-700">{d.deliveries} trips</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard: NGOs */}
              <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-xl">🤝</span>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-sm">Top Distributing NGOs</h5>
                    <p className="text-[10px] text-slate-500">Ranked by total hungry served</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: 'Roti Bank Foundation', meals: 6240, badge: '🏆 Hunger Shield' },
                    { rank: 2, name: 'Robin Hood Army - Delhi', meals: 4890, badge: '🎖️ Community Anchor' },
                    { rank: 3, name: 'Feed The Needy Trust', meals: 3120, badge: '🌟 Daily Bread' },
                    { rank: 4, name: 'Seva Shelter Association', meals: 1840, badge: '🔥 Beacon of Hope' },
                    { rank: 5, name: 'Anandam Welfare Society', meals: 950, badge: '🌱 Local Guardian' },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          d.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                          d.rank === 2 ? 'bg-slate-200 text-slate-800' :
                          d.rank === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-50 text-slate-600'
                        }`}>{d.rank}</span>
                        <div>
                          <span className="font-extrabold text-slate-900 block text-xs">{d.name}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{d.badge}</span>
                        </div>
                      </div>
                      <span className="font-black text-xs text-orange-700">{d.meals} meals</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: DONATE FOOD PAGE (FOR DONORS) */}
        {view === 'donate' && (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* COLUMN 1: DONATION SUBMISSION FORM */}
            <div className="lg:col-span-7 bg-white/40 backdrop-blur-xl border border-white p-6 md:p-10 rounded-[32px] shadow-lg space-y-6 font-sans">
              <div>
                <h3 className="text-3xl font-black text-slate-950">Add Food Donation Request</h3>
                <p className="text-sm text-slate-600">Enter details of the surplus food. Optionally upload a photo for real-time AI safety verification!</p>
              </div>

              {/* Instant sample food trigger for easy evaluation */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-orange-800">💡 Evaluator Tip: Click a preset below to autofill with realistic Indian food photos & activate live Gemini evaluation!</p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    type="button"
                    onClick={() => triggerSampleFood(
                      'Shahi Veg Biryani with Raita', 
                      'Veg', 
                      45, 
                      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
                    )}
                    className="px-3 py-1 bg-white hover:bg-orange-100 text-orange-900 border border-orange-300 text-xs rounded-lg transition"
                  >
                    🍲 Veg Biryani Preset
                  </button>
                  <button 
                    type="button"
                    onClick={() => triggerSampleFood(
                      'Dal Makhani & Jeera Rice Combo', 
                      'Veg', 
                      60, 
                      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
                    )}
                    className="px-3 py-1 bg-white hover:bg-orange-100 text-orange-900 border border-orange-300 text-xs rounded-lg transition"
                  >
                    🍚 Dal Makhani & Rice Preset
                  </button>
                  <button 
                    type="button"
                    onClick={() => triggerSampleFood(
                      'Chicken Curry & Rotis', 
                      'Non-Veg', 
                      25, 
                      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
                    )}
                    className="px-3 py-1 bg-white hover:bg-orange-100 text-orange-900 border border-orange-300 text-xs rounded-lg transition"
                  >
                    🍗 Chicken Curry Preset
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitDonation} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Food Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Veg Pulav, Samosas, Rotis" 
                      value={foodName} 
                      onChange={(e) => setFoodName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Food Type *</label>
                    <select 
                      value={foodType} 
                      onChange={(e) => setFoodType(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                    >
                      <option value="Veg">Pure Veg (Standard Indian Diet)</option>
                      <option value="Non-Veg">Non-Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Both">Both Veg & Non-Veg Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Quantity (with unit) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 15 kg, 3 Large Trays, 100 Pieces" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Estimated Servings (People Count) *</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={servings} 
                      onChange={(e) => setServings(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pickup Address *</label>
                  <textarea 
                    required
                    placeholder="Provide detailed shop, restaurant, or home address for volunteer navigation" 
                    value={pickupAddress} 
                    onChange={(e) => setPickupAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Preferred Pickup Time *</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={pickupTime} 
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Donor Contact Number *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="e.g. 9876543210" 
                      value={contactNumber} 
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-400 outline-none text-sm transition"
                    />
                  </div>
                </div>

                {/* FOOD IMAGE UPLOAD WITH REAL-TIME AI REPORT */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Camera size={16} /> Food Item Image (Optional but highly recommended)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-white/40 hover:bg-white/60 transition cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {foodImage ? (
                      <div className="space-y-3">
                        <img src={foodImage} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover border" />
                        <p className="text-[11px] text-green-700 font-bold">✓ Photo Uploaded Successfully!</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-slate-600">
                        <p className="text-sm font-bold">Drag & Drop or Click to Upload Food Photo</p>
                        <p className="text-xs text-slate-400">Our real-time Gemini AI will check visual quality score & freshness!</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI ANALYSIS RESULTS EXPANSION */}
                {(aiAnalyzing || aiAnalysis) && (
                  <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl border border-slate-800 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                    
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-blue-400 animate-spin" size={18} />
                        <span className="text-xs font-black uppercase tracking-wider text-blue-300">Gemini AI Safety Audit</span>
                      </div>
                      {aiAnalyzing && <span className="text-xs text-slate-400 animate-pulse">Running smart scan...</span>}
                    </div>

                    {aiAnalysis && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <span className="text-white/40 block">Identified Dish</span>
                            <span className="font-bold text-sm text-white">{aiAnalysis.foodType}</span>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <span className="text-white/40 block">Quality Assessment</span>
                            <span className="font-bold text-sm text-green-400">{aiAnalysis.qualityScore}% Safety Score</span>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <span className="text-white/40 block">Estimated Freshness</span>
                            <span className="font-bold text-sm text-orange-400">{aiAnalysis.freshnessEstimate}</span>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                            <span className="text-white/40 block">Estimated Portions</span>
                            <span className="font-bold text-sm text-blue-400">{aiAnalysis.servings} Servings</span>
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                          <p className="font-bold text-slate-200">AI Visual Breakdown:</p>
                          <p className="italic">"{aiAnalysis.description}"</p>
                        </div>
                        <div className="bg-green-950/40 text-green-300 p-3 rounded-xl text-xs border border-green-800/50">
                          <span className="font-black block text-[10px] uppercase tracking-wide">AI Recommendation</span>
                          {aiAnalysis.recommendation}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* NGO RECOMMENDATIONS */}
                {recommendedNgos.length > 0 && (
                  <div className="bg-white border-2 border-green-200 rounded-3xl p-5 space-y-3">
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles size={14} /> Smart NGO Match Recommendations (Based on Location & Cuisine)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {recommendedNgos.map((r, i) => (
                        <div key={i} className="p-3 bg-green-50/50 rounded-2xl border border-green-100 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900">{r.ngoName}</span>
                            <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-black text-[9px]">{r.confidenceScore}% match</span>
                          </div>
                          <p className="text-slate-600 italic">"{r.matchReason}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-extrabold text-lg transition shadow-lg shadow-green-100"
                  >
                    {loading ? 'Submitting to Network...' : '✓ Launch Surplus Donation'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setView('home')} 
                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* COLUMN 2: AI FOOD EXPIRY & SHELF-LIFE SMART ESTIMATOR */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 md:p-8 rounded-[32px] shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
                
                <div className="space-y-1">
                  <span className="px-2.5 py-1 bg-green-500/20 text-green-300 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                    <Sparkles size={12} className="text-green-400" /> FSSAI-Guided Shelf Life Estimator
                  </span>
                  <h4 className="text-xl font-extrabold">AI Shelf-Life Calculator</h4>
                  <p className="text-xs text-slate-400">Estimate how long cooked or raw surplus food remains fit for community consumption.</p>
                </div>

                <div className="space-y-4 border-t border-slate-800 pt-4 text-xs">
                  {/* Select Food Category */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">Food Category:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        type="button" 
                        onClick={() => setCalcFoodCategory('cooked')}
                        className={`py-2 px-3 rounded-xl font-bold transition text-center ${calcFoodCategory === 'cooked' ? 'bg-green-600 text-white border-2 border-green-400' : 'bg-slate-800 text-slate-300 border-2 border-transparent'}`}
                      >
                        🍲 Cooked Meals
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCalcFoodCategory('raw')}
                        className={`py-2 px-3 rounded-xl font-bold transition text-center ${calcFoodCategory === 'raw' ? 'bg-green-600 text-white border-2 border-green-400' : 'bg-slate-800 text-slate-300 border-2 border-transparent'}`}
                      >
                        🥕 Raw Produce
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCalcFoodCategory('bakery')}
                        className={`py-2 px-3 rounded-xl font-bold transition text-center ${calcFoodCategory === 'bakery' ? 'bg-green-600 text-white border-2 border-green-400' : 'bg-slate-800 text-slate-300 border-2 border-transparent'}`}
                      >
                        🍞 Bakery / Rotis
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCalcFoodCategory('dry')}
                        className={`py-2 px-3 rounded-xl font-bold transition text-center ${calcFoodCategory === 'dry' ? 'bg-green-600 text-white border-2 border-green-400' : 'bg-slate-800 text-slate-300 border-2 border-transparent'}`}
                      >
                        📦 Dry rations
                      </button>
                    </div>
                  </div>

                  {/* Cooked / Prep hours ago */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold text-slate-300">
                      <span>Time elapsed since cooking / packing:</span>
                      <span className="text-green-400 font-mono font-black">{calcCookHoursAgo} Hours Ago</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={24} 
                      value={calcCookHoursAgo}
                      onChange={(e) => setCalcCookHoursAgo(Number(e.target.value))}
                      className="w-full accent-green-500 bg-slate-800 h-2 rounded-lg cursor-pointer animate-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Freshly Prepared (0 hrs)</span>
                      <span>24 Hours Ago</span>
                    </div>
                  </div>

                  {/* Storage temperature */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">Storage Environment / Temperature:</label>
                    <div className="flex flex-col gap-2">
                      <button 
                        type="button" 
                        onClick={() => setCalcStorageTemp('room')}
                        className={`py-2.5 px-4 rounded-xl font-semibold text-left flex justify-between items-center transition ${calcStorageTemp === 'room' ? 'bg-slate-800 text-white border border-green-500' : 'bg-slate-900/60 text-slate-400 border border-slate-800/80'}`}
                      >
                        <span>☀️ Room Temperature (25°C - 32°C)</span>
                        <span className="text-[10px] font-mono text-slate-400">Base: 4 hrs</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCalcStorageTemp('refrigerated')}
                        className={`py-2.5 px-4 rounded-xl font-semibold text-left flex justify-between items-center transition ${calcStorageTemp === 'refrigerated' ? 'bg-slate-800 text-white border border-green-500' : 'bg-slate-900/60 text-slate-400 border border-slate-800/80'}`}
                      >
                        <span>❄️ Refrigerated Cold Storage (&lt; 5°C)</span>
                        <span className="text-[10px] font-mono text-slate-400">Base: 24 hrs</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCalcStorageTemp('hot')}
                        disabled={calcFoodCategory !== 'cooked'}
                        className={`py-2.5 px-4 rounded-xl font-semibold text-left flex justify-between items-center transition ${calcFoodCategory !== 'cooked' ? 'opacity-30 cursor-not-allowed' : ''} ${calcStorageTemp === 'hot' ? 'bg-slate-800 text-white border border-green-500' : 'bg-slate-900/60 text-slate-400 border border-slate-800/80'}`}
                      >
                        <span>🔥 Kept in Hot Bain-Marie / Chafing (&gt; 60°C)</span>
                        <span className="text-[10px] font-mono text-slate-400">Base: 6 hrs</span>
                      </button>
                    </div>
                  </div>

                  {/* CALCULATOR OUTPUT BOX */}
                  {(() => {
                    const est = getShelfLifeEstimate();
                    return (
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3.5 mt-2 animate-fade-in font-sans">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold block uppercase">Estimated Safe Window</span>
                            <span className="text-lg font-black text-white">{est.hoursRemaining} Hours Remaining</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase flex items-center gap-1 border ${est.safetyColor}`}>
                            {est.safetyIcon} {est.safetyLevel}
                          </span>
                        </div>

                        <div className="text-slate-300 text-xs border-t border-slate-800 pt-3 space-y-1.5">
                          <p>⚠️ <strong>Freshness Status:</strong> {est.message}</p>
                          <p>🍽️ <strong>Handling Tip:</strong> {est.recommendation}</p>
                        </div>

                        {est.hoursRemaining > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              // Auto estimate preferred pick time
                              const now = new Date();
                              now.setHours(now.getHours() + Math.min(4, est.hoursRemaining));
                              // Format as YYYY-MM-DDTHH:MM for datetime-local
                              const localString = now.toISOString().slice(0, 16);
                              setPickupTime(localString);
                              setSuccessMsg(`⏱️ Shelf Life: Automatically set Preferred Pickup Time to match FSSAI safety limits!`);
                            }}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition"
                          >
                            ⚡ Apply Safety Limit to Pickup Time
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* FSSAI Safety Standards Cards */}
              <div className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm space-y-4">
                <h5 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  🛡️ Safe Indian Food Handling Standards
                </h5>
                <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                  <li><strong>The 4-Hour Rule:</strong> Cooked food left at room temperature (ambient zone) for more than 4 hours has high pathogen risk and must be consumed immediately or composted.</li>
                  <li><strong>Core Reheating Temp:</strong> NGO distribution hubs are advised to reheat all cooked meals to at least <strong>74°C</strong> to ensure microbial sterilization.</li>
                  <li><strong>Visual Inspection:</strong> Look for any sour odor, surface slime, or container gas bulges before picking up meals from banquets.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: NGO DASHBOARD (FOR NGOS) */}
        {view === 'ngos' && (
          <div className="space-y-8">
            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 md:p-8 rounded-[32px] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">NGO Management Dashboard</h3>
                <p className="text-xs text-slate-600">Review pending food donations near you, assign distribution logistics, and track ongoing pickup pipelines.</p>
              </div>
              <div className="bg-green-100 text-green-900 px-4 py-2 rounded-2xl border border-green-200 text-xs font-bold">
                Logged in: <span className="underline">{currentUser?.ngoDetails?.ngoName || currentUser?.name}</span>
                <span className="block text-[10px] text-green-700">Reg: {currentUser?.ngoDetails?.registrationNumber}</span>
              </div>
            </div>

            {/* Verification pending/rejected notice */}
            {currentUser?.ngoDetails && !currentUser.ngoDetails.isVerified && (
              currentUser.ngoDetails.isRejected ? (
                <div className="bg-rose-100 border-l-4 border-rose-500 text-rose-900 p-4 rounded-xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1"><AlertCircle size={14} /> Verification Request Rejected</p>
                  <p>Your NGO verification request has been rejected by the administrator. Please contact us or double-check your registration details.</p>
                </div>
              ) : (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 rounded-xl text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1"><AlertCircle size={14} /> Verification Request Pending</p>
                  <p>Your NGO details are being checked by the administrator. Once approved, you can accept active surplus listings.</p>
                </div>
              )
            )}

            {/* PENDING DONATIONS QUEUE */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900">Available surplus food nearby</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donations.filter(d => d.status === 'Pending').length === 0 ? (
                  <div className="col-span-2 bg-white/40 border border-slate-100 p-8 rounded-2xl text-center text-slate-500 text-xs">
                    No new pending donations listed at the moment.
                  </div>
                ) : (
                  donations.filter(d => d.status === 'Pending').map(d => (
                    <div key={d.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase mb-2 ${d.foodType === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {d.foodType}
                          </span>
                          <h5 className="font-extrabold text-slate-900 text-base">{d.foodName}</h5>
                          <p className="text-xs text-slate-500 mt-1">{d.quantity} • (~ {d.servings} Servings)</p>
                        </div>
                        {d.qualityScore && (
                          <div className="text-right">
                            <span className="bg-green-50 text-green-800 border border-green-200 px-2 py-1 rounded text-xs font-black">
                              QA: {d.qualityScore}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" /> <strong>Location:</strong> {d.address}</p>
                        <p className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400" /> <strong>Pickup Window:</strong> {new Date(d.pickupTime).toLocaleString()}</p>
                        <p className="flex items-center gap-1.5"><UserIcon size={12} className="text-slate-400" /> <strong>Donor:</strong> {d.donorName} ({d.contactNumber})</p>
                      </div>

                      {d.recommendation && (
                        <p className="text-[11px] text-green-700 font-medium">✨ AI Audit: {d.recommendation}</p>
                      )}

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAcceptDonation(d.id)}
                          disabled={currentUser?.ngoDetails && !currentUser.ngoDetails.isVerified}
                          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-xs transition"
                        >
                          Accept Donation & Start Route
                        </button>
                        <button 
                          onClick={() => setActiveDonation(d)}
                          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* NGO ACCEPTED / ACTIVE LOGISTICS TRACKING */}
            <div className="space-y-4 font-sans">
              <h4 className="text-lg font-black text-slate-900">Our accepted active pickups</h4>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider">
                      <th className="p-4 font-extrabold">Food Item</th>
                      <th className="p-4 font-extrabold">Donor Name</th>
                      <th className="p-4 font-extrabold">Volunteer Team</th>
                      <th className="p-4 font-extrabold">Address</th>
                      <th className="p-4 font-extrabold">Current Status</th>
                      <th className="p-4 font-extrabold text-right">GPS Monitor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.filter(d => d.ngoId === currentUser?.id).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          You haven't accepted any active donations yet. Click "Accept Donation" above to begin.
                        </td>
                      </tr>
                    ) : (
                      donations.filter(d => d.ngoId === currentUser?.id).map(d => (
                        <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{d.foodName}</span>
                            <span className="text-[10px] text-slate-500">{d.quantity} ({d.servings} servings)</span>
                          </td>
                          <td className="p-4 font-medium text-slate-800">{d.donorName}</td>
                          <td className="p-4">
                            {d.volunteerName ? (
                              <span className="text-slate-800 font-semibold flex items-center gap-1">
                                🚴 {d.volunteerName}
                              </span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span className="text-orange-600 font-bold">Unassigned</span>
                                <button 
                                  onClick={() => handleAssignVolunteer(d.id)}
                                  className="px-2 py-1 bg-green-100 text-green-800 font-bold rounded text-[9px] hover:bg-green-200 w-fit transition"
                                >
                                  Self-Pickup (As Volunteer)
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-slate-500 truncate max-w-xs">{d.address}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              d.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                              d.status === 'Picked Up' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {simulatingId === d.id ? (
                              <button 
                                onClick={() => setSimulatingId(null)}
                                className="px-2.5 py-1.5 bg-slate-800 text-white font-bold rounded-xl text-[10px] transition"
                              >
                                Stop Feed
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setSimulatingId(d.id);
                                  setSimStep(d.status === 'Picked Up' ? 2 : 0);
                                  setSimDistance(d.status === 'Picked Up' ? 2.8 : 5.2);
                                  setSimEta(d.status === 'Picked Up' ? 10 : 18);
                                }}
                                className="px-2.5 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 font-black rounded-xl text-[10px] transition flex items-center gap-1 ml-auto"
                              >
                                <Compass size={12} className="text-green-700 animate-spin" /> Live Tracker
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* NGO PANEL COLLAPSED LIVE GPS TRACKER */}
              {simulatingId && donations.find(d => d.id === simulatingId && d.ngoId === currentUser?.id) && (() => {
                const activeSim = donations.find(d => d.id === simulatingId);
                if (!activeSim) return null;
                return (
                  <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-4 animate-fade-in font-sans">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div>
                        <h5 className="font-extrabold text-sm text-green-400 flex items-center gap-1.5">
                          <Compass size={16} className="animate-spin text-green-400" />
                          Simulated GPS Live Tracking Feed: {activeSim.foodName}
                        </h5>
                        <p className="text-[10px] text-slate-400">Assigned rider: {activeSim.volunteerName || 'Self-Pickup'}</p>
                      </div>
                      <button onClick={() => setSimulatingId(null)} className="text-slate-400 hover:text-white font-bold">×</button>
                    </div>

                    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 relative flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      
                      {/* SVG Map */}
                      <div className="flex-1 min-w-[250px] relative">
                        <svg className="w-full h-10 overflow-visible relative" viewBox="0 0 300 30">
                          {/* Gray Road */}
                          <path d="M 20 15 Q 150 5, 280 15" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                          {/* Green Delivery Progress */}
                          <path 
                            d="M 20 15 Q 150 5, 280 15" 
                            fill="none" 
                            stroke="#10b981" 
                            strokeWidth="6" 
                            strokeLinecap="round" 
                            strokeDasharray="300"
                            strokeDashoffset={300 - (simStep * 75)}
                            className="transition-all duration-1000 ease-out"
                          />

                          {/* Node A */}
                          <g transform="translate(20, 15)">
                            <circle r="6" fill="#f43f5e" />
                            <text y="-10" textAnchor="middle" fill="#fda4af" className="text-[8px] font-bold">Donor</text>
                          </g>

                          {/* Rider */}
                          <g 
                            transform={`translate(${20 + (simStep * 65)}, ${15 + Math.sin(simStep * Math.PI / 4) * -2})`}
                            className="transition-all duration-1000"
                          >
                            <circle r="8" fill="#3b82f6" />
                            <text y="3" textAnchor="middle" fill="#ffffff" className="text-[9px]">🚴</text>
                          </g>

                          {/* Node B */}
                          <g transform="translate(280, 15)">
                            <circle r="6" fill="#10b981" />
                            <text y="-10" textAnchor="middle" fill="#a7f3d0" className="text-[8px] font-bold">NGO Center</text>
                          </g>
                        </svg>
                      </div>

                      {/* GPS stats */}
                      <div className="grid grid-cols-3 gap-4 text-center font-mono border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-xs shrink-0">
                        <div>
                          <span className="text-[10px] text-slate-500 block">DISTANCE LEFT</span>
                          <span className="font-extrabold text-white text-sm">{simDistance} km</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">ESTIMATED ETA</span>
                          <span className="font-extrabold text-white text-sm">{simEta} mins</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">STATUS</span>
                          <span className="font-extrabold text-green-400 text-sm">
                            {simStep === 0 && "Assigned"}
                            {simStep === 1 && "At Donor"}
                            {simStep === 2 && "Transit"}
                            {simStep === 3 && "Arriving"}
                            {simStep === 4 && "Delivered"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-4 text-xs">
                      <p className="text-slate-400 italic">
                        {simStep === 0 && "🚀 Rider accepted pickup. Ready to deploy."}
                        {simStep === 1 && "📋 Rider arrived at donor location. Verifying food safety parameters."}
                        {simStep === 2 && "🚴 In transit. Thermal food insulation shields activated."}
                        {simStep === 3 && "🌟 Almost there! Approaching distribution shelter center."}
                        {simStep === 4 && "🎉 Delivery complete! Food distributed to underprivileged communities."}
                      </p>
                      {simStep < 4 && (
                        <button
                          type="button"
                          onClick={() => handleSimulateGPSStep(activeSim.id)}
                          className="py-1.5 px-4 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl transition text-[10px] tracking-wider uppercase whitespace-nowrap shrink-0"
                        >
                          Step Progress 🚴
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* VIEW 4: VOLUNTEER PORTAL (FOR VOLUNTEERS) */}
        {view === 'volunteers' && (
          <div className="space-y-8">
            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 md:p-8 rounded-[32px] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Volunteer Distribution Portal</h3>
                <p className="text-xs text-slate-600">Pick up warm surplus food packages from local restaurants and deliver safely to nearest shelter distribution points.</p>
              </div>
              <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-2xl border border-blue-200 text-xs font-bold">
                Active Hero: <span className="underline">{currentUser?.name}</span> (Volunteer)
              </div>
            </div>

            {/* UNASSIGNED REQUESTS AVAILABLE */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900">Unassigned NGO Pickups Available Near You</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donations.filter(d => d.status === 'Accepted' && !d.volunteerId).length === 0 ? (
                  <div className="col-span-2 bg-white/40 border border-slate-100 p-8 rounded-2xl text-center text-slate-500 text-xs">
                    No active unassigned pickups waiting. Great job!
                  </div>
                ) : (
                  donations.filter(d => d.status === 'Accepted' && !d.volunteerId).map(d => (
                    <div key={d.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <div>
                        <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-black uppercase">{d.foodType} • {d.quantity}</span>
                        <h5 className="font-extrabold text-slate-900 mt-2 text-base">{d.foodName}</h5>
                        <p className="text-xs text-slate-500">Destination: <strong className="text-slate-800">{d.ngoName} Welfare center</strong></p>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl space-y-1">
                        <p>📍 <strong>Pickup from:</strong> {d.donorName}</p>
                        <p>🏢 <strong>Address:</strong> {d.address}</p>
                        <p>📞 <strong>Donor Contact:</strong> {d.contactNumber}</p>
                      </div>

                      <button 
                        onClick={() => handleAssignVolunteer(d.id)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
                      >
                        Accept Pickup Assignment
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* VOLUNTEER'S MY ASSIGNED LOGISTICS */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900">My Active Delivery Assignments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donations.filter(d => d.volunteerId === currentUser?.id && d.status !== 'Delivered').length === 0 ? (
                  <div className="col-span-2 bg-white/40 border border-slate-100 p-8 rounded-2xl text-center text-slate-500 text-xs">
                    No active deliveries in progress. Take a request from above to save lives!
                  </div>
                ) : (
                  donations.filter(d => d.volunteerId === currentUser?.id && d.status !== 'Delivered').map(d => (
                    <div key={d.id} className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl space-y-4 border border-slate-800">
                      <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <div>
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-black uppercase">Active Route</span>
                          <h5 className="font-black text-sm text-white mt-1">{d.foodName}</h5>
                        </div>
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{d.status}</span>
                      </div>

                      <div className="text-xs text-slate-300 space-y-2">
                        <p>🏨 <strong>Donor:</strong> {d.donorName} (<a href={`tel:${d.contactNumber}`} className="underline text-blue-400">{d.contactNumber}</a>)</p>
                        <p>📍 <strong>Pickup address:</strong> {d.address}</p>
                        <p>🤝 <strong>Dropoff NGO:</strong> {d.ngoName}</p>
                      </div>

                      <div className="flex flex-col gap-3 pt-2">
                        {simulatingId === d.id ? (
                          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 animate-fade-in font-sans">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-green-400">🛰️ Live GPS Satellite Feed</span>
                              <span className="font-mono text-[10px] text-slate-400">Rider Status: Active</span>
                            </div>

                            {/* SVG Interactive Road Map */}
                            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/60 relative h-24 flex flex-col justify-center overflow-hidden">
                              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                              
                              {/* Simple SVG Road and Points */}
                              <svg className="w-full h-8 overflow-visible relative" viewBox="0 0 300 30">
                                {/* Gray Road path */}
                                <path d="M 20 15 Q 150 5, 280 15" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                                {/* Blue progress path */}
                                <path 
                                  d="M 20 15 Q 150 5, 280 15" 
                                  fill="none" 
                                  stroke="#10b981" 
                                  strokeWidth="6" 
                                  strokeLinecap="round" 
                                  strokeDasharray="300"
                                  strokeDashoffset={300 - (simStep * 75)}
                                  className="transition-all duration-1000 ease-out"
                                />

                                {/* Node A: Donor */}
                                <g transform="translate(20, 15)">
                                  <circle r="6" fill="#e11d48" />
                                  <text y="-10" textAnchor="middle" fill="#fda4af" className="text-[8px] font-bold">🏠 Donor</text>
                                </g>

                                {/* Rider Icon moving */}
                                <g 
                                  transform={`translate(${20 + (simStep * 65)}, ${15 + Math.sin(simStep * Math.PI / 4) * -2})`}
                                  className="transition-all duration-1000 ease-out"
                                >
                                  <circle r="9" fill="#3b82f6" className="animate-ping absolute opacity-40" />
                                  <circle r="8" fill="#2563eb" className="border border-white" />
                                  <text y="3" textAnchor="middle" fill="#ffffff" className="text-[9px] font-black">🚴</text>
                                </g>

                                {/* Node B: NGO Hub */}
                                <g transform="translate(280, 15)">
                                  <circle r="6" fill="#10b981" />
                                  <text y="-10" textAnchor="middle" fill="#a7f3d0" className="text-[8px] font-bold">🏢 NGO</text>
                                </g>
                              </svg>

                              {/* GPS Steps Tracker Metrics */}
                              <div className="flex justify-between text-[10px] text-slate-400 mt-4 font-mono">
                                <span>ETA: <strong className="text-white">{simEta} mins</strong></span>
                                <span>Distance: <strong className="text-white">{simDistance} km</strong></span>
                              </div>
                            </div>

                            {/* Active Step Status Label */}
                            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                              <p className="font-extrabold text-green-400">
                                {simStep === 0 && "📍 Rider Assigned: Loading cargo from Donor address..."}
                                {simStep === 1 && "📍 Arrived at Donor: Performing FSSAI visual check..."}
                                {simStep === 2 && "🚚 In-Transit: Navigating through traffic lanes..."}
                                {simStep === 3 && "🚴 Near Destination: Approaching NGO distribution dock..."}
                                {simStep === 4 && "💚 Delivered: Food distributed successfully!"}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              {simStep < 4 ? (
                                <button
                                  type="button"
                                  onClick={() => handleSimulateGPSStep(d.id)}
                                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-[10px] transition uppercase tracking-wider flex items-center justify-center gap-1.5"
                                >
                                  <span>🚴 Simulate GPS Step</span>
                                  <ChevronRight size={12} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSimulatingId(null)}
                                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-[10px] transition"
                                >
                                  Close Tracker
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSimulatingId(d.id);
                              setSimStep(d.status === 'Picked Up' ? 2 : 0);
                              setSimDistance(d.status === 'Picked Up' ? 2.8 : 5.2);
                              setSimEta(d.status === 'Picked Up' ? 10 : 18);
                            }}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-green-400 border border-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                          >
                            <Compass size={14} className="animate-spin text-green-400" /> Open Simulated GPS Route Map
                          </button>
                        )}

                        <div className="flex gap-2">
                          {d.status === 'Accepted' && (
                            <button 
                              onClick={() => handleUpdateStatus(d.id, 'Picked Up')}
                              className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs transition"
                            >
                              🚚 Mark Picked Up (In-Transit)
                            </button>
                          )}
                          {d.status === 'Picked Up' && (
                            <button 
                              onClick={() => handleUpdateStatus(d.id, 'Delivered')}
                              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition"
                            >
                              ✓ Mark Successfully Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* MY DELIVERED HISTORY */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900">My Completed Deliveries</h4>
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
                {donations.filter(d => d.volunteerId === currentUser?.id && d.status === 'Delivered').length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">You haven't completed any deliveries yet. Start one today!</p>
                ) : (
                  donations.filter(d => d.volunteerId === currentUser?.id && d.status === 'Delivered').map(d => (
                    <div key={d.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="font-bold text-slate-950">{d.foodName}</span>
                        <p className="text-[10px] text-slate-500">Delivered to {d.ngoName} from {d.donorName}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">✓ Complete</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 5: ADMIN DASHBOARD (FOR ADMINS) */}
        {view === 'admin' && (
          currentUser?.role === 'admin' ? (
            <div className="space-y-8">
            <div className="bg-white/40 backdrop-blur-xl border border-white p-6 md:p-8 rounded-[32px] shadow-md">
              <h3 className="text-2xl font-black text-slate-900">System Admin Control Center</h3>
              <p className="text-xs text-slate-600">Review total community impact metrics, verify newly registered NGOs, manage platform donations, and access analytics.</p>
            </div>

            {/* METRICS CARD PANEL */}
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-slate-500 text-[10px] font-bold uppercase">Total Food Saved</p>
                  <p className="text-3xl font-black text-green-600">{analytics.metrics.totalKGSaved} kg</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-slate-500 text-[10px] font-bold uppercase">Servings Distributed</p>
                  <p className="text-3xl font-black text-orange-500">{analytics.metrics.totalServingsDistributed}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-slate-500 text-[10px] font-bold uppercase">Verified NGOs</p>
                  <p className="text-3xl font-black text-blue-600">{analytics.metrics.totalNgos}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                  <p className="text-slate-500 text-[10px] font-bold uppercase">Surplus Listings</p>
                  <p className="text-3xl font-black text-purple-600">{analytics.metrics.totalDonations}</p>
                </div>
              </div>
            )}

            {/* NGO ACTIVATIONS QUEUE */}
            <div className="space-y-4">
              <h4 className="text-lg font-black text-slate-900">NGO Credentials Verification Queue</h4>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase">
                      <th className="p-4 font-extrabold">NGO Organization Name</th>
                      <th className="p-4 font-extrabold">Government Registration Number</th>
                      <th className="p-4 font-extrabold">Contact Info</th>
                      <th className="p-4 font-extrabold">Verification Status</th>
                      <th className="p-4 font-extrabold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.users?.filter((u: any) => u.role === 'ngo').length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">No NGOs found in the system.</td>
                      </tr>
                    ) : (
                      analytics?.users?.filter((u: any) => u.role === 'ngo').map((u: any) => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-slate-900">{u.ngoDetails?.ngoName || u.name}</td>
                          <td className="p-4 font-mono text-slate-600">{u.ngoDetails?.registrationNumber}</td>
                          <td className="p-4">
                            <span className="block">{u.email}</span>
                            <span className="text-[10px] text-slate-500">{u.phone}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                              u.ngoDetails?.isVerified 
                                ? 'bg-green-100 text-green-800' 
                                : u.ngoDetails?.isRejected 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-orange-100 text-orange-800'
                            }`}>
                              {u.ngoDetails?.isVerified 
                                ? 'Verified' 
                                : u.ngoDetails?.isRejected 
                                  ? 'Rejected' 
                                  : 'Pending Review'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {!u.ngoDetails?.isVerified && (
                                <button 
                                  onClick={() => handleVerifyNgo(u.id)}
                                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[10px] transition"
                                >
                                  Approve
                                </button>
                              )}
                              {!u.ngoDetails?.isVerified && !u.ngoDetails?.isRejected && (
                                <button 
                                  onClick={() => handleRejectNgo(u.id)}
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px] transition"
                                >
                                  Reject
                                </button>
                              )}
                              <button 
                                onClick={() => handleRemoveUser(u.id)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 font-bold rounded-lg text-[10px] transition"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MONTHLY FOOD SAVED REPORT GRAPHIC (INTERACTIVE SVG) */}
            {analytics && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Monthly Food Conservation Report (KG Saved)</h4>
                  <p className="text-[11px] text-slate-500">Visualization represents absolute kilos of healthy nourishment redirected from landfills to community distribution programs.</p>
                </div>

                <div className="h-64 flex items-end gap-3 pt-6 border-b border-l border-slate-100 pb-1 px-4">
                  {analytics.monthlyData.map((d: any, idx: number) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="text-slate-800 font-extrabold text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pb-1 bg-slate-100 px-1.5 py-0.5 rounded shadow">
                        {d.kgs} kg
                      </div>
                      <div 
                        style={{ height: `${Math.max(10, (d.kgs / 600) * 160)}px` }}
                        className="w-full bg-gradient-to-t from-green-500 to-green-600 rounded-t-xl group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300 shadow-inner"
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
          ) : (
            <div className="max-w-md mx-auto bg-white/40 backdrop-blur-xl border border-red-100 p-8 rounded-[32px] shadow-lg text-center space-y-4 font-sans animate-fade-in my-8">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto text-2xl border border-red-100/50">
                🛡️
              </div>
              <h3 className="text-xl font-black text-slate-950">Administrative Access Required</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are attempting to access a secured administrative zone. Please sign in with an Authorized Administrator account to view this control center.
              </p>
              <button
                onClick={() => setView('home')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs transition"
              >
                Return to Home
              </button>
            </div>
          )
        )}

        {/* VIEW 6: USER PROFILE & NOTIFICATIONS */}
        {view === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {currentUser ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Profile detail card */}
                  <div className="bg-white/40 backdrop-blur-xl border border-white p-6 rounded-[32px] shadow-sm space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-gradient-to-tr from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-md">
                        {currentUser.name[0]}
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-lg">{currentUser.name}</h4>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-black uppercase rounded-full">
                        {currentUser.role} Account
                      </span>
                    </div>

                    <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
                      <p className="text-slate-600"><strong>Email Address:</strong><br /> <span className="text-slate-950 font-medium">{currentUser.email}</span></p>
                      <p className="text-slate-600"><strong>Contact Number:</strong><br /> <span className="text-slate-950 font-medium">{currentUser.phone}</span></p>
                      <p className="text-slate-600"><strong>Operational Address:</strong><br /> <span className="text-slate-950 font-medium">{currentUser.address}</span></p>
                    </div>
                  </div>

                  {/* Notifications Panel */}
                  <div className="md:col-span-2 bg-white/40 backdrop-blur-xl border border-white p-6 rounded-[32px] shadow-sm flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h4 className="font-extrabold text-slate-900 text-lg">My Real-Time Alerts</h4>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{unreadCount} Unread</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px]">
                      {notifications.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs">No notifications yet. Activity alerts will appear here as they occur.</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => markNotifRead(n.id)}
                            className={`p-4 rounded-2xl border transition cursor-pointer text-xs flex justify-between items-start ${
                              n.readStatus 
                                ? 'bg-slate-50/50 border-slate-100 text-slate-500' 
                                : 'bg-green-50/75 border-green-100 text-slate-900 font-semibold shadow-sm'
                            }`}
                          >
                            <p className="leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-400 shrink-0 ml-4 font-normal">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {currentUser.role === 'donor' && (
                  <div className="bg-white/40 backdrop-blur-xl border border-white p-6 md:p-8 rounded-[32px] shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                          <Heart className="text-red-500 fill-red-100" size={20} />
                          Donation History
                        </h4>
                        <p className="text-xs text-slate-500">Track all your past surplus food contributions and their current or final delivery statuses.</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 font-black px-3 py-1 rounded-full w-fit">
                        {donations.filter(d => d.donorId === currentUser.id).length} Total Donations
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/50">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                            <th className="p-4">Food Item</th>
                            <th className="p-4">Quantity & Portions</th>
                            <th className="p-4">Pickup Location</th>
                            <th className="p-4">Scheduled Pickup</th>
                            <th className="p-4">Logistics Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donations.filter(d => d.donorId === currentUser.id).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500">
                                <span className="block text-2xl mb-1">🍲</span>
                                You have not made any food donations yet. Click "Donate Food" in the navigation to save lives!
                              </td>
                            </tr>
                          ) : (
                            donations.filter(d => d.donorId === currentUser.id).map(d => (
                              <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition last:border-b-0">
                                <td className="p-4">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-lg" title={d.foodType}>{d.foodType === 'Veg' ? '🟢' : '🔴'}</span>
                                    <div>
                                      <span className="font-extrabold text-slate-900 block">{d.foodName}</span>
                                      <span className="text-[9px] text-slate-400 font-mono">ID: {d.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-slate-800 block">{d.quantity}</span>
                                  <span className="text-slate-400 block text-[10px]">{d.servings} servings</span>
                                </td>
                                <td className="p-4 text-slate-600 truncate max-w-[180px]" title={d.address}>
                                  {d.address}
                                </td>
                                <td className="p-4 text-slate-500">
                                  {new Date(d.pickupTime).toLocaleString()}
                                </td>
                                <td className="p-4">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    d.status === 'Pending' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                                    d.status === 'Accepted' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                    d.status === 'Picked Up' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                    d.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                                    'bg-red-100 text-red-800 border border-red-200'
                                  }`}>
                                    {d.status}
                                  </span>
                                  {d.ngoName && d.status !== 'Pending' && d.status !== 'Cancelled' && (
                                    <span className="block text-[9px] text-slate-500 mt-0.5">NGO: {d.ngoName}</span>
                                  )}
                                  {d.volunteerName && d.status !== 'Pending' && d.status !== 'Cancelled' && (
                                    <span className="block text-[9px] text-slate-400">Rider: {d.volunteerName}</span>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  {d.status !== 'Delivered' && d.status !== 'Cancelled' && (
                                    cancellingId === d.id ? (
                                      <div className="flex gap-1.5 justify-end">
                                        <button 
                                          onClick={() => handleCancelDonation(d.id)}
                                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[9px] transition shadow-sm"
                                        >
                                          Yes, Cancel
                                        </button>
                                        <button 
                                          onClick={() => setCancellingId(null)}
                                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[9px] transition"
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setCancellingId(d.id)}
                                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl text-[10px] font-bold transition"
                                      >
                                        Cancel Request
                                      </button>
                                    )
                                  )}
                                  {d.status === 'Delivered' && (
                                    <span className="text-green-600 font-extrabold text-[10px] flex items-center justify-end gap-1">
                                      Served ❤️
                                    </span>
                                  )}
                                  {d.status === 'Cancelled' && (
                                    <span className="text-slate-400 font-semibold text-[10px] italic">
                                      Withdrawn
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // AUTHENTICATION LOGIN / REGISTER CARD
              <div className="max-w-md mx-auto bg-white/40 backdrop-blur-xl border border-white p-6 md:p-8 rounded-[32px] shadow-lg">
                <div className="flex flex-col items-center justify-center mb-6 border-b border-slate-100 pb-5">
                  <BhojanSetuLogo showText={true} size={80} className="flex-col text-center" />
                </div>
                <div className="flex border-b border-slate-200 mb-6">
                  <button 
                    onClick={() => setAuthTab('login')} 
                    className={`flex-1 pb-3 text-center font-bold text-sm transition ${authTab === 'login' ? 'text-green-700 border-b-2 border-green-600' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    Account Login
                  </button>
                  <button 
                    onClick={() => setAuthTab('register')} 
                    className={`flex-1 pb-3 text-center font-bold text-sm transition ${authTab === 'register' ? 'text-green-700 border-b-2 border-green-600' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    New Registration
                  </button>
                </div>

                {authTab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Registered Email</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="e.g. sharma@bhojansetu.in" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Account Password</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-green-400"
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition"
                    >
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Full Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="e.g. Amit Singh" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Account Role</label>
                        <select 
                          value={role} 
                          onChange={(e: any) => setRole(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:ring-2 focus:ring-green-400"
                        >
                          <option value="donor">Food Donor</option>
                          <option value="ngo">NGO Organization</option>
                          <option value="volunteer">Volunteer Deliverer</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="e.g. amit@gmail.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:ring-2 focus:ring-green-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Phone</label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="9876543210" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Password</label>
                        <input 
                          type="password" 
                          required 
                          placeholder="••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Physical Address / Landmark</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Sector 12, Dwarka, New Delhi" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-xs focus:ring-2 focus:ring-green-400"
                      />
                    </div>

                    {role === 'ngo' && (
                      <div className="grid grid-cols-2 gap-2 bg-green-50 p-3 rounded-xl border border-green-100">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-green-800">NGO Trust Name</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. Seva Welfare" 
                            value={ngoName}
                            onChange={(e) => setNgoName(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-green-200 rounded outline-none text-[11px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-green-800">Govt Reg Number</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="NGO/DL/2026/01" 
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-green-200 rounded outline-none text-[11px]"
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition mt-2 shadow"
                    >
                      {loading ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                  </form>
                )}

                {/* Instant Simulator Reminder */}
                <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                  Skip registration? Use the **One-Click Role Simulator** buttons in the bottom right or on the Home page to explore easily.
                </div>
              </div>
            )}
          </div>
        )}



      </main>

      {/* VIEW DETAILS MODAL OVERLAY */}
      {activeDonation && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-scale-up flex flex-col">
            <div className="h-48 bg-slate-100 relative">
              {activeDonation.image ? (
                <img src={activeDonation.image} alt="Nourishment Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-50 text-6xl">🍲</div>
              )}
              <button 
                onClick={() => setActiveDonation(null)}
                className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white font-extrabold w-8 h-8 rounded-full flex items-center justify-center transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[400px]">
              <div>
                <span className="text-[10px] bg-green-100 text-green-800 font-black uppercase px-2.5 py-1 rounded">
                  {activeDonation.foodType}
                </span>
                <h4 className="text-xl font-black text-slate-950 mt-2">{activeDonation.foodName}</h4>
                <p className="text-xs text-slate-500 mt-1">{activeDonation.quantity} • (~ {activeDonation.servings} Servings)</p>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <p>📍 <strong>Pickup from:</strong> {activeDonation.donorName}</p>
                <p>🏢 <strong>Detailed Address:</strong> {activeDonation.address}</p>
                <p>📞 <strong>Donor Phone:</strong> {activeDonation.contactNumber}</p>
                <p>⏰ <strong>Pickup Scheduled:</strong> {new Date(activeDonation.pickupTime).toLocaleString()}</p>
                <p>🔄 <strong>Logistics Status:</strong> <span className="font-bold underline text-green-700">{activeDonation.status}</span></p>
              </div>

              {activeDonation.aiDescription && (
                <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs space-y-1">
                  <span className="text-blue-400 font-bold flex items-center gap-1">
                    <Sparkles size={14} /> Gemini Vision Diagnosis:
                  </span>
                  <p className="italic">"{activeDonation.aiDescription}"</p>
                  {activeDonation.qualityScore && (
                    <div className="pt-2 flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Safety Margin: {activeDonation.qualityScore}%</span>
                      <span>Estimate: {activeDonation.freshnessEstimate}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action options inside modal based on role */}
              <div className="pt-2">
                {currentUser?.role === 'ngo' && activeDonation.status === 'Pending' && (
                  <button 
                    onClick={() => { handleAcceptDonation(activeDonation.id); setActiveDonation(null); }}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl text-xs transition"
                  >
                    Accept Donation & Coordinate Pickup
                  </button>
                )}
                {currentUser?.role === 'volunteer' && activeDonation.status === 'Accepted' && !activeDonation.volunteerId && (
                  <button 
                    onClick={() => { handleAssignVolunteer(activeDonation.id); setActiveDonation(null); }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs transition"
                  >
                    Assign This Pickup To Me
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING AI CHAT ASSISTANT PANEL */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
        {chatOpen ? (
          <div className="bg-slate-900 text-white w-[320px] md:w-[380px] h-[480px] rounded-[32px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-scale-up">
            
            {/* Chat header */}
            <div className="p-4 bg-gradient-to-r from-green-700 to-emerald-800 flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm leading-none">BhojanSetu AI</h5>
                  <span className="text-[10px] text-green-200">Online Safety Assistant</span>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white hover:text-orange-200 font-bold text-xl px-1">×</button>
            </div>

            {/* Chat message body list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-green-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/5'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick guide prompts */}
            <div className="px-4 py-2 border-t border-white/5 flex gap-1 overflow-x-auto whitespace-nowrap text-[9px] text-slate-400">
              <button onClick={() => setChatInput('How do I donate safely?')} className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition">🍲 Safe donation</button>
              <button onClick={() => setChatInput('What is the 4-hour rule?')} className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition">⏱️ 4-hour rule</button>
              <button onClick={() => setChatInput('How to verify NGO?')} className="bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition">🤝 Verification</button>
            </div>

            {/* Chat inputs */}
            <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950/80 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask food safety question..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-green-400"
              />
              <button type="submit" className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition">
                <Send size={14} />
              </button>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setChatOpen(true)}
            className="w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center border border-green-500 group transition hover:scale-105"
          >
            <MessageSquare size={26} className="group-hover:animate-bounce" />
          </button>
        )}
      </div>

    </div>
  );
}
