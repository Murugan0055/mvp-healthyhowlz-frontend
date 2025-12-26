import { Calendar, ChevronRight, Dumbbell, Trophy, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import WorkoutCard from '../components/workout/WorkoutCard';

const WorkoutTracker = ({ userId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load workouts
  useEffect(() => {
    const loadWorkouts = async () => {
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
    };
    loadWorkouts();
  }, [currentDate, isOffline, userId]);

  const handleToggleComplete = async (exercise, file = null) => {
    if (userId) return; // Trainer cannot toggle completion for client yet

    // Optimistic update
    const originalExercises = [...exercises];
    const updatedExercises = exercises.map(ex =>
      ex.id === exercise.id ? { ...ex, is_completed: !ex.is_completed } : ex
    );
    setExercises(updatedExercises);

    try {
      if (exercise.is_completed) {
        // Mark incomplete
        await api.post(`/workout-sessions/${exercise.id}/incomplete`, { date: currentDate });
      } else {
        // Mark complete
        if (file) {
          const formData = new FormData();
          formData.append('date', currentDate);
          formData.append('machinePhoto', file);

          await api.post(`/workout-sessions/${exercise.id}/complete`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          await api.post(`/workout-sessions/${exercise.id}/complete`, { date: currentDate });
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
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white ${userId ? '' : 'pb-28'}`}>
      {/* Header with Gradient - Hide for Trainer View */}
      {!userId && (
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
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <WifiOff size={18} className="text-amber-600 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-900">Offline - Changes may not save</p>
        </div>
      )}

      {/* Workout List */}
      <div className={`px-4 ${userId ? 'mt-0' : 'mt-6'} space-y-3`}>
        {/* Trainer View: Add "Create/Edit Workout Plan" button */}
        {userId && (
          <div className="mb-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md transition-all">
              Create/Edit Workout Plan
            </button>
          </div>
        )}

        {loading ? (
          // Skeleton Loading
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : exercises.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Dumbbell size={36} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Rest Day</h3>
            <p className="text-gray-500 text-sm">
              {userId ? "No workouts scheduled for today." : "No workouts scheduled for today."}
            </p>
          </div>
        ) : (
          exercises.map((exercise) => (
            <WorkoutCard
              key={exercise.id}
              exercise={exercise}
              onToggle={(file) => handleToggleComplete(exercise, file)}
              readOnly={!!userId} // Pass readOnly prop if userId is present
            />
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
