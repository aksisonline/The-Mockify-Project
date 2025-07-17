# EKart API Documentation

## Overview

The EKart API provides e-commerce functionality for the   Mockify platform, allowing users to buy and sell products. It includes seller product management, order processing, and e-commerce operations.

## Base URL

```
/api/ekart
```

## Authentication

Most endpoints require authentication:
- Seller endpoints: Valid session required
- Product management: User must be the product owner
- Order management: User must be the order owner or seller

## Endpoints

### 1. Seller Product Management

#### Get Seller Products

**Endpoint**: `GET /api/ekart/seller/products`

**Description**: Get all products for the authenticated seller.

**Authentication**: Required (Seller)

**Response**:
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "title": "Crestron DM-NVX-350",
      "description": "Professional video distribution system",
      "price": 2500.00,
      "image_url": "https://example.com/image.jpg",
      "category": "Video Distribution",
      "seller_id": "uuid",
      "status": "active",
      "is_active": true,
      "quantity": 5,
      "location": "New York, USA",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### Create Product

**Endpoint**: `POST /api/ekart/seller/products`

**Description**: Create a new product listing.

**Authentication**: Required (Seller)

**Request Body**:
```json
{
  "title": "Crestron DM-NVX-350",
  "description": "Professional video distribution system with 4K support",
  "price": 2500.00,
  "image_url": "https://example.com/image.jpg",
  "category": "Video Distribution"
}
```

**Response**:
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "title": "Crestron DM-NVX-350",
    "description": "Professional video distribution system with 4K support",
    "price": 2500.00,
    "image_url": "https://example.com/image.jpg",
    "category": "Video Distribution",
    "seller_id": "uuid",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Product

**Endpoint**: `PATCH /api/ekart/seller/products`

**Description**: Update an existing product.

**Authentication**: Required (Seller - Product Owner)

**Request Body**:
```json
{
  "id": "uuid",
  "title": "Updated Product Title",
  "description": "Updated product description",
  "price": 2600.00,
  "image_url": "https://example.com/new-image.jpg",
  "category": "Updated Category",
  "status": "inactive"
}
```

**Response**:
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "title": "Updated Product Title",
    "description": "Updated product description",
    "price": 2600.00,
    "image_url": "https://example.com/new-image.jpg",
    "category": "Updated Category",
    "status": "inactive",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Update Product by ID

**Endpoint**: `PATCH /api/ekart/seller/products/[productId]`

**Description**: Update a specific product by ID.

**Authentication**: Required (Seller - Product Owner)

**Request Body**:
```json
{
  "is_active": false,
  "title": "Updated Title",
  "description": "Updated description",
  "price": 2600.00,
  "location": "Los Angeles, USA",
  "quantity": 3
}
```

**Response**:
```json
{
  "success": true
}
```

#### Delete Product

**Endpoint**: `DELETE /api/ekart/seller/products?id=[productId]`

**Description**: Delete a product listing.

**Authentication**: Required (Seller - Product Owner)

**Response**:
```json
{
  "success": true
}
```

#### Delete Product by ID

**Endpoint**: `DELETE /api/ekart/seller/products/[productId]`

**Description**: Delete a specific product by ID.

**Authentication**: Required (Seller - Product Owner)

**Response**:
```json
{
  "success": true
}
```

### 2. Seller Order Management

#### Get Seller Orders

**Endpoint**: `GET /api/ekart/seller/orders`

**Description**: Get all orders for products sold by the authenticated seller.

**Authentication**: Required (Seller)

**Response**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-2024-001",
      "status": "pending",
      "total_amount": 2500.00,
      "shipping_address": "123 Main St, New York, NY 10001",
      "contact_number": "+1234567890",
      "payment_method": "credit_card",
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid",
      "items": [
        {
          "id": "uuid",
          "quantity": 1,
          "price": 2500.00,
          "product": {
            "id": "uuid",
            "title": "Crestron DM-NVX-350",
            "description": "Professional video distribution system",
            "image_url": "https://example.com/image.jpg"
          }
        }
      ],
      "buyer": {
        "id": "uuid",
        "email": "buyer@example.com",
        "name": "John Doe",
        "phone": "+1234567890",
        "avatar_url": "https://example.com/avatar.jpg"
      }
    }
  ]
}
```

#### Update Order Status

**Endpoint**: `PATCH /api/ekart/seller/orders`

**Description**: Update the status of an order.

**Authentication**: Required (Seller)

**Request Body**:
```json
{
  "orderId": "uuid",
  "status": "shipped",
  "updateTransaction": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order status updated successfully"
}
```

### 3. Shopping Cart Management

#### Get Cart Items

**Endpoint**: `GET /api/cart`

**Description**: Get items in the user's shopping cart.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true,
  "cartItems": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 2500.00,
      "total_price": 5000.00,
      "product": {
        "id": "uuid",
        "title": "Crestron DM-NVX-350",
        "description": "Professional video distribution system",
        "image_url": "https://example.com/image.jpg",
        "price": 2500.00
      }
    }
  ],
  "total": 5000.00,
  "itemCount": 2
}
```

