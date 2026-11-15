import React, { useState } from 'react';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      <div className="mb-8 flex w-full rounded-xl bg-[#23242a] p-1">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === 'login' ? 'bg-[#31323b] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === 'signup' ? 'bg-[#31323b] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Dynamic Header */}
      <h1 className="mb-6 text-3xl font-bold text-white">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Name Input - Only visible during Sign Up */}
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-sm text-gray-300">Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-700 bg-transparent px-4 py-2.5 text-sm text-white focus:border-[#dcb886] focus:outline-none focus:ring-1 focus:ring-[#dcb886]"
            />
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-1">
          <label className="text-sm text-gray-300">Email Address</label>
          <input
            type="email"
            className="w-full rounded-md border border-gray-700 bg-transparent px-4 py-2.5 text-sm text-white focus:border-[#dcb886] focus:outline-none focus:ring-1 focus:ring-[#dcb886]"
          />
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-300">Password</label>
            {/* Optional: Forgot password link for Login mode */}
            {mode === 'login' && (
              <a href="#" className="text-xs text-[#dcb886] hover:underline">
                Forgot password?
              </a>
            )}
          </div>
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-gray-700 bg-transparent px-4 py-2.5 text-sm text-white focus:border-[#dcb886] focus:outline-none focus:ring-1 focus:ring-[#dcb886]"
          />
        </div>

        {/* Dynamic Submit Button */}
        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-[#dcb886] py-3 text-sm font-bold text-black transition-colors hover:bg-[#c9a678]"
        >
          {mode === 'signup' ? 'Create Account' : 'Log In'}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center">
        <div className="flex-grow border-t border-gray-700"></div>
        <span className="mx-4 text-xs text-gray-500">or</span>
        <div className="flex-grow border-t border-gray-700"></div>
      </div>

      {/* Social Buttons */}
      <div className="space-y-3">
        <button className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-700 bg-transparent py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#23242a]">
          <span className="font-bold text-blue-500">G</span>
          <span>Continue with Google</span>
        </button>
        <button className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-700 bg-transparent py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#23242a]">
          <span className="font-bold text-white"></span>
          <span>Continue with Apple</span>
        </button>
      </div>

      {/* Dynamic Footer Link */}
      <div className="mt-8 text-center text-sm text-gray-400">
        {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
        <button 
          className="font-medium text-[#dcb886] hover:underline" 
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Log In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}