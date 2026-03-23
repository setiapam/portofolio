// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxtjs/google-fonts',
  ],

  css: ['~/assets/css/main.css'],

  supabase: {
    redirect: false,
  },

  googleFonts: {
    families: {},
    display: 'swap',
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVCIE_KEY || '',
    adminEmail: process.env.ADMIN_EMAIL || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://murphi.my.id',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#001419' },
        { name: 'author', content: 'Dimas Setia Pambudi' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css' },
      ],
    },
  },

  routeRules: {
    '/admin/**': {
      robots: 'noindex, nofollow',
    },
    // Hashed build assets — immutable, cache 1 year
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    // Static files — cache 1 week
    '/favicon.ico': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
    '/favicon.svg': {
      headers: { 'Cache-Control': 'public, max-age=604800' },
    },
    '/robots.txt': {
      headers: { 'Cache-Control': 'public, max-age=86400' },
    },
    // Public pages — short cache with stale-while-revalidate
    '/': {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
    '/about': {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
    '/projects/**': {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
    '/blog/**': {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
    '/contact': {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
      },
    },
    // API routes — no cache
    '/api/**': {
      headers: { 'Cache-Control': 'no-store' },
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://murphi.my.id',
  },
})
