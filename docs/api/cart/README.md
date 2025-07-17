# Cart API Documentation

## Overview

The Cart API provides shopping cart functionality for the   Mockify e-commerce platform. It allows users to add, update, and manage items in their shopping cart before checkout.

## Base URL

```
/api/cart
```

## Authentication

All cart endpoints require user authentication:
- Valid session required
- Cart is user-specific
- Items persist across browser sessions

## Endpoints

### 1. Cart Management

#### Get Cart Items

**Endpoint**: `GET /api/cart`

**Description**: Retrieve all items in the user's shopping cart.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true,
  "cartItems": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 2500.00,
      "total_price": 5000.00,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z",
      "product": {
        "id": "uuid",
        "title": "Crestron DM-NVX-350",
        "description": "Professional video distribution system",
        "image_url": "https://example.com/image.jpg",
        "price": 2500.00,
        "category": "Video Distribution",
        "seller": {
          "id": "uuid",
          "full_name": "John Seller",
          "email": "seller@example.com"
        }
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
    "user_id": "uuid",
    "product_id": "uuid",
    "quantity": 1,
    "unit_price": 2500.00,
    "total_price": 2500.00,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Cart Item

**Endpoint**: `PUT /api/cart`

**Description**: Update the quantity of an item in the cart.

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
    "total_price": 7500.00,
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

#### Remove Item from Cart

**Endpoint**: `DELETE /api/cart?productId=[productId]`

**Description**: Remove a specific item from the shopping cart.

**Authentication**: Required (User)

**Query Parameters**:
- `productId` (required): ID of the product to remove

**Response**:
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### Clear Cart

**Endpoint**: `DELETE /api/cart/clear`

**Description**: Remove all items from the shopping cart.

**Authentication**: Required (User)

**Response**:
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

## Data Validation

### Cart Item Validation Rules

- **productId**: Required, must be valid UUID and exist in products table
- **quantity**: Required, must be positive integer, minimum 1
- **unit_price**: Automatically calculated from product price
- **total_price**: Automatically calculated (quantity × unit_price)

### Product Validation Rules

- **Product existence**: Product must exist and be active
- **Stock availability**: Product must have sufficient quantity
- **Seller verification**: Product must be from a valid seller

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Unauthorized - Authentication required |
| `400` | Bad Request - Invalid input data |
| `404` | Not Found - Product not found |
| `409` | Conflict - Product already in cart |
| `422` | Unprocessable Entity - Insufficient stock |
| `500` | Internal Server Error - Server error |

## Rate Limiting

- **Standard operations**: 50 requests per minute per user
- **Add to cart**: 20 requests per minute per user
- **Update operations**: 30 requests per minute per user

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get cart items
const getCartItems = async () => {
  const response = await fetch('/api/cart', {
    credentials: 'include'
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

// Update cart item quantity
const updateCartItem = async (productId: string, quantity: number) => {
  const response = await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productId, quantity })
  });
  return response.json();
};

// Remove item from cart
const removeFromCart = async (productId: string) => {
  const response = await fetch(`/api/cart?productId=${productId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
};

// Clear entire cart
const clearCart = async () => {
  const response = await fetch('/api/cart/clear', {
    method: 'DELETE',
    credentials: 'include'
  });
  return response.json();
};
```

### cURL Examples

```bash
# Get cart items
curl -X GET "https://mockify.vercel.app/api/cart" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Add item to cart
curl -X POST "https://mockify.vercel.app/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "productId": "uuid",
    "quantity": 1
  }'

# Update cart item
curl -X PUT "https://mockify.vercel.app/api/cart" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "productId": "uuid",
    "quantity": 3
  }'

# Remove item from cart
curl -X DELETE "https://mockify.vercel.app/api/cart?productId=uuid" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Clear cart
curl -X DELETE "https://mockify.vercel.app/api/cart/clear" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Database Schema

### `cart_items` Table
```sql
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Indexes for performance
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
```

## Features

### Cart Management
- Add products to cart with quantity
- Update item quantities
- Remove individual items
- Clear entire cart
- Persistent cart across sessions

### Product Information
- Full product details in cart items
- Seller information
- Real-time pricing
- Stock availability checking

### User Experience
- Automatic price calculations
- Quantity validation
- Duplicate item handling
- Cart total calculations

### Security
- User-specific cart isolation
- Authentication required for all operations
- Input validation and sanitization
- SQL injection prevention

## Business Logic

### Adding Items to Cart

1. **Validation**:
   - Check if user is authenticated
   - Verify product exists and is active
   - Check stock availability
   - Validate quantity

2. **Processing**:
   - If item already exists, update quantity
   - If new item, create cart entry
   - Calculate total price
   - Update cart totals

3. **Response**:
   - Return updated cart item
   - Include success message
   - Provide error details if validation fails

### Updating Cart Items

1. **Validation**:
   - Verify item exists in user's cart
   - Check new quantity is valid
   - Verify stock availability

2. **Processing**:
   - Update quantity and total price
   - Recalculate cart totals
   - Update timestamp

3. **Response**:
   - Return updated item details
   - Include success confirmation

### Removing Items

1. **Validation**:
   - Verify item exists in user's cart
   - Check user ownership

2. **Processing**:
   - Remove item from cart
   - Recalculate cart totals
   - Update cart metadata

3. **Response**:
   - Confirm removal
   - Return updated cart state

## Integration with Other APIs

### Product API Integration
- Cart items include full product information
- Real-time price updates
- Stock availability checking
- Seller information display

### Order API Integration
- Cart items are converted to order items
- Cart is cleared after successful order creation
- Order totals calculated from cart

### User API Integration
- Cart is user-specific
- User authentication required
- Profile information for shipping

## Notes

- Cart items are automatically removed when products are deleted
- Cart is cleared after successful order placement
- Quantities are validated against product stock
- Prices are calculated in real-time from product data
- Cart persists across browser sessions
- Maximum quantity limits may apply based on stock
- Cart items include seller information for multi-seller orders 