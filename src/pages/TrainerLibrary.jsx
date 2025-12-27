import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, BookOpen, Dumbbell, Utensils, ChevronRight, Trash2, Calendar, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

const TrainerLibrary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('diet'); // 'diet' or 'workout'
  const [dietTemplates, setDietTemplates] = useState([]);
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [activeTab]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'diet' ? '/templates/diet' : '/templates/workout';
      const res = await api.get(endpoint);
      if (activeTab === 'diet') {
        setDietTemplates(res.data);
      } else {
        setWorkoutTemplates(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const endpoint = activeTab === 'diet' ? `/templates/diet/${id}` : `/templates/workout/${id}`;
      await api.delete(endpoint);
      fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const templates = activeTab === 'diet' ? dietTemplates : workoutTemplates;
  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-28">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-6 pb-20 rounded-b-[2.5rem] shadow-xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 gap-4">
            <h1 className="text-2xl font-black text-white whitespace-nowrap">Plan Library</h1>
            <div className="flex-shrink-0 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-white/10">
              <BookOpen size={14} className="fill-white" />
              {templates.length} Templates
            </div>
          </div>
          <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">
            Manage your templates for quick assignment
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab} templates...`}
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-indigo-200 border border-white/20 focus:outline-none focus:bg-white/20 transition-all font-medium"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/20">
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'diet' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/10'
              }`}
          >
            <Utensils size={18} />
            Diet
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeTab === 'workout' ? 'bg-white text-indigo-600 shadow-lg' : 'text-white hover:bg-white/10'
              }`}
          >
            <Dumbbell size={18} />
            Workout
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="px-4 -mt-10 space-y-4 relative z-10">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-28" />
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              {activeTab === 'diet' ? <Utensils size={36} className="text-indigo-500" /> : <Dumbbell size={36} className="text-indigo-500" />}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No {activeTab} templates</h3>
            <p className="text-gray-500 text-sm px-10">
              Create your first template to quickly assign it to multiple clients.
            </p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              onClick={() => navigate(`/trainer/library/${activeTab}/template/${template.id}`)}
              className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex gap-4 items-center active:scale-[0.98] hover:shadow-lg cursor-pointer transition-all group"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex-shrink-0 flex items-center justify-center shadow-inner border border-indigo-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                {activeTab === 'diet' ? (
                  <Utensils className="text-indigo-600" size={28} />
                ) : (
                  <Dumbbell className="text-indigo-600" size={28} />
                )}
              </div>

              {/* Template Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-indigo-600 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                  {template.description || 'No description provided'}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => handleDeleteTemplate(e, template.id)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 size={18} />
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 group-hover:bg-indigo-50 transition-colors">
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-indigo-600" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB - Create Template */}
      <button
        onClick={() => navigate(`/trainer/library/${activeTab}/new`)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 group"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
};

export default TrainerLibrary;
