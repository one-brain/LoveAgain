import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckmark20Regular,
  LockClosed20Regular,
  CheckmarkStarburst20Regular,
  ShieldCheckmark16Regular,
  ArrowLeft16Regular,
} from '@fluentui/react-icons';
import { BrandLogo } from '../ui/BrandLogo';

interface AuthShellProps {
  title: string;
  subtitle?: React.ReactNode;
  badgeText?: string;
  backLink?: {
    to: string;
    label: string;
  };
  editorialTitle?: string;
  editorialSubtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const TRUST_PILLARS = [
  {
    icon: ShieldCheckmark20Regular,
    title: '100% Escrow Protected',
    description:
      'Every booking is held in RBI-compliant escrow and released only after verified check-in.',
    accent: 'trust' as const,
  },
  {
    icon: CheckmarkStarburst20Regular,
    title: 'Identity-Vetted Members',
    description:
      'Mandatory government ID and 18+ age verification keep every outing authentic and accountable.',
    accent: 'brand' as const,
  },
  {
    icon: LockClosed20Regular,
    title: '4-Digit Arrival PIN',
    description:
      'Mutual in-person PIN confirmation verifies arrival before your companionship session begins.',
    accent: 'brand' as const,
  },
];

export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  badgeText = 'Escrow Protected',
  backLink,
  editorialTitle = 'Curated social outings, built on verified trust.',
  editorialSubtitle = 'Join a vetted community of guests and companions for dining, gallery walks, live events, and city exploration.',
  children,
  footer,
}) => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-background">
      <div className="w-full max-w-[960px] bg-card border border-border rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Editorial & Trust Panel (Desktop) */}
        <aside className="hidden lg:flex lg:col-span-5 bg-muted border-r border-border p-8 xl:p-10 flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="focus:outline-none">
                <BrandLogo size="md" subtitle="Curated outings" />
              </Link>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-trust-light border border-trust-border text-caption2 font-semibold text-trust">
                <ShieldCheckmark16Regular className="shrink-0" />
                <span>{badgeText}</span>
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              <h2 className="text-title2 font-semibold text-foreground tracking-tight leading-snug">
                {editorialTitle}
              </h2>
              <p className="text-body1 text-muted-foreground leading-relaxed">
                {editorialSubtitle}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {TRUST_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                const isTrust = pillar.accent === 'trust';
                return (
                  <div
                    key={pillar.title}
                    className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                        isTrust
                          ? 'bg-trust-light border-trust-border text-trust'
                          : 'bg-brand-light border-border text-brand-fg'
                      }`}
                    >
                      <Icon />
                    </div>
                    <div className="min-w-0">
                      <p className="text-caption1 font-semibold text-foreground">
                        {pillar.title}
                      </p>
                      <p className="text-caption2 text-muted-foreground leading-relaxed mt-0.5">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-border grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-body2 font-semibold text-foreground tabular">100%</p>
              <p className="text-caption2 text-muted-foreground">ID Vetted</p>
            </div>
            <div className="border-x border-border px-2">
              <p className="text-body2 font-semibold text-trust tabular">₹0</p>
              <p className="text-caption2 text-muted-foreground">Pre-PIN Release</p>
            </div>
            <div>
              <p className="text-body2 font-semibold text-foreground tabular">256-Bit</p>
              <p className="text-caption2 text-muted-foreground">Encrypted</p>
            </div>
          </div>
        </aside>

        {/* Right Interactive Auth Surface */}
        <section className="lg:col-span-7 p-6 sm:p-8 xl:p-10 flex flex-col justify-center">
          <div className="w-full max-w-[440px] mx-auto space-y-6">
            {/* Mobile Brand Header / Optional Back Link */}
            <div className="flex items-center justify-between lg:hidden">
              <Link to="/">
                <BrandLogo size="sm" subtitle="Curated outings" />
              </Link>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-trust-light border border-trust-border text-caption2 font-semibold text-trust">
                <ShieldCheckmark16Regular className="shrink-0" />
                <span>{badgeText}</span>
              </span>
            </div>

            {backLink && (
              <div>
                <Link
                  to={backLink.to}
                  className="inline-flex items-center gap-1.5 text-caption1 font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft16Regular />
                  <span>{backLink.label}</span>
                </Link>
              </div>
            )}

            {/* Page Title & Subtitle */}
            <div className="space-y-1.5">
              <h1 className="text-title2 font-semibold text-foreground tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <div className="text-body1 text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>

            {/* Form / Main Content */}
            <div className="space-y-5">{children}</div>

            {/* Optional Footer */}
            {footer && <div className="pt-2 border-t border-border">{footer}</div>}
          </div>
        </section>
      </div>
    </div>
  );
};
