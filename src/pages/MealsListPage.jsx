import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const MealsListPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientName, setClientName] = useState('');

  // Date filters - default to last 30 days
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = clientId
        ? `/trainer/clients/${clientId}/meals`
        : '/meals';

      const response = await api.get(url, {
        params: {
          from_date: fromDate,
          to_date: toDate,
          sort_by: 'date',
          sort_order: 'DESC'
        }
      });

      if (clientId && !clientName) {
        const clientRes = await api.get(`/trainer/clients/${clientId}`);
        setClientName(clientRes.data.name);
      }

      setMeals(response.data);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError(err.response?.data?.error || 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Group meals by date
  const groupedMeals = meals.reduce((groups, meal) => {
    const date = meal.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meal);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedMeals).sort((a, b) => new Date(b) - new Date(a));

  // Skeleton Loader Component
  const MealSkeleton = () => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (clientId) {
                navigate(`/trainer/clients/${clientId}/diet`);
              } else {
                navigate('/diet');
              }
            }}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-lg text-gray-900">
            {clientId ? `${clientName || 'Client'}'s Meals` : 'All Meal Logs'}
          </h2>
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
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
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
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Result Count */}
          {!loading && (
            <div className="text-sm text-gray-600 font-medium">
              {meals.length} {meals.length === 1 ? 'meal' : 'meals'} found
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <MealSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Meals</h3>
            <p className="text-gray-600 text-sm mb-6">{error}</p>
            <button
              onClick={fetchMeals}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && meals.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ImageIcon size={36} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Meals Found</h3>
            <p className="text-gray-600 text-sm mb-6">
              No meals logged in the selected date range.
            </p>
            <button
              onClick={() => navigate(clientId ? `/trainer/clients/${clientId}/diet` : '/diet')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {clientId ? 'Back to Diet' : 'Add Your First Meal'}
            </button>
          </div>
        )}

        {/* Meals List - Grouped by Date */}
        {!loading && !error && meals.length > 0 && (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Calendar size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-700">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Meals for this date */}
                <div className="space-y-3">
                  {groupedMeals[date].map((meal) => (
                    <div
                      key={meal.id}
                      onClick={() => !clientId && navigate(`/diet/meals/${meal.id}`)}
                      className={`bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex gap-4 items-center ${!clientId ? 'active:scale-[0.98] hover:shadow-lg cursor-pointer' : ''} transition-all`}
                    >
                      {/* Meal Image/Icon */}
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                        {meal.image_url && meal ? (
                          <img
                            src={meal.image_url}
                            alt={meal.meal_type}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {meal.meal_type === 'Breakfast' ? '🍳' :
                              meal.meal_type === 'Lunch' ? '🥗' :
                                meal.meal_type === 'Dinner' ? '🍽️' : '🍎'}
                          </>
                        )}
                      </div>

                      {/* Meal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 text-base">{meal.meal_type}</h4>
                          <span className="text-xs font-semibold text-gray-400">{meal.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {Array.isArray(meal.foods_detected)
                            ? meal.foods_detected.join(', ')
                            : meal.foods_detected || 'No foods listed'}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                            {meal.calories_est} kcal
                          </span>
                          {meal.protein > 0 && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                              P: {meal.protein}g
                            </span>
                          )}
                          {meal.carbs > 0 && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                              C: {meal.carbs}g
                            </span>
                          )}
                          {meal.fat > 0 && (
                            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                              F: {meal.fat}g
                            </span>
                          )}
                        </div>
                      </div>

                      {!clientId && <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealsListPage;
