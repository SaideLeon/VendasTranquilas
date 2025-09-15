import api from "./api";
import type { Product, Sale, Debt } from '@/types';

// This was in prisma, defining it manually now.
export type PlanName = 'GRATUITO' | 'PROFISSIONAL' | 'EMPRESARIAL';

export const AuthAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const ProductAPI = {
  list: () => api.get<Product[]>("/products"),
  create: (data: Omit<Product, 'id' | 'createdAt' | 'userId' | 'user'>) =>
    api.post<Product>("/products", data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  remove: (id: string) => api.delete(`/products/${id}`),
};

export const SaleAPI = {
  list: () => api.get<Sale[]>("/sales"),
  create: (data: Omit<Sale, 'id' | 'createdAt' | 'productName' | 'profit' | 'userId' | 'user'>) =>
    api.post<Sale>("/sales", data),
  remove: (id: string) => api.delete(`/sales/${id}`),
};

export const DebtAPI = {
  list: () => api.get<Debt[]>("/debts"),
  create: (data: Omit<Debt, 'id' | 'createdAt' | 'status' | 'amountPaid' | 'userId' | 'user'>) =>
    api.post<Debt>("/debts", data),
  update: (id: string, data: Partial<Omit<Debt, 'id' | 'createdAt' | 'userId' | 'user'>>) =>
    api.put<Debt>(`/debts/${id}`, data),
  remove: (id: string) => api.delete(`/debts/${id}`),
};

export const AdminAPI = {
    getAllUsersWithSubscription: () => api.get('/admin/users'),
    getPlans: () => api.get('/admin/plans'),
    createPlan: (planName: PlanName) => api.post('/admin/plans', { name: planName }),
    updateUserSubscription: (userId: string, planId: string, durationInDays: number) => api.post(`/admin/users/${userId}/subscription`, { planId, durationInDays }),
    deactivateSubscription: (subscriptionId: string) => api.patch(`/admin/subscriptions/${subscriptionId}/deactivate`),
};
