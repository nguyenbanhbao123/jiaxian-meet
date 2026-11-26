import { useState, type FormEvent } from 'react';
import { AuthUser, login, signUp } from '../../api/auth';

export type AuthMode = 'login' | 'signup';

type Props = {
  mode: AuthMode;
  onAuthSuccess: (user: AuthUser) => void;
};

export default function AuthForm({ mode, onAuthSuccess }: Props) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setMode(next: AuthMode) {
    setError(null);
    window.location.hash = next === 'login' ? 'login' : 'sign-up';
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user =
        mode === 'signup'
          ? await signUp({ username: username.trim(), email: email.trim(), password })
          : await login({ username: username.trim(), password });

      onAuthSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      {/* Mode Toggle */}
      <div className="mb-8 flex w-full rounded-xl bg-[#23242a] p-1">
        <button
          type="button"
          aria-pressed={mode === 'login'}
          onClick={() => setMode('login')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
            mode === 'login' ? 'bg-[#31323b] text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          aria-pressed={mode === 'signup'}
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Username Input */}
        <div className="space-y-1">
          <label htmlFor="auth-text" className="text-sm text-gray-300">Username</label>
          <input
            id="auth-text"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-transparent px-4 py-2.5 text-sm text-white focus:border-[#dcb886] focus:outline-none focus:ring-1 focus:ring-[#dcb886]"
          />
        </div>

        {/* Email Input */}
        {mode === 'signup' && (
          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-sm text-gray-300">Email Address</label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-transparent px-4 py-2.5 text-sm text-white focus:border-[#dcb886] focus:outline-none focus:ring-1 focus:ring-[#dcb886]"
            />
          </div>
        )}

        {/* Password Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="auth-password" className="text-sm text-gray-300">Password</label>
            {mode === 'login' && (
              <a href="#" className="text-xs text-[#dcb886] hover:underline">
                Forgot password?
              </a>
            )}
          </div>
          <input
            id="auth-password"
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-700 bg-transparent px-4 py-2.5 text-sm text-white focus:border-[#dcb886] focus:outline-none focus:ring-1 focus:ring-[#dcb886]"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Dynamic Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-[#dcb886] py-3 text-sm font-bold text-black transition-colors hover:bg-[#c9a678] disabled:opacity-50"
        >
          {submitting
            ? 'Please wait...'
            : mode === 'signup'
              ? 'Create Account'
              : 'Log In'}
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
        <button type="button" className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-700 bg-transparent py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#23242a]">
          <span className="font-bold text-blue-500">G</span>
          <span>Continue with Google</span>
        </button>
        <button type="button" className="flex w-full items-center justify-center space-x-2 rounded-md border border-gray-700 bg-transparent py-2.5 text-sm text-gray-300 transition-colors hover:bg-[#23242a]">
          <span className="font-bold text-white"></span>
          <span>Continue with Apple</span>
        </button>
      </div>

      {/* Dynamic Footer Link */}
      <div className="mt-8 text-center text-sm text-gray-400">
        {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
        <button
          type="button"
          className="font-medium text-[#dcb886] hover:underline"
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Log In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}