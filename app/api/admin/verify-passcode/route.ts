import { NextRequest, NextResponse } from 'next/server';
import {
  buildAdminCookieHeader,
  createAdminSessionCookieValue,
  isTrustedMutationRequest,
  verifyBearerFirebaseUser,
  verifyConfiguredPasscode,
} from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  if (!isTrustedMutationRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Untrusted request origin.' }, { status: 403 });
  }

  const decodedUser = await verifyBearerFirebaseUser(req);
  if (!decodedUser) {
    return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
  }

  let body: { passcode?: unknown };
  try {
    body = (await req.json()) as { passcode?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON request body.' }, { status: 400 });
  }

  if (typeof body.passcode !== 'string' || body.passcode.trim().length === 0) {
    return NextResponse.json({ ok: false, error: 'Enter the admin passcode.' }, { status: 400 });
  }

  const check = verifyConfiguredPasscode(body.passcode);
  if (!check.configured) {
    return NextResponse.json(
      {
        ok: false,
        needsSecretConfig: true,
        error: 'ADMIN_PASSCODE is not configured in environment secrets yet.',
      },
      { status: 503 }
    );
  }

  if (!check.valid) {
    return NextResponse.json({ ok: false, error: 'Invalid admin passcode.' }, { status: 403 });
  }

  const cookieVal = createAdminSessionCookieValue(decodedUser.uid);
  const res = NextResponse.json({ ok: true, uid: decodedUser.uid });
  res.headers.set('Set-Cookie', buildAdminCookieHeader(req, cookieVal));
  return res;
}
