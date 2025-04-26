"use client"; // Required for redirect

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/produtos');
  }, [router]);

  return null; // Return null or a loading indicator while redirecting
}
