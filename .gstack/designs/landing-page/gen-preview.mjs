import fs from 'fs';

const pretextCode = fs.readFileSync('frontend/src/utils/pretext.js', 'utf-8');

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LoveAgain — Verified Social Companionship Across India</title>
  <meta name="description" content="Connect with verified companions for dining, tennis, concerts, and social activities across Bengaluru, Mumbai, Delhi, and Hyderabad. 100% Escrow Protected.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0b0f17;
      --card: #111827;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #f43f5e;
      --accent-hover: #e11d48;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --emerald: #10b981;
      --amber: #f59e0b;
      --sky: #0ea5e9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .font-serif { font-family: 'Playfair Display', Georgia, serif; }
    .text-balance { text-wrap: balance; }
    .text-pretty { text-wrap: pretty; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.35rem 0.85rem; border-radius: 9999px;
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; background: rgba(244, 63, 94, 0.12);
      color: var(--accent); border: 1px solid rgba(244, 63, 94, 0.25);
    }
    .btn-primary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: var(--accent); color: white; padding: 0.85rem 1.75rem;
      border-radius: 0.75rem; font-weight: 700; font-size: 0.95rem;
      text-decoration: none; border: none; cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
    .btn-secondary {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
      background: rgba(255, 255, 255, 0.06); color: var(--text); padding: 0.85rem 1.75rem;
      border-radius: 0.75rem; font-weight: 600; font-size: 0.95rem;
      text-decoration: none; border: 1px solid var(--card-border);
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
    .card {
      background: var(--card); border: 1px solid var(--card-border);
      border-radius: 1.25rem; padding: 1.75rem;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-3px); border-color: rgba(244, 63, 94, 0.4); }
    .companion-img {
      width: 100%; height: 260px; object-fit: cover; border-radius: 1rem 1rem 0 0;
    }
    .tag {
      font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem;
      border-radius: 0.375rem; background: rgba(255, 255, 255, 0.06);
      color: var(--text-muted); border: 1px solid var(--card-border);
    }
  </style>
