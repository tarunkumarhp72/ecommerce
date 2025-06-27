import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { orderId, paymentIntentId, amount } = location.state || {};

  if (!orderId) {
    // Redirect if no order data
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Thank you for your order. Your payment has been processed successfully.
        </p>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{orderId}</span>
            </div>
            {paymentIntentId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium text-xs">{paymentIntentId}</span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">${amount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            View My Orders
          </button>
          
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-gray-200 text-gray-900 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          You will receive an email confirmation shortly with your order details.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
