<template>
    <EditorContent>
        <div class="blog-detail">
            <template v-if="post">
                <!-- File header -->
                <div class="file-comment">-- {{ post.slug }}.md</div>
                <div class="file-comment">-- Published: {{ formatDate(post.published_at) }}</div>
                <div class="blank-line">&nbsp;</div>

                <!-- Title -->
                <div class="heading"># {{ post.title }}</div>
                <div v-if="post.excerpt" class="excerpt">{{ post.excerpt }}</div>
                <div class="blank-line">&nbsp;</div>

                <!-- Meta -->
                <div class="meta-section">
                    <div v-if="post.tags?.length" class="meta-line">
                        <span class="meta-label">tags: </span>
                        <span v-for="(tag, i) in post.tags" :key="tag" class="tag">{{ tag }}<span v-if="i < post.tags.length - 1">, </span></span>
                    </div>
                    <div class="meta-line">
                        <span class="meta-label">created: </span>
                        <span class="meta-value">{{ formatDate(post.created_at) }}</span>
                    </div>
                    <div v-if="post.updated_at !== post.created_at" class="meta-line">
                        <span class="meta-label">updated: </span>
                        <span class="meta-value">{{ formatDate(post.updated_at) }}</span>
                    </div>
                </div>

                <div class="blank-line">&nbsp;</div>
                <div class="separator">---</div>
                <div class="blank-line">&nbsp;</div>

                <!-- Content -->
                <div v-if="post.content" class="content-body markdown-body" v-html="renderMarkdown(post.content)"></div>
                <div v-else class="empty-content">
                    (no content yet)
                </div>

                <div class="blank-line">&nbsp;</div>
                <div class="separator">---</div>
                <div class="nav-links">
                    <NuxtLink to="/blog" class="nav-link">← :e blog/</NuxtLink>
                </div>
            </template>

            <template v-else>
                <div class="error-msg">E484: Can't open file "{{ $route.params.slug }}.md"</div>
            </template>

            <ContentNavHint />
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
const route = useRoute()
import type { Database } from '~/types/database'
const client = useSupabaseClient<Database>()

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
const { data: post } = await useAsyncData(`blog-${route.params.slug}`, async () => {
    const { data } = await client
        .from('blog_posts')
        .select('*')
        .eq('slug', route.params.slug as string)
        .eq('status', 'published')
        .single()
    return data as BlogPost | null
})

const { renderMarkdown } = useMarkdown()

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string
const postTitle = post.value?.title ?? 'Blog Post'
const postDesc = post.value?.excerpt ?? ''

useHead({ title: postTitle })
useSeoMeta({
    description: postDesc,
    ogTitle: `${postTitle} - Dimas Setia Pambudi`,
    ogDescription: postDesc,
    ogUrl: `${siteUrl}/blog/${route.params.slug}`,
    ogType: 'article',
    ogImage: `${siteUrl}/og-image.png`,
    twitterCard: 'summary_large_image',
    articlePublishedTime: post.value?.published_at ?? undefined,
    articleModifiedTime: post.value?.updated_at ?? undefined,
    articleTag: post.value?.tags ?? undefined,
})
useHead({
    link: [{ rel: 'canonical', href: `${siteUrl}/blog/${route.params.slug}` }],
    script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: postTitle,
            description: postDesc,
            url: `${siteUrl}/blog/${route.params.slug}`,
            datePublished: post.value?.published_at,
            dateModified: post.value?.updated_at,
            author: { '@type': 'Person', name: 'Dimas Setia Pambudi' },
            ...(post.value?.tags?.length ? { keywords: post.value.tags.join(', ') } : {}),
        }),
    }],
})
</script>

<style scoped>
.blog-detail {
    padding: 8px 16px;
    line-height: 22px;
}

.file-comment {
    color: var(--comment);
    font-style: italic;
}

.blank-line {
    height: 22px;
}

.heading {
    color: var(--blue);
    font-weight: bold;
    font-size: 16px;
}

.excerpt {
    color: var(--fg-dark);
    font-style: italic;
}

.meta-section {
    padding-left: 8px;
}

.meta-line {
    color: var(--fg);
}

.meta-label {
    color: var(--comment);
}

.meta-value {
    color: var(--fg);
}

.tag {
    color: var(--purple);
}

.separator {
    color: var(--comment);
}

.content-body {
    color: var(--fg);
}

.content-body :deep(h1) { color: var(--blue); font-weight: bold; font-size: 16px; margin: 8px 0 4px; }
.content-body :deep(h2) { color: var(--cyan); font-weight: bold; margin: 8px 0 4px; }
.content-body :deep(h3) { color: var(--green); font-weight: bold; margin: 8px 0 4px; }
.content-body :deep(h4) { color: var(--yellow); font-weight: bold; margin: 4px 0; }
.content-body :deep(code) { color: var(--green); background: var(--bg-highlight); padding: 1px 4px; border-radius: 2px; }
.content-body :deep(pre) { background: var(--bg-highlight); padding: 12px; border-radius: 4px; overflow-x: auto; margin: 8px 0; }
.content-body :deep(pre code) { background: none; padding: 0; }
.content-body :deep(ul) { padding-left: 24px; margin: 4px 0; list-style: disc; }
.content-body :deep(ol) { padding-left: 24px; margin: 4px 0; list-style: decimal; }
.content-body :deep(ul ul) { list-style: circle; }
.content-body :deep(ul ul ul) { list-style: square; }
.content-body :deep(li) { margin: 2px 0; }
.content-body :deep(blockquote) { border-left: 3px solid var(--cyan); padding-left: 12px; color: var(--comment); margin: 8px 0; }
.content-body :deep(a) { color: var(--cyan); text-decoration: none; }
.content-body :deep(a:hover) { text-decoration: underline; }
.content-body :deep(hr) { border: none; border-top: 1px solid var(--bg-visual); margin: 12px 0; }
.content-body :deep(table) { border-collapse: collapse; width: 100%; margin: 8px 0; }
.content-body :deep(th), .content-body :deep(td) { border: 1px solid var(--bg-visual); padding: 4px 8px; text-align: left; }
.content-body :deep(th) { background: var(--bg-highlight); color: var(--cyan); }
.content-body :deep(strong) { color: var(--yellow); }
.content-body :deep(em) { color: var(--purple); font-style: italic; }
.content-body :deep(p) { margin: 4px 0; }

.empty-content {
    color: var(--comment);
    font-style: italic;
}

.error-msg {
    color: var(--red);
}

.nav-links {
    margin-top: 4px;
}

.nav-link {
    color: var(--cyan);
    text-decoration: none;
}

.nav-link:hover {
    text-decoration: underline;
}
</style>
