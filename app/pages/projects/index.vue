<template>
    <EditorContent>
        <div class="projects-page">
            <!-- ls -la style header -->
            <div class="ls-header">
                <span class="ls-command">$ ls -la ~/projects/</span>
            </div>
            <div class="ls-total">total {{ projects?.length ?? 0 }}</div>
            <div class="blank-line">&nbsp;</div>

            <!-- Column headers -->
            <div class="ls-row ls-header-row">
                <span class="ls-perms">permissions</span>
                <span class="ls-size">size</span>
                <span class="ls-date">date</span>
                <span class="ls-name">name</span>
            </div>
            <div class="ls-divider">{{ '-'.repeat(60) }}</div>

            <!-- Parent directory -->
            <div class="ls-row">
                <span class="ls-perms">drwxr-xr-x</span>
                <span class="ls-size">4.0K</span>
                <span class="ls-date">{{ today }}</span>
                <NuxtLink to="/" class="ls-name ls-dir">..</NuxtLink>
            </div>

            <!-- Project entries -->
            <div v-for="project in projects" :key="project.slug" class="ls-row">
                <span class="ls-perms">-rw-r--r--</span>
                <span class="ls-size">{{ estimateSize(project.content) }}</span>
                <span class="ls-date">{{ formatDate(project.updated_at) }}</span>
                <NuxtLink :to="`/projects/${project.slug}`" class="ls-name ls-file">
                    {{ project.slug }}.md
                </NuxtLink>
                <span v-if="project.featured" class="ls-featured">★</span>
            </div>

            <div v-if="!projects?.length" class="empty-msg">
                (directory is empty)
            </div>

            <div class="blank-line">&nbsp;</div>
            <div class="ls-summary">
                <span class="summary-text">{{ projects?.length ?? 0 }} files</span>
                <span v-if="featuredCount > 0" class="summary-featured"> ({{ featuredCount }} featured)</span>
            </div>

            <ContentNavHint />
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'
const client = useSupabaseClient<Database>()

type Project = Database['public']['Tables']['projects']['Row']
const { data: projects } = await useAsyncData('projects-list', async () => {
    const { data } = await client
        .from('projects')
        .select('slug, title, description, tech_stack, featured, content, updated_at')
        .eq('status', 'published')
        .order('sort_order')
    return (data ?? []) as Pick<Project, 'slug' | 'title' | 'description' | 'tech_stack' | 'featured' | 'content' | 'updated_at'>[]
})

const now = new Date()
const today = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

const featuredCount = computed(() => projects.value?.filter(p => p.featured).length ?? 0)

function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

function estimateSize(content: string | null): string {
    if (!content) return '0.1K'
    const bytes = new Blob([content]).size
    if (bytes < 1024) return `${bytes}B`
    return `${(bytes / 1024).toFixed(1)}K`
}

useHead({ title: 'Projects' })
</script>

<style scoped>
.projects-page {
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

.ls-perms {
    color: var(--comment);
    width: 110px;
    flex-shrink: 0;
}

.ls-size {
    color: var(--green);
    width: 50px;
    flex-shrink: 0;
    text-align: right;
}

.ls-date {
    color: var(--blue);
    width: 60px;
    flex-shrink: 0;
}

.ls-name {
    color: var(--fg);
    text-decoration: none;
}

.ls-file {
    color: var(--fg);
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

.ls-featured {
    color: var(--yellow);
}

.empty-msg {
    color: var(--comment);
    font-style: italic;
    padding-left: 16px;
}

.ls-summary {
    color: var(--comment);
}

.summary-featured {
    color: var(--yellow);
}

@media (max-width: 767px) {
    .ls-perms {
        display: none;
    }

    .ls-size {
        display: none;
    }
}
</style>
