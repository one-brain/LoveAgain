import fs from 'fs';

// QA Probe Runner for LoveAgain / Cue Microservices and Frontend
// Evaluates functional contracts, auth flows, discovery, bookings, wallet, admin RBAC, and frontend routes.

const BASE_API = 'http://localhost:8080/api/v1';
const BASE_WEB = 'http://localhost:3000';

const results = {
  startedAt: new Date().toISOString(),
  passed: 0,
  failed: 0,
  tests: []
};

async function test(name, fn) {
  const t0 = Date.now();
  try {
    await fn();
    const duration = Date.now() - t0;
    results.passed++;
    results.tests.push({ name, status: 'PASS', durationMs: duration });
    console.log(`[PASS] ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - t0;
    results.failed++;
    results.tests.push({ name, status: 'FAIL', durationMs: duration, error: err.message });
    console.error(`[FAIL] ${name} (${duration}ms):`, err.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function run() {
  console.log('--- Starting LoveAgain System QA Probes ---\n');

  let seekerToken = null;
  let seekerId = null;
  let companionToken = null;
  let companionId = null;
  let adminToken = null;
  let discoveredProviderId = null;

  // ==========================================
  // SECTION 1: AUTHENTICATION & IDENTITY
  // ==========================================
  console.log('== Group 1: Auth & Identity ==');

  await test('Auth: Seeker Login (demo@cue.local)', async () => {
    const res = await fetch(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@cue.local', password: 'CueDemo123!' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.accessToken, 'Missing accessToken in response');
    assert(data.user && data.user.email === 'demo@cue.local', 'User email mismatch');
    seekerToken = data.accessToken;
    seekerId = data.user.id;
  });

  await test('Auth: Companion Login (elena.provider@cue.com)', async () => {
    const res = await fetch(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'elena.provider@cue.com', password: 'CueDemo123!' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.accessToken, 'Missing accessToken');
    companionToken = data.accessToken;
    companionId = data.user.id;
  });

  await test('Auth: Admin Login (admin@cue.local)', async () => {
    const res = await fetch(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@cue.local', password: 'CueAdmin123!' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.accessToken, 'Missing accessToken');
    assert(data.user.roles && data.user.roles.includes('Admin'), 'Missing Admin role');
    adminToken = data.accessToken;
  });

  await test('Auth: Invalid Credentials Rejection (401)', async () => {
    const res = await fetch(`${BASE_API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@cue.local', password: 'WrongPassword999!' })
    });
    assert(res.status === 401, `Expected 401 Unauthorized, got ${res.status}`);
  });

  await test('Auth: User Profile Me Endpoint (/profiles/me)', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/profiles/me`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    assert(data.id === seekerId, 'Returned user ID does not match token');
  });

  // ==========================================
  // SECTION 2: DISCOVERY & SEARCH
  // ==========================================
  console.log('\n== Group 2: Discovery & Search ==');

  await test('Discovery: Public Provider Catalog returns seeded companions', async () => {
    const res = await fetch(`${BASE_API}/discovery/providers?pageSize=120`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const providers = await res.json();
    assert(Array.isArray(providers), 'Expected array of providers');
    assert(providers.length >= 80, `Expected at least 80 active providers, got ${providers.length}`);
    const first = providers[0];
    assert(first.providerId, 'Missing providerId');
    assert(first.displayName, 'Missing displayName');
    assert(first.photoUrl, 'Missing photoUrl');
    assert(first.hourlyRate > 0, 'Hourly rate should be positive');
    assert(Array.isArray(first.specialties), 'Specialties should be array');
    discoveredProviderId = first.providerId;
  });

  await test('Discovery: City Filter (Bengaluru)', async () => {
    const res = await fetch(`${BASE_API}/discovery/providers?city=Bengaluru&pageSize=120`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const providers = await res.json();
    assert(providers.length > 0, 'Expected providers in Bengaluru');
    providers.forEach(p => {
      if (p.city) assert(p.city.toLowerCase() === 'bengaluru', `Provider ${p.displayName} city mismatch: ${p.city}`);
    });
  });

  await test('Discovery: Gender Filter (Female)', async () => {
    const res = await fetch(`${BASE_API}/discovery/providers?gender=Female&pageSize=120`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const providers = await res.json();
    assert(providers.length > 0, 'Expected female providers');
    providers.forEach(p => {
      if (p.gender) assert(p.gender.toLowerCase() === 'female', `Gender mismatch: ${p.gender}`);
    });
  });

  await test('Discovery: Price Range Filter (1500 to 3000)', async () => {
    const res = await fetch(`${BASE_API}/discovery/providers?minRate=1500&maxRate=3000&pageSize=120`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const providers = await res.json();
    assert(providers.length > 0, 'Expected providers in price range');
    providers.forEach(p => {
      assert(p.hourlyRate >= 1500 && p.hourlyRate <= 3000, `Rate ${p.hourlyRate} out of range`);
    });
  });

  await test('Discovery: Keyword Search (q=tennis)', async () => {
    const res = await fetch(`${BASE_API}/discovery/providers?q=tennis&pageSize=120`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const providers = await res.json();
    assert(providers.length > 0, 'Expected tennis results');
    const hasTennis = providers.some(p => 
      (p.bio && p.bio.toLowerCase().includes('tennis')) || 
      (p.specialties && p.specialties.some(s => s.toLowerCase().includes('tennis')))
    );
    assert(hasTennis, 'Search results should contain tennis in bio or specialties');
  });

  await test('Discovery: Get Provider Details by ID with Upcoming Slots', async () => {
    assert(discoveredProviderId, 'No discovered provider ID');
    const res = await fetch(`${BASE_API}/discovery/providers/${discoveredProviderId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const p = await res.json();
    assert(p.providerId === discoveredProviderId, 'Provider ID mismatch');
    assert(p.displayName, 'Missing displayName');
    assert(Array.isArray(p.upcomingSlots), 'Expected upcomingSlots array');
  });

  // ==========================================
  // SECTION 3: BOOKINGS & AVAILABILITY
  // ==========================================
  console.log('\n== Group 3: Bookings & Availability ==');

  await test('Bookings: Companion Availability Slots (/profiles/provider/availability)', async () => {
    assert(companionToken, 'Companion token required');
    const res = await fetch(`${BASE_API}/profiles/provider/availability`, {
      headers: { 'Authorization': `Bearer ${companionToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const slots = await res.json();
    assert(Array.isArray(slots), 'Expected slots array');
    assert(slots.length > 0, 'Expected seeded companion slots');
  });

  let createdOrderId = null;
  await test('Bookings: Create Booking as Seeker', async () => {
    assert(seekerToken, 'Seeker token required');
    assert(companionId, 'Companion ID required');
    const start = new Date(Date.now() + 86400000 * 3); // 3 days in future
    const end = new Date(start.getTime() + 7200000);   // 2 hours later
    
    const body = {
      providerId: companionId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      hourlyRate: 2000,
      durationHours: 2,
      meetingAddress: 'Starbucks, Indiranagar 100ft Road, Bengaluru',
      requirements: {
        activity: 'Dining & Social',
        dressCode: 'Smart Casual',
        specialNotes: 'Automated QA booking test verification'
      }
    };

    const res = await fetch(`${BASE_API}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seekerToken}`
      },
      body: JSON.stringify(body)
    });
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    const data = await res.json();
    assert(data.orderId, 'Missing orderId in response');
    createdOrderId = data.orderId;
  });

  await test('Bookings: List Seeker Bookings', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/bookings`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const bookings = await res.json();
    const list = Array.isArray(bookings) ? bookings : bookings.bookings;
    assert(Array.isArray(list), 'Expected bookings list array');
    if (createdOrderId) {
      const found = list.find(b => b.orderId === createdOrderId);
      assert(found, `Newly created booking ${createdOrderId} should appear in seeker bookings`);
    }
  });

  await test('Bookings: Cancel Booking (204 No Content)', async () => {
    if (!createdOrderId) return;
    const res = await fetch(`${BASE_API}/bookings/${createdOrderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seekerToken}`
      },
      body: JSON.stringify({ reason: 'QA Test clean-up cancellation' })
    });
    assert(res.status === 200 || res.status === 204, `Expected 200/204, got ${res.status}`);
  });

  // ==========================================
  // SECTION 4: WALLET, PAYMENTS & ESCROW
  // ==========================================
  console.log('\n== Group 4: Wallet, Payments & Escrow ==');

  await test('Payments: Seeker Wallet Balance (/payments/wallet/balance)', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/payments/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const wallet = await res.json();
    assert(wallet.userId === seekerId, 'Wallet userId mismatch');
    assert(typeof wallet.availableBalance === 'number', 'Missing availableBalance');
  });

  await test('Payments: Seeker Wallet Transactions (/payments/wallet/transactions)', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/payments/wallet/transactions`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const txs = await res.json();
    assert(Array.isArray(txs), 'Expected transactions array');
  });

  await test('Payments: Initiate Wallet Top-Up Order (/payments/wallet/topup/order)', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/payments/wallet/topup/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seekerToken}`
      },
      body: JSON.stringify({ amount: 500, currency: 'INR' })
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const topup = await res.json();
    assert(topup.orderId, 'Missing orderId in top-up response');
  });

  // ==========================================
  // SECTION 5: CHAT, SUPPORT & SOS
  // ==========================================
  console.log('\n== Group 5: Chat, Support & SOS ==');

  let paidOrderId = null;
  await test('Bookings: Identify Paid/Active Order for Chat Probe', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/bookings`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.bookings;
    const paid = list.find(b => b.status === 'Confirmed' || b.status === 'Completed' || b.status === 'InProgress');
    if (paid) {
      paidOrderId = paid.orderId;
    }
  });

  await test('Chat: Order Messages Query (/chat/orders/{orderId}/messages)', async () => {
    if (!paidOrderId) {
      console.log('   (Skipping message fetch - no existing paid order for demo user)');
      return;
    }
    const res = await fetch(`${BASE_API}/chat/orders/${paidOrderId}/messages`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const messages = await res.json();
    assert(Array.isArray(messages), 'Expected messages array');
  });

  await test('Chat: Order Unread Count (/chat/orders/{orderId}/unread-count)', async () => {
    if (!paidOrderId) return;
    const res = await fetch(`${BASE_API}/chat/orders/${paidOrderId}/unread-count`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const count = await res.json();
    assert(typeof count === 'number', 'Expected number unread count');
  });

  await test('Support: Ticket Submission Contract (/support/tickets)', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${seekerToken}`
      },
      body: JSON.stringify({
        category: 'Inquiry',
        subject: 'QA automated support check',
        message: 'This is a test support inquiry verifying the support ticket pipeline.'
      })
    });
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    const ticket = await res.json();
    assert(ticket.ticketId, 'Missing ticketId');
  });

  await test('Support: Emergency Outing SOS Contract (/support/sos)', async () => {
    const res = await fetch(`${BASE_API}/support/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: paidOrderId || '00000000-0000-0000-0000-000000000001',
        companionName: 'Elena Rostova',
        locationAddress: 'Brigade Road, Bengaluru',
        latitude: 12.9716,
        longitude: 77.5946,
        reason: 'Automated QA SOS protocol verification check'
      })
    });
    assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
    const sos = await res.json();
    assert(sos.incidentId, 'Missing incidentId');
  });

  // ==========================================
  // SECTION 6: ADMIN GOVERNANCE & RBAC GATES
  // ==========================================
  console.log('\n== Group 6: Admin Governance & RBAC ==');

  await test('Admin: Get Verifications List (Admin Token)', async () => {
    assert(adminToken, 'Admin token required');
    const res = await fetch(`${BASE_API}/admin/verifications`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const list = await res.json();
    assert(Array.isArray(list), 'Expected verifications array');
    assert(list.length > 0, 'Expected pending verifications seeded');
  });

  await test('Admin: RBAC Gate - Seeker forbidden from Admin Verifications (403)', async () => {
    assert(seekerToken, 'Seeker token required');
    const res = await fetch(`${BASE_API}/admin/verifications`, {
      headers: { 'Authorization': `Bearer ${seekerToken}` }
    });
    assert(res.status === 403, `Expected 403 Forbidden for non-admin user, got ${res.status}`);
  });

  await test('Admin: Directory of Users', async () => {
    assert(adminToken, 'Admin token required');
    const res = await fetch(`${BASE_API}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const users = await res.json();
    assert(Array.isArray(users), 'Expected users array');
    assert(users.length >= 100, `Expected at least 100 users, got ${users.length}`);
  });

  await test('Admin: Platform MIS Analytics (/payments/admin/mis)', async () => {
    assert(adminToken, 'Admin token required');
    const res = await fetch(`${BASE_API}/payments/admin/mis`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const mis = await res.json();
    assert(mis.totalBookings != null, 'Expected totalBookings in MIS');
    assert(mis.activeEscrowLocked != null, 'Expected activeEscrowLocked in MIS');
  });

  await test('Admin: Payout Requests Hub (/payments/admin/payouts)', async () => {
    assert(adminToken, 'Admin token required');
    const res = await fetch(`${BASE_API}/payments/admin/payouts`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const payouts = await res.json();
    assert(Array.isArray(payouts), 'Expected payouts array');
  });

  // ==========================================
  // SECTION 7: FRONTEND ROUTE HEALTH SMOKES
  // ==========================================
  console.log('\n== Group 7: Frontend Route Health Smokes ==');

  const routes = [
    '/',
    '/login',
    '/register',
    '/discovery',
    '/bookings',
    '/profile',
    '/provider/dashboard',
    '/admin',
    '/admin/verifications',
    '/admin/users',
    '/admin/payouts',
    '/admin/bookings',
    '/admin/mis',
    '/privacy',
    '/terms',
    '/cancellation',
    '/guidelines'
  ];

  for (const route of routes) {
    await test(`Frontend Route: ${route}`, async () => {
      const res = await fetch(`${BASE_WEB}${route}`);
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      const text = await res.text();
      assert(text.includes('<div id="root">') || text.includes('<!DOCTYPE html>'), 'Missing root HTML container');
    });
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==========================================');
  console.log(`QA Probe Results: Total ${results.tests.length} | Passed ${results.passed} | Failed ${results.failed}`);
  console.log('==========================================\n');

  return results;
}

run().then(res => {
  fs.writeFileSync('./.gstack/qa-reports/run-latest/results.json', JSON.stringify(res, null, 2));
  if (res.failed > 0) {
    process.exit(1);
  }
}).catch(err => {
  console.error('Fatal probe runner error:', err);
  process.exit(1);
});
