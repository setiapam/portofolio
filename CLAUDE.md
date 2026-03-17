# CLAUDE.md — Neovim Portfolio Website

> Project instructions for AI-assisted development. Read this file completely before starting any task.

---

## Project Overview

Interactive portfolio website that simulates Neovim in the browser. Visitors navigate using Vim keybindings, open "buffers" to view content, and run `:commands`. All content is dynamic via Supabase — no rebuild needed for content changes.

**Stack:** Nuxt 4.4 + Supabase + TypeScript + Tailwind CSS  
**Theme:** Solarized Osaka (from user's actual Neovim setup)
**Font:** JetBrains Mono (monospace everywhere)

---

## Critical Rules

1. **Everything is a buffer.** Every page is a Neovim buffer. Navigation = switching buffers. URL changes = `:e filename`.
2. **Vim-first, mouse-second.** Keyboard navigation is primary. Mouse/touch is the fallback — always works, but never the hero.
3. **Solarized Osaka is the default.** All colors derive from the palette below. Never use arbitrary colors.
4. **Content from Supabase, always.** Hardcode nothing. Even the dashboard menu items come from `site_config` table.
5. **TypeScript strict mode.** No `any` types. All Supabase responses are typed via generated types.
6. **Monospace only.** JetBrains Mono for everything. No sans-serif, no serif, no exceptions.

---

## Solarized Osaka Color Palette

Use CSS custom properties. Every component references these — never raw hex values.

```css
:root {
  /* Base backgrounds & foregrounds */
  --bg:            #001419;   /* base04 - main background */
  --bg-dark:       #001419;   /* base04 - darkest background */
  --bg-highlight:  #002C38;   /* base03 - highlighted bg / statusline */
  --bg-visual:     #063540;   /* base02 - visual selection */
  --fg:            #839395;   /* base0  - main foreground */
  --fg-dark:       #576D74;   /* base01 - dimmed foreground */
  --fg-gutter:     #063540;   /* base02 - gutter/line numbers */
  --comment:       #576D74;   /* base01 - comments */

  /* Accent colors */
  --cyan:          #29A298;
  --blue:          #268BD3;
  --purple:        #6D71C4;   /* violet */
  --orange:        #C94C16;
  --green:         #849900;
  --red:           #DB302D;
  --yellow:        #B28500;
  --teal:          #2AEDDD;   /* cyan300 - brighter cyan */
  --magenta:       #D23681;

  /* UI elements */
  --terminal:      #002C38;   /* base03 */
}
```

---

## Layout Structure

The entire app is one Neovim window. The layout uses CSS Grid with these regions:

```
+----------------------------------------------------------+
|  [BufferLine]              tabs: 1  2  3  4               |
+----------+-----------------------------------------------+
|          |                                               |
| NeoTree  |         Main Content Area                     |
| Sidebar  |         (EditorContent)                       |
|          |                                               |
| files/   |         - line numbers on left                |
| > proj/  |         - cursor line highlight               |
| > blog/  |         - markdown rendered via Shiki          |
|          |                                               |
+----------+-----------------------------------------------+
|  [StatusLine]   NORMAL  main  utf-8  42:16               |
+----------------------------------------------------------+
|  [CommandLine]  :                                         |
+----------------------------------------------------------+
```

**Layout implementation:** `layouts/default.vue` with CSS Grid:
```
grid-template-rows: auto 1fr auto auto;
grid-template-columns: auto 1fr;
```

BufferLine spans full width. NeoTree is the left column. EditorContent fills remaining space. StatusLine and CommandLine span full width.

---

## Project Structure

```
neovim-portfolio/
├── nuxt.config.ts
├── app.vue
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── themes/
│   │   │   ├── solarized-osaka.css  # default
│   │   │   ├── catppuccin.css
│   │   │   └── gruvbox.css
│   │   └── editor.css
│   └── fonts/
├── components/
│   ├── editor/
│   │   ├── BufferLine.vue           # tab bar with active buffer indicator
│   │   ├── NeoTree.vue              # sidebar file explorer tree
│   │   ├── StatusLine.vue           # mode + file info + position
│   │   ├── CommandLine.vue          # : command input with autocomplete
│   │   ├── EditorContent.vue        # main content renderer
│   │   ├── LineNumbers.vue          # gutter line numbers
│   │   ├── TelescopeFinder.vue      # fuzzy search floating overlay
│   │   └── CursorLine.vue           # active line highlight
│   ├── content/
│   │   ├── MarkdownRenderer.vue     # markdown -> HTML via Shiki
│   │   ├── ProjectCard.vue
│   │   ├── BlogCard.vue
│   │   ├── SkillBadge.vue
│   │   └── ExperienceItem.vue
│   ├── dashboard/
│   │   ├── AsciiHeader.vue          # ASCII art from Supabase
│   │   ├── MenuItem.vue             # dashboard menu entry
│   │   └── FooterInfo.vue           # "loaded X/Y plugins in Zms"
│   └── admin/
│       ├── MarkdownEditor.vue       # split-view markdown editor
│       ├── JsonEditor.vue           # config editor with highlighting
│       ├── ImageUploader.vue        # Supabase Storage upload
│       └── DataTable.vue            # reusable CRUD table
├── composables/
│   ├── useVimMode.ts                # state machine: NORMAL|INSERT|VISUAL|COMMAND
│   ├── useCommandParser.ts          # parse `:commands` -> actions
│   ├── useBufferManager.ts          # open/close/switch buffers (tabs)
│   ├── useTheme.ts                  # theme switching + persistence
│   ├── useSupabase.ts               # typed Supabase client wrapper
│   └── useKeyboardNav.ts            # keyboard event handling
├── layouts/
│   ├── default.vue                  # Neovim editor layout
│   └── admin.vue                    # admin editor layout
├── pages/
│   ├── index.vue                    # dashboard (alpha-nvim style)
│   ├── about.vue                    # about.md buffer
│   ├── projects/
│   │   ├── index.vue                # file explorer listing
│   │   └── [slug].vue               # project detail buffer
│   ├── blog/
│   │   ├── index.vue                # file explorer listing
│   │   └── [slug].vue               # blog post buffer
│   ├── contact.vue                  # terminal-prompt style form
│   └── admin/
│       ├── index.vue                # admin dashboard
│       ├── login.vue                # terminal login
│       ├── projects.vue
│       ├── blog.vue
│       ├── profile.vue
│       └── config.vue
├── server/
│   ├── api/
│   │   ├── contact.post.ts          # contact form handler
│   │   └── revalidate.post.ts       # ISR trigger
│   └── middleware/
│       └── auth.ts
├── types/
│   ├── database.ts                  # Supabase generated types
│   ├── vim.ts                       # VimMode, KeySequence, etc.
│   └── editor.ts                    # Buffer, Tab, EditorState
├── utils/
│   ├── markdown.ts                  # markdown parsing utils
│   ├── commands.ts                  # command registry
│   └── keymaps.ts                   # keymap definitions
└── public/
    ├── fonts/
    └── og-image.png
```

---

## Supabase Database Schema

Generate TypeScript types after creating tables: `supabase gen types typescript --project-id <id> > types/database.ts`

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| name | text | NOT NULL |
| title | text | NOT NULL, job title/tagline |
| bio | text | markdown |
| avatar_url | text | |
| email | text | |
| github_url | text | |
| linkedin_url | text | |
| resume_url | text | |
| ascii_art | text | dashboard header art |
| location | text | |
| updated_at | timestamptz | default now() |

### skills
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| profile_id | uuid | FK -> profiles.id |
| name | text | NOT NULL |
| category | text | NOT NULL (frontend/backend/devops/tools) |
| level | int | 1-5 |
| icon | text | devicon identifier |
| sort_order | int | default 0 |

### projects
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| profile_id | uuid | FK -> profiles.id |
| slug | text | UNIQUE NOT NULL |
| title | text | NOT NULL |
| description | text | short desc |
| content | text | full markdown |
| tech_stack | jsonb | [] array of strings |
| github_url | text | |
| live_url | text | |
| image_url | text | |
| featured | boolean | default false |
| status | text | default 'published' (draft/published/archived) |
| sort_order | int | default 0 |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### blog_posts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| profile_id | uuid | FK -> profiles.id |
| slug | text | UNIQUE NOT NULL |
| title | text | NOT NULL |
| excerpt | text | |
| content | text | full markdown |
| tags | jsonb | [] array of strings |
| status | text | default 'draft' |
| published_at | timestamptz | |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### experiences
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| profile_id | uuid | FK -> profiles.id |
| company | text | NOT NULL |
| role | text | NOT NULL |
| description | text | markdown |
| start_date | date | NOT NULL |
| end_date | date | nullable (null = present) |
| tech_stack | jsonb | [] |
| sort_order | int | default 0 |

### site_config
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| key | text | UNIQUE NOT NULL |
| value | jsonb | NOT NULL |
| description | text | |
| updated_at | timestamptz | default now() |

Example entries:
```json
{ "key": "dashboard_menu", "value": [
  { "label": "Find File", "icon": "search", "shortcut": "f", "route": "/find" },
  { "label": "New File", "icon": "file", "shortcut": "n", "route": "/contact" },
  { "label": "Recent Files", "icon": "clock", "shortcut": "r", "route": "/recent" },
  { "label": "Config", "icon": "settings", "shortcut": "c", "route": "/config" },
  { "label": "Quit", "icon": "logout", "shortcut": "q", "action": "easter_egg" }
]}
{ "key": "theme", "value": { "default": "solarized-osaka", "available": ["solarized-osaka", "catppuccin", "gruvbox"] }}
{ "key": "seo", "value": { "title": "Username - Developer", "description": "..." }}
```

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | NOT NULL |
| email | text | NOT NULL |
| subject | text | |
| message | text | NOT NULL |
| read | boolean | default false |
| created_at | timestamptz | default now() |

### Row Level Security (RLS)
- **Public read:** profiles, skills, projects (status='published'), blog_posts (status='published'), experiences, site_config
- **Authenticated write:** all tables, only where profile_id = auth.uid()
- **Messages:** public INSERT, authenticated SELECT/UPDATE

---

## Vim Mode State Machine

The core composable `useVimMode.ts` manages a finite state machine:

```
NORMAL ──(:)──> COMMAND
NORMAL ──(i)──> INSERT
NORMAL ──(v)──> VISUAL
COMMAND ─(Esc/Enter)─> NORMAL
INSERT ──(Esc)──> NORMAL
VISUAL ──(Esc)──> NORMAL
```

**NORMAL mode:** Vim keys active (hjkl scroll, gg/G jump, / search, : command). Browser defaults suppressed.  
**INSERT mode:** All keys pass through. For form interaction and text selection.  
**VISUAL mode:** Text selection highlighting. Not critical for v1 — can be simplified.  
**COMMAND mode:** CommandLine input focused. Parse on Enter, cancel on Esc.

### Key sequence buffer
Some bindings need multi-key combos (gg, gt, gT). Implement a key buffer with 500ms timeout:
- First `g` press: store in buffer, wait
- Second key within 500ms: execute combo
- Timeout: clear buffer

---

## Keybinding Reference

### Normal Mode
| Key | Action |
|-----|--------|
| h/j/k/l | Scroll navigation |
| gg | Scroll to top |
| G | Scroll to bottom |
| / | Open Telescope search |
| : | Enter command mode |
| i | Enter insert mode |
| Esc | Return to normal mode |
| Ctrl+b | Toggle NeoTree sidebar |
| gt / gT | Next / previous buffer tab |
| f (dashboard only) | Find file |
| n | Next search result |

### Command Mode
| Command | Action |
|---------|--------|
| :e [file] | Navigate to buffer (e.g., `:e about.md` → /about) |
| :q | Easter egg: "E32: Can't quit, this is a website!" |
| :q! | Redirect to google.com |
| :w | Save (admin only) |
| :wq | Save and exit edit (admin) |
| :Telescope | Open fuzzy finder overlay |
| :Neotree toggle | Toggle sidebar |
| :set theme [name] | Switch colorscheme |
| :help | Show keybindings cheatsheet |
| :terminal | Open interactive terminal |
| :set number | Toggle line numbers |
| :Lazy | Show tech stack as "plugin list" |
| :login | Navigate to admin |

---

## Component Specifications

### BufferLine.vue
- Horizontal tab bar showing open buffers
- Active buffer highlighted with `--blue` bottom border
- File type icon (devicons) before buffer name
- Close button (×) on hover
- Click to switch buffer, middle-click to close

### NeoTree.vue
- Tree view sidebar, data-driven from Supabase
- Root entries: about.md, projects/, blog/, contact.md
- projects/ and blog/ expand to show children (fetched from DB)
- File icons based on type (.md = markdown icon)
- Toggle: Ctrl+b or `:Neotree toggle`
- Mobile: off-canvas drawer, overlay mode
- Width: 220px default, resizable is optional

### StatusLine.vue
- Left section: mode badge (NORMAL=blue, INSERT=green, VISUAL=purple, COMMAND=orange)
- Center: git branch icon + "main", file encoding "utf-8"
- Right: cursor position "line:col", file type
- Background: `--bg-dark`

### CommandLine.vue
- Single-line input at very bottom
- Prefix with `:` when in command mode
- Autocomplete dropdown above input (max 8 suggestions)
- Command history via arrow up/down (store in sessionStorage)
- Show feedback messages: success in `--green`, errors in `--red`
- When not in command mode, show last message or empty

### TelescopeFinder.vue
- Floating overlay, centered, 60% viewport width, max 70vh height
- Top: search input with magnifying glass icon
- Below: live results list, updating on keystroke
- Fuzzy match across: page titles, project names, blog titles, content snippets
- Navigate results: j/k or arrow keys, Enter to select, Esc to close
- Trigger: `/` key or `:Telescope` command
- Background: semi-transparent dark overlay

### EditorContent.vue
- Main content renderer area
- Left gutter: LineNumbers component (toggle with `:set number`)
- CursorLine: highlight current scroll position line
- Content rendered from markdown via Shiki for syntax highlighting
- Smooth scrolling with vim-like behavior

### Dashboard (pages/index.vue)
Replicates alpha-nvim/dashboard-nvim:
- ASCII art header from `profiles.ascii_art` (Supabase)
- Menu items from `site_config['dashboard_menu']`
- Each item: icon + label + right-aligned shortcut key
- Footer: "⚡ Neovim loaded X/Y plugins in Z.XXms" (X = active tech count, Z = page load time)
- Keyboard shortcuts active: f, n, g, r, c, a, p, q

---

## Data Fetching Strategy

| Data | Method | Cache |
|------|--------|-------|
| Profile & Skills | useAsyncData + Supabase | ISR 60s |
| Projects list | useAsyncData + Supabase | ISR 60s |
| Project detail | useAsyncData + Supabase | ISR 60s |
| Blog posts | useAsyncData + Supabase | ISR 300s |
| Site config | useAsyncData + Supabase | ISR 120s |
| Messages (admin) | useFetch client-only | No cache |
| Admin CRUD | Supabase client direct | No cache, realtime |

Use `@nuxtjs/supabase` module. All queries go through `useSupabase.ts` composable which wraps the client with proper typing.

---

## Admin Panel

### Authentication
- Supabase Auth with email/password
- Single user (portfolio owner)
- Login via `/admin/login` or `:login` command
- Route middleware protects all `/admin/*` routes
- Login page styled as terminal prompt: `$ ssh admin@portfolio`

### Admin Interface
- Same Neovim theme, INSERT mode default when editing
- Markdown fields use split view (`:vsplit` style) — editor left, preview right
- CRUD for: projects, blog_posts, skills, experiences
- Drag-and-drop reordering for sort_order fields
- Image upload to Supabase Storage bucket `portfolio-assets`
- Site config: JSON editor with syntax highlighting
- Save: `:w` command or Ctrl+S
- Delete: confirmation dialog styled as Vim prompt "Delete? [y/N]"

### Admin Commands
| Command | Action |
|---------|--------|
| :admin projects | Manage projects |
| :admin blog | Manage blog posts |
| :admin skills | Manage skills |
| :admin profile | Edit profile |
| :admin config | Edit site config |
| :admin messages | View messages |
| :w | Save current edits |
| :wq | Save and return to view |
| :q! | Discard changes and exit |

---

## Interactive Terminal Easter Egg

Triggered by `:terminal` command. Renders a mini terminal emulator in the content area.

Supported commands:
- `whoami` → profile name and title
- `ls` → list "files" (pages)
- `cat [file]` → preview content snippet
- `pwd` → current route path
- `neofetch` → ASCII art + tech stack info (OS: Nuxt 4.4, Shell: Vue 3, etc.)
- `help` → list available commands
- `hire-me` → display contact info
- `sudo rm -rf /` → joke animation
- `clear` → clear terminal
- `exit` → close terminal, return to previous buffer

---

## Contact Form (Terminal Style)

Sequential prompts, not a traditional form:
```
$ Enter your name: █
$ Enter your email: █
$ Subject (optional): █
$ Message:
> █
$ Sending message... ✓ Message sent successfully!
```

Submits to `/api/contact` server route → inserts into Supabase `messages` table.
Validation errors shown in `--red`. Success in `--green`.

---

## Theme System

`useTheme.ts` composable:
- Reads available themes from `site_config['theme']`
- Switches by swapping CSS custom property values on `:root`
- Persists choice in `localStorage`
- Switch via `:set theme solarized-osaka` or `:colorscheme catppuccin`
- Three themes minimum: Solarized Osaka (default), Catppuccin Mocha, Gruvbox Dark

Each theme file (`assets/css/themes/*.css`) overrides the same CSS custom properties.

---

## SEO Requirements

- Dynamic `<title>` and `<meta>` from `site_config['seo']` + per-page content
- `useHead()` in every page with appropriate title, description, og:image
- Sitemap via `@nuxtjs/sitemap`
- robots.txt: allow all public pages, disallow /admin
- JSON-LD structured data: Person (about), CreativeWork (projects)
- Open Graph image: auto-generated or static from `public/og-image.png`

---

## Responsive Design

- **Desktop (>1024px):** Full layout with sidebar visible
- **Tablet (768-1024px):** Sidebar hidden by default, toggle overlay
- **Mobile (<768px):** Sidebar as off-canvas drawer, command line trigger on tap, swipe for buffer nav, touch targets min 44px
- BufferLine: horizontal scroll on overflow
- StatusLine: abbreviated on mobile (mode + position only)
- Dashboard menu: stack vertically on mobile

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.0s |
| Lighthouse Performance | > 90 |
| Lighthouse SEO | > 95 |
| Initial bundle | < 200KB gzipped |
| Key response latency | < 50ms |
| Supabase query | < 500ms |

Strategies: lazy-load NeoTree and TelescopeFinder, preload JetBrains Mono, code-split admin routes, SSR public pages.

---

## Implementation Phases

Follow these in order. Each step is self-contained and can be a single AI prompt.

### Phase 1: Foundation (Steps 1-4)
1. **Project init** — `npx nuxi@latest init`, install @nuxtjs/supabase, tailwindcss, shiki. Configure nuxt.config.ts with Solarized Osaka palette in Tailwind.
2. **Supabase setup** — Create all tables (SQL migration), set up RLS policies, generate TypeScript types, seed initial data.
3. **Core layout** — `layouts/default.vue` with CSS Grid. Build BufferLine, StatusLine, CommandLine components. Apply Solarized Osaka CSS variables.
4. **NeoTree sidebar** — Collapsible tree, data from Supabase, toggle with Ctrl+b, responsive off-canvas on mobile.

### Phase 2: Vim Engine (Steps 5-7)
5. **Vim mode state machine** — `useVimMode.ts` composable. NORMAL/INSERT/VISUAL/COMMAND states. Key sequence buffer with timeout.
6. **Command parser** — `useCommandParser.ts`. Registry pattern, parse `:e about.md` → navigate. Autocomplete. History.
7. **Buffer manager** — `useBufferManager.ts`. Track open buffers, integrate with Vue Router, update BufferLine.

### Phase 3: Content Pages (Steps 8-12)
8. **Dashboard** — Replicate alpha-nvim. ASCII header from DB, menu from site_config, footer stats, keyboard shortcuts.
9. **About page** — Profile + skills + experiences from Supabase. Markdown with line numbers. Skills as code blocks with progress.
10. **Projects** — Explorer listing (ls -la style) + detail page with markdown + syntax highlighting.
11. **Blog** — Explorer listing with dates/tags + detail page. Tag filtering via `:tag [name]`.
12. **Contact** — Terminal-prompt sequential form. Submit to API → Supabase messages.

### Phase 4: Advanced Features (Steps 13-15)
13. **Telescope finder** — Floating fuzzy search. Search all content. j/k navigation. Triggered by `/` or `:Telescope`.
14. **Theme system** — `useTheme.ts`. CSS variable swap. localStorage persistence. 3 themes.
15. **Terminal easter egg** — Mini terminal in content area. `whoami`, `neofetch`, `ls`, `help`, etc.

### Phase 5: Admin Panel (Steps 16-18)
16. **Authentication** — Supabase Auth, login page as terminal prompt, route middleware.
17. **Admin CRUD** — DataTable, MarkdownEditor (split view), pages for each content type. `:w` to save.
18. **Image upload** — Supabase Storage, drag-and-drop, auto-optimize, return public URL.

### Phase 6: Polish & Deploy (Steps 19-22)
19. **SEO** — Meta tags, sitemap, JSON-LD, OG images.
20. **Performance & a11y** — Lazy load, font preload, ARIA labels, skip-to-content, `:help` overlay.
21. **Responsive** — Mobile sidebar drawer, touch buffer nav, abbreviated StatusLine.
22. **Deploy** — SSR mode, env vars on host, ISR config, custom domain.

---

## AI Prompt Template

Use this template for each step:

```
## Context
Building a Neovim-themed portfolio website. Nuxt 4.4 + Supabase + TypeScript.
The website simulates Neovim in the browser with Vim keybindings,
buffer management, command mode, and Solarized Osaka colorscheme.

## Current Task
[Step description from the phase list above]

## Requirements
[Bullet points from that step]

## Constraints
- Nuxt 4.4 with TypeScript strict
- Supabase for database, auth, storage
- Tailwind CSS with Solarized Osaka palette via CSS custom properties
- JetBrains Mono as the only font
- All content fetched from Supabase (nothing hardcoded)
- Components in components/editor/, components/content/, etc.
- Composables in composables/

## Files to Create/Modify
[List expected file paths]

## Reference
See CLAUDE.md for full schema, component specs, and keybinding reference.
```

---

## Testing Strategy

- **Unit:** composables (useVimMode, useCommandParser, useBufferManager) with Vitest
- **Component:** editor components with Vue Test Utils
- **E2E:** navigation flows, search, contact form with Playwright
- **Visual regression:** screenshot comparison for theme consistency
- **Accessibility:** axe-core automated checks
