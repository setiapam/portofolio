<template>
    <EditorContent>
        <div class="blog-page">
            <!-- ls -la style header -->
            <div class="ls-header">
                <span class="ls-command">$ ls -la ~/blog/</span>
            </div>
            <div class="ls-total">total {{ posts?.length ?? 0 }}</div>
            <div class="blank-line">&nbsp;</div>

            <!-- Column headers -->
            <div class="ls-row ls-header-row">
                <span class="ls-date">published</span>
                <span class="ls-tags">tags</span>
                <span class="ls-name">name</span>
            </div>
            <div class="ls-divider">{{ '-'.repeat(60) }}</div>

            <!-- Parent directory -->
            <div class="ls-row">
                <span class="ls-date">{{ today }}</span>
                <span class="ls-tags">-</span>
                <NuxtLink to="/" class="ls-name ls-dir">..</NuxtLink>
            </div>

            <!-- Blog entries -->
            <div v-for="post in filteredPosts" :key="post.slug" class="ls-row">
                <span class="ls-date">{{ formatDate(post.published_at) }}</span>
                <span class="ls-tags">
                    <span v-for="(tag, i) in post.tags?.slice(0, 3)" :key="tag" class="tag">{{ tag }}<span v-if="i < Math.min(post.tags.length, 3) - 1">,</span></span>
                    <span v-if="!post.tags?.length">-</span>
                </span>
                <NuxtLink :to="`/blog/${post.slug}`" class="ls-name ls-file">
                    {{ post.slug }}.md
                </NuxtLink>
            </div>

            <div v-if="!filteredPosts?.length" class="empty-msg">
                (directory is empty)
            </div>

            <div class="blank-line">&nbsp;</div>

            <!-- Tag filter -->
            <div v-if="allTags.length > 0" class="tag-filter">
                <span class="filter-label">:tag </span>
                <button
                    v-for="tag in allTags"
                    :key="tag"
                    class="filter-tag"
                    :class="{ active: activeTag === tag }"
                    @click="toggleTag(tag)"
                >{{ tag }}</button>
                <button v-if="activeTag" class="filter-clear" @click="activeTag = null">[clear]</button>
            </div>

            <div class="ls-summary">
                <span class="summary-text">{{ filteredPosts?.length ?? 0 }} posts</span>
                <span v-if="activeTag" class="summary-filter"> (filtered: {{ activeTag }})</span>
            </div>

            <ContentNavHint />
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'
const client = useSupabaseClient<Database>()

const activeTag = ref<string | null>(null)

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
const { data: posts } = await useAsyncData('blog-list', async () => {
    const { data } = await client
        .from('blog_posts')
        .select('slug, title, excerpt, tags, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
    return (data ?? []) as Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'tags' | 'published_at'>[]
})

const allTags = computed(() => {
    const tags = new Set<string>()
    posts.value?.forEach(p => p.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
})

const filteredPosts = computed(() => {
    if (!activeTag.value) return posts.value
    return posts.value?.filter(p => p.tags?.includes(activeTag.value!))
})

const now = new Date()
const today = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

function toggleTag(tag: string) {
    activeTag.value = activeTag.value === tag ? null : tag
}

useHead({ title: 'Blog' })
</script>

<style scoped>
.blog-page {
    padding: 8px 16px;
    line-height: 22px;
}

.ls-command {
    color: var(--green);
}

.ls-total {
    color: var(--comment);
}

.blank-line {
    height: 22px;
}

.ls-row {
    display: flex;
    gap: 16px;
    align-items: baseline;
}

.ls-header-row {
    color: var(--comment);
    font-size: 12px;
}

.ls-divider {
    color: var(--comment);
    opacity: 0.5;
}

.ls-date {
    color: var(--blue);
    width: 70px;
    flex-shrink: 0;
}

.ls-tags {
    color: var(--purple);
    width: 140px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tag {
    color: var(--purple);
}

.ls-name {
    color: var(--fg);
    text-decoration: none;
}

.ls-file:hover {
    color: var(--cyan);
    text-decoration: underline;
}

.ls-dir {
    color: var(--blue);
    font-weight: bold;
}

.ls-dir:hover {
    text-decoration: underline;
}

.empty-msg {
    color: var(--comment);
    font-style: italic;
    padding-left: 16px;
}

.tag-filter {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 8px;
}

.filter-label {
    color: var(--comment);
}

.filter-tag {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--purple);
    background: transparent;
    border: 1px solid var(--bg-highlight);
    padding: 1px 8px;
    cursor: pointer;
    border-radius: 2px;
}

.filter-tag:hover {
    background: var(--bg-highlight);
}

.filter-tag.active {
    background: var(--purple);
    color: var(--bg);
    border-color: var(--purple);
}

.filter-clear {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--red);
    background: transparent;
    border: none;
    cursor: pointer;
}

.ls-summary {
    color: var(--comment);
}

.summary-filter {
    color: var(--purple);
}
</style>
