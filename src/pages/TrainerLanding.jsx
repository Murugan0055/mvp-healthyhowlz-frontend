import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Book, Plus, Calendar, TrendingUp,
  ChevronRight, Activity, Clock, CheckCircle2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../utils/api';
import { format } from 'date-fns';

import Skeleton from '../components/ui/Skeleton';

const TrainerLanding = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeClients: 0,
    sessionsToday: 0,
    recentActivity: [],
    clientGrowth: 0
  });
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, sessionsRes] = await Promise.all([
        api.get('/trainer/dashboard/stats'),
        api.get(`/trainer/sessions?start_date=${format(new Date(), 'yyyy-MM-dd')}&end_date=${format(new Date(), 'yyyy-MM-dd')}`)
      ]);
      setStats(statsRes.data);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Mon', count: 12 },
    { name: 'Tue', count: 18 },
    { name: 'Wed', count: 15 },
    { name: 'Thu', count: 22 },
    { name: 'Fri', count: 30 },
    { name: 'Sat', count: 25 },
    { name: 'Sun', count: 10 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 pb-8">
        {/* Welcome Header Skeleton */}
        <Skeleton className="h-44 w-full rounded-3xl" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>

        {/* Quick Actions & Feed Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-3xl" />
            <Skeleton className="h-20 rounded-3xl" />
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Elevate Your Impact 🚀
          </h1>
          <p className="text-indigo-100 text-lg font-medium opacity-90">
            Welcome back! You have {stats.sessionsToday} sessions scheduled for today.
          </p>
        </div>
        {/* Abstract decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Clients', value: stats.activeClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Today', value: stats.sessionsToday, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Growth', value: `+${stats.clientGrowth}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Activity', value: stats.recentActivity.length, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Client Engagement</h2>
            <select className="bg-gray-50 border-none text-sm font-semibold rounded-xl px-3 py-1 text-gray-600 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#6366f1' : '#e0e7ff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
            <button onClick={() => navigate('/trainer/sessions')} className="text-indigo-600 text-sm font-bold hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {sessions.length > 0 ? sessions.map((session, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  {session.client_image ? (
                    <img src={session.client_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                      {session.client_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{session.client_name}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <Clock size={12} />
                    <span>{session.start_time.slice(0, 5)}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {session.status}
                </div>
              </div>
            )) : (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">No sessions scheduled for today</p>
                <button
                  onClick={() => navigate('/trainer/sessions')}
                  className="mt-2 text-indigo-600 font-bold text-sm"
                >
                  Schedule Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/trainer/clients/add')}
              className="flex items-center gap-3 p-5 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
            >
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Plus size={20} />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-indigo-900">Add Client</span>
            </button>

            <button
              onClick={() => navigate('/trainer/library')}
              className="flex items-center gap-3 p-5 bg-white rounded-3xl shadow-sm border border-gray-100 hover:bg-purple-50 hover:border-purple-100 transition-all group"
            >
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Book size={20} />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-purple-900">Templates</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Feed</h2>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {stats.recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {stats.recentActivity.map((activity, i) => (
                  <div key={i} className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                    <div className="mt-1 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold text-gray-900">{activity.client_name}</span>
                        <span className="text-gray-500 ml-1">completed {activity.exercise_name}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {format(new Date(activity.completed_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="text-gray-300" size={24} />
                </div>
                <p className="text-gray-400 text-sm">No recent client activity</p>
              </div>
            )}
            <button className="w-full py-3 bg-gray-50 text-gray-500 text-sm font-bold hover:bg-gray-100 hover:text-gray-700 transition-colors">
              Show more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerLanding;
