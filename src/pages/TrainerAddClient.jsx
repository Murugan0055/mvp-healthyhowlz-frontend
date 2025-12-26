import { ChevronLeft, Camera, Loader2, Save, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import api from '../utils/api';

const TrainerAddClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    goal: '',
    sessions: '',
    validity: '',
    password: 'Welcome123!',
    profile_image_url: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, profile_image_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/trainer/clients', formData);
      navigate('/trainer/clients');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-8 pb-12 rounded-b-[2rem] shadow-xl relative">
        <div className="relative flex items-center justify-center mb-6">
          <button
            onClick={() => navigate('/trainer/clients')}
            className="absolute left-0 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 rounded-full transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Add New Client</h1>
        </div>

        {/* Profile Avatar Placeholder */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white/30">
              {formData.profile_image_url ? (
                <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <Camera size={18} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-indigo-100 text-sm mt-3 font-medium">Enter client details below</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 -mt-8 pb-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Details Section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                Personal Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. john@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="+91..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="e.g. 28"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      Goal
                    </label>
                    <select
                      value={formData.goal}
                      onChange={e => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="">Select</option>
                      <option value="Fat Loss">Fat Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Athletic Performance">Athletic Performance</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Details Section */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">
                Subscription Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Sessions
                  </label>
                  <input
                    type="number"
                    value={formData.sessions}
                    onChange={e => setFormData({ ...formData, sessions: e.target.value })}
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. 12"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Validity (Days)
                  </label>
                  <input
                    type="number"
                    value={formData.validity}
                    onChange={e => setFormData({ ...formData, validity: e.target.value })}
                    className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/trainer/clients')}
                className="flex-1 h-14 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerAddClient;
