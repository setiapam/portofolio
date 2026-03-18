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
                <div v-if="profile?.bio" class="bio" v-html="renderMarkdown(profile.bio)"></div>
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
                    <div v-if="exp.description" class="exp-desc" v-html="renderMarkdown(exp.description)"></div>
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

function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function renderMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
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

.bio :deep(code) {
    color: var(--green);
    background: var(--bg-highlight);
    padding: 1px 4px;
    border-radius: 2px;
}

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

.exp-desc :deep(code) {
    color: var(--green);
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
