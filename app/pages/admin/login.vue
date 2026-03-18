<template>
    <EditorContent>
        <div class="login-page" @click="focusInput">
            <!-- Terminal output history -->
            <div v-for="(line, i) in lines" :key="i" class="terminal-line">
                <pre :class="line.color ?? ''">{{ line.text }}</pre>
            </div>

            <!-- Current prompt -->
            <div v-if="!authenticated" class="prompt-line">
                <span class="prompt">{{ currentPrompt }}</span>
                <input
                    ref="inputRef"
                    v-model="currentInput"
                    class="login-input"
                    :type="step === 'password' ? 'password' : 'text'"
                    @keydown.enter="submitStep"
                    @keydown.escape="handleEscape"
                    spellcheck="false"
                    autocomplete="off"
                />
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
const { setMode } = useVimMode()
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

interface TermLine {
    text: string
    color?: string
}

const lines = ref<TermLine[]>([
    { text: '$ ssh admin@portfolio', color: 'green' },
    { text: 'Connecting to portfolio...', color: 'comment' },
    { text: '' },
])
const step = ref<'email' | 'password'>('email')
const email = ref('')
const currentInput = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const authenticated = ref(false)

const currentPrompt = computed(() => {
    return step.value === 'email' ? 'login: ' : 'password: '
})

async function submitStep() {
    const value = currentInput.value.trim()
    if (!value) return

    if (step.value === 'email') {
        email.value = value
        lines.value.push({ text: `login: ${value}` })
        currentInput.value = ''
        step.value = 'password'
        nextTick(() => inputRef.value?.focus())
    } else {
        lines.value.push({ text: 'password: ********' })
        lines.value.push({ text: 'Authenticating...', color: 'comment' })

        const { error } = await client.auth.signInWithPassword({
            email: email.value,
            password: value,
        })

        if (error) {
            lines.value.push({ text: `Authentication failed: ${error.message}`, color: 'error' })
            lines.value.push({ text: '' })
            currentInput.value = ''
            step.value = 'email'
            email.value = ''
            nextTick(() => inputRef.value?.focus())
        } else {
            lines.value.push({ text: 'Authentication successful!', color: 'success' })
            lines.value.push({ text: 'Redirecting to admin panel...', color: 'comment' })
            authenticated.value = true
            setTimeout(() => router.push('/admin'), 500)
        }
    }
}

function handleEscape() {
    setMode('NORMAL')
    inputRef.value?.blur()
}

function focusInput() {
    inputRef.value?.focus()
}

// Redirect if already logged in
watch(user, (u) => {
    if (u) router.push('/admin')
}, { immediate: true })

onMounted(() => {
    setMode('INSERT')
    nextTick(() => inputRef.value?.focus())
})

useHead({ title: 'Admin Login' })
</script>

<style scoped>
.login-page {
    padding: 8px 16px;
    line-height: 22px;
    min-height: 100%;
    cursor: text;
}

.terminal-line pre {
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: var(--fg);
}

.terminal-line pre.green {
    color: var(--green);
}

.terminal-line pre.comment {
    color: var(--comment);
}

.terminal-line pre.error {
    color: var(--red);
}

.terminal-line pre.success {
    color: var(--green);
}

.prompt-line {
    display: flex;
    align-items: baseline;
}

.prompt {
    color: var(--cyan);
    flex-shrink: 0;
}

.login-input {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: var(--fg);
    background: transparent;
    border: none;
    outline: none;
    caret-color: var(--green);
}
</style>
