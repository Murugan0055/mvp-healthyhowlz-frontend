import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ForgotPassword = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for future implementation
    alert("Password reset link sent (simulated)");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reset password</h1>
          <p className="mt-2 text-gray-600">Enter your email to receive instructions</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
            />

            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/auth/login" className="font-semibold text-primary hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
