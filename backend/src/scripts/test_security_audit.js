/**
 * KrishiDirect Security Audit Test Suite
 * Tests all 9 security vectors + additional findings
 * Run: node src/scripts/test_security_audit.js
 */

const BASE_URL = 'http://localhost:5000/api';

let CONSUMER_TOKEN = '';
let FARMER_TOKEN = '';
let FARMER2_TOKEN = '';
let ADMIN_TOKEN = '';
let TEST_PRODUCT_ID = '';
let TEST_ORDER_ID = '';

const request = async (method, path, body, token) => {
  const url = `${BASE_URL}${path}`;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  try {
    const res = await fetch(url, opts);
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, error: err.message };
  }
};

let passed = 0;
let failed = 0;
const results = [];

const test = (name, condition, detail = '') => {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
    results.push({ name, result: 'PASS', detail });
  } else {
    console.error(`  ❌ FAIL: ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
    results.push({ name, result: 'FAIL', detail });
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTests = async () => {
  console.log('='.repeat(60));
  console.log('🔐 KrishiDirect Security Audit Test Suite');
  console.log('='.repeat(60));

  // ── SETUP: Create test users ─────────────────────────────────────
  console.log('\n[SETUP] Registering test accounts...');
  const ts = Date.now();

  const consumerReg = await request('POST', '/auth/register', {
    name: 'Test Consumer', email: `consumer_sec_${ts}@test.com`,
    password: 'SecurePass99', phone: '9876543210', role: 'consumer'
  });
  CONSUMER_TOKEN = consumerReg.data?.token;
  test('Consumer registration', consumerReg.status === 201 && !!CONSUMER_TOKEN, JSON.stringify(consumerReg.data?.message));

  const farmerReg = await request('POST', '/auth/register', {
    name: 'Test Farmer', email: `farmer_sec_${ts}@test.com`,
    password: 'FarmSecure99', phone: '9876543211', role: 'farmer',
    farmDetails: { farmName: 'Test Farm', farmLocation: 'Pune, Maharashtra' }
  });
  FARMER_TOKEN = farmerReg.data?.token;
  test('Farmer registration', farmerReg.status === 201 && !!FARMER_TOKEN);

  const farmer2Reg = await request('POST', '/auth/register', {
    name: 'Test Farmer2', email: `farmer2_sec_${ts}@test.com`,
    password: 'FarmSecure99', phone: '9876543212', role: 'farmer',
    farmDetails: { farmName: 'Test Farm2', farmLocation: 'Nashik, Maharashtra' }
  });
  FARMER2_TOKEN = farmer2Reg.data?.token;
  test('Farmer2 registration', farmer2Reg.status === 201 && !!FARMER2_TOKEN);

  // Login as admin
  const adminLogin = await request('POST', '/auth/login', {
    email: 'admin@agridirect.in', password: 'Password@123'
  });
  ADMIN_TOKEN = adminLogin.data?.token;
  test('Admin login', adminLogin.status === 200 && !!ADMIN_TOKEN, adminLogin.data?.message);

  if (!ADMIN_TOKEN) {
    console.error('[FATAL] Admin login failed — cannot continue tests that require admin.');
    console.log('Skipping admin-dependent tests.\n');
  }

  // Verify farmer 1 via admin
  if (ADMIN_TOKEN) {
    const farmerId = farmerReg.data?.user?.id || farmerReg.data?.user?._id;
    const vRes = await request('PATCH', `/admin/farmers/${farmerId}/verify`, { status: 'verified' }, ADMIN_TOKEN);
    console.log('  [INFO] Farmer1 verified by admin:', vRes.status, vRes.data?.message);
  }

  // ── VECTOR 1: Privilege Escalation via Registration ──────────────
  console.log('\n[1] Privilege Escalation — Registration');
  const adminRegAttempt = await request('POST', '/auth/register', {
    name: 'Evil Admin', email: `evil_admin_${ts}@test.com`,
    password: 'HackPass99', phone: '9876543213', role: 'admin'
  });
  test('Cannot self-register as admin', adminRegAttempt.data?.user?.role !== 'admin',
    `Got role: ${adminRegAttempt.data?.user?.role}`);

  // ── VECTOR 2: Admin API Access by Consumer ───────────────────────
  console.log('\n[2] Admin API Protection');
  const adminDashConsumer = await request('GET', '/admin/dashboard', null, CONSUMER_TOKEN);
  test('Consumer cannot access admin dashboard', adminDashConsumer.status === 403);

  const adminDashFarmer = await request('GET', '/admin/dashboard', null, FARMER_TOKEN);
  test('Farmer cannot access admin dashboard', adminDashFarmer.status === 403);

  const adminDashNoAuth = await request('GET', '/admin/dashboard', null, null);
  test('Unauthenticated cannot access admin dashboard', adminDashNoAuth.status === 401);

  // ── VECTOR 3: Farmer Isolation ────────────────────────────────────
  console.log('\n[3] Farmer Isolation');

  // Consumer cannot create product
  const consumerProduct = await request('POST', '/products', {
    title: 'Evil Product', category: 'Vegetables', price: 10, availableQuantity: 5, description: 'Test'
  }, CONSUMER_TOKEN);
  test('Consumer cannot create product', consumerProduct.status === 403, `Status: ${consumerProduct.status}`);

  // Unverified farmer2 cannot create product
  const unverifiedProduct = await request('POST', '/products', {
    title: 'Unverified Listing', category: 'Vegetables', price: 10, availableQuantity: 5, description: 'Test'
  }, FARMER2_TOKEN);
  test('Unverified farmer cannot list product', unverifiedProduct.status === 403, `Status: ${unverifiedProduct.status} — ${unverifiedProduct.data?.verificationStatus}`);

  // Farmer1 creates product
  const farmer1Product = await request('POST', '/products', {
    title: 'Audit Test Tomatoes', category: 'Vegetables', price: 50,
    availableQuantity: 100, description: 'Security audit test product'
  }, FARMER_TOKEN);
  TEST_PRODUCT_ID = farmer1Product.data?.product?._id;
  test('Verified farmer can list product', farmer1Product.status === 201 && !!TEST_PRODUCT_ID,
    `Status: ${farmer1Product.status} — ${farmer1Product.data?.message}`);

  // Farmer2 (even if verified later) cannot edit Farmer1's product
  if (ADMIN_TOKEN) {
    const farmer2Id = farmer2Reg.data?.user?.id || farmer2Reg.data?.user?._id;
    await request('PATCH', `/admin/farmers/${farmer2Id}/verify`, { status: 'verified' }, ADMIN_TOKEN);
  }
  const farmer2EditFarmer1 = await request('PUT', `/products/${TEST_PRODUCT_ID}`, {
    price: 1 // Attempt to undercut competitor
  }, FARMER2_TOKEN);
  test('Farmer2 cannot edit Farmer1 product (IDOR)', farmer2EditFarmer1.status === 403,
    `Status: ${farmer2EditFarmer1.status}`);

  const farmer2DeleteFarmer1 = await request('DELETE', `/products/${TEST_PRODUCT_ID}`, null, FARMER2_TOKEN);
  test('Farmer2 cannot delete Farmer1 product (IDOR)', farmer2DeleteFarmer1.status === 403,
    `Status: ${farmer2DeleteFarmer1.status}`);

  // ── VECTOR 4: Mass Assignment Protection ─────────────────────────
  console.log('\n[4] Mass Assignment / Price Manipulation');
  const massAssign = await request('PUT', `/products/${TEST_PRODUCT_ID}`, {
    price: 1,
    rating: 5.0,
    numReviews: 9999,
    farmer: 'evil_farmer_id',
    status: 'in_stock'
  }, FARMER_TOKEN);
  // Should succeed for price (it's an allowed field) but not inject farmer/rating
  // Price update is valid, but we verify that rating/numReviews/farmer are not accepted
  const updatedProduct = await request('GET', `/products/${TEST_PRODUCT_ID}`);
  test('Mass assignment blocked — farmer field unchanged',
    updatedProduct.data?.product?.farmer?._id !== 'evil_farmer_id');
  test('Mass assignment blocked — numReviews not overwritten',
    updatedProduct.data?.product?.numReviews !== 9999);

  // ── VECTOR 5: Order IDOR & Consumer Auth ─────────────────────────
  console.log('\n[5] Order IDOR & Authorization');

  // Create an order as consumer
  const orderCreate = await request('POST', '/orders', {
    items: [{ productId: TEST_PRODUCT_ID, quantity: 2 }],
    deliveryAddress: { addressLine: '123 Test St', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
    paymentMethod: 'upi'
  }, CONSUMER_TOKEN);
  TEST_ORDER_ID = orderCreate.data?.order?._id;
  test('Consumer can place order', orderCreate.status === 201 && !!TEST_ORDER_ID,
    `Status: ${orderCreate.status} — ${orderCreate.data?.message}`);

  // Farmer2 should NOT be able to update Farmer1's order status
  const farmer2StatusUpdate = await request('PATCH', `/orders/${TEST_ORDER_ID}/status`, {
    status: 'CONFIRMED'
  }, FARMER2_TOKEN);
  test('Farmer2 cannot update order not containing their items',
    farmer2StatusUpdate.status === 403, `Status: ${farmer2StatusUpdate.status}`);

  // Consumer cannot update order status (not via state machine)
  const consumerStatusUpdate = await request('PATCH', `/orders/${TEST_ORDER_ID}/status`, {
    status: 'DELIVERED'
  }, CONSUMER_TOKEN);
  test('Consumer cannot call PATCH /orders/:id/status', consumerStatusUpdate.status === 403,
    `Status: ${consumerStatusUpdate.status}`);

  // Another consumer (use admin token pretending consumer check) — IDOR
  // Create second consumer
  const consumer2Reg = await request('POST', '/auth/register', {
    name: 'Consumer 2', email: `consumer2_sec_${ts}@test.com`,
    password: 'SecurePass99', phone: '9876543214', role: 'consumer'
  });
  const CONSUMER2_TOKEN = consumer2Reg.data?.token;
  if (CONSUMER2_TOKEN && TEST_ORDER_ID) {
    const consumer2ViewOrder = await request('GET', `/orders/${TEST_ORDER_ID}`, null, CONSUMER2_TOKEN);
    test('Consumer2 cannot view Consumer1 order (IDOR)', consumer2ViewOrder.status === 403,
      `Status: ${consumer2ViewOrder.status}`);

    const consumer2CancelOrder = await request('POST', `/orders/${TEST_ORDER_ID}/cancel`, {
      reason: 'Test IDOR cancel'
    }, CONSUMER2_TOKEN);
    test('Consumer2 cannot cancel Consumer1 order (IDOR)', consumer2CancelOrder.status === 403,
      `Status: ${consumer2CancelOrder.status}`);
  }

  // ── VECTOR 6: Order Status State Machine ─────────────────────────
  console.log('\n[6] Order State Machine Enforcement');
  // Try to skip from PENDING to DELIVERED directly
  if (TEST_ORDER_ID && FARMER_TOKEN) {
    const invalidSkip = await request('PATCH', `/orders/${TEST_ORDER_ID}/status`, {
      status: 'DELIVERED'
    }, FARMER_TOKEN);
    test('Cannot skip PENDING → DELIVERED (state machine)',
      invalidSkip.status === 400, `Status: ${invalidSkip.status}`);

    // Valid: PENDING → CONFIRMED
    const confirmOrder = await request('PATCH', `/orders/${TEST_ORDER_ID}/status`, {
      status: 'CONFIRMED'
    }, FARMER_TOKEN);
    test('Farmer can CONFIRM pending order', confirmOrder.status === 200,
      `Status: ${confirmOrder.status} — ${confirmOrder.data?.message}`);

    // Invalid: back to PENDING from CONFIRMED
    const invalidBack = await request('PATCH', `/orders/${TEST_ORDER_ID}/status`, {
      status: 'PENDING'
    }, FARMER_TOKEN);
    test('Cannot go backwards CONFIRMED → PENDING', invalidBack.status === 400,
      `Status: ${invalidBack.status}`);
  }

  // ── VECTOR 7: Review Eligibility ─────────────────────────────────
  console.log('\n[7] Review Unauthorized Submission');
  // Consumer without delivered order should not be able to review
  const badReview = await request('POST', '/reviews', {
    productId: TEST_PRODUCT_ID, rating: 5, comment: 'Unauthorized review attempt'
  }, CONSUMER_TOKEN);
  test('Consumer without delivered order cannot review', badReview.status === 403,
    `Status: ${badReview.status} — ${badReview.data?.message}`);

  // Farmer cannot submit reviews
  const farmerReview = await request('POST', '/reviews', {
    productId: TEST_PRODUCT_ID, rating: 5, comment: 'Farmer review attempt'
  }, FARMER_TOKEN);
  test('Farmer cannot submit product review', farmerReview.status === 403,
    `Status: ${farmerReview.status} — ${farmerReview.data?.message}`);

  // Unauthenticated cannot submit reviews  
  const unauthReview = await request('POST', '/reviews', {
    productId: TEST_PRODUCT_ID, rating: 5, comment: 'Unauth review'
  }, null);
  test('Unauthenticated cannot submit review', unauthReview.status === 401,
    `Status: ${unauthReview.status}`);

  // ── VECTOR 8: Admin Self-Deactivation ────────────────────────────
  console.log('\n[8] Admin Self-Protection');
  if (ADMIN_TOKEN) {
    const adminMe = await request('GET', '/auth/me', null, ADMIN_TOKEN);
    const adminId = adminMe.data?.user?.id;
    if (adminId) {
      const selfDeactivate = await request('PATCH', `/admin/users/${adminId}/status`, {
        isActive: false
      }, ADMIN_TOKEN);
      test('Admin cannot self-deactivate', selfDeactivate.status === 400,
        `Status: ${selfDeactivate.status} — ${selfDeactivate.data?.message}`);
    }

    // Admin cannot be set to invalid farmer status
    const farmer1Id = farmerReg.data?.user?.id;
    if (farmer1Id) {
      const invalidStatus = await request('PATCH', `/admin/farmers/${farmer1Id}/verify`, {
        status: 'hacked_status'
      }, ADMIN_TOKEN);
      test('Admin verify farmer rejects invalid status', invalidStatus.status === 400,
        `Status: ${invalidStatus.status} — ${invalidStatus.data?.message}`);
    }

    // Admin moderate product rejects invalid status
    if (TEST_PRODUCT_ID) {
      const invalidProdStatus = await request('PATCH', `/admin/products/${TEST_PRODUCT_ID}/moderate`, {
        status: 'corrupted_state'
      }, ADMIN_TOKEN);
      test('Admin moderate product rejects invalid status', invalidProdStatus.status === 400,
        `Status: ${invalidProdStatus.status}`);
    }

    // Deactivated user cannot login
    const consumerEmail = `consumer_sec_${ts}@test.com`;
    const consumerId = consumerReg.data?.user?.id;
    if (consumerId) {
      await request('PATCH', `/admin/users/${consumerId}/status`, { isActive: false }, ADMIN_TOKEN);
      const deactivatedLogin = await request('POST', '/auth/login', {
        email: consumerEmail, password: 'SecurePass99'
      });
      test('Deactivated user cannot log in', deactivatedLogin.status === 401,
        `Status: ${deactivatedLogin.status} — ${deactivatedLogin.data?.message}`);
      // Re-activate for clean state
      await request('PATCH', `/admin/users/${consumerId}/status`, { isActive: true }, ADMIN_TOKEN);
    }

    // Farmer bank details are NOT leaked on public product endpoint
    if (TEST_PRODUCT_ID) {
      const publicProd = await request('GET', `/products/${TEST_PRODUCT_ID}`);
      const bankDetails = publicProd.data?.product?.farmer?.farmDetails?.bankDetails;
      test('Farmer bankDetails stripped from public product view', !bankDetails,
        bankDetails ? 'LEAKED' : 'Properly hidden');
    }
  }

  // ── VECTOR 9: Rate Limiting ───────────────────────────────────────
  console.log('\n[9] Rate Limiting');
  console.log('  [INFO] Sending rapid auth requests to test brute-force protection...');
  let rateLimited = false;
  for (let i = 0; i < 55; i++) {
    const r = await request('POST', '/auth/login', { email: 'test@test.com', password: 'wrong' });
    if (r.status === 429) {
      rateLimited = true;
      console.log(`  [INFO] Rate limited after ${i + 1} requests.`);
      break;
    }
  }
  test('Auth endpoint rate limiting active', rateLimited,
    rateLimited ? 'Rate limit triggered' : 'Rate limit NOT triggered after requests');

  // ── VECTOR 10: XSS Input Sanitization ────────────────────────────
  console.log('\n[10] XSS Input Sanitization');
  const xssProduct = await request('POST', '/products', {
    title: '<script>alert("xss")</script>Evil Product',
    category: 'Vegetables',
    price: 50,
    availableQuantity: 10,
    description: '<img src=x onerror=alert(1)>Bad Description'
  }, FARMER_TOKEN);
  if (xssProduct.status === 201) {
    const xssTitle = xssProduct.data?.product?.title;
    const xssDesc = xssProduct.data?.product?.description;
    test('XSS tags stripped from product title', !xssTitle?.includes('<script>'), `Title: ${xssTitle}`);
    test('XSS tags stripped from product description', !xssDesc?.includes('<img'), `Desc: ${xssDesc}`);
    // Clean up
    if (xssProduct.data?.product?._id) {
      await request('DELETE', `/products/${xssProduct.data.product._id}`, null, FARMER_TOKEN);
    }
  }

  // ── VECTOR 11: CORS Check ─────────────────────────────────────────
  console.log('\n[11] CORS Configuration');
  console.log('  [INFO] CORS restricted to FRONTEND_ORIGIN env var (http://localhost:5173).');
  console.log('  [INFO] Manual test: curl with Origin: http://evil.com should return CORS error.');

  // ─── SUMMARY ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log(`🔐 SECURITY AUDIT SUMMARY`);
  console.log('='.repeat(60));
  console.log(`  ✅ PASSED: ${passed}`);
  console.log(`  ❌ FAILED: ${failed}`);
  console.log(`  📊 TOTAL:  ${passed + failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️  FAILED TESTS:');
    results.filter(r => r.result === 'FAIL').forEach(r => {
      console.log(`  ❌ ${r.name}${r.detail ? ' → ' + r.detail : ''}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All security tests passed!');
    process.exit(0);
  }
};

runTests().catch(err => {
  console.error('[FATAL] Test runner error:', err);
  process.exit(1);
});
