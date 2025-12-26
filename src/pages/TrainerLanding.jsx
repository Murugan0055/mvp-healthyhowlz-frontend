import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Book, Plus } from 'lucide-react';

const TrainerLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Trainer!</h1>
        <p className="text-indigo-100">Ready to transform lives today?</p>
      </div>

      {/* Quick Stats (Placeholder) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase">Active Clients</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-xs font-bold uppercase">Sessions Today</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">--</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/trainer/clients')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors gap-2"
          >
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <Users size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">My Clients</span>
          </button>

          <button
            onClick={() => navigate('/trainer/library')}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors gap-2"
          >
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <Book size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700">Library</span>
          </button>
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-400 text-sm">No recent activity</p>
        </div>
      </div>
    </div>
  );
};

export default TrainerLanding;
