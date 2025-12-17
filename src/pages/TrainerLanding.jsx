import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const TrainerLanding = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Trainer Dashboard</h1>
        <p className="text-xl text-gray-600">Coming Soon</p>
        <p className="text-gray-500">This area will allow trainers to manage clients and plans.</p>
        <Button onClick={logout} variant="outline">Logout</Button>
      </div>
    </div>
  );
};

export default TrainerLanding;
