"use client";
import { useState, useCallback, useMemo } from 'react';

interface EGiftCardData {
  amount: number;
  recipient: string;
  message: string;
  quantity: number;
  senderName: string;
  senderEmail: string;
}

interface FormErrors {
  recipient?: string;
  message?: string;
  senderName?: string;
  senderEmail?: string;
  quantity?: string;
}

const AMOUNT_OPTIONS = [10, 25, 50, 100, 200];

const EGiftCard = () => {
  const [formData, setFormData] = useState<EGiftCardData>({
    amount: 10,
    recipient: '',
    message: '',
    quantity: 1,
    senderName: '',
    senderEmail: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalPrice = useMemo(() => {
    return formData.amount * formData.quantity;
  }, [formData.amount, formData.quantity]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient name is required';
    } else if (formData.recipient.trim().length < 2) {
      newErrors.recipient = 'Recipient name must be at least 2 characters';
    }

    if (formData.message.trim().length > 200) {
      newErrors.message = 'Message must be less than 200 characters';
    }

    if (!formData.senderName.trim()) {
      newErrors.senderName = 'Your name is required';
    } else if (formData.senderName.trim().length < 2) {
      newErrors.senderName = 'Name must be at least 2 characters';
    }

    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = 'Email is required';
    } else if (!validateEmail(formData.senderEmail)) {
      newErrors.senderEmail = 'Please enter a valid email address';
    }

    if (formData.quantity < 1 || formData.quantity > 10) {
      newErrors.quantity = 'Quantity must be between 1 and 10';
    }

    return newErrors;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof EGiftCardData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleQuantityChange = useCallback((delta: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(10, prev.quantity + delta))
    }));
  }, []);

  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setShowSuccess(true);
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Gift Card Purchased!</h2>
          <p className="text-gray-600 mb-6">
            Your eGift card worth ${totalPrice} has been sent successfully.
          </p>
          <button
            onClick={() => {
              setShowSuccess(false);
              setFormData({
                amount: 10,
                recipient: '',
                message: '',
                quantity: 1,
                senderName: '',
                senderEmail: '',
              });
            }}
            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-all font-medium shadow-lg"
          >
            Purchase Another
          </button>
        </div>
      </div>
    );
  }

  return (


    <>
      {/* Header */}

      <div className='bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex-col items-center justify-center'>

      <div className="text-center mb-8 pt-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">eGift cards</h1>
      </div>

      {/* Gift Card Visual */}
      <div>
      <div className="flex-col space-y-5 bg-yellow-400 py-5">
          <p className="text-gray-600 flex justify-center">Get a voucher for yourself or gift one to a friend</p>
          <div className="relative flex justify-center">
            <div className="w-64 h-40 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full opacity-20"></div>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="text-amber-800 font-bold text-lg">${formData.amount}</div>
              </div>
            </div>
            {/* Bow decoration */}
            <div className='relative'>
            <div className="absolute top-2 right-2  w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full"></div>
            </div>
            </div>
          </div>

        </div>
      </div>

      </div>
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-1 sm:p-4">
        <div className="p-8 max-w-2xl w-full">

          {/* Special Note */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-amber-800 mb-3">Special note before making a purchase:</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our eGift cards are perfect for any occasion. They can be used immediately after purchase and never expire.
              The recipient will receive a beautifully designed digital card with your personalized message.
            </p>
          </div>

          <div className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-amber-800 font-medium mb-3">Choose an amount: *</label>
              <div className="flex flex-wrap justify-center">
                {AMOUNT_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleInputChange('amount', amount)}
                    className={`px-4 py-2 font-medium transition-all ${formData.amount === amount
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    ${amount}.00
                  </button>
                ))}
              </div>
            </div>

            {/* Personalization */}
            <div>
              <h3 className="text-amber-800 font-medium mb-4">Personalize:</h3>
              <div className="space-y-4">
                <div className="flex items-center flex-wrap">
                  <label htmlFor="recipient" className="block text-gray-700 font-medium ">To:</label>
                  <input
                    id="recipient"
                    type="text"
                    value={formData.recipient}
                    onChange={(e) => handleInputChange('recipient', e.target.value)}
                    className={`w-full px-0 py-2 border-0 border-b-2 bg-transparent sm:ml-10 text-gray-600 focus:outline-none transition-colors ${errors.recipient
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-amber-500'
                      }`}
                    placeholder="Recipient's name"
                  />
                  {errors.recipient && (
                    <p className="mt-1 text-sm text-red-600">{errors.recipient}</p>
                  )}
                </div>

                <div className='flex items-center flex-wrap '>
                  <label htmlFor="message" className="block text-gray-700 font-medium ">Message:</label>
                  <input
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={`w-full px-0 py-2  border-0 border-b-2 bg-transparent sm:ml-10 text-gray-600 focus:outline-none resize-none transition-colors ${errors.message
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-amber-500'
                      }`}
                    placeholder="Your personal message (optional)"
                    maxLength={200}
                  />
                  <div className="flex justify-between items-center mt-1">
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
            <div className='flex items-center flex-wrap'>
              <label className="block text-amber-800 font-medium ">Quantity: *</label>
              <div className="flex items-center sm:ml-10">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={formData.quantity <= 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-lg font-medium  text-gray-600 ">−</span>
                </button>

                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-16 h-10 text-center border border-gray-300 rounded-lg  text-gray-600  focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={formData.quantity >= 10}
                  className="w-10 h-10 rounded-lg flex text-gray-600 items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-lg font-medium text-gray-600 ">+</span>
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

              <div className="space-y-4 " >
                <div className='flex items-center flex-wrap'>
                  <label htmlFor="senderName" className=" text-gray-700 font-medium ">From:*</label>
                  <input
                    id="senderName"
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    className={`w-full px-0 py-2 border-0 border-b-2 sm:ml-10 bg-transparent focus:outline-none transition-colors ${errors.senderName
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-amber-500'
                      }`}
                    placeholder="Your name"
                  />
                  {errors.senderName && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderName}</p>
                  )}
                </div>

                <div className='flex items-center flex-wrap'>
                  <label htmlFor="senderEmail" className="block text-gray-700 font-medium ">Email:*</label>
                  <input
                    id="senderEmail"
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) => handleInputChange('senderEmail', e.target.value)}
                    className={`w-full px-0 py-2 border-0 border-b-2 sm:ml-10 bg-transparent focus:outline-none transition-colors ${errors.senderEmail
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-amber-500'
                      }`}
                    placeholder="your@email.com"
                  />
                  {errors.senderEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.senderEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-medium rounded-xl hover:from-amber-700 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                `Continue - $${totalPrice}.00`
              )}
            </button>
          </div>
        </div>
      </div>
    </>

  );
};

export default EGiftCard;