// src/components/layout/DbProvider.tsx
'use client';

import { db } from '@/lib/db';
import { ReactNode } from 'react';

// This is a simple component that doesn't do much,
// but it's a good practice to have a provider for the database.
// In the future, we could add more logic here, like handling migrations.
export function DbProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
