import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Clock, CheckCircle2,
  Calendar, Flame, Apple, Dumbbell, ChevronRight,
  Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import api from '../utils/api';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/me/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard info:', err);
      setError('Failed to load dashboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 w-full bg-gray-200 rounded-[2.5rem]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-gray-100 rounded-3xl" />
          <div className="h-28 bg-gray-100 rounded-3xl" />
        </div>
        <div className="h-64 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
          <Activity size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6">{error || 'Could not load your dashboard data'}</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, nextWorkout, upcomingSessions, recentActivity, weightProgress } = data;

  const nutritionTrend = [
    { name: 'Mon', cal: 1800 },
    { name: 'Tue', cal: 2100 },
    { name: 'Wed', cal: 1750 },
    { name: 'Thu', cal: 1950 },
    { name: 'Fri', cal: 2200 },
    { name: 'Sat', cal: 2500 },
    { name: 'Sun', cal: summary.calories },
  ];

  const caloriePercent = Math.min(Math.round((summary.calories / summary.goalCalories) * 100), 100);

  return (
    <div className="space-y-6 pb-20">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[2.5rem] p-8 text-white shadow-xl">
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-[0.2em] mb-2 opacity-80">
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
          <h1 className="text-3xl font-black tracking-tight mb-4">
            Hey, {user?.name?.split(' ')[0] || 'Warrior'}! ✨
          </h1>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 inline-flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Flame className="text-white" size={24} />
            </div>
            <div>
              <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">Calories Today</p>
              <p className="text-xl font-black">{summary.calories} <span className="text-xs font-normal opacity-70">/ {summary.goalCalories} kcal</span></p>
            </div>
          </div>
        </div>

        {/* Abstract decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl" />
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Protein Progress */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Protein</p>
            <p className="text-lg font-black text-gray-900 truncate">{summary.protein}g</p>
          </div>
        </div>

        {/* Weight Progress */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`w-10 h-10 ${weightProgress.length > 1 && weightProgress[0].weight_kg < weightProgress[1].weight_kg ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} rounded-2xl flex items-center justify-center shrink-0`}>
            {weightProgress.length > 1 && weightProgress[0].weight_kg < weightProgress[1].weight_kg ? <TrendingDown size={20} /> : <TrendingUp size={20} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Weight</p>
            <p className="text-lg font-black text-gray-900 truncate">
              {weightProgress[0]?.weight_kg || '--'} <span className="text-xs font-bold text-gray-400">kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Nutrition Trends</h2>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
            <span className="text-xs font-bold text-gray-500 capitalize">Calories</span>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  borderRadius: '20px',
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                  fontWeight: 'bold'
                }}
              />
              <Bar dataKey="cal" radius={[8, 8, 8, 8]} barSize={32}>
                {nutritionTrend.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 6 ? 'url(#barGradient)' : '#f3f4f6'}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Up Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-[2.5rem] border border-blue-100 border-l-8 border-l-blue-500">
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 opacity-70">Next Workout</h3>
          {nextWorkout ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-black text-gray-900 mb-1">{nextWorkout.title}</p>
                <p className="text-xs font-bold text-blue-600">{nextWorkout.exercises_count} Exercises Planned</p>
              </div>
              <button
                onClick={() => navigate('/workout/plan')}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 active:scale-95 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          ) : (
            <p className="text-gray-500 font-medium italic">No active workout plan found.</p>
          )}
        </div>

        {/* Sessions Section */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">Trainer Sessions</h2>
            <Calendar size={20} className="text-indigo-400" />
          </div>
          <div className="space-y-3">
            {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-transparent hover:border-indigo-100 transition-all">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                  <Clock size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 truncate">{session.trainer_name}</p>
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tighter">
                    {format(new Date(session.session_date), 'MMM d')} • {session.start_time.slice(0, 5)}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center py-4 text-gray-400 text-sm font-medium italic">No upcoming sessions</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Feed */}
      <div>
        <h2 className="text-xl font-black text-gray-900 tracking-tight mb-4">Recent Feed</h2>
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {recentActivity.map((activity, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${activity.type === 'meal' ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500'
                }`}>
                {activity.type === 'meal' ? <Apple size={20} /> : <Dumbbell size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{activity.title}</p>
                <p className="text-xs text-gray-500 font-medium">
                  {activity.type === 'meal' ? `${activity.value} kcal` : 'Workout session'} • {format(new Date(activity.date), 'MMM d')}
                </p>
              </div>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="p-10 text-center text-gray-400 italic">No recent activity yet.</p>
          )}
          <button
            onClick={() => navigate('/diet')}
            className="w-full py-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Show Activity Feed
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
