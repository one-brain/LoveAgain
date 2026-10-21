import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
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
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
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

            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/bookings')
                      ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  My Bookings
                </Link>
                <Link
                  to="/provider"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/provider')
                      ? 'bg-accent/15 text-accent font-semibold shadow-xs'
                      : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  Provider Hub
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Switcher Button */}
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-xl border border-border/80 bg-card hover:bg-muted/80 text-foreground/80 hover:text-foreground transition-all duration-200 flex items-center gap-2 text-xs font-medium shadow-xs"
              title={`Switch Theme (Current: ${theme})`}
              aria-label="Switch Theme"
            >
              {theme === 'light' && (
                <>
                  <SunIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-foreground font-semibold text-xs">Warm</span>
                </>
              )}
              {theme === 'dark' && (
                <>
                  <MoonIcon className="w-4 h-4 text-sky-400" />
                  <span className="text-foreground font-semibold text-xs">Midnight</span>
                </>
              )}
              {theme === 'romantic' && (
                <>
                  <HeartIcon className="w-4 h-4 text-rose-500" />
                  <span className="text-foreground font-semibold text-xs">Velvet</span>
                </>
              )}
            </button>

            {isAuthenticated ? (
              /* User Menu Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 pr-2 rounded-xl border border-border/80 bg-card hover:bg-muted/80 transition-all text-sm font-medium shadow-xs"
                >
                  <span className="max-w-[130px] truncate text-foreground font-medium">
                    {user?.firstName ? `${user.firstName}` : 'My Account'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-accent/20 text-accent font-semibold flex items-center justify-center text-sm border border-accent/30">
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-border/60">
                      <p className="text-sm font-semibold text-foreground">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                      >
                        <UserCircleIcon className="w-4 h-4 text-muted-foreground" />
                        Seeker Profile
                      </Link>
                      <Link
                        to="/provider-profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                      >
                        <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                        Provider Profile
                      </Link>
                      <Link
                        to="/bookings"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/70 transition-colors"
                      >
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        My Bookings
                      </Link>
                    </div>

                    <div className="border-t border-border/60 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Log Out
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
