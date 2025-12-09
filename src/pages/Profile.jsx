import { Camera, ChevronRight, Edit2, Loader2, LogOut, Save, TrendingDown, TrendingUp, User as UserIcon, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [latestMetrics, setLatestMetrics] = useState(null);
  const [latestMeasurements, setLatestMeasurements] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    gender: '',
    profile_image_url: '',
    activity_level: '',
    goal: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profileRes, metricsRes, measurementsRes] = await Promise.all([
        api.get('/me/profile'),
        api.get('/me/body-metrics/latest'),
        api.get('/me/body-measurements/latest')
      ]);

      setProfile(profileRes.data);
      setLatestMetrics(metricsRes.data);
      setLatestMeasurements(measurementsRes.data);

      setFormData({
        name: profileRes.data.name || '',
        age: profileRes.data.age || '',
        phone: profileRes.data.phone || '',
        email: profileRes.data.email || '',
        gender: profileRes.data.gender || '',
        profile_image_url: profileRes.data.profile_image_url || '',
        activity_level: profileRes.data.activity_level || '',
        goal: profileRes.data.goal || ''
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await api.put('/me/profile', formData);
      setProfile(response.data);
      setEditMode(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, profile_image_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const calculateBMI = () => {
    if (!latestMetrics?.height_cm || !latestMetrics?.weight_kg) return null;
    const heightM = latestMetrics.height_cm / 100;
    return (latestMetrics.weight_kg / (heightM * heightM)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-8 pb-12 rounded-b-[2rem] shadow-xl relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full transition-all"
            >
              <Edit2 size={20} />
            </button>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white/30">
              {formData.profile_image_url ? (
                <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={48} className="text-gray-400" />
              )}
            </div>
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-white text-primary p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Camera size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">{formData.name || 'Your Name'}</h2>
          <p className="text-indigo-100 text-sm">{formData.email}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-16 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-900">
            {error}
          </div>
        )}



        {/* Personal Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 mt-20">
          <h3 className="font-bold text-gray-900 mb-4">Personal Details</h3>

          {editMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Activity Level
                </label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="">Select</option>
                  <option value="Sedentary">Sedentary (Little or no exercise)</option>
                  <option value="Light">Light (Exercise 1-3 days/week)</option>
                  <option value="Moderate">Moderate (Exercise 3-5 days/week)</option>
                  <option value="Active">Active (Exercise 6-7 days/week)</option>
                  <option value="Very Active">Very Active (Intense exercise daily)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                  Goal
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full h-12 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                  <option value="">Select</option>
                  <option value="Fat Loss">Fat Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Athletic Performance">Athletic Performance</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !formData.name || !formData.email}
                  className="flex-1"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span className="ml-2">{saving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      name: profile.name || '',
                      age: profile.age || '',
                      phone: profile.phone || '',
                      email: profile.email || '',
                      gender: profile.gender || '',
                      profile_image_url: profile.profile_image_url || '',
                      activity_level: profile.activity_level || '',
                      goal: profile.goal || ''
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Name</span>
                <span className="text-sm font-semibold text-gray-900">{profile?.name || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Age</span>
                <span className="text-sm font-semibold text-gray-900">{profile?.age || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Gender</span>
                <span className="text-sm font-semibold text-gray-900">{profile?.gender || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="text-sm font-semibold text-gray-900">{profile?.phone || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-semibold text-gray-900">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Activity Level</span>
                <span className="text-sm font-semibold text-gray-900">{profile?.activity_level || 'Not set'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">Goal</span>
                <span className="text-sm font-semibold text-gray-900">{profile?.goal || 'Not set'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Measurements Section */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Body Tracking</h3>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile/body-metrics')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Body Metrics</p>
                  <p className="text-xs text-gray-600">Weight, Height, BMI, Body Fat</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => navigate('/profile/body-measurements')}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <TrendingDown size={20} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Body Measurements</p>
                  <p className="text-xs text-gray-600">Arm, Chest, Waist, Hip, Thigh</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

      </div>
      {/* Logout Section */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center  py-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl hover:shadow-md transition-all active:scale-[0.98] border border-red-100"
      >
        <LogOut size={20} className="text-red-600" />
        <span className="font-semibold text-red-600">Logout</span>
      </button>
    </div>
  );
};

export default Profile;
