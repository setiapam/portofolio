<template>
  <div class="commandline">
    <template v-if="vimMode === 'COMMAND'">
      <span class="command-prefix">:</span>
      <input
        ref="inputRef"
        v-model="input"
        class="command-input"
        spellcheck="false"
        @keydown.enter="executeCommand"
        @keydown.escape="exitCommand"
        @keydown.up="historyPrev"
        @keydown.down="historyNext"
      >
    </template>
    <template v-else>
      <span class="command-message" :class="messageClass">
        {{ commandMessage }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
const { vimMode, commandMessage, setVimMode, setCommandMessage } = useEditorState()

const input = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const history = ref<string[]>([])
const historyIndex = ref(-1)

watch(vimMode, (mode) => {
  if (mode === 'COMMAND') {
    input.value = ''
    historyIndex.value = -1
    nextTick(() => inputRef.value?.focus())
  }
})

function executeCommand() {
  const cmd = input.value.trim()
  if (cmd) {
    history.value.unshift(cmd)
    if (history.value.length > 50) history.value.pop()
  }

  // Basic command handling — will be expanded in Phase 2
  if (cmd === 'q') {
    setCommandMessage("E32: Can't quit, this is a website!")
  } else if (cmd === 'q!') {
    window.location.href = 'https://google.com'
  } else if (cmd.startsWith('e ')) {
    const file = cmd.slice(2).trim().replace('.md', '')
    const route = file === 'dashboard' ? '/' : `/${file}`
    navigateTo(route)
    setCommandMessage('')
  } else if (cmd === 'Neotree toggle') {
    const { toggleSidebar } = useEditorState()
    toggleSidebar()
    setCommandMessage('')
  } else {
    setCommandMessage(`E492: Not an editor command: ${cmd}`)
  }

  setVimMode('NORMAL')
}

function exitCommand() {
  setVimMode('NORMAL')
  setCommandMessage('')
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

const messageClass = computed(() => {
  const msg = commandMessage.value
  if (msg.startsWith('E')) return 'msg-error'
  if (msg.includes('success') || msg.includes('✓')) return 'msg-success'
  return ''
})
</script>

<style scoped>
.commandline {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
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

.command-message {
  color: var(--comment);
}

.msg-error {
  color: var(--red);
}

.msg-success {
  color: var(--green);
}
</style>
