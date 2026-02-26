"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaChair, FaClock, FaUser } from "react-icons/fa";
import { apiUrl } from "@/utils/api";
import ReservationCarousal from "./Carousail";

interface ReservationData {
  adults: number;
  children: number;
  date: string;
  time: string;
  seating: string;
  agreement: boolean;
  foodPreferences: string;
  allergies: string;
  specialRequests: string;
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
}

interface ReservationApiResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
  emailMessage?: string;
  errors?: string[];
}

interface OtpSendApiResponse {
  success: boolean;
  message: string;
  otpToken?: string;
  expiresInSeconds?: number;
  errors?: string[];
}

interface OtpVerifyApiResponse {
  success: boolean;
  message: string;
  verificationToken?: string;
  expiresInSeconds?: number;
  errors?: string[];
}

const STEPS = ["Reservation", "Information", "Confirmation"];

const SEATING_OPTIONS = [
  { value: "Outdoor", label: "Outdoor" },
  { value: "Indoor", label: "Indoor" },
  { value: "Window Side", label: "Window Side" },
];

const PRICE_PER_PERSON = 20;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const TODAY_BOOKING_CUTOFF_HOUR = 18;
const SLOT_INTERVAL_MINUTES = 30;
const BOOKING_OPEN_MINUTES = 7 * 60;
const BOOKING_CLOSE_MINUTES = 18 * 60;

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function minutesToTimeValue(totalMinutes: number): string {
  const normalized = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59));
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTime12Hour(timeValue: string): string {
  const parts = parseTimeParts(timeValue);
  if (!parts) return timeValue;
  const period = parts.hours >= 12 ? "PM" : "AM";
  const hour12 = parts.hours % 12 || 12;
  return `${hour12}:${String(parts.minutes).padStart(2, "0")} ${period}`;
}

function ceilToInterval(totalMinutes: number, interval: number): number {
  return Math.ceil(totalMinutes / interval) * interval;
}

function parseDateParts(dateValue: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) return null;
  return { year, month, day };
}

function parseTimeParts(timeValue: string): { hours: number; minutes: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(timeValue);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
}

function validateReservationDateTime(
  dateValue: string,
  timeValue: string,
  nowOverride?: Date,
): string | null {
  if (!dateValue) return null;

  const dateParts = parseDateParts(dateValue);
  if (!dateParts) return "Please select a valid reservation date.";

  const now = nowOverride ? new Date(nowOverride) : new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDateStart = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
  );

  if (selectedDateStart < todayStart) {
    return "Previous date cannot be selected.";
  }

  const isTodaySelection = selectedDateStart.getTime() === todayStart.getTime();
  if (isTodaySelection && now.getHours() >= TODAY_BOOKING_CUTOFF_HOUR) {
    return "Today's reservations are closed after 6:00 PM. Please choose another date.";
  }

  const minimumDateTime = new Date(now.getTime() + TWO_HOURS_MS);
  const minimumDateString = formatLocalDate(minimumDateTime);
  const todayDateString = formatLocalDate(todayStart);

  if (isTodaySelection && minimumDateString !== todayDateString) {
    return "Today's reservations are closed. Please choose another date.";
  }

  if (!timeValue) return null;

  const timeParts = parseTimeParts(timeValue);
  if (!timeParts) return "Please select a valid reservation time.";

  if (!isTodaySelection) return null;

  const selectedDateTime = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hours,
    timeParts.minutes,
    0,
    0,
  );

  if (selectedDateTime.getTime() < minimumDateTime.getTime()) {
    return `For today's booking, choose ${formatTime12Hour(
      formatLocalTime(minimumDateTime),
    )} or later (at least 2 hours from now).`;
  }

  const selectedMinutes = timeParts.hours * 60 + timeParts.minutes;
  if (selectedMinutes > BOOKING_CLOSE_MINUTES) {
    return "Please choose a time up to 6:00 PM.";
  }

  return null;
}

const TERMS_PARAGRAPHS = [
  "If you are unable to fulfil your booking, you are obligated to cancel it as soon as possible using the booking link we will send you after completing the booking, or by contacting us by phone (thank you).",
  "You accept that petite fille cafe and its suppliers collect, store and process your personal data and data collected automatically when making this booking. Data is also collected while communicating with and visiting the restaurant.",
  "This data includes, but is not limited to: name, e-mail address, phone number, food and drink preferences and allergies, location and device specifications.",
  "Under the European GDPR law you may request a copy of the data we have collected, by sending an e-mail to petitefillerosanna@gmail.com.",
];

