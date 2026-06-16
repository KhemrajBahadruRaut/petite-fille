import { Suspense } from "react";
import CheckoutSuccessPage from "./CheckoutSuccessPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white pt-25">
          <p style={{ fontFamily: "arial" }}>Loading...</p>
        </div>
      }
    >
      <CheckoutSuccessPage />
    </Suspense>
  );
}