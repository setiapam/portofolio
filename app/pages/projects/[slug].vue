<template>
    <EditorContent>
        <div class="project-detail">
            <template v-if="project">
                <!-- File header -->
                <div class="file-comment">-- {{ project.slug }}.md</div>
                <div class="file-comment">-- Last modified: {{ formatDate(project.updated_at) }}</div>
                <div class="blank-line">&nbsp;</div>

                <!-- Title -->
                <div class="heading"># {{ project.title }}</div>
                <div v-if="project.description" class="description">{{ project.description }}</div>
                <div class="blank-line">&nbsp;</div>

                <!-- Meta info -->
                <div class="meta-section">
                    <div v-if="project.tech_stack?.length" class="meta-line">
                        <span class="meta-label">tech_stack: </span>
                        <span v-for="(tech, i) in project.tech_stack" :key="tech" class="tech-tag">{{ tech }}<span v-if="i < project.tech_stack.length - 1">, </span></span>
                    </div>
                    <div v-if="project.github_url" class="meta-line">
                        <span class="meta-label">github: </span>
                        <a :href="project.github_url" target="_blank" rel="noopener" class="meta-link">{{ project.github_url }}</a>
                    </div>
                    <div v-if="project.live_url" class="meta-line">
                        <span class="meta-label">live: </span>
                        <a :href="project.live_url" target="_blank" rel="noopener" class="meta-link">{{ project.live_url }}</a>
                    </div>
                    <div class="meta-line">
                        <span class="meta-label">status: </span>
                        <span class="meta-status">{{ project.status }}</span>
                    </div>
                </div>

                <div class="blank-line">&nbsp;</div>
                <div class="separator">---</div>
                <div class="blank-line">&nbsp;</div>

                <!-- Content -->
                <div v-if="project.content" class="content-body" v-html="renderMarkdown(project.content)"></div>
                <div v-else class="empty-content">
                    (no content yet)
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

type Project = Database['public']['Tables']['projects']['Row']
const { data: project } = await useAsyncData(`project-${route.params.slug}`, async () => {
    const { data } = await client
        .from('projects')
        .select('*')
        .eq('slug', route.params.slug as string)
        .eq('status', 'published')
        .single()
    return data as Project | null
})

function formatDate(dateStr: string): string {
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
    title: project.value?.title ?? 'Project',
})
</script>

<style scoped>
.project-detail {
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

.description {
    color: var(--fg);
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

.tech-tag {
    color: var(--purple);
}

.meta-link {
    color: var(--cyan);
    text-decoration: none;
}

.meta-link:hover {
    text-decoration: underline;
}

.meta-status {
    color: var(--green);
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
</style>
