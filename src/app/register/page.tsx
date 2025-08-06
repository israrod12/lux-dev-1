"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  AtSymbolIcon, 
  KeyIcon, 
  UserIcon, 
  ExclamationCircleIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/button";

type ValidationErrors = {
  [field: string]: string[];
};

export default function Register() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(userInfo),
        headers: {
          "Content-Type": "application/json",
        },
      });
 
      const data = await res.json();

      if (res.ok) {
        router.push("/signin");
      } else {
        // Si el backend te devuelve errores de validación en data.errors
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.error) {
          setGeneralError(data.error);
        } else {
          setGeneralError("An error occurred during registration");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }; 
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form 
        onSubmit={handleRegister} 
        className="flex-1 max-w-md rounded-lg bg-white px-6 pb-6 pt-8 shadow"
      >
        <h1 className="mb-6 text-2xl font-semibold text-center">
          Create your account
        </h1>

        {generalError && (
          <div className="mb-4 flex items-center gap-2 rounded bg-red-100 p-3 text-red-700">
            <ExclamationCircleIcon className="h-5 w-5" />
            <p>{generalError}</p>
          </div>
        )}

        {/* First Name */}
        <div className="mb-4">
          <label htmlFor="firstName" className="mb-1 block text-xs font-medium text-gray-900">
            First Name
          </label>
          <div className="relative">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              placeholder="John"
              value={userInfo.firstName}
              onChange={(e) =>
                setUserInfo({ ...userInfo, firstName: e.target.value })
              }
              className={`peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:ring-1 focus:ring-primary ${
                errors.firstName ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"
              }`}
            />
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName[0]}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label htmlFor="lastName" className="mb-1 block text-xs font-medium text-gray-900">
            Last Name
          </label>
          <div className="relative">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              placeholder="Doe"
              value={userInfo.lastName}
              onChange={(e) =>
                setUserInfo({ ...userInfo, lastName: e.target.value })
              }
              className={`peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:ring-1 focus:ring-primary ${
                errors.lastName ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"
              }`}
            />
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName[0]}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-900">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo({ ...userInfo, email: e.target.value })
              }
              className={`peer block w-full rounded-md border py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:ring-1 focus:ring-primary ${
                errors.email ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"
              }`}
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-900">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="••••••••"
              value={userInfo.password}
              onChange={(e) =>
                setUserInfo({ ...userInfo, password: e.target.value })
              }
              className={`peer block w-full rounded-md border py-[9px] pl-10 pr-10 text-sm outline-2 placeholder:text-gray-500 focus:ring-1 focus:ring-primary ${
                errors.password ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-primary"
              }`}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
          {!isLoading && (
            <ArrowRightIcon className="ml-2 inline-block h-5 w-5 text-white" />
          )}
        </Button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
