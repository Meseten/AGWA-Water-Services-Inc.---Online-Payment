import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const createPaymentIntent = async (amountInPesos) => {
    if (!STRIPE_SECRET_KEY) {
        throw new Error("Stripe Secret Key is not configured in .env file as VITE_STRIPE_SECRET_KEY");
    }

    const amountInCentavos = Math.round(amountInPesos * 100);

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            amount: amountInCentavos,
            currency: 'php',
            'payment_method_types[]': 'card'
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error.message || "Failed to create payment intent.");
    }

    const paymentIntent = await response.json();
    return paymentIntent.client_secret;
};