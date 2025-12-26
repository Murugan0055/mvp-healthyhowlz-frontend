import { ChevronLeft, Calendar, Dumbbell, Mail, Phone, User, CheckCircle2, ArrowLeft, Utensils } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Profile from './Profile';
import DietTracker from './DietTracker';
import WorkoutTracker from './WorkoutTracker';
import api from '../utils/api';
import Skeleton from '../components/ui/Skeleton';

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


  if (!loading && !client) {
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

  const sessionProgress = client?.total_sessions ? (client.completed_sessions / client.total_sessions) * 100 : 0;

  // Render Sub-Views (Diet/Workout) with a simple back header

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Simple Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/trainer/clients')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Client Details</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5">
          {loading ? (
            <Skeleton className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 rounded-full overflow-hidden bg-indigo-50 border border-indigo-100 flex-shrink-0">
              {client.profile_image_url ? (
                <img src={client.profile_image_url} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-500 text-2xl font-bold">
                  {client.name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 truncate">{client.name}</h2>
                <div className="flex flex-col gap-1 mt-1 text-gray-500 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Session Tracker Card */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
          {/* Subtle Decorative Circle */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

          {loading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 bg-white/20" />
                <Skeleton className="h-6 w-32 bg-white/20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full bg-white/10" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Session Progress</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{client.completed_sessions}</span>
                    <span className="text-indigo-100 text-sm opacity-80">/ {client.total_sessions} completed</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm relative z-10">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  style={{ width: `${sessionProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-indigo-100 font-bold tracking-wide relative z-10">
                <span>{client.total_sessions - client.completed_sessions} Remaining</span>
                <span>{Math.round(sessionProgress)}% Done</span>
              </div>
            </>
          )}
        </div>

        {/* Action Cards (Diet & Workout) */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/trainer/clients/${client?.id}/diet`)}
            className="bg-white hover:bg-green-50 rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full -mr-8 -mt-8" />
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shadow-inner">
              <Utensils size={24} />
            </div>
            <span className="text-gray-900 font-bold text-sm">Diet Plan</span>
          </button>

          <div
            onClick={() => navigate(`/trainer/clients/${clientId}/workout`)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-95 cursor-pointer group"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Dumbbell size={28} />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-900">Workout Plan</h3>
              <p className="text-xs text-gray-500">Track exercises</p>
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="px-4 relative z-20 mt-2">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">Personal Details</h3>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                    <Skeleton className="h-4 w-20 bg-gray-100" />
                    <Skeleton className="h-4 w-24 bg-gray-100" />
                  </div>
                ))
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerClientDetail;
