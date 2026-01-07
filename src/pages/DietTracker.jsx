import { AlertCircle, ArrowLeft, Camera, ChevronRight, Flame, Image as ImageIcon, Loader2, Plus, RefreshCw, Utensils, WifiOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Skeleton from '../components/ui/Skeleton';

const DietTracker = ({ userId: propUserId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const userId = propUserId || clientId;

  const [view, setView] = useState('LIST'); // 'LIST' or 'ADD'
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('');

  // Add Meal State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [formData, setFormData] = useState({
    meal_type: '',
    foods_detected: '',
    calories_est: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: ''
  });

  // Refs for keyboard navigation
  const foodsRef = useRef(null);
  const caloriesRef = useRef(null);
  const proteinRef = useRef(null);
  const carbsRef = useRef(null);
  const fatRef = useRef(null);
  const notesRef = useRef(null);


  // Load from API on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        let url = `/meals?from_date=${today}&to_date=${today}`;
        if (userId) {
          url = `/trainer/clients/${userId}/meals?from_date=${today}&to_date=${today}`;

          // Also fetch client name if not already set
          if (!clientName) {
            const clientRes = await api.get(`/trainer/clients/${userId}`);
            setClientName(clientRes.data.name);
          }
        }

        const response = await api.get(url);
        setMeals(response.data);
      } catch (error) {
        console.error('Failed to fetch meals', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId, clientName]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAnalysisError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setSelectedImage(base64String);

      // Auto-analyze
      await analyzeImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData) => {
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await api.post('/meals/analyze', { image: imageData });
      const data = response.data;

      // Pre-fill form with animation
      setTimeout(() => {
        setFormData({
          meal_type: data.meal_type || 'Snack',
          foods_detected: data.foods_detected?.join(', ') || '',
          calories_est: data.calories_est || 0,
          protein: data.macros?.protein || 0,
          carbs: data.macros?.carbs || 0,
          fat: data.macros?.fat || 0,
          notes: ''
        });
      }, 300);
    } catch (error) {
      console.error('Error analyzing meal:', error);
      if (error.response?.status === 429) {
        setAnalysisError(error.response.data.message || 'Daily AI analysis limit reached (7 requests). Please try again tomorrow.');
      } else {
        setAnalysisError('Could not analyze image. Please enter details manually or try again.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const retryAnalysis = () => {
    if (selectedImage) {
      analyzeImage(selectedImage);
    }
  };

  const handleSave = async () => {
    if (!formData.calories_est || !formData.meal_type) return;

    setSaveError(null);
    const newMeal = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      meal_type: formData.meal_type,
      foods_detected: formData.foods_detected.split(',').map(s => s.trim()).filter(Boolean),
      calories_est: Number(formData.calories_est),
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      notes: formData.notes,
      image_url: selectedImage || 'placeholder_url'
    };

    try {
      const response = await api.post('/meals', newMeal);
      const savedMeal = response.data;

      const updatedMeals = [savedMeal, ...meals];
      setMeals(updatedMeals);

      // Reset and go back with animation
      setTimeout(() => {
        setView('LIST');
        resetForm();
      }, 200);
    } catch (error) {
      console.error('Error saving meal:', error);
      setSaveError('Failed to save meal. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setAnalysisError(null);
    setSaveError(null);
    setFormData({
      meal_type: '',
      foods_detected: '',
      calories_est: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: ''
    });
  };

  // Keyboard navigation handlers
  const handleKeyPress = (e, nextRef) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  // --- ADD MEAL VIEW ---
  if (view === 'ADD' && !userId) {
    const isFormValid = formData.meal_type && formData.calories_est;

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setView('LIST')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-lg text-gray-900">Add Meal</h2>
          <div className="w-10" />
        </div>

        <div className="p-5 space-y-6">

          {/* Image Upload / Preview */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl overflow-hidden border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center group shadow-inner">
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Meal preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisError(null);
                  }}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>
                {!analyzing && !analysisError && (
                  <button
                    onClick={retryAnalysis}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-primary px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Re-analyze
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={32} className="text-indigo-500" />
                  </div>
                  <p className="text-sm text-gray-700 font-semibold">Tap to capture meal</p>
                  <p className="text-xs text-gray-500 mt-1">AI will analyze your food</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  aria-label="Upload meal image"
                />
              </>
            )}

            {/* Analyzing Overlay */}
            {analyzing && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/95 to-purple-600/95 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                <Loader2 size={48} className="animate-spin mb-3" />
                <p className="font-semibold text-lg animate-pulse">Analyzing your meal...</p>
                <p className="text-sm text-indigo-100 mt-1">This may take a few seconds</p>
              </div>
            )}
          </div>

          {/* Analysis Error */}
          {analysisError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">{analysisError}</p>
                {selectedImage && (
                  <button
                    onClick={retryAnalysis}
                    className="text-xs text-red-700 font-medium mt-2 underline hover:no-underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
            {/* Meal Type */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Meal Type *
              </label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, foodsRef)}
                className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                required
              >
                <option value="">Select meal type...</option>
                <option value="Pre Workout"> 🏋️ Pre Workout</option>
                <option value="Breakfast">🍳 Breakfast</option>
                <option value="Lunch">🥗 Lunch</option>
                <option value="Snack">🍎 Snack</option>
                <option value="Post Workout"> 🏋️ Post Workout</option>
                <option value="Dinner">🍽️ Dinner</option>
              </select>
            </div>

            {/* Foods Detected */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Foods
              </label>
              <textarea
                ref={foodsRef}
                value={formData.foods_detected}
                onChange={(e) => setFormData({ ...formData, foods_detected: e.target.value })}
                placeholder="e.g. Grilled Chicken, Brown Rice, Broccoli"
                className="w-full h-20 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                rows={2}
              />
            </div>

            {/* Calories & Protein */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Calories *
                </label>
                <input
                  ref={caloriesRef}
                  type="number"
                  inputMode="numeric"
                  value={formData.calories_est}
                  onChange={(e) => setFormData({ ...formData, calories_est: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, proteinRef)}
                  placeholder="0"
                  className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base font-bold text-orange-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Protein (g)
                </label>
                <input
                  ref={proteinRef}
                  type="number"
                  inputMode="numeric"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, carbsRef)}
                  placeholder="0"
                  className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Carbs & Fat */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Carbs (g)
                </label>
                <input
                  ref={carbsRef}
                  type="number"
                  inputMode="numeric"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, fatRef)}
                  placeholder="0"
                  className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Fat (g)
                </label>
                <input
                  ref={fatRef}
                  type="number"
                  inputMode="numeric"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, notesRef)}
                  placeholder="0"
                  className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Notes (Optional)
              </label>
              <textarea
                ref={notesRef}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional details..."
                className="w-full h-20 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                rows={2}
              />
            </div>

            {/* Save Error */}
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-900">{saveError}</p>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSave}
              className="w-full mt-6 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all"
              size="lg"
              disabled={!isFormValid || analyzing}
            >
              {analyzing ? 'Analyzing...' : 'Save Meal'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  const totalCalories = meals.reduce((acc, meal) => acc + (meal.calories_est || 0), 0);
  const totalProtein = meals.reduce((acc, meal) => acc + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((acc, meal) => acc + (meal.carbs || 0), 0);
  const totalFat = meals.reduce((acc, meal) => acc + (meal.fat || 0), 0);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col ${userId ? '' : 'pb-28'}`}>
      {/* Header with Gradient - Hide for Trainer View */}
      {/* Header with Gradient */}
      {!userId ? (
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold text-white">Today's Meals</h1>
              </div>
              <p className="text-indigo-100 text-sm font-medium">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ml-3">
              <Flame size={16} className="fill-white" />
              {totalCalories}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${Math.min((totalCalories / 2500) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-indigo-100 font-semibold">
              <span>{totalCalories} / 2500 kcal</span>
              <span>{Math.round((totalCalories / 2500) * 100)}%</span>
            </div>
          </div>

          {/* Macros Summary */}
          {meals.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
                <p className="text-white/80 text-xs font-medium mb-1">Protein</p>
                <p className="text-white text-lg font-bold">{totalProtein}g</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
                <p className="text-white/80 text-xs font-medium mb-1">Carbs</p>
                <p className="text-white text-lg font-bold">{totalCarbs}g</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
                <p className="text-white/80 text-xs font-medium mb-1">Fat</p>
                <p className="text-white text-lg font-bold">{totalFat}g</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => navigate('/diet/plan')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95 border border-white/30 shadow-lg group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Utensils size={20} className="text-white" />
                </div>
                <p className="text-white text-sm font-bold">View Diet Plan</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/diet/meals/all')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95 border border-white/30 shadow-lg group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ChevronRight size={20} className="text-white" />
                </div>
                <p className="text-white text-sm font-bold">View All Meals</p>
              </div>
            </button>
          </div>
        </div>
      ) : (
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
              <h1 className="text-lg font-bold text-gray-900">{clientName || 'Client'}'s Diet</h1>
              <p className="text-xs text-gray-500 font-medium">Daily Tracking</p>
            </div>
            <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-orange-100">
              <Flame size={14} className="fill-orange-600" />
              {totalCalories} kcal
            </div>
          </div>

          {/* Action Buttons for Trainer */}
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            <button
              onClick={() => navigate(`/trainer/clients/${userId}/diet/plan`)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl py-5 px-4 text-center transition-all flex flex-col items-center justify-center gap-2 text-sm font-bold border border-indigo-100 shadow-sm active:scale-95"
            >
              <Utensils size={20} />
              View Diet Plan
            </button>

            <button
              onClick={() => navigate(`/trainer/clients/${userId}/diet/plan/new`)}
              className="bg-green-50 hover:bg-green-100 text-green-700 rounded-2xl py-5 px-4 text-center transition-all flex flex-col items-center justify-center gap-2 text-sm font-bold border border-green-100 shadow-sm active:scale-95"
            >
              <Plus size={20} />
              Create Diet Plan
            </button>

            <button
              onClick={() => navigate(`/trainer/clients/${userId}/diet/meals/all`)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-2xl py-5 px-4 text-center transition-all flex flex-col items-center justify-center gap-2 text-sm font-bold border border-purple-100 col-span-2 shadow-sm active:scale-95"
            >
              <ChevronRight size={20} />
              View All Meals
            </button>
          </div>
        </div>
      )}



      {/* Meal List Area */}
      <div className={`flex-1 flex flex-col px-4 ${userId ? 'mt-4' : 'mt-6'}`}>
        <div className="space-y-3 flex-1 overflow-y-auto">

          {loading ? (
            // Skeleton Loading
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-4">
                  <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : meals.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                <ImageIcon size={36} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No meals logged yet today</h3>
              <p className="text-gray-500 text-sm mb-6 text-center max-w-[250px]">
                {userId ? "Client hasn't logged any meals yet." : "Start tracking your nutrition today!"}
              </p>
              {!userId && (
                <Button onClick={() => setView('ADD')} size="lg" className="shadow-lg">
                  <Plus size={20} className="mr-2" />
                  Add Your First Meal
                </Button>
              )}
            </div>
          ) : (
            meals.map((meal, idx) => (
              <div
                key={meal.id || idx}
                onClick={() => !userId && navigate(`/diet/meals/${meal.id}`)}
                className={`bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex gap-4 items-center ${!userId ? 'active:scale-[0.98] hover:shadow-lg cursor-pointer' : ''} transition-all`}
              >
                {/* Meal Image/Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-inner overflow-hidden">
                  {meal.image_url && meal ? (
                    <img src={meal.image_url} alt={meal.meal_type} className="w-full h-full object-cover" />
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

                {!userId && <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />}
              </div>
            ))
          )}

        </div>

        {/* Floating Action Button - Hide for Trainer View */}
        {
          meals.length > 0 && !userId && (
            <button
              onClick={() => setView('ADD')}
              className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 group"
              aria-label="Add meal"
            >
              <Plus size={32} className="group-hover:rotate-90 transition-transform" />
            </button>
          )
        }
      </div>
    </div>
  );
};

export default DietTracker;
