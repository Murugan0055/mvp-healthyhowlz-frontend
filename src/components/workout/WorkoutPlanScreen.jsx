import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, Info, Loader2, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import WorkoutVersionModal from './WorkoutVersionModal';

const WorkoutPlanScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCurrentPlan();
    fetchVersions();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      setLoading(true);
      const res = await api.get('/clients/me/workout-plans/current');
      setCurrentPlan(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch current plan', err);
      if (err.response?.status === 404) {
        setError('No active workout plan assigned yet.');
      } else {
        setError('Failed to load workout plan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await api.get('/clients/me/workout-plans/versions');
      setVersions(res.data);
    } catch (err) {
      console.error('Failed to fetch versions', err);
    }
  };

  const handleSelectVersion = async (version) => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const res = await api.get(`/clients/me/workout-plans/${version.id}`);
      setCurrentPlan(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch selected plan', err);
      setError('Failed to load selected plan.');
    } finally {
      setLoading(false);
    }
  };

  // Group exercises by day
  const groupedExercises = currentPlan?.exercises?.reduce((acc, ex) => {
    const day = ex.day_name || 'Unscheduled';
    if (!acc[day]) acc[day] = [];
    acc[day].push(ex);
    return acc;
  }, {}) || {};

  // Sort days order (Monday, Tuesday, etc.) - simple approach or just rely on insertion order if sorted in DB
  // Since DB order is by order_index, and usually we insert in order, it might be fine.
  // But `groupedExercises` keys order isn't guaranteed.
  // Let's assume the list is sorted by order_index, so if we iterate the list and build groups, the groups will appear in order of first appearance.
  const sortedDays = Object.keys(groupedExercises);

  if (loading && !currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Workout Plan</h1>
          </div>
        </div>

        {/* Version Selector */}
        {!error && currentPlan && (
          <div className="px-4 pb-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 transition-colors w-fit"
            >
              <Calendar size={14} />
              <span>
                {currentPlan.followed_till
                  ? `Past: ${new Date(currentPlan.followed_from).toLocaleDateString()} - ${new Date(currentPlan.followed_till).toLocaleDateString()}`
                  : `Current · Since ${new Date(currentPlan.followed_from).toLocaleDateString()}`
                }
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">{error}</p>
            <button
              onClick={fetchCurrentPlan}
              className="mt-4 text-blue-600 font-bold text-sm hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Plan Info Card */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              {currentPlan.followed_till && (
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/20">
                  Past Plan
                </div>
              )}
              <h2 className="text-xl font-bold mb-1 pr-16">{currentPlan.title}</h2>
              <p className="text-blue-100 text-sm mb-4 opacity-90">{currentPlan.description}</p>
            </div>

            {/* Exercises List Grouped by Day */}
            <div className="space-y-6">
              {sortedDays.length > 0 ? (
                sortedDays.map(day => (
                  <div key={day} className="space-y-3">
                    <h3 className="font-bold text-gray-800 text-lg px-1">{day}</h3>
                    {groupedExercises[day].map((ex) => (
                      <div key={ex.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Dumbbell size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{ex.name}</h4>
                          <div className="flex gap-3 mt-1 text-sm text-gray-600">
                            {ex.sets && <span>{ex.sets} Sets</span>}
                            {ex.reps && <span>{ex.reps} Reps</span>}
                            {ex.duration && <span>{ex.duration}</span>}
                          </div>
                          {ex.notes && <p className="text-xs text-gray-500 mt-1">{ex.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No exercises defined for this plan.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Version History Modal */}
      <WorkoutVersionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        versions={versions}
        currentVersionId={currentPlan?.id}
        onSelectVersion={handleSelectVersion}
      />
    </div>
  );
};

export default WorkoutPlanScreen;
