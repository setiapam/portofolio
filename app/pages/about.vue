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
                    <span class="info-icon"></span>
                    <span class="info-text">{{ profile.location }}</span>
                </div>
                <div v-if="profile?.email" class="info-line">
                    <span class="info-icon"></span>
                    <span class="info-text">{{ profile.email }}</span>
                </div>
                <div v-if="profile?.github_url" class="info-line">
                    <span class="info-icon"></span>
                    <a :href="profile.github_url" target="_blank" rel="noopener" class="info-link">{{ profile.github_url }}</a>
                </div>
                <div v-if="profile?.linkedin_url" class="info-line">
                    <span class="info-icon">󰌻</span>
                    <a :href="profile.linkedin_url" target="_blank" rel="noopener" class="info-link">{{ profile.linkedin_url }}</a>
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

useHead({
    title: `${profile.value?.name ?? 'About'} - About`,
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

.info-icon {
    color: var(--cyan);
    width: 16px;
    text-align: center;
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
