<template>
    <div class="commandline">
        <template v-if="vimMode === 'COMMAND'">
            <!-- Autocomplete dropdown -->
            <div v-if="completions.length > 0 && input.length > 0" class="autocomplete">
                <button v-for="(item, idx) in completions" :key="item" class="autocomplete-item"
                    :class="{ active: idx === completionIndex }" @mousedown.prevent="selectCompletion(item)">
                    {{ item }}
                </button>
            </div>

            <span class="command-prefix">:</span>
            <input ref="inputRef" v-model="input" class="command-input" spellcheck="false"
                @keydown.enter="executeCommand" @keydown.escape="exitCommand" @keydown.up="historyPrev"
                @keydown.down="historyNext" @keydown.tab.prevent="tabComplete">
        </template>
        <template v-else>
            <div class="command-default">
                <span class="command-message" :class="messageClass">
                    {{ commandMessage }}
                </span>
                <!-- Show pending keys on the right side (like Neovim) -->
                <span v-if="pendingKeys" class="pending-keys">{{ pendingKeys }}</span>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
const { mode: vimMode, pendingKeys, setMode } = useVimMode()
const { parse, getCompletions, history, message: commandMessage, setMessage } = useCommandParser()

const input = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const historyIndex = ref(-1)
const completionIndex = ref(-1)

const completions = computed(() => getCompletions(input.value))

watch(vimMode, (mode) => {
    if (mode === 'COMMAND') {
        input.value = ''
        historyIndex.value = -1
        completionIndex.value = -1
        nextTick(() => inputRef.value?.focus())
    }
})

function executeCommand() {
    parse(input.value)
    setMode('NORMAL')
}

function exitCommand() {
    setMode('NORMAL')
    setMessage('')
}

function historyPrev() {
    if (historyIndex.value < history.value.length - 1) {
        historyIndex.value++
        input.value = history.value[historyIndex.value]
    }
}

function historyNext() {
    if (historyIndex.value > 0) {
        historyIndex.value--
        input.value = history.value[historyIndex.value]
    } else {
        historyIndex.value = -1
        input.value = ''
    }
}

function tabComplete() {
    const list = completions.value
    if (list.length === 0) return

    if (list.length === 1) {
        input.value = list[0]
        return
    }

    completionIndex.value = (completionIndex.value + 1) % list.length
    input.value = list[completionIndex.value]
}

function selectCompletion(item: string) {
    input.value = item
    inputRef.value?.focus()
}

const messageClass = computed(() => {
    const msg = commandMessage.value
    if (msg.startsWith('E')) return 'msg-error'
    if (msg.includes('success') || msg.includes('✓')) return 'msg-success'
    return ''
})
</script>

<style scoped>
.commandline {
    position: relative;
    display: flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 13px;
    font-family: var(--font-mono);
    background-color: var(--bg);
    min-height: 24px;
}

.command-prefix {
    color: var(--fg);
    margin-right: 2px;
}

.command-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--fg);
    font-family: inherit;
    font-size: inherit;
    caret-color: var(--fg);
}

.command-default {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.command-message {
    color: var(--comment);
}

.msg-error {
    color: var(--red);
}

.msg-success {
    color: var(--green);
}

.pending-keys {
    color: var(--fg);
    font-weight: 600;
}

/* Autocomplete dropdown */
.autocomplete {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background-color: var(--bg-dark);
    border: 1px solid var(--bg-highlight);
    border-bottom: none;
    z-index: 50;
}

.autocomplete-item {
    display: block;
    width: 100%;
    padding: 3px 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--fg);
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
}

.autocomplete-item:hover,
.autocomplete-item.active {
    background-color: var(--bg-highlight);
    color: var(--cyan);
}
</style>
