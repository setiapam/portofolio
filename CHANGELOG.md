# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) with [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- **Email notification on new message** — When a visitor submits a contact form, an email notification with Neovim-themed template is sent to admin via Gmail SMTP (nodemailer)
- **Reply to messages from admin panel** — Admin can reply to messages directly from `/admin/messages`. Reply is sent as a styled email with original message quoted. Messages show "REPLIED" badge after reply
- **Neovim-themed email templates** — Custom HTML email templates matching the portfolio's Solarized Osaka design with BufferLine header, StatusLine footer, and monospace typography
- **`replied_at` column on messages table** — Tracks when admin replied to a message (migration `003_messages_replied_at.sql`)

---

## [1.0.2] - 2026-03-22

### Added

- **Devicon skill icons** — Import Devicon CSS via CDN and render skill icons on the about page next to skill names. Admin skills editor now shows a live icon preview and clearer placeholder format (`devicon-react-original`).

### Fixed

- **Admin experiences date input** — Fix "undefined" appearing when typing dates. The computed getter/setter created a feedback loop where partial input (e.g. "22") was stored as non-ISO string, then `isoToDisplay` produced "undefined/undefined/22". Replaced with separate display refs that only sync to the model when a complete dd/mm/yyyy date is entered.

---

## [1.0.1] - 2026-03-20

### Changed

- **Cache control optimization** — Configure `routeRules` in `nuxt.config.ts` and `_headers` file for Cloudflare Pages. Build assets (`_nuxt/*`) cached for 1 year (immutable), static files for 1 week, public pages for 1 hour in browser + 1 day at CDN edge with stale-while-revalidate. Admin pages excluded from cache. Minimizes requests to stay within Cloudflare Pages daily quota.

---

## [1.0.0] - 2026-03-19

Initial release — fully functional Neovim-themed portfolio website.

### Features
- **Neovim simulation** — full editor layout with BufferLine, NeoTree sidebar, StatusLine, and CommandLine
- **Vim mode engine** — NORMAL/INSERT/VISUAL/COMMAND state machine with key sequence buffer (gg, gt, gT)
- **Navigation** — hjkl scrolling with actual page scroll, gg/G jump, Ctrl+d/u half-page scroll, Backspace to dashboard
- **Command parser** — `:e`, `:q`, `:q!`, `:w`, `:wq`, `:set`, `:colorscheme`, `:Telescope`, `:Neotree`, `:help`, `:terminal`, `:admin`, `:login`, `:logout`, `:Lazy`
- **Command sub-completions** — context-aware suggestions for admin sections, colorschemes, set options, edit targets
- **Buffer management** — open/close/switch tabs, gt/gT navigation, x to close current buffer
- **Telescope finder** — fuzzy search across pages, projects, blog posts, admin routes
- **Theme system** — Solarized Osaka (default), Catppuccin, Gruvbox, Tokyo Night with localStorage persistence
- **Dashboard** — alpha-nvim style with ASCII art header, menu with keyboard shortcuts, load time display
- **Lazy overlay** — lazy.nvim plugin manager easter egg showing tech stack as plugins
- **About page** — profile info with SVG icons, skills with bar visualization, experience timeline, markdown rendering
- **Projects** — explorer listing + detail pages with markdown content, tech stack tags
- **Blog** — explorer listing + detail pages with markdown content, tags
- **Contact** — terminal-prompt style form with mobile Send button
- **Terminal** — interactive easter egg with whoami, neofetch, ls, cat, help, hire-me, sudo rm -rf /
- **Admin panel** — authenticated CRUD for projects, blog, profile, skills, experiences, messages
- **Markdown rendering** — GFM via `marked` library with full styling (lists, code, blockquotes, tables)
- **SEO** — meta tags, Open Graph, Twitter Cards, JSON-LD (Person, BlogPosting, CreativeWork), dynamic sitemap, robots.txt
- **Responsive design** — mobile sidebar drawer, touch toolbar, abbreviated StatusLine, min 44px touch targets
- **Nerd Font support** — JetBrains Mono NF for editor icons, SVG fallback on about page

### Tech Stack
- Nuxt 4.4 (SSR, TypeScript strict)
- Supabase (database, auth, RLS)
- Tailwind CSS
- marked (markdown)
- JetBrains Mono NF (font)
