'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = await signIn(email, password);
    if (res.success) {
      router.push('/globe');
    } else {
      setError(res.error || 'Failed to authenticate');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#f5f5f0] tracking-tight">
          Welcome back to ATLAS
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-1">
          Sign in to unlock your private interactive globe and memories.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          placeholder="explorer@atlas.journal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          type="password"
          label="Password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center"
          >
            <span>Unlock My Atlas</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-[#71717a] pt-2 border-t border-[#1c1c22]">
        Don't have an archive yet?{' '}
        <Link
          href="/register"
          className="text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          Create private account
        </Link>
      </div>
    </div>
  );
}

