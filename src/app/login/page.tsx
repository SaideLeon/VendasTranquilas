"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthAPI } from "@/lib/endpoints";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await AuthAPI.login(form);
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/produtos"; // Redirect to a protected page
      } else {
        throw new Error("Token não recebido do servidor.");
      }
    } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
            toast({
                title: "Erro no Login",
                description: error.response?.data?.message || "Credenciais inválidas. Tente novamente.",
                variant: "destructive",
            });
        } else if (error instanceof Error) {
            toast({
                title: "Erro no Login",
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Erro no Login",
                description: "Ocorreu um erro desconhecido.",
                variant: "destructive",
            });
        }
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bem-vindo ao SIGEF</CardTitle>
          <CardDescription>
            Acesse sua conta para gerenciar suas finanças.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                required
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleInputChange}
                required
                placeholder="********"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="