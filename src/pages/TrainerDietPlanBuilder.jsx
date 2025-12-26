import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Info, Flame, Apple, Coffee, Utensils, UtensilsCrossed, Dumbbell } from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';

const MEAL_TYPES = [
  { value: 'Breakfast', icon: Coffee },
  { value: 'Lunch', icon: Utensils },
  { value: 'Dinner', icon: UtensilsCrossed },
  { value: 'Snack', icon: Apple },
  { value: 'Pre Workout', icon: Dumbbell },
  { value: 'Post Workout', icon: Dumbbell }
];

const TrainerDietPlanBuilder = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [planData, setPlanData] = useState({
    title: '',
    description: '',
    isActive: true,
    meals: [
      { meal_type: 'Breakfast', name: '', description: '', protein_g: '', carbs_g: '', fat_g: '', calories_kcal: '' }
    ]
  });

  useEffect(() => {
    fetchClientName();
  }, [clientId]);

  const fetchClientName = async () => {
    try {
      const res = await api.get(`/trainer/clients/${clientId}`);
      setClientName(res.data.name);
    } catch (err) {
      console.error('Failed to fetch client name', err);
    }
  };

  const handleAddMeal = () => {
    setPlanData({
      ...planData,
      meals: [
        ...planData.meals,
        { meal_type: 'Snack', name: '', description: '', protein_g: '', carbs_g: '', fat_g: '', calories_kcal: '' }
      ]
    });
  };

  const handleRemoveMeal = (index) => {
    const newMeals = planData.meals.filter((_, i) => i !== index);
    setPlanData({ ...planData, meals: newMeals });
  };

  const handleMealChange = (index, field, value) => {
    const newMeals = [...planData.meals];
    newMeals[index][field] = value;

    // Auto-calculate calories if macros change
    if (['protein_g', 'carbs_g', 'fat_g'].includes(field)) {
      const p = Number(newMeals[index].protein_g) || 0;
      const c = Number(newMeals[index].carbs_g) || 0;
      const f = Number(newMeals[index].fat_g) || 0;
      newMeals[index].calories_kcal = Math.round((p * 4) + (c * 4) + (f * 9));
    }

    setPlanData({ ...planData, meals: newMeals });
  };

  const handleSave = async () => {
    if (!planData.title) {
      setError('Please provide a title for the diet plan.');
      return;
    }

    if (planData.meals.length === 0) {
      setError('Please add at least one meal to the plan.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.post(`/clients/${clientId}/diet-plans`, planData);
      navigate(`/trainer/clients/${clientId}/diet`);
    } catch (err) {
      console.error('Failed to save diet plan', err);
      setError('Failed to save diet plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalMacros = planData.meals.reduce((acc, meal) => ({
    p: acc.p + (Number(meal.protein_g) || 0),
    c: acc.c + (Number(meal.carbs_g) || 0),
    f: acc.f + (Number(meal.fat_g) || 0),
    cal: acc.cal + (Number(meal.calories_kcal) || 0)
  }), { p: 0, c: 0, f: 0, cal: 0 });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/trainer/clients/${clientId}/diet`)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Create Diet Plan</h1>
            <p className="text-xs text-gray-500 font-medium">For {clientName || 'Client'}</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="shadow-md"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Plan Basics */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Plan Title</label>
            <input
              type="text"
              value={planData.title}
              onChange={(e) => setPlanData({ ...planData, title: e.target.value })}
              placeholder="e.g. Muscle Gain Plan v1"
              className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={planData.description}
              onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
              placeholder="Any specific instructions for the client..."
              className="w-full h-28 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
          <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-indigo-600" />
              <span className="text-sm font-bold text-indigo-900">Set as Active Plan</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={planData.isActive}
                onChange={(e) => setPlanData({ ...planData, isActive: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
          <h3 className="text-sm font-bold mb-3 opacity-90">Daily Totals</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Protein</p>
              <p className="text-lg font-bold">{totalMacros.p}g</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Carbs</p>
              <p className="text-lg font-bold">{totalMacros.c}g</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Fat</p>
              <p className="text-lg font-bold">{totalMacros.f}g</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Calories</p>
              <p className="text-lg font-bold text-yellow-300">{totalMacros.cal}</p>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-gray-900">Meals</h3>
            <button
              onClick={handleAddMeal}
              className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <Plus size={16} />
              Add Meal
            </button>
          </div>

          {planData.meals.map((meal, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 relative animate-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => handleRemoveMeal(index)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Meal Type</label>
                  <select
                    value={meal.meal_type}
                    onChange={(e) => handleMealChange(index, 'meal_type', e.target.value)}
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  >
                    {MEAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Meal Name</label>
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                    placeholder="e.g. Oats & Whey"
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Items / Description</label>
                <textarea
                  value={meal.description}
                  onChange={(e) => handleMealChange(index, 'description', e.target.value)}
                  placeholder="e.g. 50g Oats, 1 scoop Whey, 10g Almonds"
                  className="w-full h-20 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Prot(g)</label>
                  <input
                    type="number"
                    value={meal.protein_g}
                    onChange={(e) => handleMealChange(index, 'protein_g', e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-2 text-center text-base font-bold text-blue-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Carb(g)</label>
                  <input
                    type="number"
                    value={meal.carbs_g}
                    onChange={(e) => handleMealChange(index, 'carbs_g', e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-2 text-center text-base font-bold text-green-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Fat(g)</label>
                  <input
                    type="number"
                    value={meal.fat_g}
                    onChange={(e) => handleMealChange(index, 'fat_g', e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-2 text-center text-base font-bold text-purple-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Kcal</label>
                  <input
                    type="number"
                    value={meal.calories_kcal}
                    onChange={(e) => handleMealChange(index, 'calories_kcal', e.target.value)}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-2 text-center text-base font-bold text-orange-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            onClick={handleAddMeal}
            variant="outline"
            className="w-full border-dashed border-2 border-gray-200 text-gray-500 hover:bg-gray-50 h-14 rounded-2xl"
          >
            <Plus size={20} className="mr-2" />
            Add Another Meal
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-red-700">
            <Info size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-2xl shadow-lg shadow-indigo-200"
        >
          {saving ? <Loader2 size={24} className="animate-spin" /> : 'Save Diet Plan'}
        </Button>
      </div>
    </div>
  );
};

export default TrainerDietPlanBuilder;
