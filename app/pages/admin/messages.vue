<template>
    <EditorContent>
        <div class="admin-page">
            <div class="file-comment">-- admin/messages.vue</div>
            <div class="blank-line">&nbsp;</div>

            <div class="heading"># Messages</div>
            <div class="blank-line">&nbsp;</div>

            <div v-if="!messages?.length" class="empty">No messages yet.</div>

            <div v-for="msg in messages" :key="msg.id" class="message-card" :class="{ unread: !msg.read }">
                <div class="msg-header">
                    <span class="msg-from">{{ msg.name }}</span>
                    <span class="msg-email">&lt;{{ msg.email }}&gt;</span>
                    <span class="msg-date">{{ formatDate(msg.created_at) }}</span>
                    <span v-if="!msg.read" class="msg-badge">NEW</span>
                </div>
                <div v-if="msg.subject" class="msg-subject">Subject: {{ msg.subject }}</div>
                <div class="msg-body">{{ msg.message }}</div>
                <div class="msg-actions">
                    <button v-if="!msg.read" class="btn-read" @click="markRead(msg.id)">Mark read</button>
                    <button class="btn-delete" @click="deleteMsg(msg.id)">Delete</button>
                </div>
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

definePageMeta({ middleware: 'auth' })

type Message = Database['public']['Tables']['messages']['Row']
const client = useSupabaseClient<Database>()

const { data: messages, refresh } = await useAsyncData('admin-messages', async () => {
    const { data } = await client.from('messages').select('*').order('created_at', { ascending: false })
    return (data ?? []) as Message[]
})

async function markRead(id: string) {
    await client.from('messages').update({ read: true }).eq('id', id)
    await refresh()
}

async function deleteMsg(id: string) {
    if (!confirm('Delete this message? [y/N]')) return
    await client.from('messages').delete().eq('id', id)
    await refresh()
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

useHead({ title: 'Admin - Messages' })
</script>

<style scoped>
.admin-page { padding: 8px 16px; line-height: 22px; }
.file-comment { color: var(--comment); font-style: italic; }
.blank-line { height: 22px; }
.heading { color: var(--blue); font-weight: bold; font-size: 16px; }
.empty { color: var(--comment); font-style: italic; }

.message-card {
    border: 1px solid var(--bg-highlight);
    padding: 8px 12px;
    margin-bottom: 8px;
}

.message-card.unread {
    border-left: 3px solid var(--cyan);
}

.msg-header {
    display: flex;
    gap: 8px;
    align-items: baseline;
    flex-wrap: wrap;
}

.msg-from { color: var(--cyan); font-weight: bold; }
.msg-email { color: var(--comment); font-size: 12px; }
.msg-date { color: var(--comment); font-size: 12px; margin-left: auto; }
.msg-badge { color: var(--bg); background: var(--yellow); font-size: 10px; padding: 0 4px; border-radius: 2px; }
.msg-subject { color: var(--yellow); font-size: 13px; margin-top: 4px; }
.msg-body { color: var(--fg); margin-top: 4px; white-space: pre-wrap; }

.msg-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.btn-read, .btn-delete {
    font-family: var(--font-mono);
    font-size: 12px;
    background: transparent;
    border: 1px solid;
    padding: 2px 8px;
    cursor: pointer;
    border-radius: 2px;
}

.btn-read { color: var(--green); border-color: var(--green); }
.btn-read:hover { background: var(--green); color: var(--bg); }
.btn-delete { color: var(--red); border-color: var(--red); }
.btn-delete:hover { background: var(--red); color: var(--bg); }
</style>
