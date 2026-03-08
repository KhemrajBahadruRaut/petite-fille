"use client";

import React, { Suspense } from "react";
import OtpAuthCard from "@/components/auth/OtpAuthCard";

function AuthPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
        Loading login...
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <OtpAuthCard mode="login" />
    </Suspense>
  );
}
