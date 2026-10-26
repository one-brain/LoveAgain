import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { logout, setUser } from '../store/slices/authSlice';
import { useGetSeekerProfileQuery, useGetMyProfileQuery } from '../store/api';
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
  UsersIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
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
    user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local'
  );

  const { data: walletData } = useGetWalletBalanceQuery(undefined, { skip: !isAuthenticated || isAdmin });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [opsDropdownOpen, setOpsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const opsDropdownRef = useRef<HTMLDivElement>(null);

  // Sync profile data from REST API whenever authenticated
  const { data: seekerProfileData } = useGetSeekerProfileQuery(undefined, { skip: !isAuthenticated });
  const { data: myProfileData } = useGetMyProfileQuery(undefined, { skip: !isAuthenticated || isAdmin });

  // Admin telemetry for badge counters
  const { data: adminVerificationsData } = useGetAdminVerificationsQuery({}, { skip: !isAuthenticated || !isAdmin });
  const { data: adminPayoutsData } = useGetAdminPayoutsQuery(undefined, { skip: !isAuthenticated || !isAdmin });

  const pendingAdminVerificationsCount = adminVerificationsData?.filter((v) => v.status === 'PendingReview').length ?? 0;
  const pendingAdminPayoutsCount = adminPayoutsData?.filter((p) => p.status === 'Pending').length ?? 0;

  const currentAdminSection = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/admin/verifications')) return { key: 'verifications', label: 'Companion Verifications' };
    if (p.startsWith('/admin/bookings')) return { key: 'bookings', label: 'Bookings & Escrow' };
    if (p.startsWith('/admin/users')) return { key: 'users', label: 'Users Directory' };
    if (p.startsWith('/admin/payouts')) return { key: 'payouts', label: 'UPI Payouts' };
    if (p.startsWith('/admin/mis')) return { key: 'mis', label: 'MIS Analytics' };
    if (p.startsWith('/admin/profile')) return { key: 'profile', label: 'Admin Security' };
    return { key: 'verifications', label: 'Back-Office Operations' };
  }, [location.pathname]);

  const companionStatus = myProfileData?.profile?.status;

  useEffect(() => {
    if (seekerProfileData?.profile?.firstName) {
      const p = seekerProfileData.profile;
      if (
        p.firstName !== user?.firstName ||
        p.lastName !== user?.lastName ||
        p.isVerified !== user?.isVerified ||
        p.photoUrl !== user?.photoUrl
      ) {
        dispatch(
          setUser({
            id: p.userId || user?.id || '',
            email: p.email || user?.email || '',
            firstName: p.firstName,
            lastName: p.lastName || '',
            photoUrl: p.photoUrl || null,
            isVerified: p.isVerified ?? true,
            trustScore: p.trustScore ?? 99,
            roles: user?.roles || (isAdmin ? ['Admin'] : ['Seeker', 'Provider']),
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

  const [theme, setTheme] = useState<'light' | 'dark' | 'romantic'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark' || saved === 'romantic') {
      return saved as 'light' | 'dark' | 'romantic';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'romantic');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'romantic') {
      document.documentElement.classList.add('romantic');
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
      if (opsDropdownRef.current && !opsDropdownRef.current.contains(event.target as Node)) {
        setOpsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setThemeDropdownOpen(false);
        setMobileMenuOpen(false);
        setOpsDropdownOpen(false);
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
    setOpsDropdownOpen(false);
  }, [location.pathname, location.search]);

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'romantic')[] = ['light', 'dark', 'romantic'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-3 group">
              <div className={`w-10 h-10 rounded-xl ${isAdmin ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-amber-500/20' : 'bg-gradient-to-br from-accent via-accent-hover to-accent/90'} flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                {isAdmin ? <ShieldCheckIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors font-serif flex items-center gap-1.5">
                  Cue {isAdmin && <span className="text-[11px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">Admin</span>}
                </span>
                <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground -mt-1 hidden sm:inline">
                  {isAdmin ? 'Back-Office Portal' : 'Companion Experiences'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAdmin ? (
            <nav className="hidden md:flex items-center gap-2">
              {/* Operations Dropdown Switcher */}
              <div className="relative" ref={opsDropdownRef}>
                <button
                  type="button"
                  onClick={() => setOpsDropdownOpen(!opsDropdownOpen)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-500 shadow-xs'
                      : 'border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                  }`}
                  aria-expanded={opsDropdownOpen}
                  aria-haspopup="true"
                >
                  <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                  <span>{currentAdminSection.label}</span>
                  {(pendingAdminVerificationsCount > 0 || pendingAdminPayoutsCount > 0) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                      opsDropdownOpen ? 'rotate-180 text-amber-500' : ''
                    }`}
                  />
                </button>

                {opsDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-popover/95 text-popover-foreground border border-border/90 shadow-2xl backdrop-blur-md p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                      Switch Operation Workspace
                    </div>
                    <div className="space-y-0.5 mt-0.5">
                      <Link
                        to="/admin/verifications"
                        onClick={() => setOpsDropdownOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                          location.pathname.startsWith('/admin/verifications') || location.pathname === '/admin'
                            ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                            : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                            <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <span className="truncate">Companion Verifications</span>
                        </div>
                        {pendingAdminVerificationsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 tabular-nums">
                            {pendingAdminVerificationsCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/admin/bookings"
                        onClick={() => setOpsDropdownOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                          location.pathname.startsWith('/admin/bookings')
                            ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                            : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                            <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <span className="truncate">Bookings & Escrow</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/users"
                        onClick={() => setOpsDropdownOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                          location.pathname.startsWith('/admin/users')
                            ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                            : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                            <UsersIcon className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <span className="truncate">Users Directory</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/payouts"
                        onClick={() => setOpsDropdownOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                          location.pathname.startsWith('/admin/payouts')
                            ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                            : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                            <CurrencyRupeeIcon className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <span className="truncate">UPI Payout Settlements</span>
                        </div>
                        {pendingAdminPayoutsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 tabular-nums">
                            {pendingAdminPayoutsCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/admin/mis"
                        onClick={() => setOpsDropdownOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                          location.pathname.startsWith('/admin/mis')
                            ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                            : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                            <ChartBarIcon className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                          <span className="truncate">MIS Trajectory & Analytics</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/profile"
                        onClick={() => setOpsDropdownOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                          location.pathname.startsWith('/admin/profile')
                            ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                            : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                            <UserCircleIcon className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <span className="truncate">Admin Identity & Security</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/discovery"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive('/discovery')
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                Browse Profiles
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/discovery"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/discovery')
                    ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                }`}
              >
                Discover Companions
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
          )}

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
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
                    <span className="text-foreground">Warm</span>
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
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold flex items-center justify-center text-xs tracking-wider shrink-0 font-sans">
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
                          <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-amber-500/15">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <ShieldCheckIcon className="w-3 h-3 text-amber-500" />
                              Super Admin
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              • Back-Office Operations Hub
                            </span>
                          </div>
                        </div>

                        {/* Back-Office Operations Group */}
                        <div>
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                            Back-Office Operations
                          </div>
                          <div className="space-y-0.5 mt-0.5">
                            <Link
                              to="/admin/verifications"
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                                location.pathname.startsWith('/admin/verifications') || location.pathname === '/admin'
                                  ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                                  : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                                  <ShieldCheckIcon className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="truncate">
                                  <p className="truncate leading-tight">Companion Verifications</p>
                                  <p className="text-[10px] text-muted-foreground font-normal truncate">
                                    KYC review & credential approval
                                  </p>
                                </div>
                              </div>
                              {pendingAdminVerificationsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 tabular-nums">
                                  {pendingAdminVerificationsCount}
                                </span>
                              )}
                            </Link>

                            <Link
                              to="/admin/bookings"
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                                location.pathname.startsWith('/admin/bookings')
                                  ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                                  : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                                  <BanknotesIcon className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="truncate">
                                  <p className="truncate leading-tight">Bookings & Escrow Ledger</p>
                                  <p className="text-[10px] text-muted-foreground font-normal truncate">
                                    Escrow vault release & audit trail
                                  </p>
                                </div>
                              </div>
                            </Link>

                            <Link
                              to="/admin/users"
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                                location.pathname.startsWith('/admin/users')
                                  ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                                  : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                                  <UsersIcon className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="truncate">
                                  <p className="truncate leading-tight">Users Directory</p>
                                  <p className="text-[10px] text-muted-foreground font-normal truncate">
                                    Trust scoring & account moderation
                                  </p>
                                </div>
                              </div>
                            </Link>

                            <Link
                              to="/admin/payouts"
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                                location.pathname.startsWith('/admin/payouts')
                                  ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                                  : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                                  <CurrencyRupeeIcon className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="truncate">
                                  <p className="truncate leading-tight">UPI Payout Settlements</p>
                                  <p className="text-[10px] text-muted-foreground font-normal truncate">
                                    Companion banking disbursements
                                  </p>
                                </div>
                              </div>
                              {pendingAdminPayoutsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 tabular-nums">
                                  {pendingAdminPayoutsCount}
                                </span>
                              )}
                            </Link>

                            <Link
                              to="/admin/mis"
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                                location.pathname.startsWith('/admin/mis')
                                  ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                                  : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                                  <ChartBarIcon className="w-4 h-4 text-purple-500" />
                                </div>
                                <div className="truncate">
                                  <p className="truncate leading-tight">MIS Trajectory & Analytics</p>
                                  <p className="text-[10px] text-muted-foreground font-normal truncate">
                                    GMV & platform revenue telemetry
                                  </p>
                                </div>
                              </div>
                            </Link>

                            <Link
                              to="/admin/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors group ${
                                location.pathname.startsWith('/admin/profile')
                                  ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                                  : 'text-foreground/90 hover:bg-muted hover:text-foreground font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                                  <UserCircleIcon className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="truncate">
                                  <p className="truncate leading-tight">Admin Identity & Security</p>
                                  <p className="text-[10px] text-muted-foreground font-normal truncate">
                                    Credentials, password & session
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </div>

                        {/* Marketplace Observation Section */}
                        <div className="border-t border-border/60 pt-1.5 mt-2">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                            Marketplace Auditing
                          </div>
                          <Link
                            to="/discovery"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium group"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted/80 group-hover:bg-accent/20 group-hover:text-accent transition-colors shrink-0">
                              <SparklesIcon className="w-4 h-4 text-accent" />
                            </div>
                            <div className="truncate">
                              <p className="truncate leading-tight">Browse Public Profiles</p>
                              <p className="text-[10px] text-muted-foreground font-normal truncate">
                                Audit public companion directory
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
                            <span>{companionStatus === 'Approved' ? 'Companion Hub' : companionStatus === 'PendingReview' ? 'Application Status ⏳' : 'Become a Companion'}</span>
                          </Link>
                          <Link
                            to="/bookings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-foreground/90 hover:bg-muted hover:text-foreground transition-colors font-medium"
                          >
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span>My Bookings</span>
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
          {isAdmin ? (
            <>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Back-Office Operations
              </div>
              <div className="space-y-1">
                <Link
                  to="/admin/verifications"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/verifications') || location.pathname === '/admin'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheckIcon className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>Companion Verifications</span>
                  </div>
                  {pendingAdminVerificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {pendingAdminVerificationsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/admin/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/bookings')
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BanknotesIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Bookings & Escrow Ledger</span>
                  </div>
                </Link>

                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/users')
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UsersIcon className="w-5 h-5 text-blue-500 shrink-0" />
                    <span>Users Directory</span>
                  </div>
                </Link>

                <Link
                  to="/admin/payouts"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/payouts')
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CurrencyRupeeIcon className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>UPI Payout Settlements</span>
                  </div>
                  {pendingAdminPayoutsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {pendingAdminPayoutsCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/admin/mis"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/mis')
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ChartBarIcon className="w-5 h-5 text-purple-500 shrink-0" />
                    <span>MIS Trajectory & Analytics</span>
                  </div>
                </Link>

                <Link
                  to="/admin/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    location.pathname.startsWith('/admin/profile')
                      ? 'bg-accent/15 text-accent font-bold'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>Admin Identity & Security</span>
                  </div>
                </Link>
              </div>

              <div className="border-t border-border/60 pt-2 mt-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Marketplace Auditing
                </div>
                <Link
                  to="/discovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted"
                >
                  <SparklesIcon className="w-5 h-5 text-accent shrink-0" />
                  <span>Browse Public Profiles</span>
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
              <Link
                to="/discovery"
                className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
              >
                Discover Companions
              </Link>
              <Link
                to="/how-it-works"
                className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
              >
                How It Works
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/bookings"
                    className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/provider"
                    className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
                  >
                    Companion Hub
                  </Link>
                  <Link
                    to="/wallet"
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
              ) : (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/wallet"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-border/80 bg-muted/40 text-foreground font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <BanknotesIcon className="w-5 h-5 text-accent" />
                      <span>Cue Wallet</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-accent/15 text-accent">
                      Escrow Vault
                    </span>
                  </Link>
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl border border-border font-medium text-foreground"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
