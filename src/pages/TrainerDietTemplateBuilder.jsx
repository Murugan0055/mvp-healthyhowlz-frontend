import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Info, Flame, Apple, Coffee,
  Utensils, UtensilsCrossed, Dumbbell, Camera, X, RefreshCw, Sparkles
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

const TrainerDietTemplateBuilder = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    meals: [
      { meal_type: 'Breakfast', name: '', description: '', protein_g: '', carbs_g: '', fat_g: '', calories_kcal: '' }
    ]
  });

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/templates/diet/${templateId}`);
      setTemplateData({
        name: res.data.name,
        description: res.data.description,
        meals: res.data.meals
      });
    } catch (err) {
      console.error('Failed to fetch template:', err);
      setError('Failed to load template details');
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
      setSelectedImage(base64String);
      await extractFromImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const extractFromImage = async (base64Image) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.post('/ai/extract-plan', { image: base64Image, type: 'diet' });
      setTemplateData({
        ...templateData,
        name: res.data.title || templateData.name,
        description: res.data.description || templateData.description,
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
        setError('Failed to extract data from image. Please try again or enter manually.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddMeal = () => {
    setTemplateData({
      ...templateData,
      meals: [
        ...templateData.meals,
        { meal_type: 'Snack', name: '', description: '', protein_g: '', carbs_g: '', fat_g: '', calories_kcal: '' }
      ]
    });
  };

  const handleRemoveMeal = (index) => {
    const newMeals = templateData.meals.filter((_, i) => i !== index);
    setTemplateData({ ...templateData, meals: newMeals });
  };

  const handleMealChange = (index, field, value) => {
    const newMeals = [...templateData.meals];
    newMeals[index][field] = value;

    if (['protein_g', 'carbs_g', 'fat_g'].includes(field)) {
      const p = Number(newMeals[index].protein_g) || 0;
      const c = Number(newMeals[index].carbs_g) || 0;
      const f = Number(newMeals[index].fat_g) || 0;
      newMeals[index].calories_kcal = Math.round((p * 4) + (c * 4) + (f * 9)).toString();
    }

    setTemplateData({ ...templateData, meals: newMeals });
  };

  const handleSave = async () => {
    if (!templateData.name) {
      setError('Please provide a name for the template.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (templateId) {
        await api.put(`/templates/diet/${templateId}`, templateData);
      } else {
        await api.post('/templates/diet', templateData);
      }
      navigate('/trainer/library');
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalMacros = templateData.meals.reduce((acc, meal) => ({
    p: Number(Number(acc.p || 0) + (Number(meal.protein_g) || 0)).toFixed(2),
    c: Number(Number(acc.c || 0) + (Number(meal.carbs_g) || 0)).toFixed(2),
    f: Number(Number(acc.f || 0) + (Number(meal.fat_g) || 0)).toFixed(2),
    cal: Number(Number(acc.cal || 0) + (Number(meal.calories_kcal) || 0)).toFixed(2)
  }), { p: 0, c: 0, f: 0, cal: 0 });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/trainer/library')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              {templateId ? 'Edit Diet Template' : 'New Diet Template'}
            </h1>
            <p className="text-[11px] text-gray-500 font-medium truncate">Build once, assign many times</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || analyzing}
            size="sm"
            className="shadow-md bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* AI Scanner Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-indigo-100 uppercase text-[10px] font-bold tracking-widest">
              <Sparkles size={14} className="text-yellow-300" />
              AI Smart Extract
            </div>
            <h3 className="text-xl font-bold mb-2">Import from Photo</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Upload an image of a handwritten or printed diet chart. Our AI will extract all meals and macros instantly.
            </p>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                disabled={analyzing}
              />
              <div className="w-full h-14 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center gap-3 border border-white/30 transition-all active:scale-95 shadow-lg">
                {analyzing ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span className="font-bold">Analyzing Diet Plan...</span>
                  </>
                ) : (
                  <>
                    <Camera size={24} />
                    <span className="font-bold text-lg">Pick Image</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Basics */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Template Name</label>
            <input
              type="text"
              value={templateData.name}
              onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
              placeholder="e.g. 2500kcal Fat Loss Template"
              className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              placeholder="Who is this template for? Specific focus items..."
              className="w-full h-28 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Totals Summary */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold">
            <Flame size={20} className="text-orange-500" />
            Template Daily Totals
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-blue-50/50 p-2 sm:p-3 rounded-2xl text-center border border-blue-100 flex flex-col justify-center min-w-0">
              <p className="text-[9px] text-blue-600 uppercase font-black mb-1">Prot</p>
              <p className="text-sm sm:text-lg font-black text-blue-900 truncate">{totalMacros.p}g</p>
            </div>
            <div className="bg-green-50/50 p-2 sm:p-3 rounded-2xl text-center border border-green-100 flex flex-col justify-center min-w-0">
              <p className="text-[9px] text-green-600 uppercase font-black mb-1">Carb</p>
              <p className="text-sm sm:text-lg font-black text-green-900 truncate">{totalMacros.c}g</p>
            </div>
            <div className="bg-purple-50/50 p-2 sm:p-3 rounded-2xl text-center border border-purple-100 flex flex-col justify-center min-w-0">
              <p className="text-[9px] text-purple-600 uppercase font-black mb-1">Fat</p>
              <p className="text-sm sm:text-lg font-black text-purple-900 truncate">{totalMacros.f}g</p>
            </div>
            <div className="bg-orange-50/50 p-2 sm:p-3 rounded-2xl text-center border border-orange-100 flex flex-col justify-center min-w-0">
              <p className="text-[9px] text-orange-600 uppercase font-black mb-1">Kcal</p>
              <p className="text-sm sm:text-lg font-black text-orange-900 truncate">{totalMacros.cal}</p>
            </div>
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Utensils size={20} className="text-indigo-600" />
              Meals
            </h3>
            <button
              onClick={handleAddMeal}
              className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus size={16} />
              Add Meal
            </button>
          </div>

          {templateData.meals.map((meal, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-5 relative animate-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => handleRemoveMeal(index)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all"
              >
                <Trash2 size={20} />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Meal Type</label>
                  <select
                    value={meal.meal_type}
                    onChange={(e) => handleMealChange(index, 'meal_type', e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                  >
                    {MEAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Meal Name</label>
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                    placeholder="e.g. Scrambled Eggs"
                    className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Items / Description</label>
                <textarea
                  value={meal.description}
                  onChange={(e) => handleMealChange(index, 'description', e.target.value)}
                  placeholder="e.g. 3 Whole Eggs, 2 Toast pieces..."
                  className="w-full h-24 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100">
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
            className="w-full border-dashed border-2 border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 h-16 rounded-3xl transition-all"
          >
            <Plus size={20} className="mr-2" />
            Add Another Meal
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 text-red-700 animate-in shake duration-500">
            <Info size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 shadow-[0_-4px_30px_rgba(0,0,0,0.05)] z-30">
        <Button
          onClick={handleSave}
          disabled={saving || analyzing}
          className="w-full h-16 rounded-2xl shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold"
        >
          {saving ? <Loader2 size={24} className="animate-spin" /> : 'Save Diet Template'}
        </Button>
      </div>
    </div>
  );
};

export default TrainerDietTemplateBuilder;
