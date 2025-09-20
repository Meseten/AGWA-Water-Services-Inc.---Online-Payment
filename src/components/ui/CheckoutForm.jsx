import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentFailure, billAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) {
            return;
        }
        setIsProcessing(true);

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
            },
        });

        if (stripeError) {
            if (onPaymentFailure) onPaymentFailure(stripeError.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            if (onPaymentSuccess) onPaymentSuccess(paymentIntent);
        } else {
             if (onPaymentFailure) onPaymentFailure('An unexpected error occurred during payment.');
        }

        setIsProcessing(false);
    };

    const cardElementOptions = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Details
                </label>
                <div className="p-3 border rounded-md bg-white">
                    <CardElement options={cardElementOptions} />
                </div>
            </div>

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
                {isProcessing ? (
                    <><Loader2 className="animate-spin mr-2" /> Processing...</>
                ) : (
                    `Pay ₱${parseFloat(billAmount).toFixed(2)}`
                )}
            </button>
        </form>
    );
};

export default CheckoutForm;