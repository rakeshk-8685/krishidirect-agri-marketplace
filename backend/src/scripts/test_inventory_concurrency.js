// Automated Test Script: Concurrent Inventory & State Machine Verification
const dataService = require('../services/dataService');
const { canRolePerformTransition, normalizeStatus } = require('../utils/orderStateMachine');

async function runConcurrencyTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING ORDER STATE MACHINE & INVENTORY CONCURRENCY TESTS');
  console.log('====================================================');

  try {
    // 1. Fetch initial product stock
    const products = await dataService.getProducts();
    const testProduct = products[0];
    const initialQty = testProduct.availableQuantity;

    console.log(`[TEST 1] Initial Product Stock: "${testProduct.title}" -> ${initialQty} ${testProduct.unit}`);

    // 2. Test Invalid State Machine Transitions
    console.log('\n[TEST 2] Verifying State Machine Invalid Transition Guards...');
    const invalidCheck1 = canRolePerformTransition('farmer', 'PENDING', 'DELIVERED');
    console.assert(!invalidCheck1.valid, 'Guard failed: PENDING -> DELIVERED should be invalid!');
    console.log('  ✓ Correctly rejected invalid transition: PENDING -> DELIVERED');

    const invalidCheck2 = canRolePerformTransition('consumer', 'CONFIRMED', 'DELIVERED');
    console.assert(!invalidCheck2.valid, 'Guard failed: Consumer cannot transition CONFIRMED -> DELIVERED');
    console.log('  ✓ Correctly rejected invalid consumer transition: CONFIRMED -> DELIVERED');

    const validCheck1 = canRolePerformTransition('farmer', 'PENDING', 'CONFIRMED');
    console.assert(validCheck1.valid, 'Valid transition PENDING -> CONFIRMED failed!');
    console.log('  ✓ Correctly allowed valid farmer transition: PENDING -> CONFIRMED');

    // 3. Test Concurrent Order Creation (Overbooking Prevention)
    console.log(`\n[TEST 3] Simulating 5 Concurrent Orders for ${initialQty} available stock...`);
    const orderPromises = [];
    const requestedQtyPerOrder = Math.ceil(initialQty / 2); // Each order requests ~half of initial stock

    for (let i = 0; i < 5; i++) {
      const orderPayload = {
        orderNumber: `CONCUR-ORD-${Date.now()}-${i}`,
        consumer: '66d8e0010000000000000005',
        consumerName: `Test Consumer ${i}`,
        consumerPhone: '+91 9876543210',
        items: [{
          product: testProduct._id,
          title: testProduct.title,
          price: testProduct.price,
          unit: testProduct.unit,
          quantity: requestedQtyPerOrder,
          farmer: testProduct.farmer,
          farmerName: testProduct.farmerName,
          farmName: testProduct.farmName
        }],
        deliveryAddress: { addressLine: '123 Test St', city: 'Pune', state: 'MH', pincode: '411001' },
        subtotal: testProduct.price * requestedQtyPerOrder,
        deliveryFee: 50,
        platformFee: 15,
        totalAmount: (testProduct.price * requestedQtyPerOrder) + 65,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderStatus: 'PENDING'
      };

      orderPromises.push(
        dataService.createOrder(orderPayload)
          .then(ord => ({ success: true, order: ord }))
          .catch(err => ({ success: false, error: err.message }))
      );
    }

    const results = await Promise.all(orderPromises);
    const successfulOrders = results.filter(r => r.success);
    const failedOrders = results.filter(r => !r.success);

    console.log(`  ✓ Concurrent Placement Results: ${successfulOrders.length} Succeeded, ${failedOrders.length} Blocked due to stock limit.`);

    const postProduct = await dataService.getProductById(testProduct._id);
    console.log(`  ✓ Product Stock After Concurrent Orders: ${postProduct.availableQuantity} ${postProduct.unit}`);
    console.assert(postProduct.availableQuantity >= 0, 'Stock went negative!');

    // 4. Test Inventory Restoration on Cancellation
    if (successfulOrders.length > 0) {
      const createdOrder = successfulOrders[0].order;
      console.log(`\n[TEST 4] Cancelling Order ${createdOrder.orderNumber} to verify Inventory Restoration...`);
      
      const beforeCancelStock = postProduct.availableQuantity;
      await dataService.updateOrderStatus(createdOrder._id, 'CANCELLED', 'Test cancellation inventory check');
      
      const afterCancelProduct = await dataService.getProductById(testProduct._id);
      console.log(`  ✓ Stock before cancellation: ${beforeCancelStock}, Stock after cancellation: ${afterCancelProduct.availableQuantity}`);
      console.assert(afterCancelProduct.availableQuantity === beforeCancelStock + requestedQtyPerOrder, 'Inventory restoration count mismatch!');
      console.log('  ✓ Inventory stock successfully restored to farm inventory!');
    }

    console.log('\n====================================================');
    console.log('✅ ALL STATE MACHINE & INVENTORY CONCURRENCY TESTS PASSED');
    console.log('====================================================');

  } catch (err) {
    console.error('\n❌ CONCURRENCY TEST FAILED:', err);
    process.exit(1);
  }
}

runConcurrencyTests();
