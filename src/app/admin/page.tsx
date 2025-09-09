import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { getAllUsersWithSubscription, getPlans } from '@/app/actions';
import AdminClientPage from './admin-client-page';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    // You can also redirect to a custom unauthorized page
    redirect('/'); 
  }

  try {
    const users = await getAllUsersWithSubscription();
    const plans = await getPlans();
    return <AdminClientPage users={users} plans={plans} />;
  } catch (error) {
    console.error("Failed to load admin data:", error);
    // A simple error message for the admin.
    // In a real app, you might want a more sophisticated error page.
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-destructive">Error</h1>
        <p className="text-destructive-foreground">Could not load user data. Please try again later.</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }
}
