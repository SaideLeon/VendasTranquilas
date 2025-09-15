import { useEffect, useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      // Check if we are already on the login or register page to avoid redirection loop
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login"; // redireciona se não estiver logado
      }
    } else {
      setToken(t);
    }
    setIsAuthenticating(false);
  }, []);

  return { token, isAuthenticating };
}
