"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNextPath = searchParams.get("next") || "/profile";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/profile";

  useEffect(() => {
    router.replace(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }, [nextPath, router]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-24">
      <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
        Redirecting to login...
      </div>
    </div>
  );
}
