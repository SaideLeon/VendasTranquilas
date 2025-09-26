// src/lib/auth-utils.ts
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

// WARNING: This function only decodes the token. It does not verify the signature.
// For production, a library like 'jose' or 'jsonwebtoken' should be used to verify the token signature.
export function getUserIdFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Optional: Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
        console.warn('Expired token received');
        return null;
    }
    return decoded.userId;
  } catch (error) {
    console.error('JWT Decode failed', error);
    return null;
  }
}
