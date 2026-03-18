<template>
    <EditorContent>
        <div class="contact-page">
            <div class="file-comment">-- contact.md</div>
            <div class="file-comment">-- Terminal-style contact form</div>
            <div class="blank-line">&nbsp;</div>

            <div class="heading"># Contact</div>
            <div class="blank-line">&nbsp;</div>

            <!-- Terminal prompt lines -->
            <div class="terminal-lines">
                <!-- Completed prompts -->
                <div v-for="(line, i) in completedLines" :key="i" class="prompt-line">
                    <span class="prompt">$ </span>
                    <span class="prompt-label">{{ line.label }}: </span>
                    <span class="prompt-value">{{ line.value }}</span>
                </div>

                <!-- Current prompt -->
                <div v-if="currentStep < steps.length && !submitted" class="prompt-line current">
                    <span class="prompt">$ </span>
                    <span class="prompt-label">{{ steps[currentStep]?.label }}: </span>
                    <input
                        ref="inputRef"
                        v-model="currentInput"
                        class="prompt-input"
                        :type="steps[currentStep]?.type ?? 'text'"
                        :placeholder="steps[currentStep]?.placeholder"
                        @keydown.enter="submitStep"
                        @keydown.escape="handleEscape"
                    />
                </div>

                <!-- Message textarea (special step) -->
                <div v-if="currentStep === steps.length && !submitted" class="prompt-line current">
                    <span class="prompt">$ </span>
                    <span class="prompt-label">Message:</span>
                    <div class="message-input-wrapper">
                        <span class="message-prefix">&gt; </span>
                        <textarea
                            ref="textareaRef"
                            v-model="messageInput"
                            class="message-input"
                            rows="4"
                            placeholder="Type your message... (Enter to send)"
                            @keydown.ctrl.enter="submitMessage"
                            @keydown.escape="handleEscape"
                        ></textarea>
                    </div>
                    <div class="message-hint">Press Ctrl+Enter to send</div>
                </div>

                <!-- Sending state -->
                <div v-if="sending" class="prompt-line">
                    <span class="prompt">$ </span>
                    <span class="sending-text">Sending message...</span>
                </div>

                <!-- Success -->
                <div v-if="submitted && !error" class="prompt-line">
                    <span class="prompt">$ </span>
                    <span class="success-text">Message sent successfully!</span>
                </div>
                <div v-if="submitted && !error" class="prompt-line">
                    <span class="prompt">$ </span>
                    <span class="success-hint">Thank you! I'll get back to you soon.</span>
                </div>

                <!-- Error -->
                <div v-if="error" class="prompt-line">
                    <span class="prompt">$ </span>
                    <span class="error-text">{{ error }}</span>
                </div>

                <!-- Validation error -->
                <div v-if="validationError" class="prompt-line">
                    <span class="error-text">{{ validationError }}</span>
                </div>

                <!-- Reset option after submit -->
                <div v-if="submitted" class="prompt-line">
                    <span class="prompt">$ </span>
                    <button class="reset-btn" @click="resetForm">Send another message</button>
                </div>
            </div>

            <ContentNavHint />
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
const { setMode } = useVimMode()

const steps = [
    { label: 'Enter your name', key: 'name', type: 'text', placeholder: 'John Doe' },
    { label: 'Enter your email', key: 'email', type: 'email', placeholder: 'john@example.com' },
    { label: 'Subject (optional)', key: 'subject', type: 'text', placeholder: 'Hello!' },
]

const currentStep = ref(0)
const currentInput = ref('')
const messageInput = ref('')
const validationError = ref('')
const sending = ref(false)
const submitted = ref(false)
const error = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const formData = reactive({
    name: '',
    email: '',
    subject: '',
    message: '',
})

const completedLines = ref<Array<{ label: string; value: string }>>([])

function submitStep() {
    validationError.value = ''
    const step = steps[currentStep.value]
    if (!step) return
    const value = currentInput.value.trim()

    // Validate required fields
    if (step.key === 'name' && !value) {
        validationError.value = 'E474: Name is required'
        return
    }
    if (step.key === 'email') {
        if (!value) {
            validationError.value = 'E474: Email is required'
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            validationError.value = 'E474: Invalid email address'
            return
        }
    }

    // Save value
    formData[step.key as keyof typeof formData] = value
    completedLines.value.push({ label: step.label, value: value || '(empty)' })
    currentInput.value = ''
    currentStep.value++

    // Focus next input
    nextTick(() => {
        if (currentStep.value < steps.length) {
            inputRef.value?.focus()
        } else {
            textareaRef.value?.focus()
        }
    })
}

async function submitMessage() {
    validationError.value = ''
    const message = messageInput.value.trim()

    if (!message) {
        validationError.value = 'E474: Message is required'
        return
    }

    formData.message = message
    completedLines.value.push({ label: 'Message', value: message })
    sending.value = true

    try {
        const res = await $fetch('/api/contact', {
            method: 'POST',
            body: {
                name: formData.name,
                email: formData.email,
                subject: formData.subject || null,
                message: formData.message,
            },
        })
        submitted.value = true
    } catch (e: any) {
        error.value = `E500: ${e.data?.message ?? 'Failed to send message'}`
    } finally {
        sending.value = false
    }
}

function resetForm() {
    currentStep.value = 0
    currentInput.value = ''
    messageInput.value = ''
    validationError.value = ''
    sending.value = false
    submitted.value = false
    error.value = ''
    formData.name = ''
    formData.email = ''
    formData.subject = ''
    formData.message = ''
    completedLines.value = []
    nextTick(() => inputRef.value?.focus())
}

function handleEscape() {
    setMode('NORMAL')
    inputRef.value?.blur()
    textareaRef.value?.blur()
}

// Auto-focus and set INSERT mode when entering the page
onMounted(() => {
    nextTick(() => {
        setMode('INSERT')
        inputRef.value?.focus()
    })
})

useHead({ title: 'Contact' })
</script>

<style scoped>
.contact-page {
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

.terminal-lines {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.prompt-line {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0;
}

.prompt {
    color: var(--green);
    flex-shrink: 0;
}

.prompt-label {
    color: var(--cyan);
    flex-shrink: 0;
}

.prompt-value {
    color: var(--fg);
}

.prompt-input {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--fg);
    background: transparent;
    border: none;
    outline: none;
    flex: 1;
    min-width: 200px;
    caret-color: var(--green);
}

.prompt-input::placeholder {
    color: var(--comment);
}

.message-input-wrapper {
    display: flex;
    align-items: flex-start;
    width: 100%;
    margin-top: 4px;
}

.message-prefix {
    color: var(--green);
    flex-shrink: 0;
    padding-top: 2px;
}

.message-input {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--fg);
    background: var(--bg-highlight);
    border: 1px solid var(--bg-visual);
    outline: none;
    flex: 1;
    min-width: 200px;
    padding: 4px 8px;
    resize: vertical;
    line-height: 22px;
    caret-color: var(--green);
}

.message-input::placeholder {
    color: var(--comment);
}

.message-hint {
    color: var(--comment);
    font-size: 12px;
    margin-top: 2px;
    width: 100%;
}

.sending-text {
    color: var(--yellow);
}

.success-text {
    color: var(--green);
}

.success-hint {
    color: var(--fg);
}

.error-text {
    color: var(--red);
}

.reset-btn {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--cyan);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
}

.reset-btn:hover {
    color: var(--blue);
}
</style>
