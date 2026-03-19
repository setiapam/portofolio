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
    families: {
      'JetBrains Mono': [400, 500, 600, 700],
    },
    display: 'swap',
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
  },

  runtimeConfig: {
    supabaseServiceKey: '',
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
      ],
    },
  },

  routeRules: {
    '/admin/**': {
      robots: 'noindex, nofollow',
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://murphi.my.id',
  },
})
