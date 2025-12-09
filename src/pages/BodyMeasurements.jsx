import { ArrowLeft, Calendar, Camera, Loader2, Plus, Ruler, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import api from '../utils/api';

const BodyMeasurements = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('LIST'); // 'LIST' or 'ADD'
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    recorded_at: new Date().toISOString().split('T')[0],
    arm_cm: '',
    chest_cm: '',
    waist_cm: '',
    hip_cm: '',
    thigh_cm: '',
    calf_cm: '',
    shoulders_cm: '',
    notes: '',
    image_url: ''
  });

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/me/body-measurements?limit=20');
      setMeasurements(response.data);
    } catch (err) {
      console.error('Failed to load measurements:', err);
      setError('Failed to load body measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const hasAnyMeasurement = Object.keys(formData).some(
      key => key.endsWith('_cm') && formData[key]
    );

    if (!hasAnyMeasurement) {
      setError('Please enter at least one measurement');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        arm_cm: formData.arm_cm ? parseFloat(formData.arm_cm) : null,
        chest_cm: formData.chest_cm ? parseFloat(formData.chest_cm) : null,
        waist_cm: formData.waist_cm ? parseFloat(formData.waist_cm) : null,
        hip_cm: formData.hip_cm ? parseFloat(formData.hip_cm) : null,
        thigh_cm: formData.thigh_cm ? parseFloat(formData.thigh_cm) : null,
        calf_cm: formData.calf_cm ? parseFloat(formData.calf_cm) : null,
        shoulders_cm: formData.shoulders_cm ? parseFloat(formData.shoulders_cm) : null
      };

      const response = await api.post('/me/body-measurements', payload);
      setMeasurements([response.data, ...measurements]);
      setView('LIST');
      resetForm();
    } catch (err) {
      console.error('Failed to save measurements:', err);
      setError(err.response?.data?.error || 'Failed to save body measurements');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recorded_at: new Date().toISOString().split('T')[0],
      arm_cm: '',
      chest_cm: '',
      waist_cm: '',
      hip_cm: '',
      thigh_cm: '',
      calf_cm: '',
      shoulders_cm: '',
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

  const getMeasurementChange = (field) => {
    if (measurements.length < 2) return null;
    const latest = measurements[0]?.[field];
    const previous = measurements[1]?.[field];
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
          <h2 className="font-bold text-lg text-gray-900">Add Measurements</h2>
          <div className="w-10" />
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-900">
              {error}
            </div>
          )}

          {/* Image Upload */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl overflow-hidden border-2 border-dashed border-purple-200 flex flex-col items-center justify-center">
            {formData.image_url ? (
              <>
                <img src={formData.image_url} alt="Measurement" className="w-full h-full object-cover" />
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
                  <Camera size={32} className="text-purple-500 mb-2" />
                  <p className="text-sm text-gray-700 font-semibold">Add Measurement Photo</p>
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

          {/* Upper Body Measurements */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Ruler size={18} className="text-blue-600" />
              Upper Body
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Shoulders (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.shoulders_cm}
                  onChange={(e) => setFormData({ ...formData, shoulders_cm: e.target.value })}
                  placeholder="110"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Chest (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.chest_cm}
                  onChange={(e) => setFormData({ ...formData, chest_cm: e.target.value })}
                  placeholder="95"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Arm (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.arm_cm}
                  onChange={(e) => setFormData({ ...formData, arm_cm: e.target.value })}
                  placeholder="35"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Waist (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.waist_cm}
                  onChange={(e) => setFormData({ ...formData, waist_cm: e.target.value })}
                  placeholder="80"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Lower Body Measurements */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Ruler size={18} className="text-purple-600" />
              Lower Body
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Hip (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.hip_cm}
                  onChange={(e) => setFormData({ ...formData, hip_cm: e.target.value })}
                  placeholder="95"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Thigh (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.thigh_cm}
                  onChange={(e) => setFormData({ ...formData, thigh_cm: e.target.value })}
                  placeholder="55"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Calf (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.calf_cm}
                  onChange={(e) => setFormData({ ...formData, calf_cm: e.target.value })}
                  placeholder="38"
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any observations or notes..."
              className="w-full h-24 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full shadow-lg"
            size="lg"
          >
            {saving ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
            {saving ? 'Saving...' : 'Save Measurements'}
          </Button>
        </div>
      </div>
    );
  }

  // LIST VIEW
  const latestMeasurement = measurements[0];

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
        <h2 className="font-bold text-lg text-gray-900">Body Measurements</h2>
        <div className="w-10" />
      </div>

      {/* Latest Stats Card */}
      {latestMeasurement && (
        <div className="px-4 pt-4">
          <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-5 shadow-lg">
            <p className="text-white/80 text-sm font-medium mb-3">Latest Measurements</p>
            <div className="grid grid-cols-3 gap-2">
              {latestMeasurement.chest_cm && (
                <div className="text-center">
                  <p className="text-xs text-white/70 mb-1">Chest</p>
                  <p className="text-lg font-bold text-white">{latestMeasurement.chest_cm}cm</p>
                </div>
              )}
              {latestMeasurement.waist_cm && (
                <div className="text-center">
                  <p className="text-xs text-white/70 mb-1">Waist</p>
                  <p className="text-lg font-bold text-white">{latestMeasurement.waist_cm}cm</p>
                </div>
              )}
              {latestMeasurement.hip_cm && (
                <div className="text-center">
                  <p className="text-xs text-white/70 mb-1">Hip</p>
                  <p className="text-lg font-bold text-white">{latestMeasurement.hip_cm}cm</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Measurements History */}
      <div className="px-4 mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={48} className="animate-spin text-primary" />
          </div>
        ) : measurements.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Ruler size={36} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No measurements yet</h3>
            <p className="text-gray-500 text-sm mb-6">Start tracking your body measurements</p>
            <Button onClick={() => setView('ADD')} size="lg">
              <Plus size={20} className="mr-2" />
              Add First Entry
            </Button>
          </div>
        ) : (
          <>
            {measurements.map((measurement, idx) => (
              <div
                key={measurement.id || idx}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(measurement.recorded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {measurement.image_url && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img src={measurement.image_url} alt="Measurement" className="w-full h-40 object-cover" />
                  </div>
                )}

                <div className="space-y-2">
                  {measurement.shoulders_cm && (
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-700">Shoulders</span>
                      <span className="text-sm font-bold text-blue-600">{measurement.shoulders_cm} cm</span>
                    </div>
                  )}
                  {measurement.chest_cm && (
                    <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
                      <span className="text-sm text-gray-700">Chest</span>
                      <span className="text-sm font-bold text-indigo-600">{measurement.chest_cm} cm</span>
                    </div>
                  )}
                  {measurement.arm_cm && (
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-700">Arm</span>
                      <span className="text-sm font-bold text-purple-600">{measurement.arm_cm} cm</span>
                    </div>
                  )}
                  {measurement.waist_cm && (
                    <div className="flex justify-between items-center p-2 bg-pink-50 rounded-lg">
                      <span className="text-sm text-gray-700">Waist</span>
                      <span className="text-sm font-bold text-pink-600">{measurement.waist_cm} cm</span>
                    </div>
                  )}
                  {measurement.hip_cm && (
                    <div className="flex justify-between items-center p-2 bg-rose-50 rounded-lg">
                      <span className="text-sm text-gray-700">Hip</span>
                      <span className="text-sm font-bold text-rose-600">{measurement.hip_cm} cm</span>
                    </div>
                  )}
                  {measurement.thigh_cm && (
                    <div className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                      <span className="text-sm text-gray-700">Thigh</span>
                      <span className="text-sm font-bold text-orange-600">{measurement.thigh_cm} cm</span>
                    </div>
                  )}
                  {measurement.calf_cm && (
                    <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                      <span className="text-sm text-gray-700">Calf</span>
                      <span className="text-sm font-bold text-amber-600">{measurement.calf_cm} cm</span>
                    </div>
                  )}
                </div>

                {measurement.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-700">{measurement.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      {measurements.length > 0 && (
        <button
          onClick={() => setView('ADD')}
          className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl shadow-purple-500/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
        >
          <Plus size={32} />
        </button>
      )}
    </div>
  );
};

export default BodyMeasurements;
