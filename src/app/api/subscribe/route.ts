// Email signup endpoint.
//
// POST { email, source?, signupUrl?, language?, country? }
//
// Upserts the contact into the configured SendGrid Marketing list. Behaves
// safely if env vars are missing: returns a 503 telling the client the
// service isn't configured, instead of throwing in production.
//
// Env vars (set in Vercel project settings):
//   SENDGRID_API_KEY        — server-side, never exposed to the client
//   SENDGRID_LIST_COGOODS   — Marketing list ID for Co-Goods subscribers

import { NextResponse } from 'next/server';

const SENDGRID_API = 'https://api.sendgrid.com/v3';

interface Body {
  email?: string;
  source?: string;
  signupUrl?: string;
  language?: string;
  country?: string;
}

interface SendGridContact {
  email: string;
  custom_fields: Record<string, string>;
  country?: string;
}

async function searchContact(email: string, apiKey: string) {
  const res = await fetch(`${SENDGRID_API}/marketing/contacts/search/emails`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emails: [email] }),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`SendGrid search failed: ${res.status}`);
  }
  const data: { result?: Record<string, { contact?: unknown }> } = await res.json();
  return data.result?.[email]?.contact ?? null;
}

export async function POST(req: Request) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const listId = process.env.SENDGRID_LIST_COGOODS;

  if (!apiKey || !listId) {
    return NextResponse.json(
      { error: 'Email signup is not configured yet. Please try again later.' },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  let existing;
  try {
    existing = await searchContact(email, apiKey);
  } catch {
    return NextResponse.json(
      { error: 'Subscription service is currently unavailable. Please try again later.' },
      { status: 502 },
    );
  }
  const isNew = !existing;

  const custom_fields: Record<string, string> = {
    cg_subscribed: 'TRUE',
  };
  if (isNew) {
    custom_fields.subscriber_source = 'cogoods';
    if (body.source) custom_fields.cg_newsletter_source = body.source;
    if (body.signupUrl) custom_fields.cg_signup_url = body.signupUrl;
  }
  if (body.language) custom_fields.language = body.language;
  if (body.country) custom_fields.country_code = body.country;

  const contact: SendGridContact = { email, custom_fields };
  if (body.country) {
    try {
      const region = new Intl.DisplayNames(['en'], { type: 'region' });
      contact.country = region.of(body.country.toUpperCase()) || body.country;
    } catch {
      contact.country = body.country;
    }
  }

  const putRes = await fetch(`${SENDGRID_API}/marketing/contacts`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ list_ids: [listId], contacts: [contact] }),
  });

  if (!putRes.ok) {
    return NextResponse.json(
      { error: 'Subscription failed. Please try again later.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, isNew });
}
