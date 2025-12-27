import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Info, Dumbbell, Clock,
  ListChecks, Sparkles, Camera, BookOpen, X
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

const TrainerWorkoutPlanBuilder = () => {
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
    exercises: [
      { day_name: 'Monday', name: '', category: 'STRENGTH', sets: '', reps: '', duration: '', notes: '' }
    ]
  });

  useEffect(() => {
    fetchClientName();
    fetchTemplates();
  }, [clientId]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates/workout');
      setTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  const loadTemplate = async (templateId) => {
    setLoading(true);
    try {
      const res = await api.get(`/templates/workout/${templateId}`);
      setPlanData({
        ...planData,
        title: res.data.name,
        description: res.data.description,
        exercises: res.data.exercises.map(ex => ({
          day_name: ex.day_name,
          name: ex.name,
          category: ex.category || 'STRENGTH',
          sets: ex.sets?.toString() || '',
          reps: ex.reps?.toString() || '',
          duration: ex.duration?.toString() || '',
          notes: ex.notes || ''
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
        const res = await api.post('/ai/extract-plan', { image: base64String, type: 'workout' });
        setPlanData({
          ...planData,
          title: res.data.title || planData.title,
          description: res.data.description || planData.description,
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
        setError('Failed to extract data from image.');
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

  const handleAddExercise = () => {
    setPlanData({
      ...planData,
      exercises: [
        ...planData.exercises,
        { day_name: 'Monday', name: '', category: 'STRENGTH', sets: '', reps: '', duration: '', notes: '' }
      ]
    });
  };

  const handleRemoveExercise = (index) => {
    const newExercises = planData.exercises.filter((_, i) => i !== index);
    setPlanData({ ...planData, exercises: newExercises });
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...planData.exercises];
    newExercises[index][field] = value;
    setPlanData({ ...planData, exercises: newExercises });
  };

  const handleSave = async () => {
    if (!planData.title) {
      setError('Please provide a title for the workout plan.');
      return;
    }

    if (planData.exercises.length === 0) {
      setError('Please add at least one exercise to the plan.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.post(`/clients/${clientId}/workout-plans`, planData);
      navigate(`/trainer/clients/${clientId}/workout`);
    } catch (err) {
      console.error('Failed to save workout plan', err);
      setError('Failed to save workout plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(`/trainer/clients/${clientId}/workout`)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">Create Workout Plan</h1>
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
            <div className="h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all">
              {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              <span className="font-bold text-sm">Scan Routine</span>
            </div>
          </div>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="h-14 bg-white text-blue-600 border-2 border-blue-100 rounded-2xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <BookOpen size={18} />
            <span className="font-bold text-sm">Library</span>
          </button>
        </div>

        {/* Template List Modal/Overlay */}
        {showTemplates && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100 animate-in zoom-in-95 duration-200">
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
                    className="w-full text-left p-3 rounded-xl hover:bg-blue-50 border border-gray-100 transition-colors flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-blue-600">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.exercises_count || t.exercises?.length || 0} exercises</p>
                    </div>
                    <Plus size={16} className="text-gray-300 group-hover:text-blue-500" />
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
              placeholder="e.g. Strength Phase 1"
              className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Instructions / Description</label>
            <textarea
              value={planData.description}
              onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
              placeholder="Summary of the week, focus areas, etc..."
              className="w-full h-28 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-blue-900">Set as Active Plan</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={planData.isActive}
                onChange={(e) => setPlanData({ ...planData, isActive: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ListChecks size={20} className="text-blue-600" />
              Exercises
            </h3>
            <button
              onClick={handleAddExercise}
              className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <Plus size={16} />
              Add Exercise
            </button>
          </div>

          {planData.exercises.map((ex, index) => (
            <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4 relative animate-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => handleRemoveExercise(index)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Exercise Name</label>
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    placeholder="e.g. Bench Press"
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Target Day</label>
                  <select
                    value={ex.day_name}
                    onChange={(e) => handleExerciseChange(index, 'day_name', e.target.value)}
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={ex.category}
                    onChange={(e) => handleExerciseChange(index, 'category', e.target.value)}
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {ex.category === 'CARDIO' ? (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Duration / Target</label>
                    <input
                      type="text"
                      value={ex.duration}
                      onChange={(e) => handleExerciseChange(index, 'duration', e.target.value)}
                      placeholder="e.g. 20 mins"
                      className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                ) : (
                  <>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Sets</label>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                        placeholder="3"
                        className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-2 text-center text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Reps</label>
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                        placeholder="10-12"
                        className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-2 text-center text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Notes (Optional)</label>
                <textarea
                  value={ex.notes}
                  onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                  placeholder="e.g. 90s rest, focus on squeeze at top"
                  className="w-full h-20 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
          ))}

          <Button
            onClick={handleAddExercise}
            variant="outline"
            className="w-full border-dashed border-2 border-gray-200 text-gray-500 hover:bg-gray-50 h-14 rounded-2xl"
          >
            <Plus size={20} className="mr-2" />
            Add Another Exercise
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
          className="w-full h-14 rounded-2xl shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700"
        >
          {saving ? <Loader2 size={24} className="animate-spin" /> : 'Save Workout Plan'}
        </Button>
      </div>
    </div>
  );
};

export default TrainerWorkoutPlanBuilder;
