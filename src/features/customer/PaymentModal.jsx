import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import { CreditCard, Loader2 } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise, createPaymentIntent } from '../../services/stripeService.js';
import CheckoutForm from '../../components/ui/CheckoutForm.jsx';

const PaymentModal = ({ isOpen, onClose, billToPay, onConfirmPayment, showNotification }) => {
    const [clientSecret, setClientSecret] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && billToPay) {
            setIsLoading(true);
            setError('');
            createPaymentIntent(billToPay.amount)
                .then(secret => {
                    setClientSecret(secret);
                    setIsLoading(false);
                })
                .catch(err => {
                    const errorMessage = err.message || 'Could not initialize payment. Please try again.';
                    setError(errorMessage);
                    if (showNotification) showNotification(errorMessage, 'error');
                    setIsLoading(false);
                });
        }
    }, [isOpen, billToPay, showNotification]);

    const handlePaymentSuccess = (paymentIntent) => {
        onConfirmPayment({
            billId: billToPay.id,
            paymentMethod: 'Stripe (Card)',
            amountPaid: paymentIntent.amount / 100,
            paymentReference: paymentIntent.id
        });
    };
    
    const resetAndClose = () => {
        setClientSecret(null);
        setError('');
        setIsLoading(true);
        onClose();
    };

    if (!isOpen) return null;

    const options = {
        clientSecret,
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="Secure Card Payment" size="md">
            <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm text-blue-700">You are paying for bill:</p>
                    <p className="font-bold text-lg text-blue-800">{billToPay.monthYear}</p>
                    <div className="mt-2 text-3xl font-bold text-gray-800">
                        ₱{parseFloat(billToPay.amount).toFixed(2)}
                    </div>
                </div>

                {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md">{error}</div>}

                {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                        <span className="ml-3 text-gray-600">Initializing secure payment...</span>
                    </div>
                ) : clientSecret ? (
                    <Elements stripe={stripePromise} options={options}>
                        <CheckoutForm 
                            key={clientSecret}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentFailure={(err) => setError(err)}
                            billAmount={billToPay.amount}
                        />
                    </Elements>
                ) : null}
            </div>
        </Modal>
    );
};

export default PaymentModal;