"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthRedirectFallback() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
        Redirecting to login...
      </div>
    </div>
  );
}

function AuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNextPath = searchParams.get("next") || "/profile";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/profile";

  useEffect(() => {
    router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }, [nextPath, router]);

  return <AuthRedirectFallback />;
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={<AuthRedirectFallback />}>
      <AuthRedirectContent />
    </Suspense>
  );
}
