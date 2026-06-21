'use client';

import { useState } from 'react';

type Variant = 'inline' | 'card' | 'minimal';

interface EmailSignupProps {
  variant?: Variant;
  heading?: string;
  description?: string;
  buttonLabel?: string;
  placeholder?: string;
  source?: string;
}

type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export default function EmailSignup({
  variant = 'inline',
  heading,
  description,
  buttonLabel = 'Subscribe',
  placeholder = 'you@example.com',
  source,
}: EmailSignupProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>({ status: 'idle' });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state.status === 'submitting') return;
    setState({ status: 'submitting' });

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source,
          signupUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          language: typeof navigator !== 'undefined' ? navigator.language : undefined,
        }),
      });

      const data: { ok?: boolean; isNew?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setState({
          status: 'error',
          message: data.error || 'Something went wrong. Please try again later.',
        });
        return;
      }

      setState({
        status: 'success',
        message: data.isNew
          ? 'Thanks for signing up — check your inbox.'
          : "You're already on the list. Thanks for staying with us.",
      });
      setEmail('');
    } catch {
      setState({
        status: 'error',
        message: 'Could not reach the subscription service. Please try again later.',
      });
    }
  };

  const submitting = state.status === 'submitting';

  const containerStyles: Record<Variant, string> = {
    inline: '',
    card: 'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
    minimal: '',
  };

  const inner = (
    <div className={containerStyles[variant]}>
      {heading && (
        <h3 className="text-base font-semibold text-gray-900 mb-1">{heading}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}

      <form onSubmit={onSubmit} noValidate className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`email-${variant}`} className="sr-only">
          Email address
        </label>
        <input
          id={`email-${variant}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={placeholder}
          disabled={submitting}
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : buttonLabel}
        </button>
      </form>

      {state.status === 'success' && (
        <p className="mt-3 text-sm text-emerald-700" role="status">
          {state.message}
        </p>
      )}
      {state.status === 'error' && (
        <p className="mt-3 text-sm text-rose-700" role="alert">
          {state.message}
        </p>
      )}
    </div>
  );

  // The card variant stands alone as a full section, so it carries its own
  // padding and centered width instead of relying on a page-level wrapper.
  // inline / minimal are meant to be embedded and render bare.
  if (variant === 'card') {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="mx-auto max-w-xl">{inner}</div>
      </section>
    );
  }

  return inner;
}
