# Django Ecommerce REST API

A complete ecommerce REST API built with Django, Django REST Framework, and Stripe integration for payments.

## Features

- User registration and authentication (JWT tokens)
- Product catalog with categories
- Shopping cart functionality
- Order management
- Stripe payment integration
- Admin interface for managing products and orders

## Setup Instructions

### 1. Environment Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ecommerce_project

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the project root and configure the following variables:

```bash
DEBUG=True
SECRET_KEY=your-secret-key-here-change-this-in-production
DATABASE_URL=sqlite:///db.sqlite3

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration (for user registration)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=localhost
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Populate sample data
python manage.py populate_data
```

### 4. Running the Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication

- `POST /auth/users/` - User registration
- `POST /auth/jwt/create/` - Login (get JWT tokens)
- `POST /auth/jwt/refresh/` - Refresh JWT token
- `GET /auth/users/me/` - Get current user profile

### Categories

- `GET /api/categories/` - List all categories
- `GET /api/categories/{id}/` - Get category by ID

### Products

- `GET /api/products/` - List all products
  - Query parameters: `?category=1&search=iphone`
- `GET /api/products/{id}/` - Get product by ID

### Cart

- `GET /api/cart/current/` - Get current user's cart
- `POST /api/cart/add_item/` - Add item to cart
- `PATCH /api/cart/update_item/` - Update cart item quantity
- `DELETE /api/cart/remove_item/` - Remove item from cart
- `DELETE /api/cart/clear/` - Clear entire cart

### Orders

- `GET /api/orders/` - List user's orders
- `GET /api/orders/{id}/` - Get order details
- `POST /api/orders/create_order/` - Create new order
- `POST /api/orders/{id}/confirm_payment/` - Confirm payment

## API Usage Examples

### 1. User Registration

```bash
curl -X POST http://localhost:8000/auth/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8000/auth/jwt/create/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Get Products

```bash
curl -X GET http://localhost:8000/api/products/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Add Item to Cart

```bash
curl -X POST http://localhost:8000/api/cart/add_item/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "product_id": 1,
    "quantity": 2
  }'
```

### 5. Create Order

```bash
curl -X POST http://localhost:8000/api/orders/create_order/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "shipping_address": "123 Main St",
    "shipping_city": "New York",
    "shipping_postal_code": "10001",
    "shipping_country": "USA"
  }'
```

Response:
```json
{
  "order_id": 1,
  "client_secret": "pi_1234567890_secret_1234567890",
  "amount": 159.98
}
```

## Stripe Payment Integration

### Frontend Integration

Use the `client_secret` from the order creation response to complete payment on the frontend using Stripe Elements.

Example JavaScript:
```javascript
const stripe = Stripe('pk_test_your_publishable_key_here');

// After creating order
const response = await fetch('/api/orders/create_order/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify(orderData)
});

const { client_secret, order_id } = await response.json();

// Confirm payment
const result = await stripe.confirmCardPayment(client_secret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer Name'
    }
  }
});

if (result.error) {
  // Handle payment error
} else {
  // Payment succeeded
  // Confirm payment on backend
  await fetch(`/api/orders/${order_id}/confirm_payment/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      payment_intent_id: result.paymentIntent.id
    })
  });
}
```

## Admin Interface

Access the admin interface at `http://localhost:8000/admin/` using the superuser credentials to:

- Manage categories and products
- View and update orders
- Monitor user activity
- Update order statuses

## Project Structure

```
ecommerce_project/
├── ecommerce/                 # Project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── ecommerce_app/             # Main application
│   ├── models.py              # Database models
│   ├── serializers.py         # API serializers
│   ├── views.py               # API views
│   ├── urls.py                # URL routing
│   ├── admin.py               # Admin configuration
│   └── management/            # Custom management commands
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── README.md                  # This file
```

## Models

### Category
- name
- created_at, updated_at

### Product
- name, description
- price, stock
- category (ForeignKey)
- image (ImageField)
- is_active
- created_at, updated_at

### Cart
- user (OneToOneField)
- created_at, updated_at

### CartItem
- cart (ForeignKey)
- product (ForeignKey)
- quantity

### Order
- user (ForeignKey)
- status (pending, processing, shipped, delivered, cancelled)
- total_amount
- is_paid
- stripe_payment_intent
- shipping information
- created_at, updated_at

### OrderItem
- order (ForeignKey)
- product (ForeignKey)
- quantity, price

## Security Considerations

1. **Environment Variables**: Never commit sensitive data like API keys to version control
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure CORS settings for your frontend domain
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: All inputs are validated through serializers

## Production Deployment

1. Set `DEBUG=False` in production
2. Use a production database (PostgreSQL recommended)
3. Configure proper CORS settings
4. Set up proper logging
5. Use environment variables for all sensitive configuration
6. Implement proper backup strategies

## Support

For questions or issues, please create an issue in the repository or contact the development team.
