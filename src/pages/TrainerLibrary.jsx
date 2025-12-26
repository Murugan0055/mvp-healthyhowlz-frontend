import React from 'react';

const TrainerLibrary = () => {
  return (
    <div className="p-6 text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-4xl">📚</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Library</h2>
      <p className="text-gray-500">
        Manage your workout exercises, diet templates, and resources here.
      </p>
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm">
        Feature coming soon!
      </div>
    </div>
  );
};

export default TrainerLibrary;
