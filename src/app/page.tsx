'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';

export default function HomePage() {
  useEffect(() => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (this: HTMLAnchorElement, e: MouseEvent) {
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
                    <span className="text-yellow-300">Inteligência</span>
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
                                <div className="text-2xl font-bold">R$ 15.430</div>
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
                        <div className="text-4xl font-bold text-gray-900 mb-1">R$ 0</div>
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
                            <span>Relatórios básicos</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Controle de vendas</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Suporte por email</span>
                        </li>
                    </ul>
                    <Link href="/login" className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition duration-300">
                        Começar Grátis
                    </Link>
                </div>
                
                {/* Pro Plan */}
                <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-500 p-8 relative transform scale-105">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                            Mais Popular
                        </span>
                    </div>
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Profissional</h3>
                        <div className="text-4xl font-bold text-gray-900 mb-1">R$ 29</div>
                        <div className="text-gray-600">/mês</div>
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
                            <span>Análises com IA</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Controle de dívidas</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Relatórios avançados</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Suporte prioritário</span>
                        </li>
                    </ul>
                    <Link href="/login" className="w-full block text-center bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition duration-300 transform hover:scale-105">
                        Começar Teste Grátis
                    </Link>
                </div>
                
                {/* Enterprise Plan */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Empresarial</h3>
                        <div className="text-4xl font-bold text-gray-900 mb-1">R$ 99</div>
                        <div className="text-gray-600">/mês</div>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Tudo do Profissional</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Múltiplos usuários</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>API personalizada</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Integração personalizada</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Suporte 24/7</span>
                        </li>
                    </ul>
                    <Link href="/login" className="w-full block text-center bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition duration-300">
                        Contatar Vendas
                    </Link>
                </div>
            </div>
        </div>
    </section>

    {/* Testimonials Section */}
    <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    O que nossos clientes dizem
                </h2>
                <p className="text-xl text-gray-600">
                    Veja como o SIGEF está transformando negócios
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover">
                    <div className="flex items-center mb-6">
                        <img className="w-12 h-12 rounded-full mr-4" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" alt="Maria Silva" />
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">Maria Silva</h4>
                            <p className="text-gray-600">Loja de Roupas</p>
                        </div>
                    </div>
                    <div className="flex mb-4">
                        <span className="text-yellow-400">★★★★★</span>
                    </div>
                    <p className="text-gray-600 italic">
                        "O SIGEF revolucionou minha loja! Agora tenho controle total do estoque e as análises de IA me ajudaram a aumentar o lucro em 30%."
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover">
                    <div className="flex items-center mb-6">
                        <img className="w-12 h-12 rounded-full mr-4" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" alt="João Santos" />
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">João Santos</h4>
                            <p className="text-gray-600">Supermercado</p>
                        </div>
                    </div>
                    <div className="flex mb-4">
                        <span className="text-yellow-400">★★★★★</span>
                    </div>
                    <p className="text-gray-600 italic">
                        "Sistema muito fácil de usar. Minha equipe se adaptou rapidamente e agora temos relatórios precisos em tempo real."
                    </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 card-hover">
                    <div className="flex items-center mb-6">
                        <img className="w-12 h-12 rounded-full mr-4" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" alt="Ana Costa" />
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900">Ana Costa</h4>
                            <p className="text-gray-600">Farmácia</p>
                        </div>
                    </div>
                    <div className="flex mb-4">
                        <span className="text-yellow-400">★★★★★</span>
                    </div>
                    <p className="text-gray-600 italic">
                        "Finalmente encontrei um sistema completo que gerencia tudo que preciso. O controle de dívidas é fantástico!"
                    </p>
                </div>
            </div>
        </div>
    </section>

    {/* Stats Section */}
    <section className="py-16 bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="text-white">
                    <div className="text-3xl md:text-4xl font-bold mb-2">10K+</div>
                    <div className="text-teal-100">Empresas Ativas</div>
                </div>
                <div className="text-white">
                    <div className="text-3xl md:text-4xl font-bold mb-2">1M+</div>
                    <div className="text-teal-100">Transações</div>
                </div>
                <div className="text-white">
                    <div className="text-3xl md:text-4xl font-bold mb-2">99.9%</div>
                    <div className="text-teal-100">Disponibilidade</div>
                </div>
                <div className="text-white">
                    <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
                    <div className="text-teal-100">Suporte</div>
                </div>
            </div>
        </div>
    </section>

    {/* FAQ Section */}
    <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Perguntas Frequentes
                </h2>
                <p className="text-xl text-gray-600">
                    Tire suas dúvidas sobre o SIGEF
                </p>
            </div>
            
            <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Como funciona o período gratuito?</h3>
                    <p className="text-gray-600">O plano gratuito é permanente e inclui até 50 produtos, controle de vendas e relatórios básicos. Você pode usar sem limite de tempo.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Posso migrar meus dados de outro sistema?</h3>
                    <p className="text-gray-600">Sim! Oferecemos suporte completo para importação de dados de planilhas Excel/CSV e outros sistemas de gestão.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Como funciona a análise com IA?</h3>
                    <p className="text-gray-600">Nossa IA analisa seus dados de vendas, estoque e fluxo financeiro para gerar insights e recomendações personalizadas para otimizar seu negócio.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Meus dados estão seguros?</h3>
                    <p className="text-gray-600">Absolutamente. Utilizamos criptografia de ponta, autenticação Google e backups automáticos para garantir total segurança dos seus dados.</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Posso cancelar a qualquer momento?</h3>
                    <p className="text-gray-600">Sim, você pode cancelar seu plano pago a qualquer momento e voltar ao plano gratuito, mantendo seus dados.</p>
                </div>
            </div>
        </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para transformar seu negócio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
                Junte-se a milhares de empresários que já escolheram o SIGEF para gerenciar suas finanças com inteligência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/login" className="bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 min-w-[250px]">
                    🚀 Começar Gratuitamente Agora
                </Link>
                <Link href="#features" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-teal-600 transition duration-300 transform hover:scale-105 min-w-[200px]">
                    📞 Falar com Vendas
                </Link>
            </div>
            <p className="text-sm mt-6 opacity-75">
                ✓ Sem compromisso ✓ Sem cartão de crédito ✓ Suporte em português
            </p>
        </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center mb-4">
                        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-2">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                        </div>
                        <span className="ml-2 text-2xl font-bold">SIGEF</span>
                    </div>
                    <p className="text-gray-400 mb-6 max-w-md">
                        Sistema Intuitivo de Gestão Financeira - A solução completa para gerenciar seu negócio com inteligência artificial.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                            </svg>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-4">Produto</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Recursos</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Preços</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Atualizações</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Roadmap</a></li>
                    </ul>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-4">Suporte</h3>
                    <ul className="space-y-2">
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Central de Ajuda</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Documentação</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Contato</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition duration-300">Status</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                    © 2024 SIGEF. Todos os direitos reservados.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-300">Política de Privacidade</a>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-300">Termos de Uso</a>
                    <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-300">Cookies</a>
                </div>
            </div>
        </div>
    </footer>
    </div>
    </>
  );
}