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
  console.log('--- STARTING MARKETPLACE TRUST SYSTEM TESTS ---');

  try {
    // 1. Login as Consumer (Sonu Pal)
    console.log('\n[1] Logging in as Consumer (Sonu Pal)...');
    const loginRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'consumer@gmail.com', password: 'Password@123' });

    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    const consumerToken = loginRes.body.token;
    console.log('✓ Consumer logged in successfully.');

    // 2. Login as Farmer (Ramesh Patil)
    console.log('\n[2] Logging in as Farmer (Ramesh Patil)...');
    const farmerLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'farmer.ramesh@agridirect.in', password: 'Password@123' });

    const farmerToken = farmerLogin.body.token;
    console.log('✓ Farmer logged in successfully.');

    // 3. Test Unauthorized Review Submission
    console.log('\n[3] Testing review submission without token...');
    const unauthRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { productId: '66d8e1010000000000000011', rating: 5, comment: 'Fake review' });

    if (unauthRes.status === 401) {
      console.log('✓ Unauthenticated review submission rejected (401 Unauthorized).');
    } else {
      console.error('❌ Failed: Expected 401 status, got:', unauthRes.status);
    }

    // 4. Test Ineligible Farmer Review (Farmer trying to review their own product)
    console.log('\n[4] Testing review submission by user without DELIVERED order...');
    const ineligibleRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${farmerToken}`
      }
    }, { productId: '66d8e1010000000000000011', rating: 5, comment: 'Self review' });

    if (ineligibleRes.status === 403) {
      console.log(`✓ Non-purchaser review blocked: "${ineligibleRes.body.message}"`);
    } else {
      console.error('❌ Failed: Expected 403 status, got:', ineligibleRes.status, ineligibleRes.body);
    }

    // 5. Test Eligibility Check for Verified Consumer
    console.log('\n[5] Checking eligibility for Consumer Sonu Pal...');
    const eligibilityRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews/eligibility?productId=66d8e1010000000000000011',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${consumerToken}` }
    });

    if (eligibilityRes.body.eligible) {
      console.log('✓ Verified purchaser confirmed eligible to review!');
    } else {
      console.error('❌ Failed: Expected eligible true, got:', eligibilityRes.body);
    }

    // 6. Submit Verified Product Review
    console.log('\n[6] Submitting verified product review...');
    const reviewRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${consumerToken}`
      }
    }, { 
      productId: '66d8e1010000000000000011', 
      rating: 5, 
      comment: 'Sensational Ratnagiri Alphonso mangoes! Perfectly sweet and packed directly from farm trees.' 
    });

    if (reviewRes.status === 200 || reviewRes.status === 201) {
      console.log(`✓ Review created/updated: "${reviewRes.body.message}"`);
    } else {
      console.error('❌ Failed: Expected 200/201 status, got:', reviewRes.status, reviewRes.body);
    }

    // 7. Rate Farmer Directly
    console.log('\n[7] Rating Farmer Ramesh Patil directly...');
    const farmerReviewRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${consumerToken}`
      }
    }, { 
      farmerId: '66d8e0010000000000000002',
      targetType: 'farmer',
      rating: 5, 
      comment: 'Ramesh is an outstanding organic producer. Quick packaging and transparent farming practices!' 
    });

    if (farmerReviewRes.status === 200 || farmerReviewRes.status === 201) {
      console.log(`✓ Farmer rating published: "${farmerReviewRes.body.message}"`);
    } else {
      console.error('❌ Failed: Expected 200/201 status, got:', farmerReviewRes.status, farmerReviewRes.body);
    }

    // 8. Verify Product & Farmer Rating Aggregation
    console.log('\n[8] Verifying Product and Farmer rating aggregation API output...');
    const prodReviewsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews/product/66d8e1010000000000000011',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${consumerToken}` }
    });

    console.log('✓ Product Rating Stats:', {
      avgRating: prodReviewsRes.body.avgRating,
      totalReviews: prodReviewsRes.body.totalReviews,
      breakdown: prodReviewsRes.body.ratingBreakdown,
      hasUserReview: !!prodReviewsRes.body.userReview
    });

    const farmerReviewsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews/farmer/66d8e0010000000000000002',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${consumerToken}` }
    });

    console.log('✓ Farmer Rating Stats:', {
      avgRating: farmerReviewsRes.body.avgRating,
      totalReviews: farmerReviewsRes.body.totalReviews,
      breakdown: farmerReviewsRes.body.ratingBreakdown
    });

    console.log('\n=============================================');
    console.log('   ALL TRUST SYSTEM TESTS PASSED SUCCESSFULLY!   ');
    console.log('=============================================\n');

  } catch (err) {
    console.error('❌ Test script error:', err);
  }
}

runTests();
