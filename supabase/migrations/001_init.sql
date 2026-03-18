-- ============================================
-- Neovim Portfolio — Initial Schema
-- ============================================

-- profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  bio text,
  avatar_url text,
  email text,
  github_url text,
  linkedin_url text,
  resume_url text,
  ascii_art text,
  location text,
  updated_at timestamptz DEFAULT now()
);

-- skills
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('frontend', 'backend', 'devops', 'tools')),
  level int DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  icon text,
  sort_order int DEFAULT 0
);

-- projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  content text,
  tech_stack jsonb DEFAULT '[]'::jsonb,
  github_url text,
  live_url text,
  image_url text,
  featured boolean DEFAULT false,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- blog_posts
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  tags jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- experiences
CREATE TABLE experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company text NOT NULL,
  role text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  tech_stack jsonb DEFAULT '[]'::jsonb,
  sort_order int DEFAULT 0
);

-- site_config
CREATE TABLE site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "skills_public_read" ON skills FOR SELECT USING (true);
CREATE POLICY "projects_public_read" ON projects FOR SELECT USING (status = 'published');
CREATE POLICY "blog_posts_public_read" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "experiences_public_read" ON experiences FOR SELECT USING (true);
CREATE POLICY "site_config_public_read" ON site_config FOR SELECT USING (true);

-- Authenticated write policies
CREATE POLICY "profiles_auth_write" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "skills_auth_write" ON skills FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "projects_auth_write" ON projects FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "blog_posts_auth_write" ON blog_posts FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "experiences_auth_write" ON experiences FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "site_config_auth_write" ON site_config FOR ALL USING (auth.role() = 'authenticated');

-- Messages: public insert, authenticated read/update
CREATE POLICY "messages_public_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_auth_read" ON messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "messages_auth_update" ON messages FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- Seed data
-- ============================================

INSERT INTO site_config (key, value, description) VALUES
  ('dashboard_menu', '[
    {"label": "Find File", "icon": "search", "shortcut": "f", "route": "/projects"},
    {"label": "New File", "icon": "file", "shortcut": "n", "route": "/contact"},
    {"label": "Recent Files", "icon": "clock", "shortcut": "r", "route": "/blog"},
    {"label": "Config", "icon": "settings", "shortcut": "c", "route": "/about"},
    {"label": "Quit", "icon": "logout", "shortcut": "q", "action": "easter_egg"}
  ]'::jsonb, 'Dashboard menu items'),
  ('theme', '{"default": "solarized-osaka", "available": ["solarized-osaka", "catppuccin", "gruvbox"]}'::jsonb, 'Theme configuration'),
  ('seo', '{"title": "Developer Portfolio", "description": "Interactive Neovim-themed developer portfolio"}'::jsonb, 'SEO configuration');
