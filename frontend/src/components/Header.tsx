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
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid';
import { useGetWalletBalanceQuery } from '../store/paymentApi';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: walletData } = useGetWalletBalanceQuery(undefined, { skip: !isAuthenticated });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // Sync profile data from REST API whenever authenticated
  const { data: seekerProfileData } = useGetSeekerProfileQuery(undefined, { skip: !isAuthenticated });
  const { data: myProfileData } = useGetMyProfileQuery(undefined, { skip: !isAuthenticated });

  const companionStatus = myProfileData?.profile?.status;
  const isAdmin = user?.roles?.includes('Admin') || user?.email?.toLowerCase().includes('admin');

  useEffect(() => {
    if (seekerProfileData?.profile?.firstName) {
      const p = seekerProfileData.profile;
      if (p.firstName !== user?.firstName || p.lastName !== user?.lastName || p.isVerified !== user?.isVerified) {
        dispatch(
          setUser({
            id: p.userId || user?.id || '',
            email: p.email || user?.email || '',
            firstName: p.firstName,
            lastName: p.lastName || '',
            isVerified: p.isVerified ?? true,
            trustScore: p.trustScore ?? 99,
            roles: user?.roles || ['Seeker', 'Provider'],
          })
        );
      }
    }
  }, [seekerProfileData, user, dispatch]);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setThemeDropdownOpen(false);
  }, [location.pathname]);

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
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent via-accent-hover to-accent/90 flex items-center justify-center text-white font-bold text-xl shadow-sm group-hover:scale-105 transition-transform duration-200">
                <SparklesIcon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-accent transition-colors font-serif">
                  Cue
                </span>
                <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground -mt-1 hidden sm:inline">
                  Companion Experiences
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
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
          </nav>

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
                    <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent font-bold flex items-center justify-center text-xs tracking-wider border border-accent/30 font-sans">
                      {userInitials}
                    </div>
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
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-popover/95 text-popover-foreground border border-border/90 shadow-2xl backdrop-blur-md p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                    <div className="p-3 bg-muted/50 rounded-xl mb-1.5 border border-border/40">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-foreground truncate">
                          {userDisplayName}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-success/20 text-success uppercase tracking-wider flex-shrink-0">
                          {user?.isVerified !== false ? 'Verified' : 'Member'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
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
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors font-bold"
                        >
                          <ShieldCheckIcon className="w-4 h-4 text-rose-500" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
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
          <Link
            to="/discovery"
            className="block px-3 py-2.5 rounded-xl text-base font-medium text-foreground hover:bg-muted"
          >
            Discover Companions
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
                Provider Hub
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
        </div>
      )}
    </header>
  );
};

export default Header;
