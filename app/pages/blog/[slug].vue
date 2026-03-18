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
                <div v-if="post.content" class="content-body" v-html="renderMarkdown(post.content)"></div>
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

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function renderMarkdown(text: string): string {
    return text
        .replace(/^### (.*$)/gm, '<h3 class="md-h3">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="md-h2">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="md-h1">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="md-code">$1</code>')
        .replace(/^\- (.*$)/gm, '<div class="md-list-item">• $1</div>')
        .replace(/\n\n/g, '<div class="md-break"></div>')
        .replace(/\n/g, '<br>')
}

useHead({
    title: post.value?.title ?? 'Blog Post',
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

.content-body :deep(.md-h1) {
    color: var(--blue);
    font-weight: bold;
    font-size: 16px;
    margin: 0;
}

.content-body :deep(.md-h2) {
    color: var(--cyan);
    font-weight: bold;
    margin: 0;
}

.content-body :deep(.md-h3) {
    color: var(--green);
    font-weight: bold;
    margin: 0;
}

.content-body :deep(.md-code) {
    color: var(--green);
    background: var(--bg-highlight);
    padding: 1px 4px;
    border-radius: 2px;
}

.content-body :deep(.md-list-item) {
    padding-left: 16px;
}

.content-body :deep(.md-break) {
    height: 22px;
}

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
