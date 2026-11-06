import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@fluentui/react-components';
import {
  ShieldCheckmark20Regular,
  DocumentText20Regular,
  People20Regular,
  ArrowCounterclockwise20Regular,
  QuestionCircle20Regular,
  Print16Regular,
  Info16Regular,
  Sparkle16Regular,
} from '@fluentui/react-icons';

interface LegalShellProps {
  title: string;
  subtitle: string;
  effectiveDate?: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    to: '/privacy',
    label: 'Privacy Policy',
    shortLabel: 'Privacy',
    icon: ShieldCheckmark20Regular,
    description: 'Data collection, identity security & privacy rights',
  },
  {
    to: '/terms',
    label: 'Terms of Service',
    shortLabel: 'Terms',
    icon: DocumentText20Regular,
    description: 'User terms, platonic charter & escrow rules',
  },
  {
    to: '/cancellation-policy',
    label: 'Cancellation & Refunds',
    shortLabel: 'Refunds',
    icon: ArrowCounterclockwise20Regular,
    description: 'Booking cancellations, escrow refund tiers & rules',
  },
  {
    to: '/community-guidelines',
    label: 'Community Guidelines',
    shortLabel: 'Guidelines',
    icon: People20Regular,
    description: 'Safety standards, code of conduct & boundaries',
  },
  {
    to: '/support',
    label: 'Help & Grievances',
    shortLabel: 'Support',
    icon: QuestionCircle20Regular,
    description: '24/7 dispute help, safety desk & grievance officer',
  },
];

const LegalShell: React.FC<LegalShellProps> = ({
  title,
  subtitle,
  effectiveDate = 'October 2026',
  children,
}) => {
  const location = useLocation();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header Banner */}
      <section className="pt-10 pb-8 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-light border border-border text-brand-fg text-caption1 font-semibold mb-3">
                <Sparkle16Regular />
                <span>Official platform policies</span>
              </div>
              <h1 className="text-title2 sm:text-title1 font-semibold text-foreground">
                {title}
              </h1>
              <p className="mt-1.5 text-body2 text-muted-foreground max-w-2xl">
                {subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
              <span className="text-caption1 text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-md">
                Effective: <strong className="text-foreground font-semibold">{effectiveDate}</strong>
              </span>
              <Button
                appearance="secondary"
                size="small"
                icon={<Print16Regular />}
                onClick={handlePrint}
                title="Print this policy"
              >
                Print Document
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area with Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-2">
              <span className="text-caption1 font-semibold text-muted-foreground px-2 hidden lg:block">
                Policy directory
              </span>

              <div className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-1.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body1 transition-colors whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                          linkActive || isActive
                            ? 'bg-accent-light text-brand-fg font-semibold border border-border'
                            : 'bg-card lg:bg-transparent text-foreground hover:bg-muted border border-border lg:border-transparent font-normal'
                        }`
                      }
                    >
                      <Icon className="shrink-0" />
                      <div className="text-left">
                        <span className="block leading-tight">{item.label}</span>
                        <span className="hidden lg:block text-caption1 text-muted-foreground font-normal mt-0.5 line-clamp-1">
                          {item.description}
                        </span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>

              {/* Quick Trust Info Box */}
              <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-card border border-border text-caption1 text-muted-foreground space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Info16Regular className="text-brand-fg" />
                  <span>Plain English Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Every Cue policy begins with a layman summary so you can easily understand your rights and commitments before reading legal specifics.
                </p>
                <div className="pt-2 border-t border-border text-caption1">
                  Need clarification? Email{' '}
                  <a href="mailto:support@cue.local" className="text-brand-fg underline font-semibold">
                    support@cue.local
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Document Body */}
          <main className="lg:col-span-3">
            <article className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
              {children}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LegalShell;
