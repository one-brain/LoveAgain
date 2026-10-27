import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowPathIcon,
  LifebuoyIcon,
  PrinterIcon,
  InformationCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

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
    icon: ShieldCheckIcon,
    description: 'Data collection, identity security & privacy rights',
  },
  {
    to: '/terms',
    label: 'Terms of Service',
    shortLabel: 'Terms',
    icon: DocumentTextIcon,
    description: 'User terms, platonic charter & escrow rules',
  },
  {
    to: '/cancellation-policy',
    label: 'Cancellation & Refunds',
    shortLabel: 'Refunds',
    icon: ArrowPathIcon,
    description: 'Booking cancellations, escrow refund tiers & rules',
  },
  {
    to: '/community-guidelines',
    label: 'Community Guidelines',
    shortLabel: 'Guidelines',
    icon: UserGroupIcon,
    description: 'Safety standards, code of conduct & boundaries',
  },
  {
    to: '/support',
    label: 'Help & Grievances',
    shortLabel: 'Support',
    icon: LifebuoyIcon,
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
      <section className="relative overflow-hidden pt-12 pb-10 border-b border-border/70 bg-muted/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
                <SparklesIcon className="w-3.5 h-3.5" />
                <span>Official Platform Policies</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
                {subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <span className="text-xs text-muted-foreground bg-card border border-border/80 px-3 py-1.5 rounded-lg shadow-2xs">
                Effective: <strong className="text-foreground">{effectiveDate}</strong>
              </span>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/80 hover:text-foreground bg-card border border-border/80 hover:bg-muted/50 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Print this policy"
              >
                <PrinterIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Print Document</span>
              </button>
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
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 hidden lg:block">
                Policy Directory
              </span>

              {/* Horizontal Scroll on Small Screens */}
              <div className="flex lg:flex-col overflow-x-auto pb-2 lg:pb-0 gap-1.5 scrollbar-thin">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive: linkActive }) =>
                        `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
                          linkActive || isActive
                            ? 'bg-accent text-accent-foreground shadow-2xs font-semibold'
                            : 'bg-card lg:bg-transparent text-foreground/80 hover:text-foreground hover:bg-muted/40 border border-border/60 lg:border-transparent'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="text-left">
                        <span className="block leading-tight">{item.label}</span>
                        <span className="hidden lg:block text-[11px] opacity-75 font-normal mt-0.5 line-clamp-1">
                          {item.description}
                        </span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>

              {/* Quick Trust Info Box */}
              <div className="hidden lg:block mt-6 p-4 rounded-xl bg-card border border-border/80 text-xs text-muted-foreground space-y-2.5 shadow-2xs">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <InformationCircleIcon className="w-4 h-4 text-accent" />
                  <span>Plain English Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Every Cue policy begins with a layman summary so you can easily understand your rights and commitments before reading legal specifics.
                </p>
                <div className="pt-2 border-t border-border/60 text-[11px]">
                  Need clarification? Email{' '}
                  <a href="mailto:support@cue.local" className="text-accent underline font-medium">
                    support@cue.local
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Document Body */}
          <main className="lg:col-span-3">
            <article className="bg-card border border-border/80 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
              {children}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LegalShell;
