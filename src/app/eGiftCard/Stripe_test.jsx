"use client";
import { useState, useCallback, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiUrl } from "../../utils/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

// $5 to $100 in $5 increments → [5, 10, 15, ... 100]
const AMOUNT_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1f2937",
      fontFamily: "inherit",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626", iconColor: "#dc2626" },
  },
};

const CheckoutForm = ({ formData, totalPrice, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setCardError(null);

    try {
      // Step 1 — create payment intent
      const res = await fetch(apiUrl("payment/create-payment.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: formData.recipient,
          recipientEmail: formData.recipientEmail,
          message: formData.message,
          senderName: formData.senderName,
          senderEmail: formData.senderEmail,
          quantity: formData.quantity,
          giftCardAmount: formData.amount,
          currency: "usd",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create payment intent.");
      }

      const { clientSecret } = await res.json();
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found.");

      // Step 2 — confirm card payment with Stripe (card is charged here)
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.senderName,
              email: formData.senderEmail,
            },
          },
        },
      );

      if (error) {
        setCardError(error.message || "Payment failed. Please try again.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Step 3 — payment confirmed, now send the gift card email
        const mailRes = await fetch(apiUrl("payment/sendGiftCard.php"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            recipient: formData.recipient,
            recipientEmail: formData.recipientEmail,
            senderName: formData.senderName,
            senderEmail: formData.senderEmail,
            message: formData.message,
            giftCardAmount: formData.amount,
            quantity: formData.quantity,
          }),
        });

        if (!mailRes.ok) {
          // Payment succeeded but email failed — still show success to user,
          // error is logged server-side so you can resend manually
          console.error(
            "Gift card email failed:",
            await mailRes.json().catch(() => ({})),
          );
        }

        onSuccess();
      }
    } catch (err) {
      setCardError(err.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Payment</h2>
          <p className="text-gray-500 text-sm">
            Complete your eGift card purchase
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="text-gray-500">To</span>
            <span className="font-medium">{formData.recipient}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Recipient email</span>
            <span className="font-medium truncate max-w-[60%]">
              {formData.recipientEmail}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount × Qty</span>
            <span className="font-medium">
              ${formData.amount} × {formData.quantity}
            </span>
          </div>
          {formData.message && (
            <div className="flex justify-between">
              <span className="text-gray-500">Message</span>
              <span className="font-medium italic truncate max-w-[60%]">
                &ldquo;{formData.message}&rdquo;
              </span>
            </div>
          )}
          <div className="border-t border-amber-200 pt-2 mt-2 flex justify-between font-semibold text-gray-800">
            <span>Total</span>
            <span>${totalPrice}.00</span>
          </div>
        </div>

        {/* Stripe Card Element */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2 text-sm">
            Card details
          </label>
          <div
            className={`border-2 rounded-xl px-4 py-3 transition-colors ${
              cardError
                ? "border-red-400 bg-red-50"
                : "border-gray-200 focus-within:border-amber-400 bg-white"
            }`}
          >
            <CardElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={() => setCardError(null)}
            />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <svg
                className="w-4 h-4 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {cardError}
            </p>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
          </svg>
          Secured by Stripe — your card info is never stored on our servers
        </p>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !stripe}
            className="flex-1 py-3 bg-linear-to-r from-amber-600 to-yellow-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing…
              </>
            ) : (
              `Pay $${totalPrice}.00`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Stripe_test = () => {
  const [formData, setFormData] = useState({
    amount: 10,
    recipient: "",
    recipientEmail: "",
    message: "",
    quantity: 1,
    senderName: "",
    senderEmail: "",
  });

  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form");

  const totalPrice = useMemo(
    () => formData.amount * formData.quantity,
    [formData.amount, formData.quantity],
  );

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.recipient.trim())
      newErrors.recipient = "Recipient name is required";
    else if (formData.recipient.trim().length < 2)
      newErrors.recipient = "Recipient name must be at least 2 characters";

    if (!formData.recipientEmail.trim())
      newErrors.recipientEmail = "Recipient email is required";
    else if (!validateEmail(formData.recipientEmail))
      newErrors.recipientEmail = "Please enter a valid email address";

    if (formData.message.trim().length > 200)
      newErrors.message = "Message must be less than 200 characters";
    if (!formData.senderName.trim())
      newErrors.senderName = "Your name is required";
    else if (formData.senderName.trim().length < 2)
      newErrors.senderName = "Name must be at least 2 characters";
    if (!formData.senderEmail.trim())
      newErrors.senderEmail = "Email is required";
    else if (!validateEmail(formData.senderEmail))
      newErrors.senderEmail = "Please enter a valid email address";
    if (formData.quantity < 1 || formData.quantity > 10)
      newErrors.quantity = "Quantity must be between 1 and 10";
    return newErrors;
  }, [formData]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const handleQuantityChange = useCallback((delta) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, Math.min(10, prev.quantity + delta)),
    }));
  }, []);

  const handleContinue = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setStep("payment");
  };

  const handleReset = () => {
    setFormData({
      amount: 10,
      recipient: "",
      recipientEmail: "",
      message: "",
      quantity: 1,
      senderName: "",
      senderEmail: "",
    });
    setErrors({});
    setStep("form");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-linear-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Gift Card Sent!
          </h2>
          <p className="text-gray-600 mb-2">
            Your eGift card worth <strong>${totalPrice}</strong> has been sent
            to <strong>{formData.recipient}</strong> at{" "}
            <strong>{formData.recipientEmail}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            A confirmation has also been sent to {formData.senderEmail}.
          </p>
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-linear-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all font-medium shadow-lg"
          >
            Purchase Another
          </button>
        </div>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <Elements stripe={stripePromise}>
        <CheckoutForm
          formData={formData}
          totalPrice={totalPrice}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("form")}
        />
      </Elements>
    );
  }

  return (
    <>
      <div className="bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 flex-col items-center justify-center pt-14">
        <div className="text-center mb-8 pt-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">eGift cards</h1>
        </div>
        <div>
          <div className="flex-col space-y-5 bg-[#EEC27E33] py-5">
            <p className="text-gray-600 flex justify-center">
              Get a voucher for yourself or gift one to a friend
            </p>
            <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl shadow-lg">
              <img
                src="/giftcard/gift-card-template.png"
                alt="Petite Fille Gift Card"
                className="w-full h-auto"
              />

              <div className="absolute left-[42%] top-[30%] text-[#8b7b67] text-sm sm:text-lg italic font-semibold">
                {formData.amount}
              </div>

              <div className="absolute left-[42%] top-[45%] text-[#8b7b67] text-sm sm:text-lg italic">
                 {formData.recipient || "Recipient Name"}
              </div>

              <div className="absolute left-[42%] top-[61%] text-[#8b7b67] text-sm sm:text-lg italic">
                 {formData.senderName || "Your Name"}
              </div>

              {formData.message && (
                <div className="absolute left-[39%] top-[76%] max-w-[45%] text-[#8b7b67] text-xs sm:text-sm italic line-clamp-2 ">
                  “{formData.message}”
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-1 sm:p-4">
        <div className="p-8 max-w-2xl w-full">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-amber-800 mb-3">
              Special note before making a purchase:
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our eGift cards are perfect for any occasion. They can be used
              immediately after purchase and never expire. The recipient will
              receive a beautifully designed digital card with your personalized
              message.
            </p>
          </div>

          <div className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-amber-800 font-medium mb-3">
                Choose an amount: *
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {AMOUNT_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange("amount", amount)}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                      formData.amount === amount
                        ? "bg-linear-to-r from-amber-600 to-yellow-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Personalization */}
            <div>
              <h3 className="text-amber-800 font-medium mb-4">Personalize:</h3>
              <div className="space-y-4">
                {/* Recipient Name */}
                <div className="flex items-center flex-wrap">
                  <label
                    htmlFor="recipient"
                    className="block text-gray-700 font-medium w-20"
                  >
                    To:
                  </label>
                  <input
                    id="recipient"
                    type="text"
                    value={formData.recipient}
                    onChange={(e) =>
                      handleInputChange("recipient", e.target.value)
                    }
                    className={`w-full px-0 py-2 border-0 border-b-2 bg-transparent sm:ml-2 text-gray-600 focus:outline-none transition-colors ${
                      errors.recipient
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                    placeholder="Recipient's name"
                  />
                  {errors.recipient && (
                    <p className="mt-1 text-sm text-red-600 w-full">
                      {errors.recipient}
                    </p>
                  )}
                </div>

                {/* Recipient Email */}
                <div className="flex items-center flex-wrap">
                  <label
                    htmlFor="recipientEmail"
                    className="block text-gray-700 font-medium w-20"
                  >
                    Email:
                  </label>
                  <input
                    id="recipientEmail"
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) =>
                      handleInputChange("recipientEmail", e.target.value)
                    }
                    className={`w-full px-0 py-2 border-0 border-b-2 bg-transparent sm:ml-2 text-gray-600 focus:outline-none transition-colors ${
                      errors.recipientEmail
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                    placeholder="Recipient's email address"
                  />
                  {errors.recipientEmail && (
                    <p className="mt-1 text-sm text-red-600 w-full">
                      {errors.recipientEmail}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="flex items-center flex-wrap">
                  <label
                    htmlFor="message"
                    className="block text-gray-700 font-medium w-20"
                  >
                    Message:
                  </label>
                  <input
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    className={`w-full px-0 py-2 border-0 border-b-2 bg-transparent sm:ml-2 text-gray-600 focus:outline-none resize-none transition-colors ${
                      errors.message
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                    placeholder="Your personal message (optional)"
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center mt-1 w-full">
                    {errors.message && (
                      <p className="text-sm text-red-600">{errors.message}</p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {formData.message.length}/200
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center flex-wrap">
              <label className="block text-amber-800 font-medium">
                Quantity: *
              </label>
              <div className="flex items-center sm:ml-10">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={formData.quantity <= 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-lg font-medium text-gray-600">−</span>
                </button>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", parseInt(e.target.value) || 1)
                  }
                  min="1"
                  max="10"
                  className="w-16 h-10 text-center border border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={formData.quantity >= 10}
                  className="w-10 h-10 rounded-lg flex text-gray-600 items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-lg font-medium text-gray-600">+</span>
                </button>
                <span className="text-sm text-gray-600 ml-4">
                  Total: ${totalPrice}.00
                </span>
              </div>
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
              )}
            </div>

            {/* Your Details */}
            <div>
              <h3 className="text-amber-800 font-medium mb-4">Your details:</h3>
              <div className="space-y-4">
                <div className="flex items-center flex-wrap">
                  <label
                    htmlFor="senderName"
                    className="text-gray-700 font-medium"
                  >
                    From:*
                  </label>
                  <input
                    id="senderName"
                    type="text"
                    value={formData.senderName}
                    onChange={(e) =>
                      handleInputChange("senderName", e.target.value)
                    }
                    className={`w-full px-0 py-2 border-0 border-b-2 sm:ml-10 bg-transparent text-black focus:outline-none transition-colors ${
                      errors.senderName
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                    placeholder="Your name"
                  />
                  {errors.senderName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.senderName}
                    </p>
                  )}
                </div>

                <div className="flex items-center flex-wrap">
                  <label
                    htmlFor="senderEmail"
                    className="block text-gray-700 font-medium"
                  >
                    Email:*
                  </label>
                  <input
                    id="senderEmail"
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) =>
                      handleInputChange("senderEmail", e.target.value)
                    }
                    className={`w-full px-0 py-2 border-0 border-b-2 sm:ml-10 bg-transparent text-black focus:outline-none transition-colors ${
                      errors.senderEmail
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-amber-500"
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.senderEmail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.senderEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full py-4 bg-linear-to-r from-amber-600 to-yellow-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-lg"
            >
              Continue — ${totalPrice}.00
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stripe_test;
