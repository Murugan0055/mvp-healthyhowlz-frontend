import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Signup = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, watch } = useForm();
  const { signup } = useAuth();
  const navigate = useNavigate();
  
  const password = watch("password");

  const onSubmit = async (data) => {
    const result = await signup(data.email, data.password);
    if (result.success) {
      navigate('/');
    } else {
      setError('root', { 
        type: 'manual', 
        message: result.error 
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
          <p className="mt-2 text-gray-600">Start your healthy journey today</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              error={errors.email?.message}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              error={errors.password?.message}
            />

            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || "Passwords do not match"
              })}
              error={errors.confirmPassword?.message}
            />

            {errors.root && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                {errors.root.message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isSubmitting}
            >
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-semibold text-primary hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
