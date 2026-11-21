import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookie,
  verifyBearerFirebaseUser,
} from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const decodedUser = await verifyBearerFirebaseUser(req);
  if (!decodedUser) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = verifyAdminSessionCookie(cookieVal, decodedUser.uid);
  return NextResponse.json({ isAdmin: valid });
}
