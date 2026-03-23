<template>
    <EditorContent>
        <div class="admin-page">
            <div class="file-comment">-- admin/messages.md</div>
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
                    <span v-if="msg.replied_at" class="msg-badge replied">REPLIED</span>
                </div>
                <div v-if="msg.subject" class="msg-subject">Subject: {{ msg.subject }}</div>
                <div class="msg-body">{{ msg.message }}</div>
                <div class="msg-actions">
                    <button v-if="!msg.read" class="btn-read" @click="markRead(msg.id)">Mark read</button>
                    <button class="btn-reply" @click="openReply(msg)">Reply</button>
                    <button class="btn-delete" @click="deleteMsg(msg.id)">Delete</button>
                </div>

                <!-- Reply form -->
                <div v-if="replyingTo === msg.id" class="reply-form">
                    <div class="reply-header">
                        <span class="reply-prompt">-- Replying to {{ msg.name }} &lt;{{ msg.email }}&gt;</span>
                    </div>
                    <textarea
                        ref="replyTextarea"
                        v-model="replyBody"
                        class="reply-input"
                        rows="6"
                        placeholder="Type your reply..."
                        @keydown.ctrl.enter="sendReply(msg.id)"
                        @keydown.meta.enter="sendReply(msg.id)"
                    />
                    <div class="reply-actions">
                        <span class="reply-hint">Ctrl+Enter to send</span>
                        <button class="btn-cancel" @click="closeReply">:q!</button>
                        <button class="btn-send" :disabled="replySending" @click="sendReply(msg.id)">
                            {{ replySending ? 'Sending...' : ':w send' }}
                        </button>
                    </div>
                    <div v-if="replyError" class="reply-error">E474: {{ replyError }}</div>
                    <div v-if="replySuccess" class="reply-success">Message sent successfully!</div>
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

const replyingTo = ref<string | null>(null)
const replyBody = ref('')
const replySending = ref(false)
const replyError = ref('')
const replySuccess = ref(false)
const replyTextarea = ref<HTMLTextAreaElement[]>()

function openReply(msg: Message) {
    if (replyingTo.value === msg.id) {
        closeReply()
        return
    }
    replyingTo.value = msg.id
    replyBody.value = ''
    replyError.value = ''
    replySuccess.value = false
    nextTick(() => {
        replyTextarea.value?.[0]?.focus()
    })
}

function closeReply() {
    replyingTo.value = null
    replyBody.value = ''
    replyError.value = ''
    replySuccess.value = false
}

async function sendReply(messageId: string) {
    if (!replyBody.value.trim()) {
        replyError.value = 'Reply body cannot be empty'
        return
    }

    replySending.value = true
    replyError.value = ''
    replySuccess.value = false

    try {
        const session = useSupabaseSession()
        const res = await $fetch('/api/reply', {
            method: 'POST',
            body: {
                messageId,
                replyBody: replyBody.value,
            },
            headers: {
                Authorization: `Bearer ${session.value?.access_token}`,
            },
        })

        if (res.success) {
            replySuccess.value = true
            setTimeout(() => {
                closeReply()
                refresh()
            }, 1500)
        }
    }
    catch (err: unknown) {
        const error = err as { data?: { message?: string } }
        replyError.value = error.data?.message || 'Failed to send reply'
    }
    finally {
        replySending.value = false
    }
}

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
    const d = new Date(dateStr)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hour}:${minute}`
}

useHead({ title: 'Admin - Messages' })
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

.heading {
    color: var(--blue);
    font-weight: bold;
    font-size: 16px;
}

.empty {
    color: var(--comment);
    font-style: italic;
}

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

.msg-from {
    color: var(--cyan);
    font-weight: bold;
}

.msg-email {
    color: var(--comment);
    font-size: 12px;
}

.msg-date {
    color: var(--comment);
    font-size: 12px;
    margin-left: auto;
}

.msg-badge {
    color: var(--bg);
    background: var(--yellow);
    font-size: 10px;
    padding: 0 4px;
    border-radius: 2px;
}

.msg-badge.replied {
    background: var(--green);
}

.msg-subject {
    color: var(--yellow);
    font-size: 13px;
    margin-top: 4px;
}

.msg-body {
    color: var(--fg);
    margin-top: 4px;
    white-space: pre-wrap;
}

.msg-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.btn-read,
.btn-delete,
.btn-reply,
.btn-cancel,
.btn-send {
    font-family: var(--font-mono);
    font-size: 12px;
    background: transparent;
    border: 1px solid;
    padding: 2px 8px;
    cursor: pointer;
    border-radius: 2px;
}

.btn-read {
    color: var(--green);
    border-color: var(--green);
}

.btn-read:hover {
    background: var(--green);
    color: var(--bg);
}

.btn-reply {
    color: var(--blue);
    border-color: var(--blue);
}

.btn-reply:hover {
    background: var(--blue);
    color: var(--bg);
}

.btn-delete {
    color: var(--red);
    border-color: var(--red);
}

.btn-delete:hover {
    background: var(--red);
    color: var(--bg);
}

/* Reply form */
.reply-form {
    margin-top: 12px;
    border-top: 1px solid var(--bg-highlight);
    padding-top: 12px;
}

.reply-header {
    margin-bottom: 8px;
}

.reply-prompt {
    color: var(--comment);
    font-style: italic;
    font-size: 12px;
}

.reply-input {
    width: 100%;
    background: var(--bg-dark);
    color: var(--fg);
    border: 1px solid var(--bg-highlight);
    padding: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.5;
    resize: vertical;
    box-sizing: border-box;
}

.reply-input:focus {
    outline: none;
    border-color: var(--blue);
}

.reply-input::placeholder {
    color: var(--comment);
}

.reply-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    align-items: center;
}

.reply-hint {
    color: var(--comment);
    font-size: 11px;
    margin-right: auto;
}

.btn-cancel {
    color: var(--orange);
    border-color: var(--orange);
}

.btn-cancel:hover {
    background: var(--orange);
    color: var(--bg);
}

.btn-send {
    color: var(--green);
    border-color: var(--green);
}

.btn-send:hover {
    background: var(--green);
    color: var(--bg);
}

.btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.reply-error {
    color: var(--red);
    font-size: 12px;
    margin-top: 8px;
}

.reply-success {
    color: var(--green);
    font-size: 12px;
    margin-top: 8px;
}
</style>
