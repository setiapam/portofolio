# Neovim Portfolio

Interactive portfolio website that simulates **Neovim in the browser**. Visitors navigate using Vim keybindings, open "buffers" to view content, and run `:commands`. All content is dynamic via Supabase — no rebuild needed for content changes.

## Tech Stack

- **Framework:** Nuxt 4.4 + TypeScript (strict mode)
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS + Solarized Osaka color scheme
- **Font:** JetBrains Mono (Nerd Font) — monospace everywhere
- **Markdown:** marked (GFM support)
- **Syntax Highlighting:** Shiki

## Features

### Neovim UI

- Full Neovim layout: BufferLine (tabs), NeoTree (sidebar), StatusLine, CommandLine
- Vim mode state machine: `NORMAL` / `INSERT` / `VISUAL` / `COMMAND`
- Keyboard navigation: `hjkl` scroll, `gg`/`G` jump, `gt`/`gT` switch tabs
- Command mode: `:e about.md`, `:Telescope`, `:Neotree toggle`, `:set theme`, `:help`
- Telescope fuzzy finder (`/` or `:Telescope`)
- Multiple colorschemes: Solarized Osaka (default), Catppuccin, Gruvbox, Tokyo Night

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Alpha-nvim style with ASCII art header and menu shortcuts |
| About | `/about` | Profile, skills (with level bars), work experience |
| Projects | `/projects` | File explorer listing with project details |
| Blog | `/blog` | Blog listing with tag filtering |
| Contact | `/contact` | Terminal-style sequential prompt form |
| Terminal | `/terminal` | Easter egg — `whoami`, `neofetch`, `ls`, etc. |

### Admin Panel

Protected by Supabase Auth. Accessible via `:admin` command or `/admin`.

| Section | Shortcut | Description |
|---------|----------|-------------|
| Profile | `p` | Edit name, bio, links, ASCII art |
| Projects | `j` | CRUD with markdown editor (split view) |
| Blog | `b` | CRUD with markdown editor and tag management |
| Skills | `s` | Manage skills by category with level (1-5) |
| Experiences | `e` | Manage work experience with tech stack |
| Messages | `m` | View contact form submissions |

All admin pages support `:w` (Ctrl+S) to save and `:wq` to save and exit.

## Project Structure

```
portofolio/
├── app/
│   ├── pages/              # 8 public + 8 admin pages
│   ├── components/
│   │   ├── editor/         # BufferLine, NeoTree, StatusLine, CommandLine, Telescope
│   │   ├── admin/          # DataTable, MarkdownEditor
│   │   └── content/        # NavHint
│   ├── composables/        # useVimMode, useCommandParser, useBufferManager,
│   │                       # useMarkdown, useTheme, useEditorState
│   ├── layouts/            # default.vue (Neovim editor layout)
│   ├── assets/css/         # main.css + theme files
│   └── types/              # database.ts (Supabase generated types)
├── server/
│   └── api/                # contact.post.ts
├── supabase/
│   └── migrations/         # SQL schema + RLS policies
├── nuxt.config.ts
└── tailwind.config.ts
```

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | Name, title, bio, links, ASCII art |
| `skills` | Name, category (frontend/backend/devops/tools), level (1-5) |
| `experiences` | Company, role, dates, description, tech stack |
| `projects` | Title, slug, content (markdown), tech stack, status |
| `blog_posts` | Title, slug, content (markdown), tags, status |
| `messages` | Contact form submissions |

RLS policies: public read for published content, authenticated write for admin.

## Setup

### Prerequisites

- Node.js 18+
- Supabase project (or local via `supabase start`)

### Install

```bash
npm install
```

### Environment Variables

Create `.env` with your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # for server API routes
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm run preview
```

## Keybindings

| Key | Mode | Action |
|-----|------|--------|
| `h/j/k/l` | Normal | Scroll navigation |
| `gg` / `G` | Normal | Top / bottom |
| `gt` / `gT` | Normal | Next / previous tab |
| `/` | Normal | Open Telescope search |
| `:` | Normal | Enter command mode |
| `i` | Normal | Enter insert mode |
| `Esc` | Any | Return to normal mode |
| `Ctrl+b` | Any | Toggle NeoTree sidebar |
| `Ctrl+S` | Admin | Save |
