"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function CallbackContent() {
  const router = useRouter();
  const { update } = useSession();

  useEffect(() => {
    const handleCallback = async () => {
      // Perform any necessary operations with searchParams here
      // For example, you might want to update the session or process verification results
      await update();
      router.push("/");
    };

    handleCallback();
  }, [router, update]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing verification result...</p>
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
