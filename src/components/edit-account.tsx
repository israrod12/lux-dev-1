'use client';

import { useState } from 'react';
import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  ExclamationCircleIcon,
  EyeIcon, 
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { useActionState } from 'react';
import { updateUser, State } from '@/lib/actions';

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function EditAccountForm({ user }: { user: User }) {
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [state, formAction, isPending] = useActionState(
    (prevState: State, formData: FormData) => updateUser(user.id, prevState, formData),
    { errors: {}, message: '' }
  );
  
   

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`mb-3 text-2xl`}>
          Edit your account
        </h1>
        <div className="w-full space-y-4">
          <div>
            <label htmlFor="firstName" className="mb-3 block text-xs font-medium text-gray-900">
              First Name
            </label>
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500"/>
            </div>
            {state?.errors?.firstName?.[0] && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{state.errors.firstName[0]}</p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="mb-3 block text-xs font-medium text-gray-900">
              Last Name
            </label>
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500"/>
            </div>
            {state?.errors?.lastName?.[0] && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{state.errors.lastName[0]}</p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-3 block text-xs font-medium text-gray-900">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500"/>
            </div>
            {state?.errors?.email?.[0] && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              </>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-3 block text-xs font-medium text-gray-900">
              New Password (optional)
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 pr-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500"/>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {state?.errors?.password?.[0] && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{state.errors.password[0]}</p>
              </>
            )}
          </div>
        </div>

        {state?.message && (
          <p className="text-sm text-red-500 mt-2">{state.message}</p>
        )}

        <Button className="mt-6 w-full" aria-disabled={isPending}>
          Save Changes <CheckIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
      </div>
    </form>
  );
}
