<template>
    <EditorContent>
        <div class="admin-page">
            <div class="file-comment">-- admin/experiences.vue</div>
            <div class="blank-line">&nbsp;</div>

            <div class="split-view">
                <!-- Left: list -->
                <div class="list-pane">
                    <AdminDataTable
                        title="Experiences"
                        :rows="experiences ?? []"
                        label-field="company"
                        date-field="start_date"
                        :selected-id="editing?.id"
                        @create="createNew"
                        @select="selectItem"
                        @delete="deleteItem"
                    />
                </div>

                <!-- Right: editor -->
                <div v-if="editing" class="edit-pane">
                    <div class="field">
                        <label class="field-label">company:</label>
                        <input v-model="editing.company" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">role:</label>
                        <input v-model="editing.role" class="field-input" />
                    </div>
                    <div class="field">
                        <label class="field-label">start_date:</label>
                        <input v-model="startDateDisplay" class="field-input" placeholder="dd/mm/yyyy" />
                    </div>
                    <div class="field">
                        <label class="field-label">end_date:</label>
                        <input v-model="endDateDisplay" class="field-input" placeholder="dd/mm/yyyy (kosongkan untuk present)" />
                        <button v-if="editing.end_date" class="btn-clear" @click="editing.end_date = null" title="Set as present">present</button>
                    </div>
                    <div class="field">
                        <label class="field-label">tech_stack:</label>
                        <input v-model="techStackInput" class="field-input" placeholder="comma separated" />
                    </div>
                    <div class="field">
                        <label class="field-label">sort_order:</label>
                        <input v-model.number="editing.sort_order" type="number" class="field-input" />
                    </div>
                    <div class="blank-line">&nbsp;</div>
                    <AdminMarkdownEditor v-model="editing.description" title="description" />
                    <div class="blank-line">&nbsp;</div>
                    <div class="actions">
                        <button class="btn-save" @click="save">:w Save</button>
                        <span v-if="message" :class="messageClass">{{ message }}</span>
                    </div>
                </div>
                <div v-else class="edit-pane empty">
                    Select an experience or create new
                </div>
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

definePageMeta({ middleware: 'auth' })

type Experience = Database['public']['Tables']['experiences']['Row']
const client = useSupabaseClient<Database>()
const message = ref('')
const messageClass = ref('')

const { data: profileId } = await useAsyncData('admin-profile-id', async () => {
    const { data } = await client.from('profiles').select('id').limit(1).single()
    return (data as { id: string } | null)?.id ?? null
})

const { data: experiences, refresh } = await useAsyncData('admin-experiences', async () => {
    const { data } = await client.from('experiences').select('*').order('sort_order')
    return (data ?? []) as Experience[]
})

const editing = ref<Record<string, any> | null>(null)

function isoToDisplay(iso: string | null): string {
    if (!iso) return ''
    const [y, m, d] = iso.split('-')
    return `${d}/${m}/${y}`
}

function displayToIso(display: string): string | null {
    if (!display) return null
    const parts = display.split('/')
    if (parts.length !== 3) return display
    const [d, m, y] = parts
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

const startDateDisplay = computed({
    get: () => isoToDisplay(editing.value?.start_date),
    set: (val: string) => {
        if (editing.value) editing.value.start_date = displayToIso(val) ?? ''
    },
})

const endDateDisplay = computed({
    get: () => isoToDisplay(editing.value?.end_date),
    set: (val: string) => {
        if (editing.value) editing.value.end_date = displayToIso(val)
    },
})

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
        company: '',
        role: '',
        description: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: null,
        tech_stack: [],
        sort_order: (experiences.value?.length ?? 0) + 1,
    }
    message.value = ''
}

async function save() {
    if (!editing.value) return
    const payload = {
        company: editing.value.company,
        role: editing.value.role,
        description: editing.value.description || null,
        start_date: editing.value.start_date,
        end_date: editing.value.end_date || null,
        tech_stack: editing.value.tech_stack,
        sort_order: editing.value.sort_order,
    }

    let error
    if (editing.value.id) {
        ({ error } = await client.from('experiences').update(payload).eq('id', editing.value.id))
    } else {
        if (!profileId.value) {
            message.value = 'E: No profile found. Create a profile first.'
            messageClass.value = 'msg-error'
            return
        }
        ({ error } = await client.from('experiences').insert({ ...payload, profile_id: profileId.value }))
    }

    if (error) {
        message.value = `E: ${error.message}`
        messageClass.value = 'msg-error'
    } else {
        message.value = `"${editing.value.company}" written`
        messageClass.value = 'msg-success'
        await refresh()
    }
}

async function deleteItem(row: Record<string, any>) {
    if (!confirm(`Delete "${row.company}"? [y/N]`)) return
    await client.from('experiences').delete().eq('id', row.id)
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

useHead({ title: 'Admin - Experiences' })
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
    flex: 1; font-family: var(--font-mono); font-size: 14px;
    color: var(--fg); background: var(--bg-highlight); border: 1px solid var(--bg-visual);
    padding: 4px 8px; outline: none; caret-color: var(--green);
}
.field-input:focus { border-color: var(--blue); }

.btn-clear {
    font-family: var(--font-mono); font-size: 12px;
    color: var(--yellow); background: transparent; border: 1px solid var(--yellow);
    padding: 2px 8px; cursor: pointer; border-radius: 2px; flex-shrink: 0;
}
.btn-clear:hover { background: var(--yellow); color: var(--bg); }

.actions { display: flex; gap: 12px; align-items: center; }
.btn-save {
    font-family: var(--font-mono); font-size: 13px;
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
