import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@fluentui/react-components';
import { Dismiss16Regular, ShieldCheckmark20Regular } from '@fluentui/react-icons';

export const openCookiePreferences = () => {
  window.dispatchEvent(new CustomEvent('cue:open-cookie-preferences'));
};

const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cue_cookie_consent');
    if (!consent) {
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
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50">
      <Card className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-lg space-y-3 text-body1 text-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheckmark20Regular className="text-brand-fg shrink-0" />
            <span>Cookie & privacy choice</span>
          </div>
          <Button
            appearance="subtle"
            size="small"
            icon={<Dismiss16Regular />}
            onClick={() => setIsVisible(false)}
            title="Dismiss"
            aria-label="Dismiss cookie banner"
          />
        </div>

        <p className="text-caption1 text-muted-foreground leading-relaxed">
          We use essential cookies and secure storage strictly to authenticate sessions, protect escrow payments, and remember your display preferences. We never sell your data to advertisers.{' '}
          <Link to="/privacy#cookies" className="text-brand-fg underline font-semibold">
            Learn more in our Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            appearance="secondary"
            size="small"
            onClick={() => handleChoice('essential')}
          >
            Essential only
          </Button>
          <Button
            appearance="primary"
            size="small"
            onClick={() => handleChoice('all')}
          >
            Accept all
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsentBanner;
