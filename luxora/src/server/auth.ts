import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';

export interface AuthenticatedAdmin {
  id: number;
  username: string;
  email: string;
  role: 'super_admin' | 'editor';
}

export interface AdminSession {
  id: string;
  adminId: number;
  csrfToken: string;
  expiresAt: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
      sessionData?: AdminSession;
      csrfToken?: string;
    }
  }
}

// ----------------------------------------------------
// 1. In-Memory Rate Limiting for Sensitive Endpoints
// ----------------------------------------------------
interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

const loginRateLimiter = new Map<string, RateLimitEntry>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimiter.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  // If locked out
  if (entry.lockedUntil > now) {
    const remainingSec = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: remainingSec };
  }

  // Reset if window passed (30 mins without activity)
  if (now - entry.lastAttempt > 30 * 60 * 1000) {
    loginRateLimiter.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const entry = loginRateLimiter.get(ip) || { attempts: 0, lockedUntil: 0, lastAttempt: now };

  entry.attempts += 1;
  entry.lastAttempt = now;

  if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  loginRateLimiter.set(ip, entry);
}

export function recordSuccessfulLogin(ip: string) {
  loginRateLimiter.delete(ip);
}

// ----------------------------------------------------
// 2. Cryptographic Token Generators & Hash Helpers
// ----------------------------------------------------
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText, 12);
}

export function verifyPassword(plainText: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(plainText, hash);
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 3. Purchase URL & Input Sanitization
// ----------------------------------------------------
export function validatePurchaseUrl(rawUrl: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Purchase URL is required.' };
  }

  const trimmed = rawUrl.trim();

  // Explicitly deny dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return { valid: false, error: 'Dangerous URL scheme rejected.' };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Purchase destination must be an HTTP or HTTPS link.' };
    }
    return { valid: true, sanitized: parsed.href };
  } catch {
    return { valid: false, error: 'Invalid URL format.' };
  }
}

export function validateImageUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || lower.startsWith('file:')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// 4. Audit Logging Helper (Async & Safe)
// ----------------------------------------------------
export async function logAudit(
  adminId: number | null,
  adminUsername: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  details: string | null,
  req?: Request
) {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1' : '127.0.0.1';
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO audit_logs (admin_id, admin_username, action, entity_type, entity_id, details, ip_address, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, adminUsername, action, entityType, entityId, details, ip, now]
    );
  } catch (err) {
    console.error('[LUXORA AUDIT LOG ERROR]:', err);
  }
}

// ----------------------------------------------------
// 5. Authentication & Authorization Middlewares
// ----------------------------------------------------
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionToken = req.cookies?.luxora_admin_session || 
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!sessionToken || typeof sessionToken !== 'string') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication session required. Access denied.'
    });
    return;
  }

  const now = new Date().toISOString();

  try {
    // Query session joined with active admin
    const sessionRow = await db.queryOne<{
      session_id: string;
      admin_id: number;
      csrf_token: string;
      expires_at: string;
      username: string;
      email: string;
      role: 'super_admin' | 'editor';
      is_active: number;
    }>(
      `SELECT 
        s.id as session_id,
        s.admin_id,
        s.csrf_token,
        s.expires_at,
        a.username,
        a.email,
        a.role,
        a.is_active
      FROM admin_sessions s
      JOIN admins a ON s.admin_id = a.id
      WHERE s.id = ? AND s.expires_at > ?`,
      [sessionToken, now]
    );

    if (!sessionRow || Number(sessionRow.is_active) !== 1) {
      // Clear cookie if expired or invalid
      res.clearCookie('luxora_admin_session', { path: '/' });
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Session has expired or credentials revoked. Please sign in again.'
      });
      return;
    }

    req.admin = {
      id: sessionRow.admin_id,
      username: sessionRow.username,
      email: sessionRow.email,
      role: sessionRow.role
    };

    req.sessionData = {
      id: sessionRow.session_id,
      adminId: sessionRow.admin_id,
      csrfToken: sessionRow.csrf_token,
      expiresAt: sessionRow.expires_at
    };

    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Authentication verification service error.' });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(allowedRoles: ('super_admin' | 'editor')[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient administrative privileges for this operation.'
      });
      return;
    }

    next();
  };
}

/**
 * CSRF Protection for state-changing HTTP operations
 */
export function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  // Only protect state-changing verbs
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  const clientCsrf = req.headers['x-csrf-token'] || req.body?._csrf;
  const expectedCsrf = req.sessionData?.csrfToken;

  if (!clientCsrf || !expectedCsrf || clientCsrf !== expectedCsrf) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or missing CSRF validation token.'
    });
    return;
  }

  next();
}
