import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const openCookiePreferences = () => {
  window.dispatchEvent(new CustomEvent('cue:open-cookie-preferences'));
};

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cue_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsVisible(true);
    window.addEventListener('cue:open-cookie-preferences', handleOpen);
    return () => window.removeEventListener('cue:open-cookie-preferences', handleOpen);
  }, []);

  const handleChoice = (preference: 'all' | 'essential') => {
    localStorage.setItem('cue_cookie_consent', preference);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-4 sm:p-5 rounded-2xl bg-card/95 backdrop-blur-md border border-border/90 shadow-2xl space-y-3 text-xs sm:text-sm text-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <span className="text-base">🍪</span>
            <span>Cookie & Privacy Choice</span>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            title="Dismiss"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          We use essential cookies and secure storage strictly to authenticate sessions, protect escrow payments, and remember your display preferences. We never sell your data to advertisers.{' '}
          <Link to="/privacy#cookies" className="text-accent underline font-medium">
            Learn more in our Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleChoice('essential')}
            className="px-3 py-1.5 rounded-xl border border-border/80 hover:bg-muted/50 text-foreground text-xs font-medium transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => handleChoice('all')}
            className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
