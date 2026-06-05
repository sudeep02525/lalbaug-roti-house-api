# Lalbaug Roti House - API Documentation

## Base URL
`http://localhost:5000/api/v1`

## Authentication
Admin endpoints require a Bearer token in the `Authorization` header.
Delivery Boy endpoints require a Bearer token in the `Authorization` header.

---

## 1. Admin Auth & Dashboard

### 1.1 Login Admin
- **URL**: `/admin/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "admin@lalbaugrotihouse.com",
    "password": "password123"
  }
  ```
- **Response**: JWT Token & User Details

### 1.2 Get Dashboard Stats
- **URL**: `/admin/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: totalOrders, todaysOrders, revenue, pendingOrders, deliveredOrders

---

## 2. Catalog (Public Read, Admin Write)

### 2.1 Categories
- **GET** `/catalog/categories` - List categories
- **POST** `/catalog/categories` (Admin) - Create category
- **PUT** `/catalog/categories/:id` (Admin) - Update category
- **DELETE** `/catalog/categories/:id` (Admin) - Delete category

### 2.2 Products
- **GET** `/catalog/products` - List products (query: `?categoryId=`)
- **GET** `/catalog/products/:id` - Get product details with variants
- **POST** `/catalog/products` (Admin) - Create product
- **PUT** `/catalog/products/:id` (Admin) - Update product
- **DELETE** `/catalog/products/:id` (Admin) - Delete product

### 2.3 Variants
- **POST** `/catalog/variants` (Admin) - Create variant for a product
- **PUT** `/catalog/variants/:id` (Admin) - Update variant
- **DELETE** `/catalog/variants/:id` (Admin) - Delete variant

---

## 3. Order (Guest Checkout)

### 3.1 Create Order
- **URL**: `/orders`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "items": [
      {
        "productId": "64abcdef123...",
        "variantId": "64abcdef124...",
        "quantity": 5
      }
    ],
    "address": {
      "customerName": "John Doe",
      "phone": "9876543210",
      "addressLine1": "Flat 101, Build Name",
      "city": "Mumbai",
      "pincode": "400012",
      "latitude": 18.9690,
      "longitude": 72.8311
    },
    "notes": "Less spicy please"
  }
  ```
- **Response**: Order object, `razorpayOrderId`, total amount.

### 3.2 Verify Payment
- **URL**: `/orders/verify-payment`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }
  ```
- **Response**: Updated order details.

### 3.3 Get Order details
- **URL**: `/orders/:id`
- **Method**: `GET`
- **Response**: Order details

### 3.4 Admin Order Routes
- **GET** `/orders` - Get all orders
- **PUT** `/orders/:id/status` - Update order status (PENDING, PREPARING, etc.)
- **PUT** `/orders/:id/assign` - Assign delivery boy `{"deliveryBoyId": "..."}`

---

## 4. Delivery Boy

### 4.1 Admin Controls
- **GET** `/delivery-boy`
- **POST** `/delivery-boy`
- **PUT** `/delivery-boy/:id`
- **DELETE** `/delivery-boy/:id`

### 4.2 App Controls
- **POST** `/delivery-boy/login` - Login delivery boy using phone & password.
- **GET** `/delivery-boy/orders` (Auth: DeliveryBoy) - Get assigned active orders.
- **PUT** `/delivery-boy/orders/:id/deliver` (Auth: DeliveryBoy) - Mark order as DELIVERED.
