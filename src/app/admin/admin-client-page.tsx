'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield } from 'lucide-react';
import { deactivateSubscription, updateUserSubscription, getPlans, getAllUsersWithSubscription } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Define types based on what actions return
type UserWithSubscription = Awaited<ReturnType<typeof getAllUsersWithSubscription>>[0];
type Plan = Awaited<ReturnType<typeof getPlans>>[0];


interface AdminClientPageProps {
  users: UserWithSubscription[];
  plans: Plan[];
}

function ManageSubscriptionModal({ user, plans, onSubscriptionUpdate }: { user: UserWithSubscription, plans: Plan[], onSubscriptionUpdate: () => void }) {
  const [selectedPlanId, setSelectedPlanId] = useState(user.subscription?.plan.id || '');
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleRenew = async () => {
    if (!selectedPlanId) {
      toast({ title: "Erro", description: "Selecione um plano.", variant: "destructive" });
      return;
    }
    try {
      await updateUserSubscription(user.id, selectedPlanId, 30);
      toast({ title: "Sucesso", description: `Assinatura de ${user.name} foi renovada/atualizada.` });
      onSubscriptionUpdate(); // Callback to refresh data
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível renovar a assinatura.", variant: "destructive" });
    }
  };

  const handleDeactivate = async () => {
    if (!user.subscription) return;
    try {
      await deactivateSubscription(user.subscription.id);
      toast({ title: "Sucesso", description: `Assinatura de ${user.name} foi desativada.` });
      onSubscriptionUpdate();
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Erro", description: "NÃ£o foi possÃvel desativar a assinatura.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Gerenciar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Assinatura de {user.name}</DialogTitle>
          <DialogDescription>
            Selecione um plano para ativar ou renovar por 30 dias. A data de inÃcio serÃ¡ hoje.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                    {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <div className="flex justify-between items-center">
                <Button onClick={handleRenew} disabled={!selectedPlanId}>Ativar / Renovar</Button>
                {user.subscription?.isActive && (
                    <Button variant="destructive" onClick={handleDeactivate}>Desativar</Button>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


export default function AdminClientPage({ users: initialUsers, plans }: AdminClientPageProps) {
    const [users, setUsers] = useState(initialUsers);

    const refreshUsers = async () => {
        const updatedUsers = await getAllUsersWithSubscription();
        setUsers(updatedUsers);
    };

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Painel Administrativo
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>UsuÃ¡rio</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map((user) => (
                    <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground"/>
                        {user.name}
                        {user.role === 'ADMIN' && <Badge variant="secondary">Admin</Badge>}
                        </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                        {user.subscription ? (
                        <Badge>{user.subscription.plan.name}</Badge>
                        ) : (
                        <Badge variant="outline">Sem Plano</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        {user.subscription ? (
                        user.subscription.isActive ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>
                        ) : (
                            <Badge variant="destructive">Inativa</Badge>
                        )
                        ) : (
                        'N/A'
                        )}
                    </TableCell>
                    <TableCell>
                        {user.subscription ? format(parseISO(user.subscription.endDate), 'dd/MM/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                         {user.role !== 'ADMIN' && <ManageSubscriptionModal user={user} plans={plans} onSubscriptionUpdate={refreshUsers} />}
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
}
