'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminAPI } from '@/lib/endpoints';
import AdminClientPage from './admin-client-page';
import { Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';

// Define types based on what the API returns
// These might need adjustment based on the actual API response
type UserWithSubscription = {
  id: string;
  name: string;
  email: string;
  role: string;
  subscription: {
    id: string;
    plan: { id: string; name: string };
    startDate: string;
    endDate: string;
    isActive: boolean;
  } | null;
};
type Plan = { id: string; name: string };

export default function AdminPage() {
  const { token, user, isAuthenticating } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticating) return;

    if (!token || !user) {
      router.push('/login');
      return;
    }

    const checkAdminAndFetchData = async () => {
      try {
        if (user.role !== 'ADMIN') {
          router.push('/'); // Redirect non-admins
          return;
        }
        setIsAdmin(true);

        const [usersResponse, plansResponse] = await Promise.all([
          AdminAPI.getAllUsersWithSubscription(),
          AdminAPI.getPlans(),
        ]);

        setUsers(usersResponse.data);
        setPlans(plansResponse.data);
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response) {
            setError(err.response?.data?.message || "Falha ao carregar dados do administrador.");
        } else if (err instanceof Error) {
            setError(err.message)
        }
        else {
            setError("Falha ao carregar dados do administrador.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [token, user, isAuthenticating, router]);

  if (isAuthenticating || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">Verificando permissões e carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-destructive">Erro</h1>
        <p className="text-destructive-foreground">{error}</p>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminClientPage users={users} plans={plans} />;
  }

  // This should ideally not be reached due to redirects, but as a fallback:
  return null;
}
