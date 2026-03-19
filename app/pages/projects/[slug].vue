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
                <div v-if="project.content" class="content-body markdown-body" v-html="renderMarkdown(project.content)"></div>
                <div v-else class="empty-content">
                    (no content yet)
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

const { renderMarkdown } = useMarkdown()

function formatDate(dateStr: string): string {
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string
const projectTitle = project.value?.title ?? 'Project'
const projectDesc = project.value?.description ?? ''

useHead({ title: projectTitle })
useSeoMeta({
    description: projectDesc,
    ogTitle: `${projectTitle} - Dimas Setia Pambudi`,
    ogDescription: projectDesc,
    ogUrl: `${siteUrl}/projects/${route.params.slug}`,
    ogType: 'article',
    ogImage: `${siteUrl}/og-image.png`,
    twitterCard: 'summary_large_image',
})
useHead({
    link: [{ rel: 'canonical', href: `${siteUrl}/projects/${route.params.slug}` }],
    script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: projectTitle,
            description: projectDesc,
            url: `${siteUrl}/projects/${route.params.slug}`,
            author: { '@type': 'Person', name: 'Dimas Setia Pambudi' },
            ...(project.value?.github_url ? { codeRepository: project.value.github_url } : {}),
            ...(project.value?.tech_stack?.length ? { keywords: project.value.tech_stack.join(', ') } : {}),
        }),
    }],
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
</style>
