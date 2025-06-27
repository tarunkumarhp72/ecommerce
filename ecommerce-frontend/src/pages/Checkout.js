import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import API from '../services/api';

const Checkout = () => {
  const { cart, isLoading: cartLoading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_country: 'USA'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const initializeStripe = async () => {
      try {
        // Get Stripe publishable key
        const configResponse = await API.get('/stripe/config/');
        setStripePromise(loadStripe(configResponse.data.publishable_key));
      } catch (err) {
        console.error('Error loading Stripe config:', err);
        setError('Failed to initialize payment system');
      }
    };

    initializeStripe();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Pre-fill shipping info with user data if available
    if (user) {
      setShippingInfo({
        shipping_address: user.address || '',
        shipping_city: user.city || '',
        shipping_postal_code: user.postal_code || '',
        shipping_country: user.country || 'USA'
      });
    }
  }, [user]);

  const handleCreateOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!shippingInfo.shipping_address || !shippingInfo.shipping_city || !shippingInfo.shipping_postal_code) {
      setError('Please fill in all shipping information');
      return;
    }

    try {
      setIsLoading(true);
      const response = await API.post('/api/orders/create_order/', shippingInfo);
      
      setClientSecret(response.data.client_secret);
      setCheckoutData({
        orderId: response.data.order_id,
        totalAmount: response.data.amount
      });
      setError('');
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value
    });
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (cartLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-md object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${item.total_price}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${cart.total_price}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information & Payment */}
          <div className="space-y-6">
            {/* Shipping Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="shipping_address"
                    value={shippingInfo.shipping_address}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="shipping_city"
                      value={shippingInfo.shipping_city}
                      onChange={handleShippingChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Anytown"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="shipping_postal_code"
                      value={shippingInfo.shipping_postal_code}
                      onChange={handleShippingChange}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="12345"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    name="shipping_country"
                    value={shippingInfo.shipping_country}
                    onChange={handleShippingChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>

              {!clientSecret && (
                <button
                  onClick={handleCreateOrder}
                  disabled={isLoading}
                  className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Order...' : 'Continue to Payment'}
                </button>
              )}
            </div>

            {/* Payment Form */}
            {clientSecret && stripePromise && (
              <Elements 
                stripe={stripePromise} 
                options={{ clientSecret, appearance }}
              >
                <CheckoutForm
                  clientSecret={clientSecret}
                  orderId={checkoutData.orderId}
                  totalAmount={checkoutData.totalAmount}
                />
              </Elements>
            )}

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
