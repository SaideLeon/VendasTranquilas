/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'sigef-cache-v1';
const OFFLINE_URL = '/offline.html';

// Lista de URLs para fazer o pre-cache durante a instalação do Service Worker.
const URLS_TO_PRECACHE = [
  OFFLINE_URL,
  '/logo.svg',
  '/manifest.json',
  // Adicione aqui outros assets estáticos essenciais que você queira disponíveis offline imediatamente
  // Ex: '/fonts/my-font.woff2', '/images/hero-image.png'
];

/**
 * Evento de Instalação (install)
 * - Acionado quando o Service Worker é instalado pela primeira vez.
 * - Abre o cache e adiciona os arquivos da lista de pre-cache.
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pré-cache de assets essenciais.');
        return cache.addAll(URLS_TO_PRECACHE);
      })
      .then(() => {
        // Força o novo Service Worker a se tornar ativo imediatamente.
        return self.skipWaiting();
      })
  );
});

/**
 * Evento de Ativação (activate)
 * - Acionado quando o Service Worker é ativado.
 * - É um bom lugar para limpar caches antigos e garantir que o SW tome controle imediato.
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    Promise.all([
      // Garante que o novo Service Worker tome controle da página imediatamente.
      self.clients.claim(),
      // Limpa caches antigos que não correspondem ao CACHE_NAME atual.
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(`[Service Worker] Deletando cache antigo: ${cacheName}`);
              return caches.delete(cacheName);
            }
            return null;
          })
        );
      })
    ])
  );
});

/**
 * Evento de Busca (fetch)
 * - Intercepta todas as requisições de rede da aplicação.
 * - Aplica diferentes estratégias de cache com base no tipo de requisição.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignora requisições que não são GET (ex: POST, PUT) e requisições do Chrome Extension.
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Estratégia para requisições de navegação (páginas HTML)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  // Estratégia para outros assets (CSS, JS, Imagens, Fontes)
  event.respondWith(cacheFirst(request));
});

/**
 * Estratégia: Network First (para navegação)
 * 1. Tenta buscar o recurso da rede.
 * 2. Se a rede falhar, tenta obter o recurso do cache.
 * 3. Se o cache também falhar, retorna a página de fallback offline.
 * @param {Request} request - A requisição a ser tratada.
 * @returns {Promise<Response>} A resposta da rede, do cache ou a página offline.
 */
async function networkFirstNavigate(request) {
  try {
    // Tenta obter a resposta da rede primeiro.
    const networkResponse = await fetch(request);
    // Se bem-sucedido, clona a resposta e a armazena no cache para uso futuro.
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log(`[Service Worker] Rede falhou para ${request.url}. Tentando o cache...`, error);
    // Se a rede falhar, busca no cache.
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Se não houver nada no cache, retorna a página offline.
    return caches.match(OFFLINE_URL);
  }
}

/**
 * Estratégia: Cache First (para assets estáticos)
 * 1. Tenta obter o recurso do cache primeiro.
 * 2. Se estiver no cache, retorna a resposta cacheada.
 * 3. Se não estiver no cache, busca na rede, armazena a resposta no cache e a retorna.
 * @param {Request} request - A requisição a ser tratada.
 * @returns {Promise<Response>} A resposta do cache ou da rede.
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    // Clona a resposta e a armazena no cache para futuras requisições.
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.error(`[Service Worker] Falha ao buscar e cachear ${request.url}`, error);
    // Para assets, não retornamos a página offline, apenas falhamos a requisição.
    // O navegador mostrará o erro de imagem/script quebrado, o que é geralmente o comportamento esperado.
    return new Response(null, { status: 404 });
  }
}
