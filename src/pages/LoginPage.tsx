import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Shield, Users, Sparkles, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)`
          }}></div>
        </div>
        
        {/* Yellow Diagonal Lines Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 50px,
                rgba(250, 204, 21, 0.6) 50px,
                rgba(250, 204, 21, 0.6) 52px
              )
            `
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce-gentle"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse-gentle"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-12">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Welcome to
              <br />
              <span className="gradient-text bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Student Support
              </span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Nottinghamshire New University's modern platform for seamless student assistance and support management.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Academic Excellence</h3>
                <p className="text-white/70">Supporting your educational journey with modern tools</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-white/70">Enterprise-grade security for your peace of mind</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">24/7 Support</h3>
                <p className="text-white/70">Always here when you need assistance</p>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-8 left-12 right-12">
            <div className="h-1 bg-gradient-to-r from-white/20 via-white/40 to-white/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
            Welcome Back
          </h2>
            <p className="text-neutral-600">
            Sign in to your Student Support account
          </p>
        </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome back
              <span className="inline-block ml-2 animate-bounce-gentle">•</span>
            </h2>
            <p className="text-neutral-600 text-lg">
              Let's get you connected to student support
            </p>
          </div>

        {/* Login Form */}
          <div className="card-glass p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                    className={`input pl-12 ${
                      errors.email ? 'input-error' : ''
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                  <p className="mt-2 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                    className={`input pl-12 pr-12 ${
                      errors.password ? 'input-error' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                      <EyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                  ) : (
                      <Eye className="h-5 w-5 text-neutral-400 hover:text-neutral-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                  <p className="mt-2 text-sm text-error-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center py-4 text-lg font-semibold group"
            >
              {isLoading ? (
                <>
                    <LoadingSpinner size="sm" className="mr-3" />
                  Signing in...
                </>
              ) : (
                  <>
                    Sign In to Student Support
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </form>

          {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/20 text-center">
              <p className="text-sm text-white/80">
              Nottinghamshire New University Student Support System
            </p>
              <p className="text-xs text-white/60 mt-1">
                Modern • Secure • Always Available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
