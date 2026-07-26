'use client';
import { useEffect, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import Tracker from '@/components/Tracker';
import { supabase } from '@/lib/supabase';

export default function OnboardingPage() {
  return <AuthGate><Shell /></AuthGate>;
}

function Shell() {
  const [email, setEmail] = useState('');
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''));
  }, []);

  return (
    <div className="wrap">
      <div className="bar">
        <div className="mark">B</div>
        <div>
          <h1>Onboarding tracker</h1>
          <div className="sub">Six steps per joiner, due five working days after the date of joining</div>
        </div>
        <div className="right"><a className="back" href="/">← All tiles</a></div>
      </div>
      <Tracker email={email} />
    </div>
  );
}
