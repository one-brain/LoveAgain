import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheckmark16Regular, Sparkle16Regular, Heart16Regular } from '@fluentui/react-icons';
import type { RootState } from '../store';
import { openCookiePreferences } from './CookieConsentBanner';

const Footer: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');

  return (
    <footer className="bg-card border-t border-border text-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand info */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-accent-foreground font-semibold">
                <Sparkle16Regular />
              </div>
              <span className="text-subtitle1 font-semibold text-foreground">
                Cue
              </span>
            </Link>
            <p className="text-body1 text-muted-foreground leading-relaxed">
              Meaningful shared experiences. Host verified guests for coffee, dining, shopping, arts, and city activities with mutual escrow trust.
            </p>
            <div className="flex items-center gap-1.5 text-caption1 text-muted-foreground pt-1">
              <ShieldCheckmark16Regular className="text-success shrink-0" />
              <span>Identity verified & safe escrow</span>
            </div>
          </div>

          {/* Experience Categories */}
          <div>
            <h4 className="text-body1 font-semibold text-foreground mb-3">
              Experiences
            </h4>
            <ul className="space-y-2 text-body1">
              <li>
                <Link to="/discovery?q=Domestic+%26+Lifestyle" className="text-brand-fg hover:underline font-semibold">
                  Indian Domestic & Lifestyle
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Regional+Homestyle+Cook" className="text-muted-foreground hover:text-foreground">
                  Homestyle Cooking (Ghar Ka Khana)
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Festival+%26+Pooja+Decor" className="text-muted-foreground hover:text-foreground">
                  Festival & Pooja Decor
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Senior+Companion+%26+Temple+Escort" className="text-muted-foreground hover:text-foreground">
                  Senior Companion (Buzurg Saath)
                </Link>
              </li>
              <li>
                <Link to="/discovery?q=Coffee" className="text-muted-foreground hover:text-foreground">
                  Coffee Dates & Cafes
                </Link>
              </li>
              <li>
                <Link to="/discovery?q=Restaurant" className="text-muted-foreground hover:text-foreground">
                  Restaurant Visits & Dining
                </Link>
              </li>
              <li>
                <Link to="/discovery?q=Shopping" className="text-muted-foreground hover:text-foreground">
                  Shopping & Styling Companion
                </Link>
              </li>
              <li>
                <Link to="/discovery?q=Movies" className="text-muted-foreground hover:text-foreground">
                  Movies & Cinema Outings
                </Link>
              </li>
              <li>
                <Link to="/discovery?q=Weekend" className="text-muted-foreground hover:text-foreground">
                  Weekend Activities & Day Trips
                </Link>
              </li>
              <li>
                <Link to="/discovery?q=Special+Events" className="text-muted-foreground hover:text-foreground">
                  Special Events & Plus-One
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Tennis" className="text-muted-foreground hover:text-foreground">
                  Sports & Fitness
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Cooking" className="text-muted-foreground hover:text-foreground">
                  Homestyle Cooking
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety Column */}
          <div>
            <h4 className="text-body1 font-semibold text-foreground mb-3">
              Trust & safety
            </h4>
            <ul className="space-y-2 text-body1">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
                  Identity Verification
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
                  100% Escrow Protection
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-muted-foreground hover:text-foreground">
                  Trust Score System
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-muted-foreground hover:text-foreground font-semibold">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link to="/terms#platonic-mandate" className="text-muted-foreground hover:text-foreground">
                  Strictly Platonic Charter
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-foreground">
                  24/7 Dispute Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies Column */}
          <div>
            <h4 className="text-body1 font-semibold text-foreground mb-3">
              Legal & policies
            </h4>
            <ul className="space-y-2 text-body1">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground font-semibold">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground font-semibold">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-muted-foreground hover:text-foreground font-semibold">
                  Cancellation & Refunds
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-muted-foreground hover:text-foreground">
                  Safety Standards
                </Link>
              </li>
              <li>
                <Link to="/support#grievance" className="text-muted-foreground hover:text-foreground">
                  Grievance Redressal
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="text-muted-foreground hover:text-foreground text-left cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Role-Differentiated Quick Links */}
          <div>
            <h4 className="text-body1 font-semibold text-foreground mb-3">
              {isAdmin ? 'Admin portals' : 'Platform'}
            </h4>
            <ul className="space-y-2 text-body1">
              {isAdmin ? (
                <>
                  <li>
                    <Link to="/admin/verifications" className="text-muted-foreground hover:text-foreground font-semibold">
                      Guest Approvals
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/bookings" className="text-muted-foreground hover:text-foreground">
                      Platform Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/users" className="text-muted-foreground hover:text-foreground">
                      User Directory
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/payouts" className="text-muted-foreground hover:text-foreground">
                      Earnings Withdrawals
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/mis" className="text-muted-foreground hover:text-foreground">
                      Platform Performance
                    </Link>
                  </li>
                </>
              ) : isAuthenticated ? (
                <>
                  <li>
                    <Link to="/discovery" className="text-muted-foreground hover:text-foreground font-semibold">
                      Discover Guests
                    </Link>
                  </li>
                  <li>
                    <Link to="/bookings" className="text-muted-foreground hover:text-foreground">
                      My Outings
                    </Link>
                  </li>
                  <li>
                    <Link to="/wallet" className="text-muted-foreground hover:text-foreground">
                      Wallet & Payments
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-muted-foreground hover:text-foreground">
                      Account Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-muted-foreground hover:text-foreground">
                      Support Desk
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/discovery" className="text-muted-foreground hover:text-foreground font-semibold">
                      Discover Guests
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/register?redirect=/apply-companion" className="text-muted-foreground hover:text-foreground">
                      Become a Guest
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-muted-foreground hover:text-foreground">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-muted-foreground hover:text-foreground">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-muted-foreground hover:text-foreground">
                      Support Desk
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar with Copyright, Quick Legal Links & Branding */}
        <div className="pt-6 border-t border-border flex flex-col lg:flex-row items-center justify-between gap-4 text-caption1 text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Cue Platform. Designed for meaningful, safe human connections.
          </p>

          {/* Quick Legal Horizontal Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-caption1 text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/cancellation-policy" className="hover:text-foreground">
              Cancellation & Refunds
            </Link>
            <span>•</span>
            <Link to="/community-guidelines" className="hover:text-foreground">
              Community Guidelines
            </Link>
            <span>•</span>
            <Link to="/support" className="hover:text-foreground">
              Support & Grievances
            </Link>
            <span>•</span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-foreground cursor-pointer"
            >
              Cookie Preferences
            </button>
          </div>

          <div className="flex items-center gap-1 text-caption1 shrink-0">
            <span>Crafted with care</span>
            <Heart16Regular className="text-brand-fg inline" />
            <span>for authentic experiences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
