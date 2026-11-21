import crypto from 'node:crypto';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { NextRequest } from 'next/server';
import firebaseConfig from '@/firebase-applet-config.json';

export const ADMIN_COOKIE_NAME = 'thinkcode_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

declare global {
  var _thinkcodeAdminSessionSecret: string | undefined;
}

function getSigningSecret(): string {
  const fromEnv = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSCODE;
  if (fromEnv && fromEnv.trim().length > 0) {
    return crypto.createHash('sha256').update(`thinkcode_cookie_key:${fromEnv}`).digest('hex');
  }
  if (!global._thinkcodeAdminSessionSecret) {
    global._thinkcodeAdminSessionSecret = crypto.randomBytes(32).toString('hex');
  }
  return global._thinkcodeAdminSessionSecret;
}

function getFirebaseAdminAuth() {
  const app = getApps().length
    ? getApp()
    : initializeApp({ projectId: firebaseConfig.projectId });
  return getAuth(app);
}

export async function verifyBearerFirebaseUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;
  try {
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

export function isTrustedMutationRequest(req: NextRequest): boolean {
  const requestedWith = req.headers.get('x-requested-with');
  if (requestedWith === 'XMLHttpRequest') {
    return true;
  }
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (!origin || !host) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export function verifyConfiguredPasscode(submitted: string): {
  configured: boolean;
  valid: boolean;
} {
  const configuredPasscode = process.env.ADMIN_PASSCODE?.trim();
  if (!configuredPasscode) {
    return { configured: false, valid: false };
  }
  const submittedDigest = crypto.createHash('sha256').update(submitted.trim()).digest();
  const configuredDigest = crypto.createHash('sha256').update(configuredPasscode).digest();
  return {
    configured: true,
    valid: crypto.timingSafeEqual(submittedDigest, configuredDigest),
  };
}

export function createAdminSessionCookieValue(uid: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAdminSessionCookie(cookieValue: string | undefined, expectedUid: string): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      uid?: string;
      exp?: number;
    };
    if (!decoded.uid || decoded.uid !== expectedUid) return false;
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

export function buildAdminCookieHeader(req: NextRequest, value: string, maxAge = SESSION_TTL_SECONDS): string {
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '');
  const isHttps = proto === 'https';
  const parts = [
    `${ADMIN_COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${maxAge}`,
  ];
  if (isHttps) {
    parts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  return parts.join('; ');
}
