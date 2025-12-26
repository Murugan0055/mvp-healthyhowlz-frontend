import { ChevronLeft, Calendar, Dumbbell, Mail, Phone, User, CheckCircle2, ArrowLeft, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Profile from './Profile';
import DietTracker from './DietTracker';
import WorkoutTracker from './WorkoutTracker';
import api from '../utils/api';

const TrainerClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'diet', 'workout'
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await api.get(`/trainer/clients/${clientId}`);
        setClient(response.data);
      } catch (error) {
        console.error('Failed to fetch client details', error);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-500 mb-4">Client not found.</p>
        <button
          onClick={() => navigate('/trainer/clients')}
          className="text-indigo-600 font-medium hover:underline"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const sessionProgress = client.total_sessions ? (client.completed_sessions / client.total_sessions) * 100 : 0;

  // Render Sub-Views (Diet/Workout) with a simple back header
  if (activeView === 'diet') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm flex items-center gap-3">
          <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-bold text-lg text-gray-900">Diet Plan</h1>
        </div>
        <div className="p-4">
          <DietTracker userId={clientId} />
        </div>
      </div>
    );
  }

  if (activeView === 'workout') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white sticky top-0 z-10 px-4 py-3 shadow-sm flex items-center gap-3">
          <button onClick={() => setActiveView('dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="font-bold text-lg text-gray-900">Workout Plan</h1>
        </div>
        <div className="p-4">
          <WorkoutTracker userId={clientId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl relative z-10">
        {/* Top Bar */}
        <div className="relative flex items-center justify-center mb-8">
          <button
            onClick={() => navigate('/trainer/clients')}
            className="absolute left-0 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Client Details</h1>
        </div>

        {/* Profile Info */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-lg overflow-hidden bg-white flex-shrink-0">
            {client.profile_image_url ? (
              <img src={client.profile_image_url} alt={client.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 text-2xl font-bold">
                {client.name?.charAt(0) || 'C'}
              </div>
            )}
          </div>
          <div className="text-white flex-1 min-w-0">
            <h2 className="text-2xl font-bold truncate">{client.name}</h2>
            <div className="flex flex-col gap-1 mt-1 text-indigo-100 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span className="truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Session Tracker Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Session Progress</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">{client.completed_sessions}</span>
                <span className="text-indigo-200 text-sm">/ {client.total_sessions} completed</span>
              </div>
            </div>
            {/* <button
              onClick={async () => {
                if (confirm('Mark one session as complete?')) {
                  try {
                    const res = await api.post(`/trainer/clients/${clientId}/sessions/complete`);
                    setClient(prev => ({
                      ...prev,
                      completed_sessions: res.data.completed_sessions
                    }));
                  } catch (err) {
                    alert('Failed to update session: ' + (err.response?.data?.error || err.message));
                  }
                }
              }}
              className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Mark Complete
            </button> */}
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${sessionProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-indigo-200 font-medium">
            <span>{client.total_sessions - client.completed_sessions} Remaining</span>
            <span>{Math.round(sessionProgress)}% Done</span>
          </div>
        </div>

        {/* Action Cards (Diet & Workout) */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/trainer/clients/${client.id}/diet`)}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/20 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Utensils size={24} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">View Diet</span>
          </button>

          <button
            onClick={() => setActiveView('workout')}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/20 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Dumbbell size={24} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">View Workout</span>
          </button>
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Personal Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Age</span>
              <span className="text-sm font-semibold text-gray-900">{client.age || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Gender</span>
              <span className="text-sm font-semibold text-gray-900">{client.gender || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Goal</span>
              <span className="text-sm font-semibold text-gray-900">{client.goal || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="text-sm font-semibold text-gray-900">{client.phone || 'Not set'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm font-semibold text-gray-900">{client.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerClientDetail;
