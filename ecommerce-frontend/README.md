# ShopEase - React Frontend

A modern, responsive React frontend for the Django ecommerce API.

## Features

- 🎨 Modern, clean UI with Tailwind CSS
- 📱 Fully responsive design
- 🔐 JWT-based authentication
- 🛒 Shopping cart functionality
- 🔍 Product search and filtering
- 💳 Stripe payment integration (ready)
- ⚡ Fast and optimized

## Tech Stack

- **React** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Context API** - State management
- **Stripe** - Payment processing (integration ready)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Django backend running on `http://localhost:8000`

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm start
```

The app will be available at `http://localhost:3000`

### 3. Backend Configuration

Make sure your Django backend is running on `http://localhost:8000`. The API endpoints should be accessible at:

- Authentication: `http://localhost:8000/auth/`
- Products: `http://localhost:8000/api/products/`
- Cart: `http://localhost:8000/api/cart/`
- Orders: `http://localhost:8000/api/orders/`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Header.js       # Navigation header
├── contexts/           # React Context providers
│   ├── AuthContext.js  # Authentication state
│   └── CartContext.js  # Shopping cart state
├── pages/              # Page components
│   ├── Home.js         # Landing page
│   ├── Login.js        # User login
│   ├── Register.js     # User registration
│   ├── Products.js     # Product listing
│   └── Cart.js         # Shopping cart
├── services/           # API service layer
│   └── api.js          # Axios configuration and API calls
├── App.js             # Main app component with routing
└── index.js           # App entry point
```

## Key Features

### Authentication
- User registration and login
- JWT token management with automatic refresh
- Protected routes for authenticated users
- Persistent login state

### Product Catalog
- Browse all products
- Search products by name
- Filter by categories
- Responsive product grid
- Product detail views

### Shopping Cart
- Add/remove items
- Update quantities
- Persistent cart state
- Real-time total calculation
- Empty cart handling

### Modern UI/UX
- Clean, professional design
- Responsive across all devices
- Loading states and error handling
- Smooth transitions and hover effects
- Accessible navigation

## Getting Started with Backend

1. Make sure the Django backend is running:
   ```bash
   cd ../ecommerce_project
   source venv/bin/activate
   python manage.py runserver
   ```

2. The backend should be accessible at `http://localhost:8000`

3. You can create a test user through the frontend registration or use the admin panel at `http://localhost:8000/admin`

## Demo Credentials

Admin user (for backend admin panel):
- Username: `admin`
- Password: `admin123`

You can also register new users through the frontend.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
