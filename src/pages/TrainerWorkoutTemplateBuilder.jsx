import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Info, Dumbbell,
  Camera, X, RefreshCw, Sparkles, Clock, ListChecks, Calendar
} from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';

const CATEGORIES = [
  { value: 'STRENGTH', label: 'Strength' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'STRETCHING', label: 'Stretching' },
  { value: 'OTHER', label: 'Other' }
];

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TrainerWorkoutTemplateBuilder = () => {
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
    exercises: [
      { day_name: 'Monday', name: '', category: 'STRENGTH', sets: '', reps: '', duration: '', notes: '' }
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
      const res = await api.get(`/templates/workout/${templateId}`);
      setTemplateData({
        name: res.data.name,
        description: res.data.description,
        exercises: res.data.exercises
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
      const res = await api.post('/ai/extract-plan', { image: base64Image, type: 'workout' });
      setTemplateData({
        ...templateData,
        name: res.data.title || templateData.name,
        description: res.data.description || templateData.description,
        exercises: res.data.exercises.map(ex => ({
          ...ex,
          sets: ex.sets?.toString() || '',
          reps: ex.reps?.toString() || '',
          duration: ex.duration?.toString() || '',
          notes: ex.notes || ''
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

  const handleAddExercise = () => {
    setTemplateData({
      ...templateData,
      exercises: [
        ...templateData.exercises,
        { day_name: 'Monday', name: '', category: 'STRENGTH', sets: '', reps: '', duration: '', notes: '' }
      ]
    });
  };

  const handleRemoveExercise = (index) => {
    const newExercises = templateData.exercises.filter((_, i) => i !== index);
    setTemplateData({ ...templateData, exercises: newExercises });
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...templateData.exercises];
    newExercises[index][field] = value;
    setTemplateData({ ...templateData, exercises: newExercises });
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
        await api.put(`/templates/workout/${templateId}`, templateData);
      } else {
        await api.post('/templates/workout', templateData);
      }
      navigate('/trainer/library');
    } catch (err) {
      console.error('Failed to save template:', err);
      setError('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
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
              {templateId ? 'Edit Workout Template' : 'New Workout Template'}
            </h1>
            <p className="text-[11px] text-gray-500 font-medium truncate">Build once, assign many times</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || analyzing}
            size="sm"
            className="shadow-md bg-blue-600 hover:bg-blue-700"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="mr-2" />}
            Save
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* AI Scanner Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all duration-700" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-blue-100 uppercase text-[10px] font-bold tracking-widest">
              <Sparkles size={14} className="text-yellow-300" />
              AI Smart Extract
            </div>
            <h3 className="text-xl font-bold mb-2">Import from Photo</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">
              Upload an image of a handwritten workout routine or training plan. Our AI will extract all exercises and sets instantly.
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
                    <span className="font-bold">Analyzing Workout Plan...</span>
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
              placeholder="e.g. 5-Day Hypertrophy Template"
              className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={templateData.description}
              onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
              placeholder="Who is this template for? Split info..."
              className="w-full h-28 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ListChecks size={20} className="text-blue-600" />
              Exercises
            </h3>
            <button
              onClick={handleAddExercise}
              className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Plus size={16} />
              Add Exercise
            </button>
          </div>

          {templateData.exercises.map((ex, index) => (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-5 relative animate-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => handleRemoveExercise(index)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-all"
              >
                <Trash2 size={20} />
              </button>

              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Exercise Name</label>
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    placeholder="e.g. Bench Press"
                    className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Target Day</label>
                  <select
                    value={ex.day_name}
                    onChange={(e) => handleExerciseChange(index, 'day_name', e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Category</label>
                  <select
                    value={ex.category}
                    onChange={(e) => handleExerciseChange(index, 'category', e.target.value)}
                    className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {ex.category === 'CARDIO' ? (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Duration / Target</label>
                    <input
                      type="text"
                      value={ex.duration}
                      onChange={(e) => handleExerciseChange(index, 'duration', e.target.value)}
                      placeholder="e.g. 20 mins"
                      className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                ) : (
                  <>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2 text-center">Sets</label>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                        placeholder="3"
                        className="w-full h-14 rounded-2xl border-2 border-white bg-white px-2 text-center text-lg font-black text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2 text-center">Reps</label>
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                        placeholder="10-12"
                        className="w-full h-14 rounded-2xl border-2 border-white bg-white px-2 text-center text-lg font-black text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2">Notes (Optional)</label>
                <textarea
                  value={ex.notes}
                  onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                  placeholder="e.g. 90s rest, focus on squeeze at top"
                  className="w-full h-24 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          ))}

          <Button
            onClick={handleAddExercise}
            variant="outline"
            className="w-full border-dashed border-2 border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 h-16 rounded-3xl transition-all"
          >
            <Plus size={20} className="mr-2" />
            Add Another Exercise
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
          className="w-full h-16 rounded-2xl shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
        >
          {saving ? <Loader2 size={24} className="animate-spin" /> : 'Save Workout Template'}
        </Button>
      </div>
    </div>
  );
};

export default TrainerWorkoutTemplateBuilder;
