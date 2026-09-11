// Explicit Order State Machine for KrishiDirect Order Management System

const ORDER_STATES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  DISPUTED: 'DISPUTED'
};

// Normalize status string (support legacy lowercase strings)
const normalizeStatus = (status) => {
  if (!status) return ORDER_STATES.PENDING;
  const upper = status.toString().toUpperCase();
  const mapping = {
    'PENDING': ORDER_STATES.PENDING,
    'CONFIRMED': ORDER_STATES.CONFIRMED,
    'ACCEPTED': ORDER_STATES.CONFIRMED,
    'PREPARING': ORDER_STATES.PREPARING,
    'PACKING': ORDER_STATES.PREPARING,
    'READY_FOR_DELIVERY': ORDER_STATES.READY_FOR_DELIVERY,
    'READY': ORDER_STATES.READY_FOR_DELIVERY,
    'OUT_FOR_DELIVERY': ORDER_STATES.OUT_FOR_DELIVERY,
    'DELIVERED': ORDER_STATES.DELIVERED,
    'CANCELLED': ORDER_STATES.CANCELLED,
    'REJECTED': ORDER_STATES.REJECTED,
    'DISPUTED': ORDER_STATES.DISPUTED
  };
  return mapping[upper] || upper;
};

// Allowed State Machine Transitions
const ALLOWED_TRANSITIONS = {
  [ORDER_STATES.PENDING]: [
    ORDER_STATES.CONFIRMED, 
    ORDER_STATES.REJECTED, 
    ORDER_STATES.CANCELLED
  ],
  [ORDER_STATES.CONFIRMED]: [
    ORDER_STATES.PREPARING, 
    ORDER_STATES.CANCELLED
  ],
  [ORDER_STATES.PREPARING]: [
    ORDER_STATES.READY_FOR_DELIVERY, 
    ORDER_STATES.CANCELLED
  ],
  [ORDER_STATES.READY_FOR_DELIVERY]: [
    ORDER_STATES.OUT_FOR_DELIVERY, 
    ORDER_STATES.CANCELLED
  ],
  [ORDER_STATES.OUT_FOR_DELIVERY]: [
    ORDER_STATES.DELIVERED, 
    ORDER_STATES.DISPUTED, 
    ORDER_STATES.CANCELLED
  ],
  [ORDER_STATES.DELIVERED]: [
    ORDER_STATES.DISPUTED
  ],
  [ORDER_STATES.DISPUTED]: [
    ORDER_STATES.DELIVERED, // Admin resolves dispute, closing claim
    ORDER_STATES.CANCELLED  // Admin resolves dispute with refund/cancellation
  ],
  [ORDER_STATES.CANCELLED]: [],
  [ORDER_STATES.REJECTED]: []
};

// Check if transition is valid according to state machine rules
const isValidTransition = (currentStatus, targetStatus) => {
  const current = normalizeStatus(currentStatus);
  const target = normalizeStatus(targetStatus);

  if (current === target) return true; // Idempotent

  const allowed = ALLOWED_TRANSITIONS[current] || [];
  return allowed.includes(target);
};

// Role-based state transition permissions check
const canRolePerformTransition = (role, currentStatus, targetStatus) => {
  const current = normalizeStatus(currentStatus);
  const target = normalizeStatus(targetStatus);

  if (!isValidTransition(current, target)) {
    return { valid: false, reason: `Invalid order state transition from ${current} to ${target}.` };
  }

  if (role === 'admin') {
    return { valid: true };
  }

  if (role === 'consumer') {
    if (target === ORDER_STATES.CANCELLED) {
      if ([ORDER_STATES.PENDING, ORDER_STATES.CONFIRMED].includes(current)) {
        return { valid: true };
      }
      return { valid: false, reason: `Consumers can only cancel orders while in PENDING or CONFIRMED state.` };
    }
    if (target === ORDER_STATES.DISPUTED) {
      if ([ORDER_STATES.DELIVERED, ORDER_STATES.OUT_FOR_DELIVERY].includes(current)) {
        return { valid: true };
      }
      return { valid: false, reason: `Disputes can only be raised for DELIVERED or OUT_FOR_DELIVERY orders.` };
    }
    return { valid: false, reason: `Consumers are not authorized to transition order state to ${target}.` };
  }

  if (role === 'farmer') {
    if (target === ORDER_STATES.REJECTED) {
      if (current === ORDER_STATES.PENDING) return { valid: true };
      return { valid: false, reason: `Farmers can only reject orders while in PENDING state.` };
    }
    if (target === ORDER_STATES.CONFIRMED && current === ORDER_STATES.PENDING) return { valid: true };
    if (target === ORDER_STATES.PREPARING && current === ORDER_STATES.CONFIRMED) return { valid: true };
    if (target === ORDER_STATES.READY_FOR_DELIVERY && current === ORDER_STATES.PREPARING) return { valid: true };
    if (target === ORDER_STATES.OUT_FOR_DELIVERY && current === ORDER_STATES.READY_FOR_DELIVERY) return { valid: true };
    if (target === ORDER_STATES.DELIVERED && current === ORDER_STATES.OUT_FOR_DELIVERY) return { valid: true };
    if (target === ORDER_STATES.CANCELLED && [ORDER_STATES.PENDING, ORDER_STATES.CONFIRMED, ORDER_STATES.PREPARING, ORDER_STATES.READY_FOR_DELIVERY].includes(current)) {
      return { valid: true };
    }
    return { valid: false, reason: `Farmers are not authorized to transition order from ${current} to ${target}.` };
  }

  return { valid: false, reason: `Unauthorized role ${role}.` };
};

module.exports = {
  ORDER_STATES,
  normalizeStatus,
  isValidTransition,
  canRolePerformTransition,
  ALLOWED_TRANSITIONS
};
