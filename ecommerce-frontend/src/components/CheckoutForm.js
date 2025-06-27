import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#424770',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146'
    }
  }
};

const CheckoutForm = ({ clientSecret, orderId, totalAmount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError('');

    const cardNumberElement = elements.getElement(CardNumberElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: 'Customer Name', // You can get this from user profile
            },
          }
        }
      );

      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        
        // Optional: Confirm payment on backend
        try {
          await API.post(`/orders/${orderId}/confirm_payment/`, {
            payment_intent_id: paymentIntent.id
          });
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
        }

        if (onSuccess) {
          onSuccess(paymentIntent);
        }
        
        // Redirect to success page
        navigate('/order-success', { 
          state: { 
            orderId, 
            paymentIntentId: paymentIntent.id,
            amount: totalAmount 
          } 
        });
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center p-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Successful!</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your payment has been processed successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Number
            </label>
            <div className="p-3 border border-gray-300 rounded-md">
              <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <div className="p-3 border border-gray-300 rounded-md">
                <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVC
              </label>
              <div className="p-3 border border-gray-300 rounded-md">
                <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total: ${totalAmount}
          </div>
          
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : `Pay $${totalAmount}`}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;
