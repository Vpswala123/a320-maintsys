import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/shared/Navbar';

export default function AppShell() {
  const { profile, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('light');
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} profile={profile} signOut={signOut} />
      
      {/* Main Content */}
      <main className="flex-1 border-b" style={{ borderColor: 'var(--border)' }}>
        <Outlet />
      </main>

      {/* Disclaimer */}
      <div className="h-[24px] shrink-0 flex items-center justify-center text-[10px] font-mono"
        style={{ background: 'var(--bg-panel-2)', color: 'var(--text-muted)' }}>
        ⚠️ DISCLAIMER: Simulated data for educational purposes only — Not official Airbus documentation
      </div>
    </div>
  );
}
