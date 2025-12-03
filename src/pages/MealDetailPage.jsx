import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Flame, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const MealDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/meals/${id}`);
        setMeal(response.data);
      } catch (err) {
        console.error('Error fetching meal details:', err);
        setError(err.response?.data?.error || 'Failed to load meal details');
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetails();
  }, [id]);

  // Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
        {/* Header Skeleton */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-8" />
        </div>

        <div className="p-5 space-y-6">
          {/* Image Skeleton */}
          <div className="w-full aspect-video bg-gray-200 rounded-3xl animate-pulse" />

          {/* Info Skeletons */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-xl w-3/4 animate-pulse" />
            <div className="flex gap-3">
              <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse" />
            </div>

            {/* Nutrient Pills Skeleton */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>

            {/* Foods Skeleton */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-16 bg-gray-200 rounded-xl animate-pulse" />
            </div>

            {/* Notes Skeleton */}
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Meal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No meal found
  if (!meal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-900">Meal Details</h2>
        <div className="w-10" />
      </div>

      <div className="p-5 space-y-6">
        {/* Meal Image */}
        <div className="w-full aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl overflow-hidden shadow-lg">
          {meal.image_url && meal ? (
            <img
              src={meal.image_url}
              alt={meal.meal_type}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {meal.meal_type === 'Breakfast' ? '🍳' :
                meal.meal_type === 'Lunch' ? '🥗' :
                  meal.meal_type === 'Dinner' ? '🍽️' : '🍎'}
            </div>
          )}
        </div>

        {/* Meal Type & Date/Time */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{meal.meal_type}</h1>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Calendar size={16} />
              <span className="text-sm font-medium">
                {new Date(meal.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Clock size={16} />
              <span className="text-sm font-medium">{meal.time}</span>
            </div>
          </div>
        </div>

        {/* Nutrition Summary - Pill Style */}
        <div>
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
            Nutrition Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Calories */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-4 text-center shadow-sm">
              <Flame size={20} className="text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-700">{meal.calories_est}</p>
              <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wide">kcal</p>
            </div>

            {/* Protein */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-700">{meal.protein || 0}</p>
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wide">Protein</p>
              <p className="text-[9px] text-blue-500">grams</p>
            </div>

            {/* Carbs */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-700">{meal.carbs || 0}</p>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wide">Carbs</p>
              <p className="text-[9px] text-green-500">grams</p>
            </div>

            {/* Fat */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-purple-700">{meal.fat || 0}</p>
              <p className="text-[10px] text-purple-600 font-semibold uppercase tracking-wide">Fat</p>
              <p className="text-[9px] text-purple-500">grams</p>
            </div>
          </div>
        </div>

        {/* Foods Detected */}
        {meal.foods_detected && (Array.isArray(meal.foods_detected) ? meal.foods_detected.length > 0 : meal.foods_detected.trim() !== '') && (
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Foods Detected
            </h3>
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-800 leading-relaxed">
                {Array.isArray(meal.foods_detected)
                  ? meal.foods_detected.join(', ')
                  : meal.foods_detected}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {meal.notes && meal.notes.trim() !== '' && (
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Notes
            </h3>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {meal.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealDetailPage;
