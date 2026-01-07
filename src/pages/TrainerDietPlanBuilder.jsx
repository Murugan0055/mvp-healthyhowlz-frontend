import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Info, Flame, Apple, Coffee,
  Utensils, UtensilsCrossed, Dumbbell, Sparkles, Camera, BookOpen, X
} from 'lucide-react';
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
  const [analyzing, setAnalyzing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
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
    fetchTemplates();
  }, [clientId]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates/diet');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  const loadTemplate = async (templateId) => {
    setLoading(true);
    try {
      const res = await api.get(`/templates/diet/${templateId}`);
      setPlanData({
        ...planData,
        title: res.data.name,
        description: res.data.description,
        meals: res.data.meals.map(m => ({
          meal_type: m.meal_type,
          name: m.name,
          description: m.description,
          protein_g: m.protein_g.toString(),
          carbs_g: m.carbs_g.toString(),
          fat_g: m.fat_g.toString(),
          calories_kcal: m.calories_kcal.toString()
        }))
      });
      setShowTemplates(false);
    } catch (err) {
      console.error('Failed to load template', err);
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setAnalyzing(true);
      setError(null);
      try {
        const res = await api.post('/ai/extract-plan', { image: base64String, type: 'diet' });
        setPlanData({
          ...planData,
          title: res.data.title || planData.title,
          description: res.data.description || planData.description,
          meals: res.data.meals.map(m => ({
            ...m,
            protein_g: m.protein_g.toString(),
            carbs_g: m.carbs_g.toString(),
            fat_g: m.fat_g.toString(),
            calories_kcal: m.calories_kcal.toString()
          }))
        });
      } catch (err) {
        console.error('Extraction failed:', err);
        if (err.response?.status === 429) {
          setError(err.response.data.message || 'Daily AI extraction limit reached (7 requests). Please try again tomorrow.');
        } else {
          setError('Failed to extract data from image.');
        }
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

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
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/trainer/clients/${clientId}/diet`)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">Create Diet Plan</h1>
            <p className="text-[11px] text-gray-500 font-medium truncate">For {clientName || 'Client'}</p>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={analyzing}
            />
            <div className="h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all">
              {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              <span className="font-bold text-sm">Scan Plan</span>
            </div>
          </div>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-14 bg-white text-indigo-600 border-2 border-indigo-100 rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <BookOpen size={18} />
            <span className="font-bold text-sm">Library</span>
          </button>
        </div>

        {/* Template List Modal/Overlay */}
        {showTemplates && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Select Template</h3>
              <button onClick={() => setShowTemplates(false)} className="text-gray-400 p-1">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {templates.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No templates found in library</p>
              ) : (
                templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => loadTemplate(t.id)}
                    className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 border border-gray-100 transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-indigo-600">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.meals_count || t.meals?.length || 0} meals</p>
                    </div>
                    <Plus size={16} className="text-gray-300 group-hover:text-indigo-500" />
                  </button>
                ))
              )}
            </div>
          </div>
        )}
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
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
            <div className="text-center min-w-0">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Protein</p>
              <p className="text-base sm:text-lg font-bold truncate">{totalMacros.p}g</p>
            </div>
            <div className="text-center min-w-0">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Carbs</p>
              <p className="text-base sm:text-lg font-bold truncate">{totalMacros.c}g</p>
            </div>
            <div className="text-center min-w-0">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Fat</p>
              <p className="text-base sm:text-lg font-bold truncate">{totalMacros.f}g</p>
            </div>
            <div className="text-center min-w-0">
              <p className="text-[10px] text-indigo-200 uppercase font-bold">Calories</p>
              <p className="text-base sm:text-lg font-bold text-yellow-300 truncate">{totalMacros.cal}</p>
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="relative">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest pl-1 mb-1.5">
                    Prot <span className="text-[8px] opacity-60">(g)</span>
                  </label>
                  <input
                    type="number"
                    value={meal.protein_g}
                    onChange={(e) => handleMealChange(index, 'protein_g', e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-white bg-white px-3 text-lg font-black text-blue-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="relative">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-widest pl-1 mb-1.5">
                    Carb <span className="text-[8px] opacity-60">(g)</span>
                  </label>
                  <input
                    type="number"
                    value={meal.carbs_g}
                    onChange={(e) => handleMealChange(index, 'carbs_g', e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-white bg-white px-3 text-lg font-black text-green-900 shadow-sm focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="relative">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-purple-600 uppercase tracking-widest pl-1 mb-1.5">
                    Fat <span className="text-[8px] opacity-60">(g)</span>
                  </label>
                  <input
                    type="number"
                    value={meal.fat_g}
                    onChange={(e) => handleMealChange(index, 'fat_g', e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-white bg-white px-3 text-lg font-black text-purple-900 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="0"
                  />
                </div>
                <div className="relative">
                  <label className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase tracking-widest pl-1 mb-1.5">
                    Kcal <span className="text-[8px] opacity-60">(cal)</span>
                  </label>
                  <input
                    type="number"
                    value={meal.calories_kcal}
                    onChange={(e) => handleMealChange(index, 'calories_kcal', e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-white bg-white px-3 text-lg font-black text-orange-900 shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-300"
                    placeholder="0"
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
      <div className="fixed bottom-20 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30">
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
