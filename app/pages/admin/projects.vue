<template>
    <EditorContent>
        <div class="admin-page">
            <div class="file-comment">-- admin/projects.vue</div>
            <div class="blank-line">&nbsp;</div>

            <div class="split-view">
                <!-- Left: list -->
                <div class="list-pane">
                    <AdminDataTable
                        title="Projects"
                        :rows="projects ?? []"
                        label-field="title"
                        status-field="status"
                        date-field="updated_at"
                        :selected-id="editing?.id"
                        @create="createNew"
                        @select="selectItem"
                        @delete="deleteItem"
                    />
                </div>

                <!-- Right: editor -->
                <div v-if="editing" class="edit-pane">
                    <div class="field">
                        <label class="field-label">title:</label>
                        <input v-model="editing.title" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">slug:</label>
                        <input v-model="editing.slug" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">description:</label>
                        <input v-model="editing.description" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">status:</label>
                        <select v-model="editing.status" class="field-input">
                            <option value="draft">draft</option>
                            <option value="published">published</option>
                            <option value="archived">archived</option>
                        </select>
                    </div>
                    <div class="field">
                        <label class="field-label">tech_stack:</label>
                        <input v-model="techStackInput" class="field-input" placeholder="comma separated" />
                    </div>
                    <div class="field">
                        <label class="field-label">github_url:</label>
                        <input v-model="editing.github_url" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">live_url:</label>
                        <input v-model="editing.live_url" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">featured:</label>
                        <input type="checkbox" v-model="editing.featured" />
                    </div>
                    <div class="blank-line">&nbsp;</div>
                    <AdminMarkdownEditor v-model="editing.content" title="content" />
                    <div class="blank-line">&nbsp;</div>
                    <div class="actions">
                        <button class="btn-save" @click="save">:w Save</button>
                        <span v-if="message" :class="messageClass">{{ message }}</span>
                    </div>
                </div>
                <div v-else class="edit-pane empty">
                    Select a project or create new
                </div>
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

definePageMeta({ middleware: 'auth' })

type Project = Database['public']['Tables']['projects']['Row']
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const message = ref('')
const messageClass = ref('')

const { data: projects, refresh } = await useAsyncData('admin-projects', async () => {
    const { data } = await client.from('projects').select('*').order('sort_order')
    return (data ?? []) as Project[]
})

const editing = ref<Record<string, any> | null>(null)
const techStackInput = computed({
    get: () => (editing.value?.tech_stack ?? []).join(', '),
    set: (val: string) => {
        if (editing.value) {
            editing.value.tech_stack = val.split(',').map(s => s.trim()).filter(Boolean)
        }
    },
})

function selectItem(row: Record<string, any>) {
    editing.value = { ...row }
    message.value = ''
}

function createNew() {
    editing.value = {
        id: null,
        title: '',
        slug: '',
        description: '',
        content: '',
        tech_stack: [],
        github_url: '',
        live_url: '',
        featured: false,
        status: 'draft',
        sort_order: (projects.value?.length ?? 0) + 1,
    }
    message.value = ''
}

async function save() {
    if (!editing.value) return
    const payload = {
        title: editing.value.title,
        slug: editing.value.slug,
        description: editing.value.description,
        content: editing.value.content,
        tech_stack: editing.value.tech_stack,
        github_url: editing.value.github_url || null,
        live_url: editing.value.live_url || null,
        featured: editing.value.featured,
        status: editing.value.status,
        sort_order: editing.value.sort_order,
        updated_at: new Date().toISOString(),
    }

    let error
    if (editing.value.id) {
        ({ error } = await client.from('projects').update(payload).eq('id', editing.value.id))
    } else {
        ({ error } = await client.from('projects').insert({ ...payload, profile_id: user.value!.id }))
    }

    if (error) {
        message.value = `E: ${error.message}`
        messageClass.value = 'msg-error'
    } else {
        message.value = `"${editing.value.slug}.md" written`
        messageClass.value = 'msg-success'
        await refresh()
    }
}

async function deleteItem(row: Record<string, any>) {
    if (!confirm(`Delete "${row.title}"? [y/N]`)) return
    await client.from('projects').delete().eq('id', row.id)
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

useHead({ title: 'Admin - Projects' })
</script>

<style scoped>
.admin-page { padding: 8px 16px; line-height: 22px; }
.file-comment { color: var(--comment); font-style: italic; }
.blank-line { height: 22px; }

.split-view { display: flex; gap: 16px; height: calc(100vh - 200px); }
.list-pane { width: 320px; flex-shrink: 0; overflow-y: auto; }
.edit-pane { flex: 1; overflow-y: auto; }
.edit-pane.empty { color: var(--comment); font-style: italic; display: flex; align-items: center; justify-content: center; }

.field { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.field-label { color: var(--cyan); min-width: 110px; flex-shrink: 0; font-size: 13px; }
.field-input {
    flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 14px;
    color: var(--fg); background: var(--bg-highlight); border: 1px solid var(--bg-visual);
    padding: 4px 8px; outline: none; caret-color: var(--green);
}
.field-input:focus { border-color: var(--blue); }

.actions { display: flex; gap: 12px; align-items: center; }
.btn-save {
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    color: var(--bg); background: var(--green); border: none;
    padding: 4px 16px; cursor: pointer; border-radius: 2px;
}
.btn-save:hover { opacity: 0.9; }
.msg-success { color: var(--green); font-size: 13px; }
.msg-error { color: var(--red); font-size: 13px; }

@media (max-width: 767px) {
    .split-view { flex-direction: column; height: auto; }
    .list-pane { width: 100%; }
}
</style>
