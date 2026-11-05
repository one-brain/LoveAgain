import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { setUser } from '../store/slices/authSlice';
import { performFullLogout } from '../utils/sessionManager';
import { useGetSeekerProfileQuery, useGetMyProfileQuery } from '../store/api';
import { useResendVerificationMutation } from '../store/authApi';
import {
  SunIcon,
  MoonIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { useGetWalletBalanceQuery } from '../store/paymentApi';
import {
  useGetAdminVerificationsQuery,
  useGetAdminPayoutsQuery,
} from '../store/adminApi';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = Boolean(
    isAuthenticated && (user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local')
  );
  const isInAdminPortal = Boolean(isAdmin && location.pathname.startsWith('/admin'));

  const { data: walletData } = useGetWalletBalanceQuery(undefined, { skip: !isAuthenticated || isAdmin });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Sync profile data from REST API whenever authenticated
  const { data: seekerProfileData } = useGetSeekerProfileQuery(undefined, { skip: !isAuthenticated });
  const { data: myProfileData } = useGetMyProfileQuery(undefined, { skip: !isAuthenticated || isAdmin });

  // Admin telemetry for badge counters
  const { data: adminVerificationsData } = useGetAdminVerificationsQuery({ status: 'PendingReview', pageSize: 1 }, { skip: !isAuthenticated || !isAdmin });
  const { data: adminPayoutsData } = useGetAdminPayoutsQuery({ pageSize: 1 }, { skip: !isAuthenticated || !isAdmin });

  const pendingAdminVerificationsCount = adminVerificationsData?.totalCount ?? 0;
  const pendingAdminPayoutsCount = adminPayoutsData?.totalCount ?? 0;

  const companionStatus = myProfileData?.profile?.status;

  useEffect(() => {
    if (seekerProfileData?.profile?.firstName && user?.id) {
      const p = seekerProfileData.profile;
      // Guard: strictly ensure the loaded profile matches the currently logged-in user id
      if (p.userId && p.userId !== user.id) {
        return;
      }
      if (
        p.firstName !== user?.firstName ||
        p.lastName !== user?.lastName ||
        p.isVerified !== user?.isVerified ||
        p.photoUrl !== user?.photoUrl ||
        (p.trustScore !== undefined && p.trustScore !== user?.trustScore)
      ) {
        dispatch(
          setUser({
            id: user.id,
            email: p.email || user.email || '',
            firstName: p.firstName || user.firstName,
            lastName: p.lastName ?? user.lastName ?? '',
            photoUrl: p.photoUrl || user.photoUrl || null,
            isVerified: p.isVerified ?? user.isVerified ?? false,
            trustScore: p.trustScore ?? user.trustScore ?? 50,
            roles: user.roles || (isAdmin ? ['Admin'] : ['Seeker', 'Provider']),
          })
        );
      }
    }
  }, [seekerProfileData, user, isAdmin, dispatch]);

  const userInitials = useMemo(() => {
    if (!user) return 'U';
    const first = user.firstName?.trim()?.charAt(0) || '';
    const last = user.lastName?.trim()?.charAt(0) || '';
    const combined = `${first}${last}`.toUpperCase();
    if (combined && combined !== 'M' && combined !== 'ME') return combined;
    if (first && first.toUpperCase() !== 'M') return first.toUpperCase();
    if (user.email) {
      const parts = user.email.split('@')[0].split('.');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }, [user]);

  const userDisplayName = useMemo(() => {
    if (!user) return 'My Account';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (fullName && fullName.toLowerCase() !== 'member') return fullName;
    if (user.firstName && user.firstName.toLowerCase() !== 'member') return user.firstName;
    if (user.email) {
      const parts = user.email.split('@')[0].split('.');
      if (parts.length >= 2) {
        return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      }
      return user.email.split('@')[0];
    }
    return 'My Account';
  }, [user]);

  type ThemeMode = 'light' | 'dark' | 'romantic' | 'emerald' | 'champagne' | 'sapphire';

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme');
    if (
      saved === 'light' ||
      saved === 'dark' ||
      saved === 'romantic' ||
      saved === 'emerald' ||
      saved === 'champagne' ||
      saved === 'sapphire'
    ) {
      return saved as ThemeMode;
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'romantic', 'emerald', 'champagne', 'sapphire');
    if (theme !== 'light') {
      document.documentElement.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setThemeDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setThemeDropdownOpen(false);
  }, [location.pathname, location.search]);

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'romantic', 'emerald', 'champagne', 'sapphire'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const [resendVerification, { isLoading: isResendingVerification }] = useResendVerificationMutation();
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResendVerification = async () => {
    try {
      await resendVerification().unwrap();
      setResendStatus('Verification link sent! Check your inbox.');
      setTimeout(() => setResendStatus(null), 6000);
    } catch {
      setResendStatus('Failed to send verification link. Please try again later.');
      setTimeout(() => setResendStatus(null), 6000);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await performFullLogout(dispatch, navigate);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isAuthenticated && !isAdmin && user?.isVerified === false && !user?.email?.endsWith('@cue.local') && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-700 dark:text-amber-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <span>⚠️ Your email is not verified yet. Confirm your email address to unlock full escrow booking features.</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {resendStatus ? (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  {resendStatus}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-semibold text-[11px] border border-amber-500/30 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-50 glass border-b border-border/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={isInAdminPortal ? "/admin" : "/"} className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl ${isInAdminPortal ? 'bg-gradient-to-br from-accent-champagne via-[#A47E3B] to-accent shadow-accent-champagne/20' : 'bg-gradient-to-br from-accent via-accent-hover to-accent/90'} flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                {isInAdminPortal ? <ShieldCheckIcon className="w-6 h-6 text-white" /> : <SparklesIcon className="w-6 h-6" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors font-serif flex items-center gap-1.5">
                  Cue {isInAdminPortal && <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent-champagne/20 text-accent-champagne border border-accent-champagne/40">Command</span>}
                </span>
                <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground -mt-1 hidden sm:inline font-sans">
                  {isInAdminPortal ? 'Back-Office Operations' : 'Curated Outings'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isInAdminPortal ? (
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  location.pathname === '/admin'
                    ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30 shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <ShieldCheckIcon className="w-4 h-4 text-accent-champagne" />
                <span>Dashboard Overview</span>
                {(pendingAdminVerificationsCount > 0 || pendingAdminPayoutsCount > 0) && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-champagne/20 text-accent-champagne tabular-nums">
                    {pendingAdminVerificationsCount + pendingAdminPayoutsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/discovery"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive('/discovery')
                    ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30 shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <SparklesIcon className="w-4 h-4 text-accent" />
                <span>Guest Directory</span>
              </Link>
            </nav>
          ) : isAuthenticated && !isAdmin ? (
            /* Authenticated Host Desktop Navigation */
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/discovery"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/discovery')
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                Discover Guests
              </Link>
              <Link
                to="/bookings"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/bookings')
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                My Outings
              </Link>
              <Link
                to="/how-it-works"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/how-it-works')
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                How It Works
              </Link>
            </nav>
          ) : (
            /* Public Host, Guest & Admin Marketplace Desktop Navigation */
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/discovery"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/discovery')
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                Discover Guests
              </Link>
              <Link
                to="/how-it-works"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/how-it-works')
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                How It Works
              </Link>
              {!isAdmin && (
                <Link
                  to={isAuthenticated ? "/apply-companion" : "/register?redirect=/apply-companion"}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/apply-companion') || (location.pathname === '/register' && location.search.includes('apply-companion'))
                      ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  Become a Guest
                </Link>
              )}
            </nav>
          )}

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin Quick Shortcut back to Operations when browsing public marketplace */}
            {isAdmin && !isInAdminPortal && (
              <Link
                to="/admin/verifications"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-bold text-amber-600 dark:text-amber-400 transition-all shadow-2xs hover:scale-[1.02]"
                title="Return to Back-Office Operations Portal"
              >
                <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Back-Office Portal &rarr;</span>
              </Link>
            )}

            {/* Seeker Quick Wallet Balance Pill */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/wallet"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 border border-accent/25 text-xs font-semibold text-accent transition-all shadow-2xs hover:scale-[1.02]"
                title="View Cue Escrow Wallet & Vault"
              >
                <BanknotesIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="font-mono">₹{walletData?.availableBalance?.toLocaleString('en-IN') ?? '0'}</span>
              </Link>
            )}

            {/* Theme Dropdown Menu */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                type="button"
                onClick={() => setThemeDropdownOpen((prev) => !prev)}
                className={`p-2 pl-3 pr-2.5 rounded-xl border transition-all duration-200 flex items-center gap-2 text-xs font-semibold shadow-xs select-none ${
                  themeDropdownOpen
                    ? 'border-accent bg-card text-foreground ring-2 ring-accent/25'
                    : 'border-border/80 bg-card hover:bg-muted/80 text-foreground/80 hover:text-foreground'
                }`}
                title="Switch Theme"
                aria-haspopup="listbox"
                aria-expanded={themeDropdownOpen}
              >
                {theme === 'light' && (
                  <>
                    <SunIcon className="w-4 h-4 text-amber-500" />
                    <span className="text-foreground">Daylight</span>
                  </>
                )}
                {theme === 'dark' && (
                  <>
                    <MoonIcon className="w-4 h-4 text-sky-400" />
                    <span className="text-foreground">Midnight</span>
                  </>
                )}
                {theme === 'romantic' && (
                  <>
                    <HeartIcon className="w-4 h-4 text-rose-500" />
                    <span className="text-foreground">Velvet</span>
                  </>
                )}
                {theme === 'emerald' && (
                  <>
                    <SparklesIcon className="w-4 h-4 text-emerald-500" />
                    <span className="text-foreground">Emerald</span>
                  </>
                )}
                {theme === 'champagne' && (
                  <>
                    <SunIcon className="w-4 h-4 text-amber-600" />
                    <span className="text-foreground">Sand</span>
                  </>
                )}
                {theme === 'sapphire' && (
                  <>
                    <MoonIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-foreground">Sapphire</span>
                  </>
                )}
                <ChevronDownIcon
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                    themeDropdownOpen ? 'rotate-180 text-accent' : ''
                  }`}
                />
              </button>

              {themeDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Select Theme Palette"
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-popover/95 text-popover-foreground border border-border/90 shadow-2xl backdrop-blur-md p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Select Theme Palette
                  </div>
                  <button
                    type="button"
                    role="option"
                    aria-selected={theme === 'light'}
                    onClick={() => {
                      setTheme('light');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      theme === 'light'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-500 border border-amber-300 shadow-xs flex-shrink-0" />
                      <div className="text-left">
                        <div className="leading-tight">Warm Daylight</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Vanilla & Amber</div>
                      </div>
                    </div>
                    {theme === 'light' && <CheckIcon className="w-4 h-4 text-accent" />}
                  </button>

                  <button
                    type="button"
                    role="option"
                    aria-selected={theme === 'dark'}
                    onClick={() => {
                      setTheme('dark');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      theme === 'dark'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-sky-500 border border-sky-300 shadow-xs flex-shrink-0" />
                      <div className="text-left">
                        <div className="leading-tight">Midnight Luxe</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Obsidian & Slate</div>
                      </div>
                    </div>
                    {theme === 'dark' && <CheckIcon className="w-4 h-4 text-accent" />}
                  </button>

                  <button
                    type="button"
                    role="option"
                    aria-selected={theme === 'romantic'}
                    onClick={() => {
                      setTheme('romantic');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      theme === 'romantic'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-rose-500 border border-rose-300 shadow-xs flex-shrink-0" />
                      <div className="text-left">
                        <div className="leading-tight">Velvet Night</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Bordeaux Noir & Rose</div>
                      </div>
                    </div>
                    {theme === 'romantic' && <CheckIcon className="w-4 h-4 text-accent" />}
                  </button>

                  <button
                    type="button"
                    role="option"
                    aria-selected={theme === 'emerald'}
                    onClick={() => {
                      setTheme('emerald');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      theme === 'emerald'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-600 border border-emerald-400 shadow-xs flex-shrink-0" />
                      <div className="text-left">
                        <div className="leading-tight">Emerald Estate</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Heritage Forest & Gold</div>
                      </div>
                    </div>
                    {theme === 'emerald' && <CheckIcon className="w-4 h-4 text-accent" />}
                  </button>

                  <button
                    type="button"
                    role="option"
                    aria-selected={theme === 'champagne'}
                    onClick={() => {
                      setTheme('champagne');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      theme === 'champagne'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-700 border border-amber-500 shadow-xs flex-shrink-0" />
                      <div className="text-left">
                        <div className="leading-tight">Champagne Sand</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Linen & Terracotta Bronze</div>
                      </div>
                    </div>
                    {theme === 'champagne' && <CheckIcon className="w-4 h-4 text-accent" />}
                  </button>

                  <button
                    type="button"
                    role="option"
                    aria-selected={theme === 'sapphire'}
                    onClick={() => {
                      setTheme('sapphire');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      theme === 'sapphire'
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-blue-600 border border-blue-400 shadow-xs flex-shrink-0" />
                      <div className="text-left">
                        <div className="leading-tight">Sapphire Royal</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Parisian Cobalt & Pearl</div>
                      </div>
                    </div>
                    {theme === 'sapphire' && <CheckIcon className="w-4 h-4 text-accent" />}
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              /* Enhanced User Menu Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2.5 p-1.5 pl-3 pr-2.5 rounded-xl border transition-all text-sm font-medium shadow-xs select-none ${
                    userDropdownOpen
                      ? 'border-accent bg-card text-foreground ring-2 ring-accent/25'
                      : 'border-border/80 bg-card hover:bg-muted/80 text-foreground'
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={userDropdownOpen}
                >
                  <span className="max-w-[140px] truncate text-foreground font-semibold text-xs sm:text-sm">
                    {userDisplayName}
                  </span>
                  <div className="relative">
                    {user?.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={userDisplayName}
                        className="w-8 h-8 rounded-lg object-cover border border-accent/30"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-lg ${isAdmin ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : 'bg-accent/20 text-accent border-accent/30'} font-bold flex items-center justify-center text-xs tracking-wider border font-sans`}>
                        {userInitials}
                      </div>
                    )}
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-card">
                      <span className="sr-only">Online status: Active</span>
                    </span>
                  </div>
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180 text-accent' : ''
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2 ${
                      isAdmin ? 'w-80 sm:w-[22rem]' : 'w-64'
                    } rounded-2xl bg-popover/95 text-popover-foreground border border-border/90 shadow-2xl backdrop-blur-md p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150`}
                  >
                    {isAdmin ? (
                      <div>
                        {/* Admin Identity Card */}
                        <div className="p-3 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-xl mb-2 border border-amber-500/25">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-accent-champagne/20 text-accent-champagne border border-accent-champagne/30 font-bold flex items-center justify-center text-xs tracking-wider shrink-0 font-sans">
                              {userInitials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate leading-tight">
                                {userDisplayName}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-accent-champagne/20">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-accent-champagne/20 text-accent-champagne border border-accent-champagne/40">
                              <ShieldCheckIcon className="w-3 h-3 text-accent-champagne" />
                              Platform Administrator
                            </span>
                          </div>
                        </div>

                        {/* Direct Admin Quick Navigation */}
                        <div className="space-y-0.5 mt-1">
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent-champagne/15 text-accent-champagne group-hover:bg-accent-champagne/25 transition-colors shrink-0">
                                <ShieldCheckIcon className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="truncate font-semibold leading-tight">Command Dashboard</p>
                                <p className="text-[10px] text-muted-foreground font-normal truncate">
                                  Full back-office cockpit
                                </p>
                              </div>
                            </div>
                            {(pendingAdminVerificationsCount > 0 || pendingAdminPayoutsCount > 0) && (
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent-champagne/20 text-accent-champagne shrink-0 tabular-nums">
                                {pendingAdminVerificationsCount + pendingAdminPayoutsCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            to="/admin?tab=profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium group"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                              <UserCircleIcon className="w-4 h-4 text-muted-foreground group-hover:text-accent" />
                            </div>
                            <div className="truncate">
                              <p className="truncate leading-tight">Admin Credentials & Security</p>
                              <p className="text-[10px] text-muted-foreground font-normal truncate">
                                Password rotation & identity
                              </p>
                            </div>
                          </Link>
                        </div>

                        {/* Marketplace Preview Link */}
                        <div className="border-t border-border/60 pt-1.5 mt-2">
                          <Link
                            to="/discovery"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium group"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                              <SparklesIcon className="w-4 h-4 text-accent" />
                            </div>
                            <div className="truncate">
                              <p className="truncate leading-tight">Guest Catalog Preview</p>
                              <p className="text-[10px] text-muted-foreground font-normal truncate">
                                Explore public member listings
                              </p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-muted/50 rounded-xl mb-1.5 border border-border/40">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-foreground truncate">
                              {userDisplayName}
                            </p>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-success/20 text-success uppercase tracking-wider flex-shrink-0">
                              {user?.isVerified !== false ? 'Verified' : 'Member'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <Link
                            to="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium"
                          >
                            <UserCircleIcon className="w-4 h-4 text-muted-foreground" />
                            <span>My Account</span>
                          </Link>
                          <Link
                            to={companionStatus === 'Approved' ? '/provider' : '/apply-companion'}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium"
                          >
                            <SparklesIcon className="w-4 h-4 text-accent" />
                            <span>{companionStatus === 'Approved' ? 'Guest Dashboard' : companionStatus === 'PendingReview' ? 'Guest Status ⏳' : 'Become a Guest'}</span>
                          </Link>
                          <Link
                            to="/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium"
                          >
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span>My Outings</span>
                          </Link>
                          <Link
                            to="/wallet"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium"
                          >
                            <div className="flex items-center gap-2.5">
                              <BanknotesIcon className="w-4 h-4 text-accent" />
                              <span>Cue Wallet</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-accent">
                              ₹{walletData?.availableBalance?.toLocaleString('en-IN') ?? '0'}
                            </span>
                          </Link>
                        </div>
                      </>
                    )}

                    <div className="border-t border-border/60 pt-1 mt-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated actions */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/70 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-accent-foreground bg-accent hover:bg-accent-hover rounded-xl shadow-xs transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Bar (Theme toggle + Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl border border-border/80 bg-card text-foreground/80"
              aria-label="Cycle theme"
            >
              {theme === 'light' && <SunIcon className="w-5 h-5 text-amber-500" />}
              {theme === 'dark' && <MoonIcon className="w-5 h-5 text-indigo-400" />}
              {theme === 'romantic' && <HeartIcon className="w-5 h-5 text-rose-500" />}
              {theme === 'emerald' && <SparklesIcon className="w-5 h-5 text-emerald-400" />}
              {theme === 'champagne' && <SunIcon className="w-5 h-5 text-amber-600" />}
              {theme === 'sapphire' && <MoonIcon className="w-5 h-5 text-sky-400" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-border/80 bg-card text-foreground"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/80 bg-card px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {isInAdminPortal ? (
            <>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Admin Command
              </div>
              <div className="space-y-1">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname === '/admin'
                      ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheckIcon className="w-5 h-5 text-accent-champagne shrink-0" />
                    <span>Command Dashboard</span>
                  </div>
                  {(pendingAdminVerificationsCount > 0 || pendingAdminPayoutsCount > 0) && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-accent-champagne/20 text-accent-champagne">
                      {pendingAdminVerificationsCount + pendingAdminPayoutsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/admin?tab=profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircleIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span>Admin Security</span>
                  </div>
                </Link>
              </div>

              <div className="border-t border-border/60 pt-2 mt-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Catalog
                </div>
                <Link
                  to="/discovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                >
                  <SparklesIcon className="w-5 h-5 text-accent shrink-0" />
                  <span>Guest Directory</span>
                </Link>
              </div>

              <div className="border-t border-border/60 pt-3">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {isAdmin && (
                <div className="pb-2">
                  <Link
                    to="/admin/verifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>Back-Office Portal</span>
                    </div>
                    <span className="text-xs font-mono">&rarr;</span>
                  </Link>
                </div>
              )}

              <Link
                to="/discovery"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
              >
                Discover Guests
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
              >
                How It Works
              </Link>
              {isAuthenticated ? (
                isAdmin ? (
                  <div className="border-t border-border/60 pt-3">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      to="/bookings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                    >
                      My Outings
                    </Link>
                    <Link
                      to="/provider"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                    >
                      Guest Dashboard
                    </Link>
                    <Link
                      to="/wallet"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <BanknotesIcon className="w-5 h-5 text-accent" />
                        <span>Cue Wallet</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-accent">
                        ₹{walletData?.availableBalance?.toLocaleString('en-IN') ?? '0'}
                      </span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                    >
                      Profile Settings
                    </Link>
                    <div className="border-t border-border/60 pt-3">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10"
                      >
                        Log Out
                      </button>
                    </div>
                  </>
                )
              ) : (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/register?redirect=/apply-companion"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                  >
                    Become a Guest
                  </Link>
                  <div className="pt-2 flex flex-col gap-2 border-t border-border/60">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl border border-border font-medium text-foreground hover:bg-muted"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent-hover"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </header>
    </>
  );
};

export default Header;
