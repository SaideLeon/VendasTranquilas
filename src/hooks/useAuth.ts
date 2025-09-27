// src/hooks/useAuth.ts
'use client';

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const PUBLIC_PATHS = ["/login", "/register", "/", "/politica-de-privacidade", "/termos-e-condicoes"];

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    // This effect runs only on the client side
    const storedToken = localStorage.getItem("token");
    const isPublicPath = PUBLIC_PATHS.includes(pathname);

    if (!storedToken) {
      // No token found in storage
      if (!isPublicPath) {
        // If it's a protected route, redirect to login
        router.push("/login");
      } else {
        // If it's a public route, no auth is needed, stop loading
        setIsAuthenticating(false);
      }
      return; // Stop further execution in this effect run
    }

    // Token found, now validate it
    try {
      const decodedUser: User = jwtDecode(storedToken);
      const tokenExp = (decodedUser as any).exp; // exp is in seconds

      if (tokenExp * 1000 < Date.now()) {
        // Token is expired
        throw new Error("Token expired");
      }

      // Token is valid, set user and token state
      setToken(storedToken);
      setUser(decodedUser);

    } catch (error) {
      console.error("Authentication error:", error);
      // If token is invalid or expired, clear it
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);

      if (!isPublicPath) {
        // Redirect to login if on a protected route
        router.push("/login");
      }
    } finally {
      // Finished authentication process
      setIsAuthenticating(false);
    }
  }, [pathname, router]);

  return { token, user, isAuthenticating };
}
