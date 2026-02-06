"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaUser, FaCalendarAlt, FaClock, FaChair } from "react-icons/fa";
import ReservationCarousal from "./Carousail";

// Types for better type safety
interface ReservationData {
  adults: number;
  children: number;
  date: string;
  time: string;
  seating: string;
  agreement: boolean;
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
}

// Constants moved outside component to prevent re-creation
const STEPS = ["Reservation", "Information", "Confirmation"];
const SEATING_OPTIONS = [
  { value: "Outdoor", label: "Outdoor" },
  { value: "Indoor", label: "Indoor" },
  { value: "Window Side", label: "Window Side" }
];
const PRICE_PER_PERSON = 20;

// - StepIndicator component
const StepIndicator = React.memo(({ currentStep }: { currentStep: number }) => (
  <div className="flex justify-center sm:gap-20 my-6">
    {STEPS.map((label, idx) => (
      <div
        key={label}
        className="flex flex-col items-center text-center text-gray-600 "
      >
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full 
          ${currentStep === idx + 1 ? "bg-yellow-400 text-white" : "bg-gray-300"}`}
        >
          {idx + 1}
        </div>
        <p className="mt-2 text-sm">{label}</p>
      </div>
    ))}
  </div>
));
StepIndicator.displayName = 'StepIndicator';

const LoadingState = React.memo(() => (
  <div className="w-full min-h-screen bg-white">
    <div className="relative h-64 flex items-center justify-center bg-gray-800">
      <h1 className="text-4xl md:text-5xl font-bold text-white">
        Reservations
      </h1>
    </div>
    <div className="text-center py-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
      <p className="text-lg mt-2 text-black">Loading...</p>
    </div>
  </div>
));
// Add this line after the component definition
LoadingState.displayName = 'LoadingState';

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Consolidated reservation state
  const [reservationData, setReservationData] = useState<ReservationData>({
    adults: 2,
    children: 0,
    date: "",
    time: "17:30",
    seating: "Outdoor",
    agreement: false
  });

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: ""
  });

  // Memoized computed values
  const totalGuests = useMemo(() =>
    reservationData.adults + reservationData.children,
    [reservationData.adults, reservationData.children]
  );

  const totalFee = useMemo(() =>
    totalGuests * PRICE_PER_PERSON,
    [totalGuests]
  );

  const formattedDate = useMemo(() =>
    reservationData.date ? new Date(reservationData.date).toLocaleDateString() : "",
    [reservationData.date]
  );

  const canProceedStep1 = useMemo(() =>
    reservationData.agreement && reservationData.date,
    [reservationData.agreement, reservationData.date]
  );

  const canProceedStep2 = useMemo(() =>
    personalInfo.fullName.trim() &&
    personalInfo.email.trim() &&
    personalInfo.phone.trim(),
    [personalInfo]
  );

  // Optimized handlers using useCallback
  const updateReservationData = useCallback((updates: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePersonalInfo = useCallback((updates: Partial<PersonalInfo>) => {
    setPersonalInfo(prev => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real app, send data to API
      console.log('Reservation Data:', reservationData);
      console.log('Personal Info:', personalInfo);

      alert("Sorry for the inconvenience, but the reservation feature is currently unavailable. Please contact us directly to make a reservation.");

      // Reset form
      setStep(1);
      setReservationData({
        adults: 2,
        children: 0,
        date: "",
        time: "17:30",
        seating: "Outdoor",
        agreement: false
      });
      setPersonalInfo({
        fullName: "",
        email: "",
        phone: ""
      });
    } catch (error) {
      console.error('Reservation failed:', error);
      alert("Reservation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [reservationData, personalInfo, isSubmitting]);

  // Initialize date on mount
  useEffect(() => {
    setMounted(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    updateReservationData({ date: tomorrowStr });
  }, [updateReservationData]);

  // Memoized option arrays to prevent re-creation
  const adultOptions = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1} Adults`
    })), []
  );

  const childrenOptions = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      value: i,
      label: `${i} Children`
    })), []
  );

  if (!mounted) {
    return <LoadingState />;
  }

  return (
    <div className="w-full  bg-white">
      {/* Header Section */}
      <div>
        <ReservationCarousal />
      </div>

      {/* Opening Hours */}
      <section className="text-center py-6" aria-labelledby="hours-heading">
        <h2 id="hours-heading" className="sr-only">Opening Hours</h2>
        <p className="text-lg text-black">We are now open everyday</p>
        <p className="text-sm text-gray-600">
          Weekdays 7:30 AM - 3 PM | Sat & Sun 8 AM - 3 PM
        </p>
      </section>

      {/* Steps */}
      <StepIndicator currentStep={step} />

      {/* Step Content */}
      <main className="max-w-lg mx-auto px-6 py-6 shadow-md rounded-lg pb-10">
        {step === 1 && (
          <section aria-labelledby="reservation-heading">
            <h2 id="reservation-heading" className="text-center text-xl font-semibold mb-6 text-gray-700">
              Reservation Details
            </h2>

            <div className="grid grid-cols-1 gap-4 ">
              {/* Adults & Children */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <FaUser className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="adults-select">Number of Adults</label>
                  <select
                    id="adults-select"
                    value={reservationData.adults}
                    onChange={(e) => updateReservationData({ adults: Number(e.target.value) })}
                    className="w-full border-b text-gray-500 border-yellow-500 p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {adultOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <FaUser className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="children-select">Number of Children</label>
                  <select
                    id="children-select"
                    value={reservationData.children}
                    onChange={(e) => updateReservationData({ children: Number(e.target.value) })}
                    className="w-full border-b text-gray-500 border-yellow-500  p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    {childrenOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <FaCalendarAlt className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="date-input">Reservation Date</label>
                  <input
                    id="date-input"
                    type="date"
                    value={reservationData.date}
                    onChange={(e) => updateReservationData({ date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border-b border-yellow-500 text-gray-500 p-2 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <FaClock className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="time-input">Reservation Time</label>
                  <input
                    id="time-input"
                    type="time"
                    value={reservationData.time}
                    onChange={(e) => updateReservationData({ time: e.target.value })}
                    className="w-full border-b border-yellow-500 text-gray-500  p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Seating */}
              <div className="flex items-center gap-2">
                <FaChair className="text-yellow-500" aria-hidden="true" />
                <label className="sr-only" htmlFor="seating-select">Seating Preference</label>
                <select
                  id="seating-select"
                  value={reservationData.seating}
                  onChange={(e) => updateReservationData({ seating: e.target.value })}
                  className="w-full border-b border-yellow-500 text-gray-500 p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  {SEATING_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-500 text-center mt-3 p-3 bg-gray-50 rounded">
                <p>
                  A fee of ${PRICE_PER_PERSON} per person is required to secure your booking.
                  Non-refundable if canceled within 6 hours of booking or no-show.
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm mt-2">
                <input
                  type="checkbox"
                  checked={reservationData.agreement}
                  onChange={(e) => updateReservationData({ agreement: e.target.checked })}
                  className="w-4 h-4 mt-0.5"
                  required
                />
                <span className="text-gray-500">I agree to the terms and conditions and understand the cancellation policy.</span>
              </label>

              {/* Navigation Buttons */}
              <nav className="flex justify-between mt-6">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-500"
                  aria-label="Go back to previous step"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-yellow-500"
                  aria-label="Continue to next step"
                >
                  Continue
                </button>
              </nav>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="information-heading">
            <h2 id="information-heading" className="text-xl font-semibold mb-4 text-center text-gray-600">
              Enter Your Information
            </h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="fullname"
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full text-gray-500 border-b border-yellow-500 focus:outline-none  p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  placeholder="Enter your email address"
                  className="w-full text-gray-500 border-b focus:outline-none border-yellow-500  p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full text-gray-500 border-b focus:outline-none border-yellow-500  p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <label
                htmlFor="request"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Any specific requests? (optional)
              </label>
              <textarea
                id="request"
                placeholder="Specify your requests..."
                className="w-full text-gray-900 rounded-md border focus:outline-none border-yellow-500 p-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <nav className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="px-4 py-2 border rounded focus:ring-2 text-gray-600 focus:ring-gray-500"
                aria-label="Go back to reservation details"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceedStep2}
                className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-yellow-500"
                aria-label="Continue to confirmation"
              >
                Continue
              </button>
            </nav>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="confirmation-heading">
            <h2 id="confirmation-heading" className="text-xl font-semibold mb-4 text-center text-gray-600">
              Confirm Your Reservation
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Name:</span>
                <span className="text-gray-400">{personalInfo.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Email:</span>
                <span className="text-gray-400">{personalInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Phone:</span>
                <span className="text-gray-400">{personalInfo.phone}</span>
              </div>
              <hr className="my-3 text-gray-400" />
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Guests:</span>
                <span className="text-gray-400">
                  {reservationData.adults} Adults
                  {reservationData.children > 0 && `, ${reservationData.children} Children`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Date:</span>
                <span className="text-gray-400">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Time:</span>
                <span className="text-gray-400">{reservationData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Seating:</span>
                <span className="text-gray-400">{reservationData.seating}</span>
              </div>
              <hr className="my-3 text-gray-400" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total Fee:</span>
                <span className="text-gray-900">${totalFee}</span>
              </div>
            </div>
            <nav className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-4 py-2 border text-gray-600 border-gray-600 rounded disabled:opacity-50 focus:ring-2  focus:ring-gray-500"
                aria-label="Go back to personal information"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-yellow-500 text-white flex items-center gap-3 rounded hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-yellow-500"
                aria-label="Submit reservation"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
              </button>
            </nav>
          </section>
        )}
      </main>
    </div>
  );
}