#### Add Item to Cart

**Endpoint**: `POST /api/cart`

**Description**: Add a product to the shopping cart.

**Authentication**: Required (User)

**Request Body**:
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Item added to cart",
  "cartItem": {
    "id": "uuid",
    "product_id": "uuid",
    "quantity": 1,
    "unit_price": 2500.00,
    "total_price": 2500.00
  }
}
```

#### Update Cart Item

**Endpoint**: `PUT /api/cart`

**Description**: Update quantity of an item in the cart.

**Authentication**: Required (User)

**Request Body**:
```json
{
  "productId": "uuid",
  "quantity": 3
}
```

**Response**:
```json
{
  "success": true,
  "message": "Cart updated",
  "cartItem": {
    "id": "uuid",
    "quantity": 3,
    "total_price": 7500.00
  }
}
```

#### Remove Item from Cart

**Endpoint**: `DELETE /api/cart?productId=[productId]`

**Description**: Remove an item from the shopping cart.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### Clear Cart

**Endpoint**: `DELETE /api/cart/clear`

**Description**: Clear all items from the shopping cart.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

### 4. Order Management

#### Create Order

**Endpoint**: `POST /api/orders`

**Description**: Create a new order from cart items.

**Authentication**: Required (User)

**Request Body**:
```json
{
  "shipping_address": "123 Main St, New York, NY 10001",
  "contact_number": "+1234567890",
  "payment_method": "credit_card",
  "notes": "Please deliver during business hours"
}
```

**Response**:
```json
{
  "success": true,
  "order": {
    "id": "uuid",
    "order_number": "ORD-2024-001",
    "status": "pending",
    "total_amount": 5000.00,
    "shipping_address": "123 Main St, New York, NY 10001",
    "contact_number": "+1234567890",
    "payment_method": "credit_card",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Order created successfully"
}
```

#### Get User Orders

**Endpoint**: `GET /api/orders`

**Description**: Get all orders for the authenticated user.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true,
  "orders": [
    {
      "id": "uuid",
      "order_number": "ORD-2024-001",
      "status": "pending",
      "total_amount": 5000.00,
      "shipping_address": "123 Main St, New York, NY 10001",
      "contact_number": "+1234567890",
      "payment_method": "credit_card",
      "created_at": "2024-01-01T00:00:00Z",
      "items": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "quantity": 2,
          "unit_price": 2500.00,
          "total_price": 5000.00,
          "product": {
            "id": "uuid",
            "title": "Crestron DM-NVX-350",
            "description": "Professional video distribution system",
            "image_url": "https://example.com/image.jpg"
          }
        }
      ]
    }
  ]
}
```

### 5. Product Catalog

#### Get All Products

**Endpoint**: `GET /api/products`

**Description**: Get all available products with filtering options.

**Authentication**: Not required

**Query Parameters**:
- `category` (optional): Filter by category
- `search` (optional): Search in title and description
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `sort` (optional): Sort by "price", "created_at", "title"
- `order` (optional): Sort order "asc" or "desc"
- `limit` (optional): Number of products (default: 20)
- `page` (optional): Page number (default: 1)

**Response**:
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "title": "Crestron DM-NVX-350",
      "description": "Professional video distribution system",
      "price": 2500.00,
      "image_url": "https://example.com/image.jpg",
      "category": "Video Distribution",
      "seller_id": "uuid",
      "status": "active",
      "is_active": true,
      "quantity": 5,
      "location": "New York, USA",
      "seller": {
        "id": "uuid",
        "full_name": "John Seller",
        "email": "seller@example.com"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Get Product by ID

**Endpoint**: `GET /api/products/[id]`

**Description**: Get detailed information about a specific product.

**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "product": {
    "id": "uuid",
    "title": "Crestron DM-NVX-350",
    "description": "Professional video distribution system with 4K support",
    "price": 2500.00,
    "image_url": "https://example.com/image.jpg",
    "category": "Video Distribution",
    "seller_id": "uuid",
    "status": "active",
    "is_active": true,
    "quantity": 5,
    "location": "New York, USA",
    "seller": {
      "id": "uuid",
      "full_name": "John Seller",
      "email": "seller@example.com",
      "phone": "+1234567890"
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

## Data Validation

### Product Validation Rules

- **title**: Required, maximum 255 characters
- **description**: Required, maximum 1000 characters
- **price**: Required, must be positive number
- **image_url**: Required, must be valid URL
- **category**: Required, maximum 100 characters
- **quantity**: Optional, must be positive integer
- **location**: Optional, maximum 255 characters

### Order Validation Rules

- **shipping_address**: Required, maximum 500 characters
- **contact_number**: Required, valid phone number format
- **payment_method**: Required, must be "credit_card", "paypal", or "bank_transfer"
- **status**: Must be "pending", "processing", "shipped", "delivered", or "cancelled"

### Cart Validation Rules

- **productId**: Required, valid UUID
- **quantity**: Required, must be positive integer
- **unit_price**: Must be positive number

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized - Authentication required |
| `403` | Forbidden - Access denied |
| `400` | Bad Request - Invalid input data |
| `404` | Not Found - Product or order not found |
| `409` | Conflict - Product already in cart |
| `500` | Internal Server Error - Server error |

## Rate Limiting

- **Standard endpoints**: 100 requests per minute per user
- **Product creation**: 10 requests per minute per seller
- **Order creation**: 5 requests per minute per user
- **Cart operations**: 50 requests per minute per user

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get seller products
const getSellerProducts = async () => {
  const response = await fetch('/api/ekart/seller/products', {
    credentials: 'include'
  });
  return response.json();
};

// Create a product
const createProduct = async (productData) => {
  const response = await fetch('/api/ekart/seller/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(productData)
  });
  return response.json();
};

// Get seller orders
const getSellerOrders = async () => {
  const response = await fetch('/api/ekart/seller/orders', {
    credentials: 'include'
  });
  return response.json();
};

// Update order status
const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetch('/api/ekart/seller/orders', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ orderId, status })
  });
  return response.json();
};

