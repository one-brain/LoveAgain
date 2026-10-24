# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Seekers**: Individuals seeking safe, verified companionship for social outings, dining, fitness, cultural events, travel navigation, or mindful platonic conversation. Their primary job is finding someone reliable, pleasant, and verified to share an experience with without awkwardness or safety ambiguity.
- **Companions (Providers)**: Verified local individuals sharing their time, skills, passions, and presence on an hourly basis. Their primary job is publishing authentic profiles, receiving pre-funded booking requests, setting custom rates and availability, and receiving direct bank/UPI payouts.
- **Platform Administrators**: Back-office platform supervisors who monitor business health (GMV, 15% platform take, 85% companion payouts, escrow liquidity holds) and review verification applications (government ID proof, liveness selfie, and 3-photo public browse galleries).

## Product Purpose

Cue is an on-demand marketplace for curated, platonic companionship experiences. It removes loneliness, isolation, and social friction by making trusted human companionship accessible, structured, and safe. Success means seekers easily book fulfilling, dignified experiences while companions earn predictable, safe income with zero ambiguity regarding boundaries.

## Positioning

Unlike conventional dating apps or informal social forums, Cue is an **identity-verified, escrow-backed platonic companionship marketplace**. Payments are locked in an escrow vault until sessions conclude successfully, companions undergo mandatory government ID and live face verification before appearing in discovery, and administrative oversight guarantees mutual safety and clear conduct boundaries.

## Operating Context

- Target Market: India (tier-1 metro hubs: Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Pune, Chennai).
- Currency Standard: Indian Rupees (`INR` / `₹`) using Indian numbering formatting (`en-IN`).
- Pricing Dynamics: Standard companion hourly rates range from ₹800/hr to ₹2,500/hr (benchmark average ₹1,500/hr). Minimum recommended rate is ₹300/hr.
- Settlement Rails: Razorpay UPI (Google Pay, PhonePe, Paytm, BHIM, CRED), NetBanking, and RuPay/Visa/Mastercard cards.
- Web platform (responsive mobile-first layout accessible from phones, tablets, and desktops).
- Real-time category and specialty filtering (dining, tennis/fitness, city walks, art galleries, event attendance).
- Unified Canonical Booking Standard ("Book with Escrow"): All bookings across Discovery cards and Companion Detail pages follow a single, unified 2-step escrow reservation pattern (Step 1: Experience & venue specifications; Step 2: Escrow wallet/Razorpay deposit).
- Escrow transaction lifecycle: Booking requested -> Companion confirms -> Wallet funds escrowed -> Session takes place -> Funds settled (85% to companion wallet, 15% platform commission).
- Strict separation between administrative oversight and marketplace participation.

## Capabilities and Constraints

- **Capabilities**:
  - Browse verified companion cards with 3 curated discovery photos, bio, hourly rate, and specialties.
  - Single canonical "Book with Escrow" flow: Experience specifications (date, time, venue, activity, boundaries) followed by Razorpay/Wallet escrow checkout.
  - Razorpay-backed digital wallet with escrow holds, deposits, and transaction history.
  - Real-time messaging and chat between confirmed seeker and companion.
  - Comprehensive Admin Portal with GMV analytics, KYC inspection, bookings ledger, and account moderation.
  - Multi-theme visual palette switcher (Warm Daylight, Velvet Night, Midnight).
- **Constraints**:
  - Strictly platonic and safe; no adult services or harassment permitted.
  - Administrators are strictly isolated: admins cannot hold companion profiles or book as seekers.
  - Discovery profiles must contain verified photos before public listing.

## Brand Commitments

- **Name**: Cue
- **Tone**: Warm, refined, respectful, trustworthy, and discreet.
- **Design Tokens**: Luxury hospitality warmth (warm neutrals, rich bordeaux velvet accents, gold/amber highlights, typography-led elegance with serif headlines and clean sans-serif body).

## Evidence on Hand

- Fully functional React 19 + TypeScript + Vite frontend with Tailwind CSS and Redux Toolkit.
- ASP.NET Core microservices architecture with PostgreSQL database backing auth, profiles, bookings, and payments.
- Real seed profiles and demonstration fixtures (`seeker.demo@cue.com`, `elena.provider@cue.com`, `admin@cue.local`).

## Product Principles

1. **Safety and Integrity First**: Identity verification and escrow vaults are non-negotiable foundations, ensuring both parties feel protected.
2. **Dignity & Clarity**: Clear boundaries, transparent hourly pricing, and zero ambiguity about the platonic nature of companionship.
3. **Effortless Discovery**: Finding an ideal companion based on activity, vibe, and schedule should be intuitive, aesthetic, and welcoming.
4. **Frictionless Financial Settlement**: Companions receive their full earnings directly without opaque deductions or settlement delays.
5. **Purposeful Craft & Restraint**: Interface design respects user privacy and displays information with understated elegance.

## Accessibility & Inclusion

- Responsive design with minimum touch target sizes (44x44px).
- High contrast color ratios across light (Warm Daylight), dark (Midnight), and romantic (Velvet Night) themes.
- Clear semantic HTML elements, accessible form labels, and focus rings.