const StepIndicator = React.memo(
  ({ currentStep }: { currentStep: number }) => (
    <div className="my-6 flex justify-center sm:gap-20">
      {STEPS.map((label, idx) => (
        <div
          key={label}
          className="flex flex-col items-center text-center text-gray-600"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              currentStep === idx + 1
                ? "bg-yellow-400 text-white"
                : "bg-gray-300"
            }`}
          >
            {idx + 1}
          </div>
          <p className="mt-2 text-sm">{label}</p>
        </div>
      ))}
    </div>
  ),
);
StepIndicator.displayName = "StepIndicator";

const LoadingState = React.memo(() => (
  <div className="min-h-screen w-full bg-white">
    <div className="relative flex h-64 items-center justify-center bg-gray-800">
      <h1 className="text-4xl font-bold text-white md:text-5xl">Reservations</h1>
    </div>
    <div className="py-6 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-500" />
      <p className="mt-2 text-lg text-black">Loading...</p>
    </div>
  </div>
));
LoadingState.displayName = "LoadingState";

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [timeNow, setTimeNow] = useState<Date>(() => new Date());

  const [reservationData, setReservationData] = useState<ReservationData>({
    adults: 2,
    children: 0,
    date: "",
    time: "17:30",
    seating: "Outdoor",
    agreement: false,
    foodPreferences: "",
    allergies: "",
    specialRequests: "",
  });

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
  });

  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [emailVerification, setEmailVerification] = useState<{
    status: "unverified" | "sent" | "verified";
    otpToken: string;
    verificationToken: string;
    infoMessage: string;
    errorMessage: string;
  }>({
    status: "unverified",
    otpToken: "",
    verificationToken: "",
    infoMessage: "",
    errorMessage: "",
  });

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });

  const totalGuests = useMemo(
    () => reservationData.adults + reservationData.children,
    [reservationData.adults, reservationData.children],
  );

  const totalFee = useMemo(
    () => totalGuests * PRICE_PER_PERSON,
    [totalGuests],
  );

  const formattedDate = useMemo(
    () =>
      reservationData.date
        ? new Date(reservationData.date).toLocaleDateString()
        : "",
    [reservationData.date],
  );

  const todayDateString = formatLocalDate(timeNow);

  const availableTimeSlots = useMemo(() => {
    if (!reservationData.date) return [] as Array<{ value: string; label: string }>;

    const dateParts = parseDateParts(reservationData.date);
    if (!dateParts) return [] as Array<{ value: string; label: string }>;

    const now = new Date(timeNow);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDateStart = new Date(
      dateParts.year,
      dateParts.month - 1,
      dateParts.day,
    );

    if (selectedDateStart < todayStart) return [] as Array<{ value: string; label: string }>;

    let startMinutes = BOOKING_OPEN_MINUTES;

    const isTodaySelection = selectedDateStart.getTime() === todayStart.getTime();
    if (isTodaySelection) {
      if (now.getHours() >= TODAY_BOOKING_CUTOFF_HOUR) {
        return [] as Array<{ value: string; label: string }>;
      }

      const minimumDateTime = new Date(now.getTime() + TWO_HOURS_MS);
      if (formatLocalDate(minimumDateTime) !== formatLocalDate(todayStart)) {
        return [] as Array<{ value: string; label: string }>;
      }

      const minimumMinutes = minimumDateTime.getHours() * 60 + minimumDateTime.getMinutes();
      startMinutes = Math.max(
        BOOKING_OPEN_MINUTES,
        ceilToInterval(minimumMinutes, SLOT_INTERVAL_MINUTES),
      );
    }

    if (startMinutes > BOOKING_CLOSE_MINUTES) {
      return [] as Array<{ value: string; label: string }>;
    }

    const slots: Array<{ value: string; label: string }> = [];
    for (
      let minutes = startMinutes;
      minutes <= BOOKING_CLOSE_MINUTES;
      minutes += SLOT_INTERVAL_MINUTES
    ) {
      const value = minutesToTimeValue(minutes);
      slots.push({ value, label: formatTime12Hour(value) });
    }

    return slots;
  }, [reservationData.date, timeNow]);

  const dateTimeValidationError = useMemo(
    () =>
      validateReservationDateTime(
        reservationData.date,
        reservationData.time,
        timeNow,
      ),
    [reservationData.date, reservationData.time, timeNow],
  );

  const canProceedStep1 = useMemo(
    () =>
      reservationData.agreement &&
      reservationData.date &&
      reservationData.time &&
      !dateTimeValidationError,
    [
      reservationData.agreement,
      reservationData.date,
      reservationData.time,
      dateTimeValidationError,
    ],
  );

  const canProceedStep2 = useMemo(
    () =>
      personalInfo.fullName.trim() &&
      personalInfo.email.trim() &&
      personalInfo.phone.trim() &&
      emailVerification.status === "verified",
    [emailVerification.status, personalInfo],
  );

  const isValidGmail = useMemo(
    () => /^[a-zA-Z0-9._%+\-]+@gmail\.com$/i.test(personalInfo.email.trim()),
    [personalInfo.email],
  );

  const updateReservationData = useCallback(
    (updates: Partial<ReservationData>) => {
      setReservationData((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const updatePersonalInfo = useCallback((updates: Partial<PersonalInfo>) => {
    setPersonalInfo((prev) => ({ ...prev, ...updates }));
  }, []);

  const sendEmailVerificationCode = useCallback(async () => {
    if (isSendingOtp) return;

    const email = personalInfo.email.trim();
    if (!isValidGmail) {
      setEmailVerification((prev) => ({
        ...prev,
        errorMessage: "Please enter a valid Gmail address first.",
        infoMessage: "",
      }));
      return;
    }

    setIsSendingOtp(true);
    setEmailVerification((prev) => ({
      ...prev,
      status: "unverified",
      otpToken: "",
      verificationToken: "",
      errorMessage: "",
      infoMessage: "",
    }));

    try {
      const response = await fetch(apiUrl("reservation/send_email_otp.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const raw = await response.text();
      let data: OtpSendApiResponse = {
        success: false,
        message: "Unable to send verification code.",
      };
      try {
        data = JSON.parse(raw) as OtpSendApiResponse;
      } catch {
        data = {
          success: false,
          message: "Unable to send verification code.",
        };
      }

      if (!response.ok || !data.success || !data.otpToken) {
        const apiMessage =
          data.errors && data.errors.length > 0
            ? data.errors.join(", ")
            : data.message || "Unable to send verification code.";
        throw new Error(apiMessage);
      }

      setEmailOtpCode("");
      setEmailVerification({
        status: "sent",
        otpToken: data.otpToken,
        verificationToken: "",
        infoMessage: "Verification code sent. Please check your Gmail inbox.",
        errorMessage: "",
      });
    } catch (error) {
      setEmailVerification((prev) => ({
        ...prev,
        status: "unverified",
        otpToken: "",
        verificationToken: "",
        infoMessage: "",
        errorMessage:
          error instanceof Error
            ? error.message
            : "Unable to send verification code.",
      }));
    } finally {
      setIsSendingOtp(false);
    }
  }, [isSendingOtp, isValidGmail, personalInfo.email]);

  const verifyEmailCode = useCallback(async () => {
    if (isVerifyingOtp) return;

    const email = personalInfo.email.trim();
    const otpCode = emailOtpCode.trim();

    if (emailVerification.otpToken === "") {
      setEmailVerification((prev) => ({
        ...prev,
        errorMessage: "Please request a verification code first.",
        infoMessage: "",
      }));
      return;
    }

    if (!/^\d{6}$/.test(otpCode)) {
      setEmailVerification((prev) => ({
        ...prev,
        errorMessage: "Please enter the 6-digit verification code.",
        infoMessage: "",
      }));
      return;
    }

    setIsVerifyingOtp(true);
    setEmailVerification((prev) => ({
      ...prev,
      errorMessage: "",
      infoMessage: "",
    }));

    try {
      const response = await fetch(apiUrl("reservation/verify_email_otp.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode,
          otpToken: emailVerification.otpToken,
        }),
      });

      const raw = await response.text();
      let data: OtpVerifyApiResponse = {
        success: false,
        message: "Unable to verify code.",
      };
      try {
        data = JSON.parse(raw) as OtpVerifyApiResponse;
      } catch {
        data = {
          success: false,
          message: "Unable to verify code.",
        };
      }

      if (!response.ok || !data.success || !data.verificationToken) {
        const apiMessage =
          data.errors && data.errors.length > 0
            ? data.errors.join(", ")
            : data.message || "Invalid verification code.";
        throw new Error(apiMessage);
      }

      setEmailVerification((prev) => ({
        ...prev,
        status: "verified",
        verificationToken: data.verificationToken || "",
        infoMessage: "Email verified successfully.",
        errorMessage: "",
      }));
      setEmailOtpCode("");
    } catch (error) {
      setEmailVerification((prev) => ({
        ...prev,
        status: "sent",
        verificationToken: "",
        infoMessage: "",
        errorMessage:
          error instanceof Error ? error.message : "Unable to verify code.",
      }));
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [
    emailOtpCode,
    emailVerification.otpToken,
    isVerifyingOtp,
    personalInfo.email,
  ]);

  const handleNext = useCallback(() => {
    if (step < 3) setStep((prev) => prev + 1);
  }, [step]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((prev) => prev - 1);
  }, [step]);

  const resetForm = useCallback(() => {
    setStep(1);
    setReservationData({
      adults: 2,
      children: 0,
      date: "",
      time: "17:30",
      seating: "Outdoor",
      agreement: false,
      foodPreferences: "",
      allergies: "",
      specialRequests: "",
    });
    setPersonalInfo({
      fullName: "",
      email: "",
      phone: "",
    });
    setEmailOtpCode("");
    setEmailVerification({
      status: "unverified",
      otpToken: "",
      verificationToken: "",
      infoMessage: "",
      errorMessage: "",
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (
      emailVerification.status !== "verified" ||
      !emailVerification.verificationToken
    ) {
      setStep(2);
      setFeedback({
        type: "error",
        message: "Please verify your email before submitting reservation.",
      });
      return;
    }

    const dateTimeError = validateReservationDateTime(
      reservationData.date,
      reservationData.time,
      new Date(),
    );
    if (dateTimeError) {
      setStep(1);
      setFeedback({ type: "error", message: dateTimeError });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "idle", message: "" });

    try {
      const notes = [
        reservationData.specialRequests
          ? `Special requests: ${reservationData.specialRequests}`
          : "",
        `Seating preference: ${reservationData.seating}`,
        `Adults: ${reservationData.adults}, Children: ${reservationData.children}`,
      ]
        .filter(Boolean)
        .join("\n");

      const payload = {
        fullName: personalInfo.fullName.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phone.trim(),
        reservationDate: reservationData.date,
        reservationTime: reservationData.time,
        guestCount: totalGuests,
        foodPreferences: reservationData.foodPreferences.trim(),
        allergies: reservationData.allergies.trim(),
        notes,
        termsAccepted: reservationData.agreement,
        emailVerificationToken: emailVerification.verificationToken,
      };

      const response = await fetch(apiUrl("reservation/submit_reservation.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ReservationApiResponse;

      if (!response.ok || !data.success) {
        const apiMessage =
          data?.errors && data.errors.length > 0
            ? data.errors.join(", ")
            : data?.message || "Reservation failed.";
        throw new Error(apiMessage);
      }

      setFeedback({
        type: "success",
        message:
          "Reservation submitted successfully. Please check your mail for details and cancellation instructions.",
      });

      resetForm();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to complete reservation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    emailVerification.status,
    emailVerification.verificationToken,
    isSubmitting,
    personalInfo,
    reservationData,
    resetForm,
    totalGuests,
  ]);

  useEffect(() => {
    setMounted(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    updateReservationData({ date: tomorrowStr });
  }, [updateReservationData]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setEmailOtpCode("");
    setEmailVerification({
      status: "unverified",
      otpToken: "",
      verificationToken: "",
      infoMessage: "",
      errorMessage: "",
    });
  }, [personalInfo.email]);

  useEffect(() => {
    if (!reservationData.date) return;

    const hasCurrentTime = availableTimeSlots.some(
      (slot) => slot.value === reservationData.time,
    );

    if (hasCurrentTime) return;
    const fallbackTime = availableTimeSlots[0]?.value || "";
    if (reservationData.time === fallbackTime) return;

    updateReservationData({ time: fallbackTime });
  }, [availableTimeSlots, reservationData.date, reservationData.time, updateReservationData]);

  useEffect(() => {
    if (!isTermsOpen) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTermsOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isTermsOpen]);

  const adultOptions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1} Adults`,
      })),
    [],
  );

  const childrenOptions = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        value: i,
        label: `${i} Children`,
      })),
    [],
  );

  if (!mounted) return <LoadingState />;

  return (
    <div className="w-full bg-white pb-10">
      <div>
        <ReservationCarousal />
      </div>

      <section className="py-6 text-center" aria-labelledby="hours-heading">
        <h2 id="hours-heading" className="sr-only">
          Opening Hours
        </h2>
        <p className="text-lg text-black">We are now open everyday</p>
        <p className="text-sm text-gray-600">
          Weekdays 7:30 AM - 3 PM | Sat &amp; Sun 8 AM - 3 PM
        </p>
      </section>

      <StepIndicator currentStep={step} />

      <main className="mx-auto max-w-lg rounded-lg px-6 py-6 pb-10 shadow-md">
        {feedback.message && (
          <div
            className={`mb-4 rounded-md border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <p>{feedback.message}</p>
          </div>
        )}

        {step === 1 && (
          <section aria-labelledby="reservation-heading">
            <h2
              id="reservation-heading"
              className="mb-6 text-center text-xl font-semibold text-gray-700"
            >
              Reservation Details
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <FaUser className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="adults-select">
                    Number of Adults
                  </label>
                  <select
                    id="adults-select"
                    value={reservationData.adults}
                    onChange={(e) =>
                      updateReservationData({ adults: Number(e.target.value) })
                    }
                    className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                  >
                    {adultOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <FaUser className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="children-select">
                    Number of Children
                  </label>
                  <select
                    id="children-select"
                    value={reservationData.children}
                    onChange={(e) =>
                      updateReservationData({ children: Number(e.target.value) })
                    }
                    className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                  >
                    {childrenOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <FaCalendarAlt className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="date-input">
                    Reservation Date
                  </label>
                  <input
                    id="date-input"
                    type="date"
                    value={reservationData.date}
                    onChange={(e) => updateReservationData({ date: e.target.value })}
                    min={todayDateString}
                    className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <FaClock className="text-yellow-500" aria-hidden="true" />
                  <label className="sr-only" htmlFor="time-input">
                    Reservation Time
                  </label>
                  <select
                    id="time-input"
                    value={reservationData.time}
                    onChange={(e) => updateReservationData({ time: e.target.value })}
                    className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                  >
                    {availableTimeSlots.length === 0 ? (
                      <option value="">No available times</option>
                    ) : (
                      availableTimeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {dateTimeValidationError && (
                <p className="text-xs text-red-600">{dateTimeValidationError}</p>
              )}

              {!dateTimeValidationError &&
                reservationData.date === todayDateString &&
                availableTimeSlots.length > 0 && (
                  <p className="text-xs text-gray-500">
                    For today, only time slots at least 2 hours from now are shown.
                  </p>
                )}

              <div className="flex items-center gap-2">
                <FaChair className="text-yellow-500" aria-hidden="true" />
                <label className="sr-only" htmlFor="seating-select">
                  Seating Preference
                </label>
                <select
                  id="seating-select"
                  value={reservationData.seating}
                  onChange={(e) => updateReservationData({ seating: e.target.value })}
                  className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:ring-2 focus:ring-yellow-500"
                >
                  {SEATING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 rounded bg-gray-50 p-3 text-center text-xs text-gray-500">
                <p>
                  A fee of ${PRICE_PER_PERSON} per person is required to secure your
                  booking. Non-refundable if canceled within 6 hours of booking or
                  no-show.
                </p>
              </div>

              <label className="mt-2 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={reservationData.agreement}
                  onChange={(e) =>
                    updateReservationData({ agreement: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4"
                  required
                />
                <span className="text-gray-500">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(true)}
                    className="text-yellow-700 underline transition hover:text-yellow-900"
                  >
                    Terms and Conditions
                  </button>
                  .
                </span>
              </label>

              <nav className="mt-6 flex justify-between">
                <button
                  onClick={handleBack}
                  disabled={step === 1}
                  className="rounded border px-4 py-2 focus:ring-2 focus:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Go back to previous step"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  className="rounded bg-yellow-500 px-6 py-2 text-white transition hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
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
            <h2
              id="information-heading"
              className="mb-4 text-center text-xl font-semibold text-gray-600"
            >
              Enter Your Information
            </h2>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="fullname"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Full Name *
                </label>
                <input
                  id="fullname"
                  type="text"
                  value={personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                  placeholder="Enter your email address"
                  className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={sendEmailVerificationCode}
                    disabled={isSendingOtp || !isValidGmail}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSendingOtp ? "Sending..." : "Send verification code"}
                  </button>
                  {emailVerification.status === "verified" && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      Verified
                    </span>
                  )}
                </div>

                {!isValidGmail && personalInfo.email.trim() !== "" && (
                  <p className="mt-2 text-xs text-red-600">
                    Please use a valid Gmail address.
                  </p>
                )}

                {emailVerification.status !== "verified" &&
                  emailVerification.otpToken !== "" && (
                    <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
                      <label
                        htmlFor="email-otp"
                        className="mb-1 block text-xs font-medium text-blue-700"
                      >
                        Enter 6-digit verification code
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          id="email-otp"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={emailOtpCode}
                          onChange={(event) =>
                            setEmailOtpCode(
                              event.target.value.replace(/[^0-9]/g, ""),
                            )
                          }
                          className="w-40 rounded border border-blue-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123456"
                        />
                        <button
                          type="button"
                          onClick={verifyEmailCode}
                          disabled={isVerifyingOtp}
                          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isVerifyingOtp ? "Verifying..." : "Verify code"}
                        </button>
                      </div>
                    </div>
                  )}

                {emailVerification.infoMessage && (
                  <p className="mt-2 text-xs text-green-700">
                    {emailVerification.infoMessage}
                  </p>
                )}
                {emailVerification.errorMessage && (
                  <p className="mt-2 text-xs text-red-600">
                    {emailVerification.errorMessage}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={personalInfo.phone}
                  onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="foodPreferences"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Food &amp; Drink Preferences
                </label>
                <input
                  id="foodPreferences"
                  type="text"
                  value={reservationData.foodPreferences}
                  onChange={(e) =>
                    updateReservationData({ foodPreferences: e.target.value })
                  }
                  placeholder="Any preferences"
                  className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label
                  htmlFor="allergies"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Allergies
                </label>
                <input
                  id="allergies"
                  type="text"
                  value={reservationData.allergies}
                  onChange={(e) =>
                    updateReservationData({ allergies: e.target.value })
                  }
                  placeholder="Please mention allergies"
                  className="w-full border-b border-yellow-500 p-2 text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label
                  htmlFor="request"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Any specific requests? (optional)
                </label>
                <textarea
                  id="request"
                  value={reservationData.specialRequests}
                  onChange={(e) =>
                    updateReservationData({ specialRequests: e.target.value })
                  }
                  placeholder="Specify your requests..."
                  className="w-full rounded-md border border-yellow-500 p-2 text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            {emailVerification.status !== "verified" && (
              <p className="mt-3 text-xs text-amber-700">
                Verify your email to continue.
              </p>
            )}
            <nav className="mt-6 flex justify-between">
              <button
                onClick={handleBack}
                className="rounded border px-4 py-2 text-gray-600 focus:ring-2 focus:ring-gray-500"
                aria-label="Go back to reservation details"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceedStep2}
                className="rounded bg-yellow-500 px-6 py-2 text-white transition hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Continue to confirmation"
              >
                Continue
              </button>
            </nav>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="confirmation-heading">
            <h2
              id="confirmation-heading"
              className="mb-4 text-center text-xl font-semibold text-gray-600"
            >
              Confirm Your Reservation
            </h2>
            <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-4">
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
                  {reservationData.children > 0 &&
                    `, ${reservationData.children} Children`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Date:</span>
                <span className="text-gray-400">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Time:</span>
                <span className="text-gray-400">
                  {reservationData.time
                    ? formatTime12Hour(reservationData.time)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Seating:</span>
                <span className="text-gray-400">{reservationData.seating}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Preferences:</span>
                <span className="text-right text-gray-400">
                  {reservationData.foodPreferences || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Allergies:</span>
                <span className="text-right text-gray-400">
                  {reservationData.allergies || "-"}
                </span>
              </div>
              <hr className="my-3 text-gray-400" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-900">Total Fee:</span>
                <span className="text-gray-900">${totalFee}</span>
              </div>
            </div>
            <nav className="mt-6 flex justify-between">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="rounded border border-gray-600 px-4 py-2 text-gray-600 focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                aria-label="Go back to personal information"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-3 rounded bg-yellow-500 px-6 py-2 text-white transition hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Submit reservation"
              >
                {isSubmitting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                )}
                {isSubmitting ? "Processing..." : "Confirm Reservation"}
              </button>
            </nav>
          </section>
        )}
      </main>

      {isTermsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsTermsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Terms and Conditions"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                Terms and Conditions
              </h3>
              <button
                type="button"
                onClick={() => setIsTermsOpen(false)}
                className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="space-y-4 text-sm leading-6 text-gray-700">
              {TERMS_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
