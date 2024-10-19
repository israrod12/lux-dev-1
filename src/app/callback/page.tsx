"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { update } = useSession();

  useEffect(() => {
    const handleCallback = async () => {
      router.push("/");
    };

    handleCallback();
  }, [router, searchParams, update]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing verification result...</p>
    </div>
  );
}
