'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createPlan } from "@/app/actions";
import type { PlanName } from "@prisma/client";

const FormSchema = z.object({
  name: z.enum(['GRATUITO', 'PROFISSIONAL', 'EMPRESARIAL'], {
    required_error: "Você precisa selecionar um tipo de plano.",
  }),
});

export function CreatePlanForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      await createPlan(data.name as PlanName);
      toast({
        title: "Plano Criado",
        description: `O plano "${data.name}" foi criado com sucesso.`,
      });
      // Atualiza os dados da página do servidor
      router.refresh();
      form.reset({ name: undefined });
    } catch (error) {
      toast({
        title: "Erro ao Criar Plano",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Nome do Plano</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano para cadastrar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="GRATUITO">Gratuito</SelectItem>
                  <SelectItem value="PROFISSIONAL">Profissional</SelectItem>
                  <SelectItem value="EMPRESARIAL">Empresarial</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Cadastrar Plano</Button>
      </form>
    </Form>
  );
}
