import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

type UserId = string;

declare module 'next-auth/jwt' {
  interface JWT {
    id: UserId;
    role: string; // Add role
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: UserId;
      role: string; // Add role
    } & Session['user'];
  }
  interface User {
      role: string; // Add role
  }
}
