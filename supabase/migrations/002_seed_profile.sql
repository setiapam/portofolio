-- ============================================
-- Fix RLS policies & seed initial profile
-- ============================================

-- Drop old write policies that incorrectly match auth.uid() to profile/row UUIDs
DROP POLICY IF EXISTS "profiles_auth_write" ON profiles;
DROP POLICY IF EXISTS "skills_auth_write" ON skills;
DROP POLICY IF EXISTS "projects_auth_write" ON projects;
DROP POLICY IF EXISTS "blog_posts_auth_write" ON blog_posts;
DROP POLICY IF EXISTS "experiences_auth_write" ON experiences;

-- Also allow authenticated users to read all rows (including drafts) for admin
DROP POLICY IF EXISTS "projects_public_read" ON projects;
DROP POLICY IF EXISTS "blog_posts_public_read" ON blog_posts;

-- Public read: published only
CREATE POLICY "projects_public_read" ON projects FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "blog_posts_public_read" ON blog_posts FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

-- Authenticated write: any authenticated user can manage all content
-- (single-user portfolio, no need for per-user checks)
CREATE POLICY "profiles_auth_write" ON profiles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "skills_auth_write" ON skills FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_auth_write" ON projects FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "blog_posts_auth_write" ON blog_posts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "experiences_auth_write" ON experiences FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Messages: allow authenticated delete
CREATE POLICY "messages_auth_delete" ON messages FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- Seed initial profile (run once)
-- ============================================
INSERT INTO profiles (name, title, bio, email, location)
SELECT 'Your Name', 'Software Engineer', '', 'you@example.com', 'Indonesia'
WHERE NOT EXISTS (SELECT 1 FROM profiles LIMIT 1);