// Add item to cart
const addToCart = async (productId: string, quantity: number) => {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productId, quantity })
  });
  return response.json();
};

// Create order
const createOrder = async (orderData) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(orderData)
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get seller products
curl -X GET "https://mockify.vercel.app/api/ekart/seller/products" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Create a product
curl -X POST "https://mockify.vercel.app/api/ekart/seller/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "title": "Crestron DM-NVX-350",
    "description": "Professional video distribution system",
    "price": 2500.00,
    "image_url": "https://example.com/image.jpg",
    "category": "Video Distribution"
  }'

# Update order status
curl -X PATCH "https://mockify.vercel.app/api/ekart/seller/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "orderId": "uuid",
    "status": "shipped"
  }'

# Add item to cart
curl -X POST "https://mockify.vercel.app/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "productId": "uuid",
    "quantity": 1
  }'

# Create order
curl -X POST "https://mockify.vercel.app/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "shipping_address": "123 Main St, New York, NY 10001",
    "contact_number": "+1234567890",
    "payment_method": "credit_card"
  }'
```

## Features

### Seller Management
- Product listing and management
- Order tracking and status updates
- Inventory management
- Sales analytics and reporting

### Shopping Experience
- Product catalog with filtering and search
- Shopping cart functionality
- Secure checkout process
- Order tracking and history

### Order Processing
- Multi-step order workflow
- Status tracking and updates
- Email notifications
- Transaction management

### Security
- User authentication and authorization
- Product ownership verification
- Secure payment processing
- Data validation and sanitization

## Notes

- All seller operations require product ownership verification
- Cart items are automatically cleared after order creation
- Order status changes trigger email notifications
- Product quantities are automatically updated on purchase
- Seller can only manage orders for their own products
- All monetary values are stored as decimals for precision 