<template>
    <EditorContent>
        <div class="admin-page">
            <div class="file-comment">-- admin/profile.vue [INSERT]</div>
            <div class="blank-line">&nbsp;</div>

            <div v-if="profile" class="form-fields">
                <div class="field">
                    <label class="field-label">name:</label>
                    <input v-model="profile.name" class="field-input" />
                </div>
                <div class="field">
                    <label class="field-label">title:</label>
                    <input v-model="profile.title" class="field-input" />
                </div>
                <div class="field">
                    <label class="field-label">email:</label>
                    <input v-model="profile.email" class="field-input" type="email" />
                </div>
                <div class="field">
                    <label class="field-label">location:</label>
                    <input v-model="profile.location" class="field-input" />
                </div>
                <div class="field">
                    <label class="field-label">github_url:</label>
                    <input v-model="profile.github_url" class="field-input" />
                </div>
                <div class="field">
                    <label class="field-label">linkedin_url:</label>
                    <input v-model="profile.linkedin_url" class="field-input" />
                </div>
                <div class="field">
                    <label class="field-label">resume_url:</label>
                    <input v-model="profile.resume_url" class="field-input" />
                </div>
                <div class="blank-line">&nbsp;</div>
                <div class="field-label">bio:</div>
                <AdminMarkdownEditor v-model="profile.bio" title="bio" />
                <div class="blank-line">&nbsp;</div>
                <div class="field-label">ascii_art:</div>
                <textarea v-model="profile.ascii_art" class="ascii-textarea" rows="10"></textarea>

                <div class="blank-line">&nbsp;</div>
                <div class="actions">
                    <button class="btn-save" @click="save">:w Save</button>
                    <span v-if="message" :class="messageClass">{{ message }}</span>
                </div>
            </div>
            <div v-else class="loading">Loading...</div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

definePageMeta({ middleware: 'auth' })

type Profile = Database['public']['Tables']['profiles']['Row']
const client = useSupabaseClient<Database>()
const message = ref('')
const messageClass = ref('')

const { data: profileData } = await useAsyncData('admin-profile', async () => {
    const { data } = await client.from('profiles').select('*').limit(1).single()
    return data as Profile | null
})

const profile = ref<Record<string, any>>({})
watchEffect(() => {
    if (profileData.value) {
        profile.value = { ...profileData.value }
    }
})

async function save() {
    const { error } = await client
        .from('profiles')
        .update({
            name: profile.value.name,
            title: profile.value.title,
            bio: profile.value.bio,
            email: profile.value.email,
            location: profile.value.location,
            github_url: profile.value.github_url,
            linkedin_url: profile.value.linkedin_url,
            resume_url: profile.value.resume_url,
            ascii_art: profile.value.ascii_art,
            updated_at: new Date().toISOString(),
        })
        .eq('id', profile.value.id)

    if (error) {
        message.value = `E: ${error.message}`
        messageClass.value = 'msg-error'
    } else {
        message.value = '"profile" written'
        messageClass.value = 'msg-success'
    }
}

// Ctrl+S to save
function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
    }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

useHead({ title: 'Admin - Profile' })
</script>

<style scoped>
.admin-page { padding: 8px 16px; line-height: 22px; }
.file-comment { color: var(--comment); font-style: italic; }
.blank-line { height: 22px; }

.form-fields { max-width: 800px; }

.field {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
}

.field-label {
    color: var(--cyan);
    min-width: 120px;
    flex-shrink: 0;
    font-size: 13px;
}

.field-input {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: var(--fg);
    background: var(--bg-highlight);
    border: 1px solid var(--bg-visual);
    padding: 4px 8px;
    outline: none;
    caret-color: var(--green);
}

.field-input:focus { border-color: var(--blue); }

.ascii-textarea {
    width: 100%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    line-height: 1.3;
    color: var(--cyan);
    background: var(--bg-highlight);
    border: 1px solid var(--bg-visual);
    padding: 8px;
    outline: none;
    resize: vertical;
    caret-color: var(--green);
}

.actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.btn-save {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: var(--bg);
    background: var(--green);
    border: none;
    padding: 4px 16px;
    cursor: pointer;
    border-radius: 2px;
}

.btn-save:hover { opacity: 0.9; }

.msg-success { color: var(--green); font-size: 13px; }
.msg-error { color: var(--red); font-size: 13px; }
.loading { color: var(--comment); }
</style>
