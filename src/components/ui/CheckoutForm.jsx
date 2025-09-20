import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, CreditCard } from "lucide-react";

const CheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentFailure }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

    if (stripeError) {
      setError(stripeError.message);
      onPaymentFailure(stripeError.message);
    } else if (paymentIntent.status === "succeeded") {
      onPaymentSuccess(paymentIntent);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label
          htmlFor="card-element"
          className="block text-sm font-medium text-gray-700"
        >
          Credit or debit card
        </label>
        <div className="mt-1">
          <CardElement
            id="card-element"
            className="p-3 border border-gray-300 rounded-md"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin mr-2" /> Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2" /> Pay Now
          </>
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;