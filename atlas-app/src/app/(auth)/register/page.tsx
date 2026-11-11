'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !fullName) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    const res = await signUp(email, password, fullName);
    if (res.success) {
      router.push('/globe');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#f5f5f0] tracking-tight">
          Create Your Private Atlas
        </h2>
        <p className="text-xs text-[#a1a1aa] mt-1">
          Begin cataloging your real-world journeys and personal milestones.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          label="Your Full Name"
          placeholder="e.g. Alex Drake"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          type="email"
          label="Email Address"
          placeholder="alex@explorer.journal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          type="password"
          label="Password (min 6 characters)"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your memories are private by default and never shared publicly.</span>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center"
          >
            <span>Begin My Journey</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>

      <div className="text-center text-xs text-[#71717a] pt-2 border-t border-[#1c1c22]">
        Already have an archive?{' '}
        <Link
          href="/login"
          className="text-emerald-400 hover:text-emerald-300 font-semibold"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
