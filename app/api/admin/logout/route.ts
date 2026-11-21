import { NextRequest, NextResponse } from 'next/server';
import { buildAdminCookieHeader, isTrustedMutationRequest } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!isTrustedMutationRequest(req)) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', buildAdminCookieHeader(req, '', 0));
  return res;
}
