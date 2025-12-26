import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronRight, Dumbbell, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const WorkoutListPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [error, setError] = useState(null);

  // Date filters - default to last 30 days
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchClientName = useCallback(async () => {
    if (!clientId) return;
    try {
      const res = await api.get(`/trainer/clients/${clientId}`);
      setClientName(res.data.name);
    } catch (err) {
      console.error('Failed to fetch client name', err);
    }
  }, [clientId]);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/workout-sessions';
      if (clientId) {
        url = `/trainer/clients/${clientId}/workouts/history`;
      }

      const response = await api.get(url, {
        params: {
          from_date: fromDate,
          to_date: toDate
        }
      });

      setWorkouts(response.data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError(err.response?.data?.error || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, clientId]);

  useEffect(() => {
    fetchWorkouts();
    if (clientId) fetchClientName();
  }, [fetchWorkouts, fetchClientName, clientId]);

  // Group workouts by date
  const groupedWorkouts = workouts.reduce((groups, workout) => {
    const date = new Date(workout.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedWorkouts).sort((a, b) => new Date(b) - new Date(a));

  // Skeleton Loader Component
  const WorkoutSkeleton = () => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );

  const handleBack = () => {
    if (clientId) {
      navigate(`/trainer/clients/${clientId}/workout`);
    } else {
      navigate('/workout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 text-center">
            <h2 className="font-bold text-lg text-gray-900">Workout History</h2>
            {clientId && <p className="text-xs text-gray-500 font-medium">For {clientName || 'Client'}</p>}
          </div>
          <div className="w-10" />
        </div>

        {/* Date Range Filters */}
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={toDate}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <WorkoutSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Workouts</h3>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <button
              onClick={fetchWorkouts}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && workouts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Dumbbell size={36} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Workouts Found</h3>
            <p className="text-gray-600 text-sm mb-6 text-center">
              No workouts {clientId ? "logged by client" : "scheduled"} in the selected date range.
            </p>
          </div>
        )}

        {/* Workouts List - Grouped by Date */}
        {!loading && !error && workouts.length > 0 && (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const dayWorkouts = groupedWorkouts[date];
              const completedCount = dayWorkouts.filter(w => w.is_completed).length;
              const totalCount = dayWorkouts.length;

              return (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <Calendar size={16} className="text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-700">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-medium text-gray-500">
                      {completedCount}/{totalCount} Done
                    </span>
                  </div>

                  {/* Exercises for this date */}
                  <div className="space-y-3">
                    {dayWorkouts.map((ex) => (
                      <div
                        key={ex.id}
                        className={`bg-white p-4 rounded-2xl shadow-md border flex gap-4 items-center ${ex.is_completed ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                          }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${ex.is_completed ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                          <Dumbbell size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className={`font-bold text-base ${ex.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {ex.name}
                          </h4>
                          <div className="flex gap-3 mt-1 text-sm text-gray-600">
                            {ex.sets && <span>{ex.sets} Sets</span>}
                            {ex.reps && <span>{ex.reps} Reps</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutListPage;
