<template>
    <Teleport to="body">
        <div v-if="isOpen" class="telescope-overlay" @click.self="close">
            <div class="telescope-window">
                <!-- Header -->
                <div class="telescope-header">
                    <span class="telescope-icon">󰈞</span>
                    <span class="telescope-title">Telescope</span>
                    <span class="telescope-hint">Arrow key navigate · Enter select · Esc close</span>
                </div>

                <!-- Search input -->
                <div class="telescope-input-row">
                    <span class="input-prefix">&gt; </span>
                    <input ref="inputRef" v-model="query" class="telescope-input"
                        placeholder="Search files, projects, blog posts..." @keydown="handleKeydown" />
                </div>

                <!-- Results -->
                <div class="telescope-results" ref="resultsRef">
                    <div v-for="(result, i) in filteredResults" :key="result.path" class="telescope-result"
                        :class="{ active: i === selectedIndex }" @click="selectResult(result)"
                        @mouseenter="selectedIndex = i">
                        <span class="result-icon">{{ result.icon }}</span>
                        <span class="result-label">{{ result.label }}</span>
                        <span class="result-path">{{ result.path }}</span>
                    </div>
                    <div v-if="filteredResults.length === 0" class="telescope-empty">
                        No results found
                    </div>
                </div>

                <!-- Footer -->
                <div class="telescope-footer">
                    {{ filteredResults.length }} / {{ allResults.length }} results
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

interface SearchResult {
    label: string
    path: string
    icon: string
    type: string
}

const client = useSupabaseClient<Database>()
const router = useRouter()
const user = useSupabaseUser()

const isOpen = ref(false)
const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const resultsRef = ref<HTMLElement | null>(null)

// Static pages
const staticPages: SearchResult[] = [
    { label: 'dashboard', path: '/', icon: '', type: 'page' },
    { label: 'about.md', path: '/about', icon: '', type: 'page' },
    { label: 'projects/', path: '/projects', icon: '', type: 'page' },
    { label: 'blog/', path: '/blog', icon: '', type: 'page' },
    { label: 'contact.md', path: '/contact', icon: '', type: 'page' },
    { label: 'terminal', path: '/terminal', icon: '', type: 'page' },
]

const adminPages: SearchResult[] = [
    { label: 'admin/', path: '/admin', icon: '', type: 'admin' },
    { label: 'admin/profile', path: '/admin/profile', icon: '', type: 'admin' },
    { label: 'admin/projects', path: '/admin/projects', icon: '', type: 'admin' },
    { label: 'admin/blog', path: '/admin/blog', icon: '', type: 'admin' },
    { label: 'admin/skills', path: '/admin/skills', icon: '', type: 'admin' },
    { label: 'admin/experiences', path: '/admin/experiences', icon: '', type: 'admin' },
    { label: 'admin/messages', path: '/admin/messages', icon: '', type: 'admin' },
]

// Fetch dynamic content (lazy so component doesn't block layout rendering)
const { data: projects } = useLazyAsyncData('telescope-projects', async () => {
    const { data } = await client
        .from('projects')
        .select('slug, title')
        .eq('status', 'published')
        .order('sort_order')
    return (data ?? []) as { slug: string; title: string }[]
})

const { data: blogPosts } = useLazyAsyncData('telescope-blog', async () => {
    const { data } = await client
        .from('blog_posts')
        .select('slug, title')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
    return (data ?? []) as { slug: string; title: string }[]
})

const allResults = computed<SearchResult[]>(() => {
    const results: SearchResult[] = [...staticPages]

    if (user.value) {
        results.push(...adminPages)
    }

    projects.value?.forEach(p => {
        results.push({ label: `${p.slug}.md`, path: `/projects/${p.slug}`, icon: '', type: 'project' })
    })

    blogPosts.value?.forEach(p => {
        results.push({ label: `${p.slug}.md`, path: `/blog/${p.slug}`, icon: '', type: 'blog' })
    })

    return results
})

const filteredResults = computed(() => {
    if (!query.value.trim()) return allResults.value
    const q = query.value.toLowerCase()
    return allResults.value.filter(r =>
        r.label.toLowerCase().includes(q) || r.path.toLowerCase().includes(q)
    )
})

watch(query, () => {
    selectedIndex.value = 0
})

function open() {
    isOpen.value = true
    query.value = ''
    selectedIndex.value = 0
    nextTick(() => inputRef.value?.focus())
}

function close() {
    isOpen.value = false
}

function selectResult(result: SearchResult) {
    close()
    router.push(result.path)
}

function handleKeydown(e: KeyboardEvent) {
    const len = filteredResults.value.length
    switch (e.key) {
        case 'Escape':
            e.preventDefault()
            close()
            break
        case 'ArrowDown':
        case 'j':
            if (e.ctrlKey || e.key === 'ArrowDown') {
                e.preventDefault()
                selectedIndex.value = (selectedIndex.value + 1) % Math.max(len, 1)
                scrollToSelected()
            }
            break
        case 'ArrowUp':
        case 'k':
            if (e.ctrlKey || e.key === 'ArrowUp') {
                e.preventDefault()
                selectedIndex.value = (selectedIndex.value - 1 + Math.max(len, 1)) % Math.max(len, 1)
                scrollToSelected()
            }
            break
        case 'Enter':
            e.preventDefault()
            if (filteredResults.value[selectedIndex.value]) {
                selectResult(filteredResults.value[selectedIndex.value])
            }
            break
    }
}

function scrollToSelected() {
    nextTick(() => {
        const el = resultsRef.value?.children[selectedIndex.value] as HTMLElement | undefined
        el?.scrollIntoView({ block: 'nearest' })
    })
}

defineExpose({ open, close, isOpen })
</script>

<style scoped>
.telescope-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 15vh;
    z-index: 100;
}

.telescope-window {
    width: 60%;
    max-width: 600px;
    max-height: 70vh;
    background: var(--bg);
    border: 1px solid var(--bg-highlight);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.telescope-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--bg-highlight);
    font-size: 12px;
}

.telescope-icon {
    color: var(--blue);
}

.telescope-title {
    color: var(--blue);
    font-weight: bold;
}

.telescope-hint {
    color: var(--comment);
    margin-left: auto;
    font-size: 11px;
}

.telescope-input-row {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--bg-highlight);
}

.input-prefix {
    color: var(--green);
    flex-shrink: 0;
}

.telescope-input {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--fg);
    background: transparent;
    border: none;
    outline: none;
    caret-color: var(--green);
}

.telescope-input::placeholder {
    color: var(--comment);
}

.telescope-results {
    flex: 1;
    overflow-y: auto;
    max-height: 50vh;
}

.telescope-result {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    cursor: pointer;
    font-size: 13px;
}

.telescope-result.active {
    background: var(--bg-highlight);
}

.result-icon {
    color: var(--blue);
    width: 16px;
    text-align: center;
    flex-shrink: 0;
}

.result-label {
    color: var(--fg);
    flex: 1;
}

.result-path {
    color: var(--comment);
    font-size: 11px;
}

.telescope-empty {
    padding: 16px 12px;
    color: var(--comment);
    text-align: center;
    font-style: italic;
}

.telescope-footer {
    padding: 6px 12px;
    border-top: 1px solid var(--bg-highlight);
    color: var(--comment);
    font-size: 11px;
}

@media (max-width: 767px) {
    .telescope-window {
        width: 90%;
    }

    .telescope-hint {
        display: none;
    }
}
</style>
