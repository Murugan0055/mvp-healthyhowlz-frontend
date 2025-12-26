import { Calendar, ChevronRight, Dumbbell, Trophy, ArrowLeft, Plus, ListChecks } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import WorkoutCard from '../components/workout/WorkoutCard';
import Skeleton from '../components/ui/Skeleton';

const WorkoutTracker = ({ userId: propUserId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const userId = propUserId || clientId;

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Load client name if trainer viewing
  useEffect(() => {
    if (userId) {
      const fetchClientName = async () => {
        try {
          const res = await api.get(`/trainer/clients/${userId}`);
          setClientName(res.data.name);
        } catch (err) {
          console.error('Failed to fetch client name', err);
        }
      };
      fetchClientName();
    }
  }, [userId]);

  // Load workouts
  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/workout-sessions?date=${currentDate}`;
      if (userId) {
        url = `/trainer/clients/${userId}/workouts?date=${currentDate}`;
      }
      const response = await api.get(url);
      setExercises(response.data);
    } catch (error) {
      console.error('Failed to fetch workouts', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, userId]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleToggleComplete = async (exercise, file = null) => {
    // Optimistic update
    const originalExercises = [...exercises];
    const updatedExercises = exercises.map(ex =>
      ex.id === exercise.id ? { ...ex, is_completed: !ex.is_completed } : ex
    );
    setExercises(updatedExercises);

    try {
      if (exercise.is_completed) {
        // Mark incomplete
        if (userId) {
          await api.post(`/trainer/clients/${userId}/workouts/${exercise.id}/incomplete`, { date: currentDate });
        } else {
          await api.post(`/workout-sessions/${exercise.id}/incomplete`, { date: currentDate });
        }
      } else {
        // Mark complete
        if (file) {
          const formData = new FormData();
          formData.append('date', currentDate);
          formData.append('machinePhoto', file);

          if (userId) {
            await api.post(`/trainer/clients/${userId}/workouts/${exercise.id}/complete`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } else {
            await api.post(`/workout-sessions/${exercise.id}/complete`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          }
        } else {
          if (userId) {
            await api.post(`/trainer/clients/${userId}/workouts/${exercise.id}/complete`, { date: currentDate });
          } else {
            await api.post(`/workout-sessions/${exercise.id}/complete`, { date: currentDate });
          }
        }
      }
    } catch (error) {
      console.error('Failed to update status', error);
      // Revert on error
      setExercises(originalExercises);
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const completedCount = exercises.filter(e => e.is_completed).length;
  const totalCount = exercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${userId ? '' : 'pb-24'}`}>
      {/* Header with Gradient - For Client View */}
      {!userId ? (
        <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold text-white">Today's Workout</h1>
              </div>
              <p className="text-blue-100 text-sm font-medium">
                {new Date(currentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ml-3">
              <Trophy size={16} className="fill-white" />
              {completedCount}/{totalCount}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 via-green-400 to-emerald-400 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-blue-100 font-semibold">
              <span>{progress === 100 ? 'Completed!' : 'Keep going!'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => navigate('/workout/plan')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95 border border-white/30 shadow-lg group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Calendar size={20} className="text-white" />
                </div>
                <p className="text-white text-sm font-bold">View Plan</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/workout/all')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95 border border-white/30 shadow-lg group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ChevronRight size={20} className="text-white" />
                </div>
                <p className="text-white text-sm font-bold">History</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* Trainer Header Sticky Header */
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
          <div className="px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate(`/trainer/clients/${userId}`)}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">{clientName || 'Client'}'s Workout</h1>
              <p className="text-xs text-gray-500 font-medium">Daily Tracking</p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100">
              <Trophy size={14} className="fill-blue-600" />
              {completedCount}/{totalCount}
            </div>
          </div>

          {/* Action Buttons for Trainer */}
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            <button
              onClick={() => navigate(`/trainer/clients/${userId}/workout/plan`)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl py-5 px-4 text-center transition-all flex flex-col items-center justify-center gap-2 text-sm font-bold border border-indigo-100 shadow-sm active:scale-95"
            >
              <ListChecks size={20} />
              View Workout Plan
            </button>

            <button
              onClick={() => navigate(`/trainer/clients/${userId}/workout/plan/new`)}
              className="bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl py-5 px-4 text-center transition-all flex flex-col items-center justify-center gap-2 text-sm font-bold border border-green-100 shadow-sm active:scale-95"
            >
              <Plus size={20} />
              Create Workout Plan
            </button>

            <button
              onClick={() => navigate(`/trainer/clients/${userId}/workout/all`)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl py-5 px-4 text-center transition-all flex flex-col items-center justify-center gap-2 text-sm font-bold border border-purple-100 col-span-2 shadow-sm active:scale-95"
            >
              <ChevronRight size={20} />
              View All Workouts
            </button>
          </div>
        </div>
      )}


      {/* Workout List Area */}
      <div className={`flex-1 flex flex-col px-4 ${userId ? 'mt-4' : 'mt-6'}`}>
        <div className="space-y-3 flex-1 overflow-y-auto pb-6">
          {loading ? (
            // Skeleton Loading
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))
          ) : exercises.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                <Dumbbell size={36} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">No Workouts Scheduled</h3>
              <p className="text-gray-500 text-sm text-center">
                {userId ? "No workouts logged for today." : "No workouts scheduled for today."}
              </p>
            </div>
          ) : (
            exercises.map((exercise) => (
              <WorkoutCard
                key={exercise.id}
                exercise={exercise}
                onToggle={(file) => handleToggleComplete(exercise, file)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;