</head>
<body>
  <!-- Header / Navigation -->
  <header style="border-bottom: 1px solid var(--card-border); padding: 1rem 0; position: sticky; top: 0; background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(12px); z-index: 50;">
    <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--accent);">Cue</span>
        <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); padding: 0.15rem 0.5rem; border-radius: 9999px; color: var(--text-muted);">LoveAgain</span>
      </div>
      <nav style="display: flex; gap: 1.5rem; font-size: 0.9rem; font-weight: 600;">
        <a href="#activities" style="color: var(--text-muted); text-decoration: none;">Activities</a>
        <a href="#companions" style="color: var(--text-muted); text-decoration: none;">Companions</a>
        <a href="#how-it-works" style="color: var(--text-muted); text-decoration: none;">How It Works</a>
        <a href="#faq" style="color: var(--text-muted); text-decoration: none;">FAQ</a>
      </nav>
      <div style="display: flex; gap: 0.75rem;">
        <a href="/login" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Login</a>
        <a href="/discovery" class="btn-primary" style="padding: 0.5rem 1.25rem; font-size: 0.85rem;">Find Companions</a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section style="padding: 5rem 0 4rem; text-align: center; position: relative;">
    <div class="container">
      <div class="badge" style="margin-bottom: 1.5rem;">Verified Social Companionship Across India</div>
      <h1 class="font-serif text-balance" style="font-size: clamp(2.5rem, 5vw, 4.25rem); font-weight: 700; line-height: 1.15; max-width: 900px; margin: 0 auto;">
        Meet Verified Companions for <span style="color: var(--accent);">Events, Dining & Hobbies</span>
      </h1>
      <p class="text-pretty" style="max-width: 680px; margin: 1.5rem auto 2.5rem; font-size: 1.15rem; color: var(--text-muted);">
        Connect with verified local partners for concerts, tennis, fine dining, city exploration, and weekend hobbies. 100% platonic, protected by platform escrow, and verified with government ID.
      </p>
      <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <a href="/discovery" class="btn-primary" style="padding: 1rem 2rem; font-size: 1.05rem;">
          Explore Verified Companions &rarr;
        </a>
        <a href="#how-it-works" class="btn-secondary" style="padding: 1rem 1.75rem;">
          How Escrow Protects You
        </a>
      </div>

      <!-- Trust Metrics -->
      <div style="margin-top: 4rem; padding-top: 2.5rem; border-top: 1px solid var(--card-border); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
        <div>
          <div class="font-serif" style="font-size: 2rem; font-weight: 700;">100%</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Government ID & Selfie KYC</div>
        </div>
        <div>
          <div class="font-serif" style="font-size: 2rem; font-weight: 700;">Escrow Hold</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Zero Pre-payment Default Risk</div>
        </div>
        <div>
          <div class="font-serif" style="font-size: 2rem; font-weight: 700;">4-Digit PIN</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">In-Person Check-In Security</div>
        </div>
        <div>
          <div class="font-serif" style="font-size: 2rem; font-weight: 700;">24/7 SOS</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Live Emergency Dispatch</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pretext-Native Category Pillars -->
  <section id="activities" style="padding: 4rem 0;">
    <div class="container">
      <div style="margin-bottom: 2rem;">
        <span class="badge" style="margin-bottom: 0.5rem;">Four Ways to Connect</span>
        <h2 class="font-serif" style="font-size: 2rem; font-weight: 700;">Explore Outing Categories</h2>
      </div>

      <div class="grid-4">
        <div class="card">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--emerald); text-transform: uppercase; margin-bottom: 0.5rem;">Social & Events</div>
          <h3 class="font-serif" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">Cue Social & Gatherings</h3>
          <div data-pretext class="card-desc" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Connect with verified companions for city tours, concerts, fine dining, art galleries, and social plus-one gatherings.
          </div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <span class="tag">City Tours</span>
            <span class="tag">Fine Dining</span>
            <span class="tag">Concerts</span>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--amber); text-transform: uppercase; margin-bottom: 0.5rem;">Active & Sports</div>
          <h3 class="font-serif" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">Cue Fitness & Tennis</h3>
          <div data-pretext class="card-desc" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Partner up for weekend tennis matches, gym spotting, morning lake runs, hiking trails, and mindfulness yoga sessions.
          </div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <span class="tag">Tennis Partner</span>
            <span class="tag">Hiking Trails</span>
            <span class="tag">Gym Spotter</span>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--sky); text-transform: uppercase; margin-bottom: 0.5rem;">Skills & Hobbies</div>
          <h3 class="font-serif" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">Cue Creative Walks</h3>
          <div data-pretext class="card-desc" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Hire companion mentors for golden-hour street photography walks, foreign language practice, and hobby masterclasses.
          </div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <span class="tag">Photography</span>
            <span class="tag">Languages</span>
            <span class="tag">Culinary</span>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 0.75rem; font-weight: 700; color: #f43f5e; text-transform: uppercase; margin-bottom: 0.5rem;">Domestic & Senior</div>
          <h3 class="font-serif" style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">Cue Lifestyle & Care</h3>
          <div data-pretext class="card-desc" style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Find regional homestyle cooks, festive floral & pooja artists, patient senior escorts, and local bazaar shopping guides.
          </div>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            <span class="tag">Homestyle Cook</span>
            <span class="tag">Senior Escort</span>
            <span class="tag">Pooja Prep</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pretext Layout Engine Script -->
  <script type="module">
    ${pretextCode}

    // Apply Pretext resize-aware dynamic height computation
    async function initPretext() {
      if (document.fonts) await document.fonts.ready;
      const elements = document.querySelectorAll('[data-pretext]');
      const preparedMap = new Map();

      for (const el of elements) {
        const text = el.textContent.trim();
        const font = getComputedStyle(el).font || '14px Plus Jakarta Sans';
        preparedMap.set(el, prepare(text, font));
      }

      function relayout() {
        for (const [el, handle] of preparedMap) {
          const width = el.clientWidth;
          if (width > 0) {
            const res = layout(handle, width, 22);
            el.style.height = res.height + 'px';
          }
        }
      }

      relayout();
      window.addEventListener('resize', relayout);
    }

    initPretext();
  </script>
</body>
</html>`;

fs.writeFileSync('.gstack/designs/landing-page/finalized.html', htmlContent);
console.log('Successfully wrote .gstack/designs/landing-page/finalized.html');
