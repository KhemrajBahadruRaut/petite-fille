"use client";
import ContactsCarousel from '@/components/contactsCarousel/ContactsCarousel';
import { useState, useCallback } from 'react';

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    message: string;
    agreement: boolean;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    message?: string;
    agreement?: string;
}

const ContactForm = () => {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        message: '',
        agreement: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    };

    const validateForm = useCallback((): FormErrors => {
        const newErrors: FormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        if (!formData.agreement) {
            newErrors.agreement = 'You must agree to the terms';
        }

        return newErrors;
    }, [formData]);

    const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
        
        // Clear submit error
        if (submitError) {
            setSubmitError('');
        }
    }, [errors, submitError]);

    const handleSubmit = async () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            const response = await fetch('https://api.gr8.com.np/petite-backend/contact/submit_contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setIsSubmitted(true);
                setFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    message: '',
                    agreement: false,
                });
            } else {
                setSubmitError(result.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setSubmitError('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
                    <p className="text-gray-600 mb-6">Thank you for reaching out. We will respond promptly.</p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <ContactsCarousel />
            <div className="bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4"
                style={{ fontFamily: 'arial' }}
            >
                <div className="p-8 max-w-xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-xl font-bold text-gray-800 mb-2">
                            Send us a message and we will respond promptly.
                        </h1>
                    </div>

                    {/* Error Alert */}
                    {submitError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex-1">
                                <p className="text-sm text-red-800 font-medium">{submitError}</p>
                            </div>
                            <button onClick={() => setSubmitError('')} className="text-red-600 hover:text-red-800">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                placeholder="Your Name"
                                className={`w-full px-4 py-3 border-b-2 bg-transparent text-gray-500 focus:outline-none transition-colors ${errors.fullName
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-200 focus:border-yellow-700'
                                    }`}
                                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                            />
                            {errors.fullName && (
                                <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="abc@gmail.com"
                                className={`w-full px-4 py-3 border-b-2 bg-transparent text-gray-500 focus:outline-none transition-colors ${errors.email
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-200 focus:border-yellow-700'
                                    }`}
                                aria-describedby={errors.email ? "email-error" : undefined}
                            />
                            {errors.email && (
                                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone number
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                placeholder="Your number"
                                className={`w-full px-4 py-3 border-b-2 bg-transparent text-gray-500 focus:outline-none transition-colors ${errors.phone
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-200 focus:border-yellow-700'
                                    }`}
                                aria-describedby={errors.phone ? "phone-error" : undefined}
                            />
                            {errors.phone && (
                                <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                Write your message / queries.
                            </label>
                            <textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => handleInputChange('message', e.target.value)}
                                placeholder="Type your message here ..."
                                rows={4}
                                className={`w-full px-4 py-3 border-2 rounded-lg resize-none text-gray-500 bg-transparent focus:outline-none transition-colors ${errors.message
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-gray-200 focus:border-yellow-700'
                                    }`}
                                aria-describedby={errors.message ? "message-error" : undefined}
                            />
                            {errors.message && (
                                <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
                                    {errors.message}
                                </p>
                            )}
                        </div>

                        {/* Agreement Checkbox */}
                        <div>
                            <div className="flex items-start space-x-3">
                                <input
                                    id="agreement"
                                    type="checkbox"
                                    checked={formData.agreement}
                                    onChange={(e) => handleInputChange('agreement', e.target.checked)}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    aria-describedby={errors.agreement ? "agreement-error" : undefined}
                                />
                                <label htmlFor="agreement" className="text-sm text-gray-700 leading-5">
                                    I agree to the terms and conditions and privacy policy
                                </label>
                            </div>
                            {errors.agreement && (
                                <p id="agreement-error" className="mt-1 text-sm text-red-600" role="alert">
                                    {errors.agreement}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-black rounded-lg font-medium border hover:bg-amber-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send the message'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactForm;