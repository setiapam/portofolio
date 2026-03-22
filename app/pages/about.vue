<template>
    <EditorContent>
        <div class="about-page">
            <!-- File header comment -->
            <div class="file-comment">-- about.md</div>
            <div class="file-comment">-- Last modified: {{ formatDate(profile?.updated_at) }}</div>
            <div class="blank-line">&nbsp;</div>

            <!-- Profile section -->
            <div class="section">
                <div class="heading"># {{ profile?.name ?? 'Developer' }}</div>
                <div class="subheading">## {{ profile?.title ?? 'Software Engineer' }}</div>
                <div class="blank-line">&nbsp;</div>
                <div v-if="profile?.bio" class="bio markdown-body" v-html="renderMarkdown(profile.bio)"></div>
                <div class="blank-line">&nbsp;</div>

                <!-- Links -->
                <div v-if="profile?.location" class="info-line">
                    <svg class="info-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
                    <span class="info-text">{{ profile.location }}</span>
                </div>
                <div v-if="profile?.email" class="info-line">
                    <svg class="info-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                    <span class="info-text">{{ profile.email }}</span>
                </div>
                <div v-if="profile?.github_url" class="info-line">
                    <svg class="info-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    <a :href="profile.github_url" target="_blank" rel="noopener" class="info-link">{{ profile.github_url }}</a>
                </div>
                <div v-if="profile?.linkedin_url" class="info-line">
                    <svg class="info-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                    <a :href="profile.linkedin_url" target="_blank" rel="noopener" class="info-link">{{ profile.linkedin_url }}</a>
                </div>
                <div v-if="profile?.resume_url" class="info-line">
                    <svg class="info-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                    <a :href="profile.resume_url" target="_blank" rel="noopener" class="info-link">Resume / CV</a>
                </div>
            </div>

            <div class="blank-line">&nbsp;</div>
            <div class="separator">---</div>
            <div class="blank-line">&nbsp;</div>

            <!-- Skills section -->
            <div class="section">
                <div class="heading"># Skills</div>
                <div class="blank-line">&nbsp;</div>
                <div v-for="category in skillCategories" :key="category" class="skill-category">
                    <div class="subheading">## {{ category }}</div>
                    <div v-for="skill in skillsByCategory(category)" :key="skill.id" class="skill-line">
                        <i v-if="skill.icon" :class="skill.icon" class="skill-icon"></i>
                        <span class="skill-name">{{ skill.name }}</span>
                        <span class="skill-bar">{{ getSkillBar(skill.level) }}</span>
                    </div>
                    <div class="blank-line">&nbsp;</div>
                </div>
            </div>

            <div class="separator">---</div>
            <div class="blank-line">&nbsp;</div>

            <!-- Experience section -->
            <div class="section">
                <div class="heading"># Experience</div>
                <div class="blank-line">&nbsp;</div>
                <div v-for="exp in experiences" :key="exp.id" class="experience-entry">
                    <div class="exp-header">
                        <span class="exp-role">{{ exp.role }}</span>
                        <span class="exp-at"> @ </span>
                        <span class="exp-company">{{ exp.company }}</span>
                    </div>
                    <div class="exp-dates">
                        {{ formatDate(exp.start_date) }} - {{ exp.end_date ? formatDate(exp.end_date) : 'Present' }}
                    </div>
                    <div v-if="exp.description" class="exp-desc markdown-body" v-html="renderMarkdown(exp.description)"></div>
                    <div v-if="exp.tech_stack?.length" class="exp-tech">
                        <span class="tech-label">stack: </span>
                        <span v-for="(tech, i) in exp.tech_stack" :key="tech" class="tech-tag">{{ tech }}<span v-if="i < exp.tech_stack.length - 1">, </span></span>
                    </div>
                    <div class="blank-line">&nbsp;</div>
                </div>
            </div>

            <ContentNavHint />
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']
type Skill = Database['public']['Tables']['skills']['Row']
type Experience = Database['public']['Tables']['experiences']['Row']

const client = useSupabaseClient<Database>()

const { data: profile } = await useAsyncData('about-profile', async () => {
    const { data } = await client
        .from('profiles')
        .select('*')
        .limit(1)
        .single()
    return data as Profile | null
})

const { data: skills } = await useAsyncData('about-skills', async () => {
    const { data } = await client
        .from('skills')
        .select('*')
        .order('sort_order')
    return (data ?? []) as Skill[]
})

const { data: experiences } = await useAsyncData('about-experiences', async () => {
    const { data } = await client
        .from('experiences')
        .select('*')
        .order('sort_order')
    return (data ?? []) as Experience[]
})

