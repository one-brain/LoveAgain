import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  CounterBadge,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Menu,
  MenuDivider,
  MenuItem,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  OverlayDrawer,
} from '@fluentui/react-components';
import {
  WeatherSunny20Regular,
  WeatherMoon20Regular,
  Desktop20Regular,
  Navigation20Regular,
  Dismiss20Regular,
  PersonCircle20Regular,
  Calendar20Regular,
  Sparkle20Regular,
  SignOut20Regular,
  Wallet20Regular,
  ShieldCheckmark20Regular,
  ChevronDown16Regular,
  Warning16Regular,
} from '@fluentui/react-icons';
import type { RootState } from '../store';
import { setUser } from '../store/slices/authSlice';
import { performFullLogout } from '../utils/sessionManager';
import { useGetSeekerProfileQuery, useGetMyProfileQuery } from '../store/api';
import { useResendVerificationMutation } from '../store/authApi';
import { useGetWalletBalanceQuery } from '../store/paymentApi';
import {
  useGetAdminVerificationsQuery,
  useGetAdminPayoutsQuery,
} from '../store/adminApi';
import { useTheme, type ThemePreference } from '../theme/ThemeProvider';

const Header: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { preference, scheme, setPreference } = useTheme();

  const isAdmin = Boolean(
    isAuthenticated && (user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local')
  );
  const isInAdminPortal = Boolean(isAdmin && location.pathname.startsWith('/admin'));

  const { data: walletData } = useGetWalletBalanceQuery(undefined, { skip: !isAuthenticated || isAdmin });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync profile data from REST API whenever authenticated
  const { data: seekerProfileData } = useGetSeekerProfileQuery(undefined, { skip: !isAuthenticated });
  const { data: myProfileData } = useGetMyProfileQuery(undefined, { skip: !isAuthenticated || isAdmin });

  // Admin telemetry for badge counters
  const { data: adminVerificationsData } = useGetAdminVerificationsQuery(
    { status: 'PendingReview', pageSize: 1 },
    { skip: !isAuthenticated || !isAdmin }
  );
  const { data: adminPayoutsData } = useGetAdminPayoutsQuery(
    { pageSize: 1 },
    { skip: !isAuthenticated || !isAdmin }
  );

  const pendingAdminVerificationsCount = adminVerificationsData?.totalCount ?? 0;
  const pendingAdminPayoutsCount = adminPayoutsData?.totalCount ?? 0;
  const totalAdminPending = pendingAdminVerificationsCount + pendingAdminPayoutsCount;

  const companionStatus = myProfileData?.profile?.status;

  useEffect(() => {
    if (seekerProfileData?.profile?.firstName && user?.id) {
      const p = seekerProfileData.profile;
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

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
    setMobileMenuOpen(false);
    await performFullLogout(dispatch, navigate);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-md text-body1 transition-colors flex items-center gap-1.5 ${
      active
        ? 'bg-accent-light text-brand-fg font-semibold'
        : 'text-foreground hover:bg-muted font-normal'
    }`;

  const themeLabel =
    preference === 'light' ? 'Light' : preference === 'dark' ? 'Dark' : 'System';

  const ThemeIcon =
    preference === 'system'
      ? Desktop20Regular
      : scheme === 'dark'
      ? WeatherMoon20Regular
      : WeatherSunny20Regular;

  return (
    <>
      {isAuthenticated && !isAdmin && user?.isVerified === false && !user?.email?.endsWith('@cue.local') && (
        <div className="bg-warning-light border-b border-border px-4 py-2 text-caption1 text-warning">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <Warning16Regular className="shrink-0" />
              <span>Your email is not verified yet. Confirm your email address to unlock full escrow booking features.</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              {resendStatus ? (
                <span className="font-semibold text-success">
                  {resendStatus}
                </span>
              ) : (
                <Button
                  size="small"
                  appearance="secondary"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? 'Sending...' : 'Resend link'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-card acrylic border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5">
              <Link to={isInAdminPortal ? '/admin' : '/'} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-semibold">
                  {isInAdminPortal ? (
                    <ShieldCheckmark20Regular />
                  ) : (
                    <Sparkle20Regular />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-subtitle1 font-semibold text-foreground">
                    Cue
                  </span>
                  {isInAdminPortal && (
                    <Badge appearance="tint" color="brand" size="small">
                      Command
                    </Badge>
                  )}
                  <span className="text-caption1 text-muted-foreground hidden sm:inline">
                    {isInAdminPortal ? 'Back-office operations' : 'Curated outings'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isInAdminPortal ? (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  to="/admin"
                  className={navLinkClass(location.pathname === '/admin')}
                >
                  <ShieldCheckmark20Regular className="text-trust" />
                  <span>Dashboard Overview</span>
                  {totalAdminPending > 0 && (
                    <CounterBadge
                      count={totalAdminPending}
                      size="small"
                      color="important"
                      className="tabular"
                    />
                  )}
                </Link>

                <Link
                  to="/discovery"
                  className={navLinkClass(isActive('/discovery'))}
                >
                  <Sparkle20Regular className="text-brand-fg" />
                  <span>Guest Directory</span>
                </Link>
              </nav>
            ) : isAuthenticated && !isAdmin ? (
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/discovery" className={navLinkClass(isActive('/discovery'))}>
                  Explore
                </Link>
                <Link to="/bookings" className={navLinkClass(isActive('/bookings'))}>
                  My Outings
                </Link>
                <Link to="/how-it-works" className={navLinkClass(isActive('/how-it-works'))}>
                  How It Works
                </Link>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/discovery" className={navLinkClass(isActive('/discovery'))}>
                  Explore
                </Link>
                <Link to="/how-it-works" className={navLinkClass(isActive('/how-it-works'))}>
                  How It Works
                </Link>
                {!isAdmin && (
                  <Link
                    to={isAuthenticated ? '/apply-companion' : '/register?redirect=/apply-companion'}
                    className={navLinkClass(
                      isActive('/apply-companion') ||
                        (location.pathname === '/register' && location.search.includes('apply-companion'))
                    )}
                  >
                    Become a Host
                  </Link>
                )}
              </nav>
            )}

            {/* Right Action Area (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {isAdmin && !isInAdminPortal && (
                <Link
                  to="/admin/verifications"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-trust-light border border-trust-border text-caption1 font-semibold text-trust"
                  title="Return to Back-Office Operations Portal"
                >
                  <ShieldCheckmark20Regular className="text-trust shrink-0" />
                  <span>Admin &rarr;</span>
                </Link>
              )}

              {isAuthenticated && !isAdmin && (
                <Link
                  to="/wallet"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-md bg-accent-light border border-border text-caption1 font-semibold text-brand-fg hover:bg-muted"
                  title="View Cue Escrow Wallet & Vault"
                >
                  <Wallet20Regular className="text-brand-fg shrink-0" />
                  <span className="font-mono tabular">
                    ₹{walletData?.availableBalance?.toLocaleString('en-IN') ?? '0'}
                  </span>
                </Link>
              )}

              {/* Fluent Theme Menu (Light / Dark / System) */}
              <Menu
                checkedValues={{ theme: [preference] }}
                onCheckedValueChange={(_, data) => {
                  const next = data.checkedItems[0] as ThemePreference | undefined;
                  if (next) setPreference(next);
                }}
              >
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    appearance="secondary"
                    size="medium"
                    icon={<ThemeIcon />}
                    iconPosition="before"
                    title="Switch theme"
                    aria-label="Switch theme"
                  >
                    <span className="flex items-center gap-1">
                      <span>{themeLabel}</span>
                      <ChevronDown16Regular className="text-muted-foreground" />
                    </span>
                  </Button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList aria-label="Theme preference">
                    <MenuItemRadio
                      name="theme"
                      value="light"
                      icon={<WeatherSunny20Regular />}
                    >
                      Light
                    </MenuItemRadio>
                    <MenuItemRadio
                      name="theme"
                      value="dark"
                      icon={<WeatherMoon20Regular />}
                    >
                      Dark
                    </MenuItemRadio>
                    <MenuItemRadio
                      name="theme"
                      value="system"
                      icon={<Desktop20Regular />}
                    >
                      System
                    </MenuItemRadio>
                  </MenuList>
                </MenuPopover>
              </Menu>

              {isAuthenticated ? (
                /* Fluent User Menu with Avatar */
                <Menu positioning="below-end">
                  <MenuTrigger disableButtonEnhancement>
                    <Button
                      appearance="secondary"
                      size="medium"
                      aria-label="User account menu"
                      className="!px-2.5"
                    >
                      <span className="flex items-center gap-2">
                        <span className="max-w-[140px] truncate text-body1 font-semibold text-foreground">
                          {userDisplayName}
                        </span>
                        <Avatar
                          name={userDisplayName}
                          initials={userInitials}
                          size={24}
                          color="brand"
                          image={user?.photoUrl ? { src: user.photoUrl } : undefined}
                          badge={{ status: 'available' }}
                        />
                        <ChevronDown16Regular className="text-muted-foreground" />
                      </span>
                    </Button>
                  </MenuTrigger>
                  <MenuPopover className="min-w-[240px]">
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-body1 font-semibold text-foreground truncate">
                          {userDisplayName}
                        </p>
                        <Badge
                          appearance="tint"
                          color={isAdmin ? 'important' : 'success'}
                          size="small"
                        >
                          {isAdmin ? 'Admin' : user?.isVerified !== false ? 'Verified' : 'Member'}
                        </Badge>
                      </div>
                      {user?.email && (
                        <p className="text-caption1 text-muted-foreground truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <MenuList>
                      {isAdmin ? (
                        <>
                          <MenuItem
                            icon={<ShieldCheckmark20Regular />}
                            onClick={() => navigate('/admin')}
                          >
                            <div className="flex items-center justify-between gap-2 w-full">
                              <span>Command Dashboard</span>
                              {totalAdminPending > 0 && (
                                <CounterBadge
                                  count={totalAdminPending}
                                  size="small"
                                  color="important"
                                  className="tabular"
                                />
                              )}
                            </div>
                          </MenuItem>
                          <MenuItem
                            icon={<PersonCircle20Regular />}
                            onClick={() => navigate('/admin?tab=profile')}
                          >
                            Admin Credentials & Security
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem
                            icon={<Sparkle20Regular />}
                            onClick={() => navigate('/discovery')}
                          >
                            Guest Catalog Preview
                          </MenuItem>
                        </>
                      ) : (
                        <>
                          <MenuItem
                            icon={<PersonCircle20Regular />}
                            onClick={() => navigate('/profile')}
                          >
                            My Account
                          </MenuItem>
                          <MenuItem
                            icon={<Sparkle20Regular />}
                            onClick={() =>
                              navigate(companionStatus === 'Approved' ? '/provider' : '/apply-companion')
                            }
                          >
                            {companionStatus === 'Approved'
                              ? 'Guest Dashboard'
                              : companionStatus === 'PendingReview'
                              ? 'Guest Status'
                              : 'Become a Guest'}
                          </MenuItem>
                          <MenuItem
                            icon={<Calendar20Regular />}
                            onClick={() => navigate('/bookings')}
                          >
                            My Outings
                          </MenuItem>
                          <MenuItem
                            icon={<Wallet20Regular />}
                            onClick={() => navigate('/wallet')}
                          >
                            <div className="flex items-center justify-between gap-4 w-full">
                              <span>Cue Wallet</span>
                              <span className="font-mono tabular font-semibold text-brand-fg">
                                ₹{walletData?.availableBalance?.toLocaleString('en-IN') ?? '0'}
                              </span>
                            </div>
                          </MenuItem>
                        </>
                      )}
                      <MenuDivider />
                      <MenuItem
                        icon={<SignOut20Regular className="text-destructive" />}
                        onClick={handleLogout}
                      >
                        <span className="text-destructive font-semibold">Log Out</span>
                      </MenuItem>
                    </MenuList>
                  </MenuPopover>
                </Menu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    appearance="subtle"
                    size="medium"
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </Button>
                  <Button
                    appearance="primary"
                    size="medium"
                    onClick={() => navigate('/register')}
                  >
                    Join Cue
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Right Bar (Theme menu + Hamburger) */}
            <div className="flex md:hidden items-center gap-1.5">
              <Menu
                checkedValues={{ theme: [preference] }}
                onCheckedValueChange={(_, data) => {
                  const next = data.checkedItems[0] as ThemePreference | undefined;
                  if (next) setPreference(next);
                }}
              >
                <MenuTrigger disableButtonEnhancement>
                  <Button
                    appearance="subtle"
                    size="medium"
                    icon={<ThemeIcon />}
                    aria-label="Switch theme"
                    className="min-h-11 min-w-11"
                  />
                </MenuTrigger>
                <MenuPopover>
                  <MenuList aria-label="Theme preference">
                    <MenuItemRadio name="theme" value="light" icon={<WeatherSunny20Regular />}>
                      Light
                    </MenuItemRadio>
                    <MenuItemRadio name="theme" value="dark" icon={<WeatherMoon20Regular />}>
                      Dark
                    </MenuItemRadio>
                    <MenuItemRadio name="theme" value="system" icon={<Desktop20Regular />}>
                      System
                    </MenuItemRadio>
                  </MenuList>
                </MenuPopover>
              </Menu>

              <Button
                appearance="subtle"
                size="medium"
                icon={mobileMenuOpen ? <Dismiss20Regular /> : <Navigation20Regular />}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open mobile menu"
                className="min-h-11 min-w-11"
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation OverlayDrawer */}
        <OverlayDrawer
          position="end"
          open={mobileMenuOpen}
          onOpenChange={(_, { open }) => setMobileMenuOpen(open)}
        >
          <DrawerHeader>
            <DrawerHeaderTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close menu"
                  icon={<Dismiss20Regular />}
                  onClick={() => setMobileMenuOpen(false)}
                />
              }
            >
              <span className="text-subtitle2 font-semibold text-foreground">Cue</span>
            </DrawerHeaderTitle>
          </DrawerHeader>

          <DrawerBody className="flex flex-col gap-2 pt-2 pb-6">
            {isInAdminPortal ? (
              <>
                <div className="px-3 py-1 text-caption1 font-semibold text-muted-foreground">
                  Admin command
                </div>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-11 flex items-center justify-between px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheckmark20Regular className="text-trust shrink-0" />
                    <span>Command Dashboard</span>
                  </div>
                  {totalAdminPending > 0 && (
                    <CounterBadge
                      count={totalAdminPending}
                      size="small"
                      color="important"
                      className="tabular"
                    />
                  )}
                </Link>

                <Link
                  to="/admin?tab=profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-11 flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body1 text-foreground hover:bg-muted"
                >
                  <PersonCircle20Regular className="text-muted-foreground shrink-0" />
                  <span>Admin Security</span>
                </Link>

                <div className="border-t border-border pt-2 mt-2">
                  <div className="px-3 py-1 text-caption1 font-semibold text-muted-foreground">
                    Catalog
                  </div>
                  <Link
                    to="/discovery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-11 flex items-center gap-2.5 px-3 py-2.5 rounded-md text-body1 text-foreground hover:bg-muted"
                  >
                    <Sparkle20Regular className="text-brand-fg shrink-0" />
                    <span>Guest Directory</span>
                  </Link>
                </div>

                <div className="border-t border-border pt-3 mt-auto">
                  <Button
                    appearance="subtle"
                    size="large"
                    icon={<SignOut20Regular />}
                    onClick={handleLogout}
                    className="w-full min-h-11 !justify-start !text-destructive"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                {isAdmin && (
                  <div className="pb-2">
                    <Link
                      to="/admin/verifications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-11 flex items-center justify-between px-3 py-2.5 rounded-md text-body1 font-semibold bg-trust-light text-trust border border-trust-border"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheckmark20Regular className="text-trust shrink-0" />
                        <span>Admin</span>
                      </div>
                      <span className="font-mono">&rarr;</span>
                    </Link>
                  </div>
                )}

                <Link
                  to="/discovery"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-11 flex items-center px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                >
                  Explore
                </Link>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-11 flex items-center px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                >
                  How It Works
                </Link>

                {isAuthenticated ? (
                  isAdmin ? (
                    <div className="border-t border-border pt-3 mt-auto">
                      <Button
                        appearance="subtle"
                        size="large"
                        icon={<SignOut20Regular />}
                        onClick={handleLogout}
                        className="w-full min-h-11 !justify-start !text-destructive"
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-h-11 flex items-center px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                      >
                        My Outings
                      </Link>
                      <Link
                        to="/provider"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-h-11 flex items-center px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                      >
                        Guest Dashboard
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-h-11 flex items-center justify-between px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet20Regular className="text-brand-fg" />
                          <span>Cue Wallet</span>
                        </div>
                        <span className="font-mono tabular text-body1 font-semibold text-brand-fg">
                          ₹{walletData?.availableBalance?.toLocaleString('en-IN') ?? '0'}
                        </span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="min-h-11 flex items-center px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                      >
                        Profile Settings
                      </Link>
                      <div className="border-t border-border pt-3 mt-auto">
                        <Button
                          appearance="subtle"
                          size="large"
                          icon={<SignOut20Regular />}
                          onClick={handleLogout}
                          className="w-full min-h-11 !justify-start !text-destructive"
                        >
                          Log Out
                        </Button>
                      </div>
                    </>
                  )
                ) : (
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      to="/register?redirect=/apply-companion"
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-11 flex items-center px-3 py-2.5 rounded-md text-body1 font-semibold text-foreground hover:bg-muted"
                    >
                      Become a Host
                    </Link>
                    <div className="pt-3 flex flex-col gap-2 border-t border-border">
                      <Button
                        appearance="secondary"
                        size="large"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/login');
                        }}
                        className="w-full min-h-11"
                      >
                        Sign in
                      </Button>
                      <Button
                        appearance="primary"
                        size="large"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/register');
                        }}
                        className="w-full min-h-11"
                      >
                        Join Cue
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DrawerBody>
        </OverlayDrawer>
      </header>
    </>
  );
};

export default Header;
