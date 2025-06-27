import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
          <Link
            to="/login"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      await removeFromCart(itemId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H19M7 13v6a1 1 0 001 1h9a1 1 0 001-1v-6M7 13H5"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start shopping to add items to your cart.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow rounded-lg">
              <ul className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <li key={item.id} className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-20 w-20 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-md bg-gray-200 flex items-center justify-center">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="ml-6 flex-1">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              <Link to={`/products/${item.product.id}`} className="hover:text-primary-600">
                                {item.product.name}
                              </Link>
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">{item.product.category_name}</p>
                            <p className="mt-1 text-sm text-gray-600">{item.product.description}</p>
                          </div>

                          <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                            <p className="text-lg font-medium text-gray-900">
                              ${item.product.price}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Total: ${item.total_price}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <label htmlFor={`quantity-${item.id}`} className="sr-only">
                              Quantity, {item.product.name}
                            </label>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="mx-3 text-gray-900 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>${cart.total_price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${cart.total_price}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Proceed to Checkout
              </button>

              <div className="mt-4 text-center">
                <Link
                  to="/products"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
