import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'https://murphi.my.id'

    const supabase = createClient(
        config.public.supabase.url,
        config.supabaseServiceKey || config.public.supabase.key,
    )

    // Fetch published projects and blog posts
    const [{ data: projects }, { data: posts }] = await Promise.all([
        supabase.from('projects').select('slug, updated_at').eq('status', 'published'),
        supabase.from('blog_posts').select('slug, updated_at').eq('status', 'published'),
    ])

    const staticPages = [
        { loc: '', priority: '1.0', changefreq: 'weekly' },
        { loc: '/about', priority: '0.9', changefreq: 'monthly' },
        { loc: '/projects', priority: '0.8', changefreq: 'weekly' },
        { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
        { loc: '/contact', priority: '0.6', changefreq: 'yearly' },
    ]

    const projectPages = (projects ?? []).map(p => ({
        loc: `/projects/${p.slug}`,
        lastmod: p.updated_at,
        priority: '0.7',
        changefreq: 'monthly',
    }))

    const blogPages = (posts ?? []).map(p => ({
        loc: `/blog/${p.slug}`,
        lastmod: p.updated_at,
        priority: '0.7',
        changefreq: 'monthly',
    }))

    const allPages = [...staticPages, ...projectPages, ...blogPages]

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${siteUrl}${page.loc}</loc>${page.lastmod ? `\n    <lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    setResponseHeader(event, 'content-type', 'application/xml')
    return xml
})
