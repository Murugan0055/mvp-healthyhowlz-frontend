import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, Info, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import DietMealCard from './DietMealCard';
import DietVersionModal from './DietVersionModal';

const DietPlanScreen = () => {
  const navigate = useNavigate();
  const { clientId: paramClientId } = useParams();
  const clientId = paramClientId || 'me';

  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [versions, setVersions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [clientName, setClientName] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchCurrentPlan();
    fetchVersions();
    if (paramClientId) {
      fetchClientName();
    }
  }, [clientId]);

  const fetchClientName = async () => {
    try {
      const res = await api.get(`/trainer/clients/${paramClientId}`);
      setClientName(res.data.name);
    } catch (err) {
      console.error('Failed to fetch client name', err);
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clients/${clientId}/diet-plans/current`);
      setCurrentPlan(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch current plan', err);
      if (err.response?.status === 404) {
        setError('No active diet plan assigned yet.');
      } else {
        setError('Failed to load diet plan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await api.get(`/clients/${clientId}/diet-plans/versions`);
      setVersions(res.data);
    } catch (err) {
      console.error('Failed to fetch versions', err);
    }
  };

  const handleSelectVersion = async (version) => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const res = await api.get(`/clients/${clientId}/diet-plans/${version.id}`);
      setCurrentPlan(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch selected plan', err);
      setError('Failed to load selected plan.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = currentPlan?.meals?.reduce((acc, meal) => ({
    protein: acc.protein + Number(meal.protein_g || 0),
    carbs: acc.carbs + Number(meal.carbs_g || 0),
    fat: acc.fat + Number(meal.fat_g || 0),
    calories: acc.calories + Number(meal.calories_kcal || 0),
  }), { protein: 0, carbs: 0, fat: 0, calories: 0 });

  if (loading && !currentPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
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
            <h1 className="text-lg font-bold text-gray-900">
              {paramClientId ? `${clientName || 'Client'}'s Diet Plan` : 'Diet Plan'}
            </h1>
          </div>
          {paramClientId && (
            <button
              onClick={() => navigate(`/trainer/clients/${paramClientId}/diet/plan/new`)}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              Create New
            </button>
          )}
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
              className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Plan Info Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
              {currentPlan.followed_till && (
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold text-white border border-white/20">
                  Past Plan
                </div>
              )}
              <h2 className="text-xl font-bold mb-1 pr-16">{currentPlan.title}</h2>
              <p className="text-indigo-100 text-sm mb-4 opacity-90">{currentPlan.description}</p>

              {/* Totals */}
              <div className="flex justify-between items-center bg-white/10 backdrop-blur-md rounded-xl p-3">
                <div className="text-center">
                  <p className="text-xs text-indigo-200 mb-0.5">Protein</p>
                  <p className="font-bold">{Math.round(totals.protein)}g</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-xs text-indigo-200 mb-0.5">Carbs</p>
                  <p className="font-bold">{Math.round(totals.carbs)}g</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-xs text-indigo-200 mb-0.5">Fat</p>
                  <p className="font-bold">{Math.round(totals.fat)}g</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-xs text-indigo-200 mb-0.5">Calories</p>
                  <p className="font-bold text-yellow-300">{Math.round(totals.calories)}</p>
                </div>
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
              {currentPlan.meals && currentPlan.meals.length > 0 ? (
                currentPlan.meals.map((meal) => (
                  <DietMealCard key={meal.id} meal={meal} />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No meals defined for this plan.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Version History Modal */}
      <DietVersionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        versions={versions}
        currentVersionId={currentPlan?.id}
        onSelectVersion={handleSelectVersion}
      />
    </div>
  );
};

export default DietPlanScreen;
