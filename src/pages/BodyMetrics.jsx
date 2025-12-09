import { ArrowLeft, Calendar, Camera, Loader2, Plus, Save, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import api from '../utils/api';

const BodyMetrics = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('LIST'); // 'LIST' or 'ADD'
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    recorded_at: new Date().toISOString().split('T')[0],
    height_cm: '',
    weight_kg: '',
    body_fat_percent: '',
    notes: '',
    image_url: ''
  });

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/me/body-metrics?limit=20');
      setMetrics(response.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setError('Failed to load body metrics');
    } finally {
      setLoading(false);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightM = height / 100;
    return (weight / (heightM * heightM)).toFixed(1);
  };

  const calculateBMR = (weight, height, age = 25, gender = 'Male') => {
    if (!weight || !height) return null;
    // Mifflin-St Jeor Equation
    if (gender === 'Male') {
      return (10 * weight + 6.25 * height - 5 * age + 5).toFixed(0);
    } else {
      return (10 * weight + 6.25 * height - 5 * age - 161).toFixed(0);
    }
  };

  const handleSave = async () => {
    if (!formData.weight_kg && !formData.height_cm) {
      setError('Please enter at least weight or height');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const bmi = calculateBMI(formData.weight_kg, formData.height_cm);
      const bmr = calculateBMR(formData.weight_kg, formData.height_cm);

      const payload = {
        ...formData,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        body_fat_percent: formData.body_fat_percent ? parseFloat(formData.body_fat_percent) : null,
        bmi: bmi ? parseFloat(bmi) : null,
        bmr: bmr ? parseFloat(bmr) : null
      };

      const response = await api.post('/me/body-metrics', payload);
      setMetrics([response.data, ...metrics]);
      setView('LIST');
      resetForm();
    } catch (err) {
      console.error('Failed to save metrics:', err);
      setError(err.response?.data?.error || 'Failed to save body metrics');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recorded_at: new Date().toISOString().split('T')[0],
      height_cm: '',
      weight_kg: '',
      body_fat_percent: '',
      notes: '',
      image_url: ''
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const getWeightTrend = () => {
    if (metrics.length < 2) return null;
    const latest = metrics[0]?.weight_kg;
    const previous = metrics[1]?.weight_kg;
    if (!latest || !previous) return null;
    const diff = latest - previous;
    return { diff: diff.toFixed(1), isUp: diff > 0 };
  };

  // ADD VIEW
  if (view === 'ADD') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
          <button
            onClick={() => setView('LIST')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="font-bold text-lg text-gray-900">Add Body Metrics</h2>
          <div className="w-10" />
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-900">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl overflow-hidden border-2 border-dashed border-blue-200 flex flex-col items-center justify-center">
            {formData.image_url ? (
              <>
                <img src={formData.image_url} alt="Progress" className="w-full h-full object-cover" />
                <button
                  onClick={() => setFormData({ ...formData, image_url: '' })}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <Camera size={32} className="text-blue-500 mb-2" />
                  <p className="text-sm text-gray-700 font-semibold">Add Progress Photo</p>
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.recorded_at}
              onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
              className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Weight & Height */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                placeholder="70.5"
                className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base font-bold text-blue-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.height_cm}
                onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                placeholder="175"
                className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base font-bold text-purple-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Calculated BMI */}
          {formData.weight_kg && formData.height_cm && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Calculated BMI</p>
              <p className="text-2xl font-bold text-green-700">
                {calculateBMI(formData.weight_kg, formData.height_cm)}
              </p>
            </div>
          )}

          {/* Body Fat % */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Body Fat % (Optional)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.body_fat_percent}
              onChange={(e) => setFormData({ ...formData, body_fat_percent: e.target.value })}
              placeholder="15.5"
              className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How are you feeling? Any observations..."
              className="w-full h-24 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || (!formData.weight_kg && !formData.height_cm)}
            className="w-full shadow-lg"
            size="lg"
          >
            {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
            {saving ? 'Saving...' : 'Save Metrics'}
          </Button>
        </div>
      </div>
    );
  }

  // LIST VIEW
  const trend = getWeightTrend();
  const latestMetric = metrics[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-28">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-10 border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-gray-900">Body Metrics</h2>
        <div className="w-10" />
      </div>

      {/* Latest Stats Card */}
      {latestMetric && (
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 shadow-lg">
            <p className="text-white/80 text-sm font-medium mb-3">Latest Metrics</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-white/70 mb-1">Weight</p>
                <p className="text-xl font-bold text-white">{latestMetric.weight_kg}kg</p>
                {trend && (
                  <p className={`text-xs mt-1 ${trend.isUp ? 'text-red-200' : 'text-green-200'}`}>
                    {trend.isUp ? '↑' : '↓'} {Math.abs(trend.diff)}kg
                  </p>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-white/70 mb-1">BMI</p>
                <p className="text-xl font-bold text-white">{latestMetric.bmi || 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/70 mb-1">Body Fat</p>
                <p className="text-xl font-bold text-white">
                  {latestMetric.body_fat_percent ? `${latestMetric.body_fat_percent}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics History */}
      <div className="px-4 mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        ) : metrics.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={36} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No metrics yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start tracking your body metrics</p>
            <Button onClick={() => setView('ADD')} size="lg">
              <Plus size={20} className="mr-2" />
              Add First Entry
            </Button>
          </div>
        ) : (
          <>
            {metrics.map((metric, idx) => (
              <div
                key={metric.id || idx}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(metric.recorded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {metric.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img src={metric.image_url} alt="Progress" className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Weight</p>
                    <p className="text-lg font-bold text-blue-600">{metric.weight_kg}kg</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Height</p>
                    <p className="text-lg font-bold text-purple-600">{metric.height_cm}cm</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">BMI</p>
                    <p className="text-lg font-bold text-green-600">{metric.bmi || 'N/A'}</p>
                  </div>
                </div>

                {metric.body_fat_percent && (
                  <div className="text-center p-3 bg-orange-50 rounded-xl mb-3">
                    <p className="text-xs text-gray-600 mb-1">Body Fat</p>
                    <p className="text-lg font-bold text-orange-600">{metric.body_fat_percent}%</p>
                  </div>
                )}

                {metric.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700">{metric.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      {metrics.length > 0 && (
        <button
          onClick={() => setView('ADD')}
          className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
        >
          <Plus size={32} />
        </button>
      )}
    </div>
  );
};

export default BodyMetrics;
