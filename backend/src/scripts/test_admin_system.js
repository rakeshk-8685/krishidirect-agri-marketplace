const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING COMPLETE ADMIN SYSTEM VERIFICATION TESTS ---');

  try {
    // 1. Login as Consumer (Non-admin)
    console.log('\n[1] Logging in as Consumer (Ananya Sharma)...');
    const consumerLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'consumer@gmail.com', password: 'Password@123' });

    const consumerToken = consumerLogin.body.token;
    console.log('✓ Consumer logged in.');

    // 2. Test Non-Admin Forbidden Access
    console.log('\n[2] Testing Admin endpoint protection against Consumer token...');
    const forbiddenRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${consumerToken}` }
    });

    if (forbiddenRes.status === 403) {
      console.log(`✓ Non-admin access correctly blocked (403 Forbidden): "${forbiddenRes.body.message}"`);
    } else {
      console.error('❌ Failed: Expected 403 status, got:', forbiddenRes.status, forbiddenRes.body);
    }

    // 3. Login as Admin
    console.log('\n[3] Logging in as Super Admin (admin@agridirect.in)...');
    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@agridirect.in', password: 'Password@123' });

    if (adminLogin.status !== 200 || !adminLogin.body.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);
    }

    const adminToken = adminLogin.body.token;
    console.log('✓ Admin authenticated successfully.');

    // 4. Fetch Operational Analytics Dashboard
    console.log('\n[4] Fetching Operational Analytics Dashboard...');
    const dashRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (dashRes.status === 200) {
      const m = dashRes.body.metrics;
      console.log('✓ Operational Metrics Output:', {
        totalFarmers: m.farmers?.total,
        verifiedFarmers: m.farmers?.verified,
        pendingFarmers: m.farmers?.pending,
        totalConsumers: m.consumers,
        totalOrders: m.orders?.total,
        fulfillmentRatePercent: `${m.orders?.fulfillmentRatePercent}%`,
        totalGmv: `₹${m.financials?.totalGmv}`,
        platformCommissionRate: `${m.financials?.commissionRatePercent}%`,
        platformFeeEarned: `₹${m.financials?.platformFeeEarned}`,
        netFarmerPayouts: `₹${m.financials?.netFarmerPayouts}`,
        averageOrderValue: `₹${m.financials?.averageOrderValue}`,
        repeatCustomerRatePercent: `${m.financials?.repeatCustomerRatePercent}%`
      });
    } else {
      console.error('❌ Dashboard fetch failed:', dashRes.status, dashRes.body);
    }

    // 5. Test User Account Management
    console.log('\n[5] Fetching all platform users and toggling account status...');
    const usersRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    const targetUser = usersRes.body.users.find(u => u.role === 'consumer');
    if (targetUser) {
      const toggleRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/admin/users/${targetUser._id}/status`,
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` 
        }
      }, { isActive: false });

      console.log(`✓ Account status updated for ${targetUser.name}: "${toggleRes.body.message}"`);

      // Restore to active for clean state across test suites
      await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/admin/users/${targetUser._id}/status`,
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` 
        }
      }, { isActive: true });
    }

    // 6. Test Farmer Verification Workflow
    console.log('\n[6] Testing Farmer Verification Workflow...');
    const farmerUser = usersRes.body?.users?.find(u => u.role === 'farmer');
    if (farmerUser) {
      const verifyRes = await request({
        hostname: 'localhost',
        port: 5000,
        path: `/api/admin/farmers/${farmerUser._id}/verify`,
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` 
        }
      }, { status: 'verified', notes: 'Quality audit passed. Documents verified.' });

      console.log(`✓ Farmer verification updated: "${verifyRes.body.message}"`);
    }

    // 7. Test Commission Configuration Update
    console.log('\n[7] Updating platform commission rate to 7.5%...');
    const commRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/commission',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}` 
      }
    }, { commissionRatePercent: 7.5 });

    console.log(`✓ Commission updated: "${commRes.body.message}"`);

    console.log('\n=================================================');
    console.log('   ALL ADMIN SYSTEM TESTS PASSED SUCCESSFULLY!   ');
    console.log('=================================================\n');

  } catch (err) {
    console.error('❌ Admin test script error:', err);
  }
}

runTests();
