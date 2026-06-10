export const Roles = {
  ADMIN: 'ADMIN',
  DELIVERY_BOY: 'DELIVERY_BOY'
};

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

export const DeliverySettings = {
  MINIMUM_ORDER_QUANTITY: 5,
  MAX_DELIVERY_RADIUS_KM: 20
};

export const DeliverySlabs = [
  { maxKm: 3, charge: 20 },
  { maxKm: 5, charge: 30 },
  { maxKm: 8, charge: 50 },
  { maxKm: 12, charge: 70 },
  { maxKm: 20, charge: 100 }
];
