import React from 'react';
import { Plus } from 'lucide-react';

const WorkoutTracker = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workouts</h2>
        <button className="bg-primary text-white p-2 rounded-full shadow-lg">
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Placeholder for workout list */}
        <p className="text-center text-gray-500 py-4">No workouts logged today.</p>
      </div>
    </div>
  );
};

export default WorkoutTracker;
