import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Today's Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-blue-600 text-sm font-medium">Calories</p>
            <p className="text-2xl font-bold text-blue-800">1,250</p>
            <p className="text-xs text-blue-500">Goal: 2,200</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-600 text-sm font-medium">Workouts</p>
            <p className="text-2xl font-bold text-green-800">1</p>
            <p className="text-xs text-green-500">Exercises: 5</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">🍔</div>
            <div>
              <p className="font-medium">Lunch</p>
              <p className="text-sm text-gray-500">450 kcal • 12:30 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">💪</div>
            <div>
              <p className="font-medium">Full Body A</p>
              <p className="text-sm text-gray-500">5 Exercises • 08:00 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
