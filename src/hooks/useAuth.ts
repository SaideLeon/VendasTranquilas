import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // This effect runs only on the client side
    const t = localStorage.getItem("token");
    const isPublicPath = pathname === "/login" || pathname === "/register" || pathname === "/" || pathname === "/politica-de-privacidade" || pathname === "/termos-e-condicoes";

    if (!t) {
      if (!isPublicPath) {
        // If no token and not on a public page, redirect to login
        window.location.href = "/login";
      } else {
        // If on a public page, no token is needed
        setIsAuthenticating(false);
      }
    } else {
      setToken(t);
      try {
        const decodedUser: User = jwtDecode(t);
        setUser(decodedUser);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        if (!isPublicPath) {
          window.location.href = "/login";
        }
      } finally {
        setIsAuthenticating(false);
      }
    }
  }, [pathname]);

  return { token, user, isAuthenticating };
}
