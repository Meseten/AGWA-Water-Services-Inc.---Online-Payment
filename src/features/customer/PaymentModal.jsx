import React, { useState, useEffect } from "react";
import Modal from "../../components/ui/Modal.jsx";
import {
  CreditCard,
  Loader2,
  X,
  Landmark,
  CheckCircle,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/ui/CheckoutForm.jsx";
import { getFunctions, httpsCallable } from "firebase/functions";

const stripePromise = loadStripe("YOUR_PUBLISHABLE_KEY");

const PaymentModal = ({
  isOpen,
  onClose,
  billToPay,
  onConfirmPayment,
  isProcessingPayment,
  userData,
}) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentStep, setPaymentStep] = useState("selection");

  const handlePaymentMethodSelect = async (method) => {
    setSelectedMethod(method);
    if (method === "Credit/Debit Card") {
      setPaymentStep("card_payment");
      const functions = getFunctions();
      const createPaymentIntent = httpsCallable(
        functions,
        "createPaymentIntent"
      );
      try {
        const result = await createPaymentIntent({
          amount: Math.round(billToPay.amount * 100),
          currency: "php",
          payment_method_types: ["card"],
        });
        setClientSecret(result.data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
      }
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    onConfirmPayment({
      billId: billToPay.id,
      paymentMethod: "Card",
      amountPaid: billToPay.amount,
      paymentReference: paymentIntent.id,
    });
    setPaymentStep("success");
  };

  const handlePaymentFailure = (error) => {
    console.error("Payment failed:", error);
  };

  const handleOtherPayment = () => {
    onConfirmPayment({
      billId: billToPay.id,
      paymentMethod: selectedMethod,
      amountPaid: billToPay.amount,
      paymentReference: `SIM-${Date.now()}`,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Payment"
      size="md"
    >
      <div className="space-y-6">
        {paymentStep === "selection" && (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-sm text-blue-700">You are paying for bill:</p>
              <p className="font-bold text-lg text-blue-800">
                {billToPay.monthYear}
              </p>
              <div className="mt-2 text-3xl font-bold text-gray-800">
                ₱{billToPay.amount.toFixed(2)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Select Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePaymentMethodSelect("Credit/Debit Card")}
                  className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 h-24 ${
                    selectedMethod === "Credit/Debit Card"
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <CreditCard className="w-8 h-8 mb-1 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-center text-gray-700">
                    Credit/Debit Card
                  </span>
                </button>
                <button
                  onClick={() => handlePaymentMethodSelect("Bank Transfer")}
                  className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 h-24 ${
                    selectedMethod === "Bank Transfer"
                      ? "ring-2 ring-blue-500 border-blue-500"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  <Landmark className="w-8 h-8 mb-1 text-gray-600" />
                  <span className="text-xs sm:text-sm font-medium text-center text-gray-700">
                    Bank Transfer
                  </span>
                </button>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={handleOtherPayment}
                className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                disabled={!selectedMethod || isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="animate-spin mr-2" /> Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-1 font-bold">₱</span> Confirm Payment
                  </>
                )}
              </button>
            </div>
          </>
        )}
        {paymentStep === "card_payment" && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              clientSecret={clientSecret}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          </Elements>
        )}
        {paymentStep === "success" && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">
              Your payment has been processed successfully.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white font-bold rounded-lg text-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentModal;