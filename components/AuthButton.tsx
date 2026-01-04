'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Button onClick={() => router.push('/login')}>
        Sign In
      </Button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm font-light text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
    >
      Sign Out
    </button>
  );
}

