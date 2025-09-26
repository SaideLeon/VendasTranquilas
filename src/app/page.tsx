'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';    
export default function HomePage() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href) {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.card-hover, .animate-slide-up').forEach(el => {
        observer.observe(el);
    });

    return () => {
      observer.disconnect();
    }
  }, []);

  return (
    <>
      <Head>
        <title>SIGEF - Sistema Intuitivo de Gestão Financeira</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            font-family: 'Inter', sans-serif;
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, #4DB6AC 0%, #26A69A 50%, #00897B 100%);
        }
        
        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
            background: linear-gradient(135deg, #4DB6AC, #26A69A);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .animate-fade-in {
            animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-up {
            animation: slideUp 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        
        @keyframes floating {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        .pulse-bg {
            animation: pulse-background 2s infinite;
        }
        
        @keyframes pulse-background {
            0%, 100% { background-color: rgb(77, 182, 172); }
            50% { background-color: rgb(38, 166, 154); }
        }
      `}</style>
    <div className="bg-gray-50">
    {/* Navigation */}
    <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-2">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </div>
                    <span className="ml-2 text-xl font-bold text-gray-800">SIGEF</span>
                </div>
                <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                        <a href="#features" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Recursos</a>
                        <a href="#benefits" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Benefícios</a>
                        <a href="#pricing" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium transition duration-300">Preços</a>
                        <Link href="/login" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 transform hover:scale-105">
                            Começar Agora
                        </Link>
                    </div>
                </div>
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Abrir menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full max-w-xs">
                            <div className="flex flex-col space-y-6 p-6">
                                <SheetClose asChild>
                                    <a href="#features" className="text-gray-800 hover:text-teal-600 text-lg">Recursos</a>
                                </SheetClose>
                                <SheetClose asChild>
                                    <a href="#benefits" className="text-gray-800 hover:text-teal-600 text-lg">Benefícios</a>
                                </SheetClose>
                                <SheetClose asChild>
                                    <a href="#pricing" className="text-gray-800 hover:text-teal-600 text-lg">Preços</a>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Link href="/login" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold text-lg text-center transition duration-300">
                                        Começar Agora
                                    </Link>
                                </SheetClose>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    </nav>

    {/* Hero Section */}
    <section className="gradient-bg text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                    Gerencie suas Finanças com
                    <span className="text-yellow-300"> Inteligência</span>
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
                    O SIGEF é o sistema completo para controlar produtos, vendas, dívidas e obter insights poderosos com IA para seu negócio
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/login" className="pulse-bg text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition duration-300 transform hover:scale-105 min-w-[200px]">
                        🚀 Começar Gratuitamente
                    </Link>
                    <Link href="#features" className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 min-w-[200px]">
                        📺 Ver Demonstração
                    </Link>
                </div>
            </div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute top-20 left-10 floating">
            <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
            </div>
        </div>
        <div className="absolute top-40 right-10 floating" style={{animationDelay: '1s'}}>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
            </div>
        </div>
    </section>

    {/* Features Section */}
    <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-slide-up">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Tudo que você precisa em um só lugar
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Recursos poderosos e intuitivos para transformar a gestão do seu negócio
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover border border-gray-100">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-3 w-fit mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Gestão de Produtos</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Controle completo do seu estoque com tracking automático de quantidades, custos e valores de aquisição.
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 w-fit mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Registro de Vendas</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Registre vendas e perdas facilmente, com cálculo automático de lucros e atualização de estoque em tempo real.
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover border border-gray-100">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 w-fit mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Controle de Dívidas</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Gerencie contas a pagar e receber com datas de vencimento, status de pagamento e histórico completo.
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover border border-gray-100">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 w-fit mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Relatórios Detalhados</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Visualize métricas importantes como faturamento, lucros, produtos mais rentáveis e análise de desempenho.
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover border border-gray-100">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 w-fit mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Análise com IA</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Obtenha insights inteligentes e recomendações personalizadas para otimizar seu negócio usando inteligência artificial.
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover border border-gray-100">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-3 w-fit mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Multiplataforma</h3>
                    <p className="text-gray-600 leading-relaxed">
                        Acesse seus dados em qualquer dispositivo com sincronização automática entre desktop, tablet e celular.
                    </p>
                </div>
            </div>
        </div>
    </section>

    {/* Benefits Section */}
    <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="animate-slide-up">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Por que escolher o SIGEF?
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="bg-teal-100 rounded-lg p-2 mt-1">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Simplicidade e Facilidade</h3>
                                <p className="text-gray-600">Interface intuitiva que qualquer pessoa pode usar, sem necessidade de treinamento complexo.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                            <div className="bg-teal-100 rounded-lg p-2 mt-1">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Otimizada</h3>
                                <p className="text-gray-600">Sistema rápido e responsivo, construído com as melhores tecnologias modernas.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                            <div className="bg-teal-100 rounded-lg p-2 mt-1">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Segurança Garantida</h3>
                                <p className="text-gray-600">Seus dados protegidos com autenticação Google e backup automático na nuvem.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative">
                    <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl transform rotate-3">
                        <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm opacity-75">Dashboard</span>
                                <div className="flex space-x-1">
                                    <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></div>
                                    <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></div>
                                    <div className="w-3 h-3 bg-white bg-opacity-60 rounded-full"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-white bg-opacity-40 rounded h-4 w-full"></div>
                                <div className="bg-white bg-opacity-40 rounded h-4 w-3/4"></div>
                                <div className="bg-white bg-opacity-40 rounded h-4 w-1/2"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">15.430 MT</div>
                                <div className="text-sm opacity-75">Faturamento</div>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <div className="text-2xl font-bold">247</div>
                                <div className="text-sm opacity-75">Vendas</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Pricing Section */}
    <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Planos que crescem com seu negócio
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Escolha o plano ideal para suas necessidades. Comece grátis e evolua quando precisar.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuito</h3>
                        <div className="text-4xl font-bold text-gray-900 mb-1">0,00 MT</div>
                        <div className="text-gray-600">Para sempre</div>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Até 50 produtos</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Até 100 transações/mês</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Relatórios básicos</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            <span>Análise com IA</span>
                        </li>
                    </ul>
                     <Link href="/register" className="w-full text-center block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-300">
                        Começar Grátis
                    </Link>
                </div>
                
                {/* Pro Plan */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-2xl border border-teal-700 p-8 relative transform scale-105">
                    <div className="absolute top-0 right-0 -mt-3 mr-3 bg-yellow-400 text-gray-900 font-bold text-sm py-1 px-3 rounded-full">MAIS POPULAR</div>
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Profissional</h3>
                        <div className="text-4xl font-bold text-white mb-1">450,00 MT</div>
                        <div className="text-teal-100">Por mês</div>
                    </div>
                    <ul className="space-y-4 mb-8 text-white">
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Até 500 produtos</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Transações ilimitadas</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Relatórios avançados</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Análise com IA</span>
                        </li>
                    </ul>
                    <Link href="/register" className="w-full text-center block bg-white hover:bg-gray-100 text-teal-600 font-semibold py-3 rounded-lg transition duration-300 shadow-md">
                        Escolher Plano Pro
                    </Link>
                </div>
                
                {/* Enterprise Plan */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
                     <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Empresarial</h3>
                        <div className="text-4xl font-bold text-gray-900 mb-1">900,00 MT</div>
                        <div className="text-gray-600">Por mês</div>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Produtos ilimitados</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Multi-usuário</span>
                        </li>
                        <li className="flex items-center spacex-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Suporte prioritário</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                             <span>Integrações customizadas</span>
                        </li>
                    </ul>
                     <Link href="/contact" className="w-full text-center block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-300">
                        Contate-nos
                    </Link>
                </div>
            </div>
        </div>
    </section>

    {/* Footer */}
    <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Soluções</h3>
                    <ul className="mt-4 space-y-4">
                        <li><a href="#features" className="text-base text-gray-600 hover:text-gray-900">Gestão de Estoque</a></li>
                        <li><a href="#features" className="text-base text-gray-600 hover:text-gray-900">Análise de Vendas</a></li>
                        <li><a href="#features" className="text-base text-gray-600 hover:text-gray-900">Insights com IA</a></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Suporte</h3>
                    <ul className="mt-4 space-y-4">
                        <li><a href="#pricing" className="text-base text-gray-600 hover:text-gray-900">Preços</a></li>
                        <li><a href="/docs" className="text-base text-gray-600 hover:text-gray-900">Documentação</a></li>
                        <li><a href="/contact" className="text-base text-gray-600 hover:text-gray-900">Contato</a></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Empresa</h3>
                    <ul className="mt-4 space-y-4">
                        <li><a href="/about" className="text-base text-gray-600 hover:text-gray-900">Sobre Nós</a></li>
                        <li><a href="/blog" className="text-base text-gray-600 hover:text-gray-900">Blog</a></li>
                        <li><a href="/careers" className="text-base text-gray-600 hover:text-gray-900">Carreiras</a></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Legal</h3>
                    <ul className="mt-4 space-y-4">
                        <li><a href="/politica-de-privacidade" className="text-base text-gray-600 hover:text-gray-900">Política de Privacidade</a></li>
                        <li><a href="/termos-e-condicoes" className="text-base text-gray-600 hover:text-gray-900">Termos de Serviço</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
                <div className="flex space-x-6 md:order-2">
                    {/* Social media icons here */}
                </div>
                <p className="mt-8 text-base text-gray-500 md:mt-0 md:order-1">
                    &copy; 2024 SIGEF. Todos os direitos reservados.
                </p>
            </div>
        </div>
    </footer>
</div>
</>
);
}
