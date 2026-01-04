'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up with redirect URL
        const redirectUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/login?confirmed=true`
          : undefined;
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (signUpError) throw signUpError;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          // Email confirmation required
          setSuccessMessage('Please check your email to confirm your account before signing in.');
          setEmail('');
          setPassword('');
          setIsSignUp(false);
          return;
        }

        // If we have a session, user is automatically signed in
        if (data.session) {
          router.push('/');
          router.refresh();
          return;
        }
      } else {
        // Sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // Check if it's an email confirmation error
          if (signInError.message.includes('Email not confirmed') || signInError.message.includes('email_not_confirmed')) {
            throw new Error('Please check your email and confirm your account before signing in.');
          }
          throw signInError;
        }

        // Redirect to home
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#1a1a1a]">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-2xl font-light text-[#2a2a2a] dark:text-[#e5e5e5] mb-2">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h1>
          <p className="text-sm font-light text-gray-600 dark:text-gray-400">
            {isSignUp 
              ? 'Create an account to start tracking your goals'
              : 'Sign in to view your goals'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={6}
          />

          {error && (
            <div className="text-sm text-[#2a2a2a] dark:text-[#e5e5e5] font-light border-l-2 border-[#6a6a6a] dark:border-[#6a6a6a] pl-3 py-2">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-sm text-[#2a2a2a] dark:text-[#e5e5e5] font-light border-l-2 border-[#6a6a6a] dark:border-[#8a8a8a] pl-3 py-2 bg-gray-50 dark:bg-[#2a2a2a]">
              {successMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading 
              ? (isSignUp ? 'Creating Account...' : 'Signing In...')
              : (isSignUp ? 'Sign Up' : 'Sign In')
            }
          </Button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