const skillCategories = computed(() => {
    const cats = new Set(skills.value?.map(s => s.category) ?? [])
    return Array.from(cats)
})

function skillsByCategory(category: string) {
    return skills.value?.filter(s => s.category === category) ?? []
}

function getSkillBar(level: number): string {
    const filled = '█'.repeat(level)
    const empty = '░'.repeat(5 - level)
    return `[${filled}${empty}]`
}

const { renderMarkdown } = useMarkdown()

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
}

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string
const profileName = profile.value?.name ?? 'Developer'
const profileTitle = profile.value?.title ?? 'Software Engineer'
const bioText = profile.value?.bio?.replace(/[#*`\n]/g, ' ').slice(0, 160) ?? ''

useHead({
    title: `${profileName} - About`,
})
useSeoMeta({
    description: `${profileName} — ${profileTitle}. ${bioText}`,
    ogTitle: `${profileName} - About`,
    ogDescription: `${profileName} — ${profileTitle}. Skills, experience, and background.`,
    ogUrl: `${siteUrl}/about`,
    ogType: 'profile',
    ogImage: `${siteUrl}/og-image.png`,
    twitterCard: 'summary_large_image',
})
useHead({
    script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: profileName,
            jobTitle: profileTitle,
            description: bioText,
            url: siteUrl,
            email: profile.value?.email ?? undefined,
            sameAs: [profile.value?.github_url, profile.value?.linkedin_url].filter(Boolean),
        }),
    }],
})
</script>

<style scoped>
.about-page {
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

.subheading {
    color: var(--cyan);
    font-weight: bold;
}

.bio {
    color: var(--fg);
}

.markdown-body :deep(h1) { color: var(--blue); font-weight: bold; font-size: 16px; margin: 8px 0 4px; }
.markdown-body :deep(h2) { color: var(--cyan); font-weight: bold; margin: 8px 0 4px; }
.markdown-body :deep(h3) { color: var(--green); font-weight: bold; margin: 8px 0 4px; }
.markdown-body :deep(h4) { color: var(--yellow); font-weight: bold; margin: 4px 0; }
.markdown-body :deep(code) { color: var(--green); background: var(--bg-highlight); padding: 1px 4px; border-radius: 2px; }
.markdown-body :deep(pre) { background: var(--bg-highlight); padding: 12px; border-radius: 4px; overflow-x: auto; margin: 8px 0; }
.markdown-body :deep(pre code) { background: none; padding: 0; }
.markdown-body :deep(ul) { padding-left: 24px; margin: 4px 0; list-style: disc; }
.markdown-body :deep(ol) { padding-left: 24px; margin: 4px 0; list-style: decimal; }
.markdown-body :deep(ul ul) { list-style: circle; }
.markdown-body :deep(ul ul ul) { list-style: square; }
.markdown-body :deep(li) { margin: 2px 0; }
.markdown-body :deep(blockquote) { border-left: 3px solid var(--cyan); padding-left: 12px; color: var(--comment); margin: 8px 0; }
.markdown-body :deep(a) { color: var(--cyan); text-decoration: none; }
.markdown-body :deep(a:hover) { text-decoration: underline; }
.markdown-body :deep(hr) { border: none; border-top: 1px solid var(--bg-visual); margin: 12px 0; }
.markdown-body :deep(strong) { color: var(--yellow); }
.markdown-body :deep(em) { color: var(--purple); font-style: italic; }
.markdown-body :deep(p) { margin: 4px 0; }

.info-line {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fg);
}

.info-svg {
    width: 14px;
    height: 14px;
    color: var(--cyan);
    flex-shrink: 0;
}

.info-link {
    color: var(--blue);
    text-decoration: none;
}

.info-link:hover {
    text-decoration: underline;
}

.separator {
    color: var(--comment);
}

.skill-category {
    margin-bottom: 4px;
}

.skill-line {
    display: flex;
    gap: 12px;
    align-items: center;
}

.skill-icon {
    color: var(--cyan);
    font-size: 16px;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
}

.skill-name {
    color: var(--fg);
    min-width: 160px;
}

.skill-bar {
    color: var(--green);
    font-size: 12px;
}

.experience-entry {
    margin-bottom: 4px;
}

.exp-header {
    font-weight: bold;
}

.exp-role {
    color: var(--yellow);
}

.exp-at {
    color: var(--comment);
}

.exp-company {
    color: var(--cyan);
}

.exp-dates {
    color: var(--comment);
    font-size: 13px;
}

.exp-desc {
    color: var(--fg);
    padding-left: 8px;
}

.exp-tech {
    color: var(--fg);
}

.tech-label {
    color: var(--comment);
}

.tech-tag {
    color: var(--purple);
}
</style>
