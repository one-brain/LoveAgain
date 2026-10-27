import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldCheckIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline';
import type { RootState } from '../store';
import { openCookiePreferences } from './CookieConsentBanner';

const Footer: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAdmin = Boolean(user?.roles?.includes('Admin') || user?.email?.toLowerCase() === 'admin@cue.local');

  return (
    <footer className="bg-card border-t border-border/80 text-foreground transition-colors duration-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand info (spans full 2 columns on mobile, 1 on desktop) */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-bold">
                <SparklesIcon className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif tracking-tight text-foreground">
                Cue
              </span>
            </Link>
            <p className="text-sm text-foreground/80 leading-relaxed">
              Meaningful companion experiences. Rent companionship for sports, arts, dining, skill-sharing, and new city explorations with verified community trust.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Identity Verified & Safe Escrow</span>
            </div>
          </div>

          {/* Experience Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Experiences
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/discovery?q=Domestic+%26+Lifestyle" className="text-foreground/80 hover:text-accent transition-colors font-medium text-accent">
                  🏡 Indian Domestic & Lifestyle
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Regional+Homestyle+Cook" className="text-foreground/80 hover:text-accent transition-colors">
                  Homestyle Cooking (Ghar Ka Khana)
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Festival+%26+Pooja+Decor" className="text-foreground/80 hover:text-accent transition-colors">
                  Festival & Pooja Decor
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Senior+Companion+%26+Temple+Escort" className="text-foreground/80 hover:text-accent transition-colors">
                  Senior Companion (Buzurg Saath)
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Tennis" className="text-foreground/80 hover:text-accent transition-colors">
                  Sports & Fitness
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Art" className="text-foreground/80 hover:text-accent transition-colors">
                  Museums & Culture
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Cooking" className="text-foreground/80 hover:text-accent transition-colors">
                  Culinary & Dining
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Hiking" className="text-foreground/80 hover:text-accent transition-colors">
                  Outdoors & Hiking
                </Link>
              </li>
              <li>
                <Link to="/discovery?specialty=Photography" className="text-foreground/80 hover:text-accent transition-colors">
                  Skill Sharing & Photo
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Trust & Safety
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/how-it-works" className="text-foreground/80 hover:text-accent transition-colors">
                  Identity Verification
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-foreground/80 hover:text-accent transition-colors">
                  100% Escrow Protection
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-foreground/80 hover:text-accent transition-colors">
                  Trust Score System
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-foreground/80 hover:text-accent transition-colors font-medium">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link to="/terms#platonic-mandate" className="text-foreground/80 hover:text-accent transition-colors">
                  Strictly Platonic Charter
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-foreground/80 hover:text-accent transition-colors">
                  24/7 Dispute Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies Column (NEW) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              Legal & Policies
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-foreground/80 hover:text-accent transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-foreground/80 hover:text-accent transition-colors font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cancellation-policy" className="text-foreground/80 hover:text-accent transition-colors font-medium">
                  Cancellation & Refunds
                </Link>
              </li>
              <li>
                <Link to="/community-guidelines" className="text-foreground/80 hover:text-accent transition-colors">
                  Safety Standards
                </Link>
              </li>
              <li>
                <Link to="/support#grievance" className="text-foreground/80 hover:text-accent transition-colors">
                  Grievance Redressal
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={openCookiePreferences}
                  className="text-foreground/80 hover:text-accent transition-colors text-left cursor-pointer"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Role-Differentiated Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
              {isAdmin ? 'Admin Portals' : 'Platform'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {isAdmin ? (
                <>
                  <li>
                    <Link to="/admin/verifications" className="text-foreground/80 hover:text-accent transition-colors font-medium">
                      Companion Approvals
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/bookings" className="text-foreground/80 hover:text-accent transition-colors">
                      Platform Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/users" className="text-foreground/80 hover:text-accent transition-colors">
                      User Directory
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/payouts" className="text-foreground/80 hover:text-accent transition-colors">
                      Earnings Withdrawals
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/mis" className="text-foreground/80 hover:text-accent transition-colors">
                      Platform Performance
                    </Link>
                  </li>
                </>
              ) : isAuthenticated ? (
                <>
                  <li>
                    <Link to="/discovery" className="text-foreground/80 hover:text-accent transition-colors font-medium">
                      Discover Companions
                    </Link>
                  </li>
                  <li>
                    <Link to="/bookings" className="text-foreground/80 hover:text-accent transition-colors">
                      My Bookings
                    </Link>
                  </li>
                  <li>
                    <Link to="/wallet" className="text-foreground/80 hover:text-accent transition-colors">
                      Wallet & Payments
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="text-foreground/80 hover:text-accent transition-colors">
                      Account Settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="text-foreground/80 hover:text-accent transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-foreground/80 hover:text-accent transition-colors">
                      Support Desk
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/discovery" className="text-foreground/80 hover:text-accent transition-colors font-medium">
                      Discover Companions
                    </Link>
                  </li>
                  <li>
                    <Link to="/how-it-works" className="text-foreground/80 hover:text-accent transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link to="/register?redirect=/apply-companion" className="text-foreground/80 hover:text-accent transition-colors">
                      Become a Companion
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-foreground/80 hover:text-accent transition-colors">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-foreground/80 hover:text-accent transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/support" className="text-foreground/80 hover:text-accent transition-colors">
                      Support Desk
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar with Copyright, Quick Legal Links & Branding */}
        <div className="pt-8 border-t border-border/60 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Cue Platform. Designed for meaningful, safe human connections.
          </p>

          {/* Quick Legal Horizontal Strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <span className="opacity-40">•</span>
            <Link to="/terms" className="hover:text-accent transition-colors">
              Terms of Service
            </Link>
            <span className="opacity-40">•</span>
            <Link to="/cancellation-policy" className="hover:text-accent transition-colors">
              Cancellation & Refunds
            </Link>
            <span className="opacity-40">•</span>
            <Link to="/community-guidelines" className="hover:text-accent transition-colors">
              Community Guidelines
            </Link>
            <span className="opacity-40">•</span>
            <Link to="/support" className="hover:text-accent transition-colors">
              Support & Grievances
            </Link>
            <span className="opacity-40">•</span>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-accent transition-colors cursor-pointer"
            >
              Cookie Preferences
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs shrink-0">
            <span>Crafted with care</span>
            <HeartIcon className="w-3.5 h-3.5 text-accent inline" />
            <span>for authentic experiences</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
