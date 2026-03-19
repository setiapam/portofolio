<template>
    <EditorContent>
        <div class="admin-page">
            <div class="file-comment">-- admin/skills.md</div>
            <div class="blank-line">&nbsp;</div>

            <div class="split-view">
                <!-- Left: list -->
                <div class="list-pane">
                    <AdminDataTable title="Skills" :rows="skills ?? []" label-field="name" status-field="category"
                        date-field="" :selected-id="editing?.id" @create="createNew" @select="selectItem"
                        @delete="deleteItem" />
                </div>

                <!-- Right: editor -->
                <div v-if="editing" class="edit-pane">
                    <div class="field">
                        <label class="field-label">name:</label>
                        <input v-model="editing.name" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">category:</label>
                        <select v-model="editing.category" class="field-input">
                            <option value="frontend">frontend</option>
                            <option value="backend">backend</option>
                            <option value="devops">devops</option>
                            <option value="tools">tools</option>
                        </select>
                    </div>
                    <div class="field">
                        <label class="field-label">level:</label>
                        <select v-model.number="editing.level" class="field-input">
                            <option :value="1">1 - Beginner</option>
                            <option :value="2">2 - Basic</option>
                            <option :value="3">3 - Intermediate</option>
                            <option :value="4">4 - Advanced</option>
                            <option :value="5">5 - Expert</option>
                        </select>
                    </div>
                    <div class="field">
                        <label class="field-label">icon:</label>
                        <input v-model="editing.icon" class="field-input" placeholder="devicon identifier" />
                    </div>
                    <div class="field">
                        <label class="field-label">sort_order:</label>
                        <input v-model.number="editing.sort_order" type="number" class="field-input" />
                    </div>
                    <div class="blank-line">&nbsp;</div>
                    <div class="skill-preview">
                        <span class="preview-label">preview:</span>
                        <span class="preview-name">{{ editing.name }}</span>
                        <span class="preview-bar">{{ getSkillBar(editing.level) }}</span>
                        <span class="preview-category">{{ editing.category }}</span>
                    </div>
                    <div class="blank-line">&nbsp;</div>
                    <div class="actions">
                        <button class="btn-save" @click="save">:w Save</button>
                        <span v-if="message" :class="messageClass">{{ message }}</span>
                    </div>
                </div>
                <div v-else class="edit-pane empty">
                    Select a skill or create new
                </div>
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

definePageMeta({ middleware: 'auth' })

type Skill = Database['public']['Tables']['skills']['Row']
const client = useSupabaseClient<Database>()
const message = ref('')
const messageClass = ref('')

const { data: profileId } = await useAsyncData('admin-profile-id', async () => {
    const { data } = await client.from('profiles').select('id').limit(1).single()
    return (data as { id: string } | null)?.id ?? null
})

const { data: skills, refresh } = await useAsyncData('admin-skills', async () => {
    const { data } = await client.from('skills').select('*').order('category').order('sort_order')
    return (data ?? []) as Skill[]
})

const editing = ref<Record<string, any> | null>(null)

function getSkillBar(level: number): string {
    const filled = '\u2588'.repeat(level)
    const empty = '\u2591'.repeat(5 - level)
    return `[${filled}${empty}]`
}

function selectItem(row: Record<string, any>) {
    editing.value = { ...row }
    message.value = ''
}

function createNew() {
    editing.value = {
        id: null,
        name: '',
        category: 'frontend',
        level: 3,
        icon: '',
        sort_order: (skills.value?.length ?? 0) + 1,
    }
    message.value = ''
}

async function save() {
    if (!editing.value) return
    const payload = {
        name: editing.value.name,
        category: editing.value.category,
        level: editing.value.level,
        icon: editing.value.icon || null,
        sort_order: editing.value.sort_order,
    }

    let error
    if (editing.value.id) {
        ({ error } = await client.from('skills').update(payload).eq('id', editing.value.id))
    } else {
        if (!profileId.value) {
            message.value = 'E: No profile found. Create a profile first.'
            messageClass.value = 'msg-error'
            return
        }
        ({ error } = await client.from('skills').insert({ ...payload, profile_id: profileId.value }))
    }

    if (error) {
        message.value = `E: ${error.message}`
        messageClass.value = 'msg-error'
    } else {
        message.value = `"${editing.value.name}" written`
        messageClass.value = 'msg-success'
        await refresh()
    }
}

async function deleteItem(row: Record<string, any>) {
    if (!confirm(`Delete "${row.name}"? [y/N]`)) return
    await client.from('skills').delete().eq('id', row.id)
    if (editing.value?.id === row.id) editing.value = null
    await refresh()
}

function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
    }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

useHead({ title: 'Admin - Skills' })
</script>

<style scoped>
.admin-page {
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

.split-view {
    display: flex;
    gap: 16px;
    height: calc(100vh - 200px);
}

.list-pane {
    width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
}

.edit-pane {
    flex: 1;
    overflow-y: auto;
}

.edit-pane.empty {
    color: var(--comment);
    font-style: italic;
    display: flex;
    align-items: center;
    justify-content: center;
}

.field {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.field-label {
    color: var(--cyan);
    min-width: 110px;
    flex-shrink: 0;
    font-size: 13px;
}

.field-input {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--fg);
    background: var(--bg-highlight);
    border: 1px solid var(--bg-visual);
    padding: 4px 8px;
    outline: none;
    caret-color: var(--green);
}

.field-input:focus {
    border-color: var(--blue);
}

.skill-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-dark);
    border: 1px solid var(--bg-highlight);
    font-size: 13px;
}

.preview-label {
    color: var(--comment);
}

.preview-name {
    color: var(--cyan);
}

.preview-bar {
    color: var(--green);
    font-family: var(--font-mono);
}

.preview-category {
    color: var(--comment);
    font-style: italic;
}

.actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.btn-save {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--bg);
    background: var(--green);
    border: none;
    padding: 4px 16px;
    cursor: pointer;
    border-radius: 2px;
}

.btn-save:hover {
    opacity: 0.9;
}

.msg-success {
    color: var(--green);
    font-size: 13px;
}

.msg-error {
    color: var(--red);
    font-size: 13px;
}

@media (max-width: 767px) {
    .split-view {
        flex-direction: column;
        height: auto;
    }

    .list-pane {
        width: 100%;
    }
}
</style>
