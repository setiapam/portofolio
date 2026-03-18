<template>
    <EditorContent>
        <div class="terminal-page" @click="focusInput">
            <!-- Terminal output history -->
            <div v-for="(entry, i) in history" :key="i" class="terminal-entry">
                <div v-if="entry.type === 'input'" class="terminal-input-line">
                    <span class="prompt-user">visitor</span><span class="prompt-at">@</span><span class="prompt-host">portfolio</span><span class="prompt-colon">:</span><span class="prompt-path">~{{ entry.cwd }}</span><span class="prompt-dollar">$ </span>
                    <span class="input-text">{{ entry.text }}</span>
                </div>
                <pre v-else class="terminal-output" :class="entry.color ?? ''">{{ entry.text }}</pre>
            </div>

            <!-- Current input line -->
            <div class="terminal-input-line current">
                <span class="prompt-user">visitor</span><span class="prompt-at">@</span><span class="prompt-host">portfolio</span><span class="prompt-colon">:</span><span class="prompt-path">~{{ currentPath }}</span><span class="prompt-dollar">$ </span>
                <input
                    ref="inputRef"
                    v-model="currentInput"
                    class="terminal-input"
                    @keydown.enter="executeCommand"
                    @keydown.up.prevent="historyUp"
                    @keydown.down.prevent="historyDown"
                    @keydown.tab.prevent="tabComplete"
                    spellcheck="false"
                    autocomplete="off"
                />
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

interface TerminalEntry {
    type: 'input' | 'output'
    text: string
    cwd?: string
    color?: string
}

const client = useSupabaseClient<Database>()
const router = useRouter()
const route = useRoute()
const { setMode } = useVimMode()

type Profile = Database['public']['Tables']['profiles']['Row']
const { data: profile } = await useAsyncData('terminal-profile', async () => {
    const { data } = await client.from('profiles').select('name, title, email, github_url, location').limit(1).single()
    return data as Pick<Profile, 'name' | 'title' | 'email' | 'github_url' | 'location'> | null
})

const history = ref<TerminalEntry[]>([])
const currentInput = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const currentPath = computed(() => route.path)
const cmdHistory = ref<string[]>([])
const cmdHistoryIndex = ref(-1)

const AVAILABLE_COMMANDS = ['whoami', 'ls', 'cat', 'pwd', 'neofetch', 'help', 'hire-me', 'clear', 'exit', 'cd', 'sudo']

const neofetchArt = `
        .-/+oossssoo+/-.          visitor@portfolio
    \`:+ssssssssssssssssss+:\`      -----------------
  -+ssssssssssssssssssyyssss+-    OS: Nuxt 4.4
.ossssssssssssssssss  dMMs osss.  Host: Vercel
+sssssssssssssss  hMMMMMNh ssss+  Kernel: Vue 3.5
ossss ssssssss  hNMMMd+  sssso   Shell: TypeScript
ossss  sssssss  hNMMM+   sssso   Terminal: Solarized Osaka
+ssss  +ssssss  hMMMo  +sssss+   Packages: Supabase, Tailwind
\`ossss  sssssss  hMM+  osssso\`    CPU: JetBrains Mono
 +sssss  sssssss  o  +sssss+     Memory: ∞
  \`+sssss  sssssss  +sssss+\`     Uptime: since 2024
    \`+ssss  sssss  +ssss+\`
       \`+s  sss  +s+\`
          \`+   +\`
`.trimStart()

function pushOutput(text: string, color?: string) {
    history.value.push({ type: 'output', text, color })
}

function pushInput(text: string) {
    history.value.push({ type: 'input', text, cwd: currentPath.value })
}

const commands: Record<string, (args: string) => void> = {
    whoami: () => {
        const name = profile.value?.name ?? 'visitor'
        const title = profile.value?.title ?? 'Developer'
        pushOutput(`${name} — ${title}`)
    },
    ls: () => {
        pushOutput('dashboard    about.md    projects/    blog/    contact.md    terminal', 'ls-output')
    },
    cat: (args) => {
        const file = args.trim().replace(/\.md$/, '')
        if (!file) {
            pushOutput('cat: missing operand', 'error')
            return
        }
        const pages: Record<string, string> = {
            'about': `# ${profile.value?.name ?? 'Developer'}\n${profile.value?.title ?? 'Software Engineer'}`,
            'contact': '# Contact\nUse :e contact.md or visit /contact to send a message.',
        }
        if (pages[file]) {
            pushOutput(pages[file])
        } else {
            pushOutput(`cat: ${file}.md: No such file or directory`, 'error')
        }
    },
    pwd: () => {
        pushOutput(currentPath.value)
    },
    neofetch: () => {
        pushOutput(neofetchArt, 'neofetch')
    },
    help: () => {
        pushOutput([
            'Available commands:',
            '  whoami      — display user info',
            '  ls          — list files (pages)',
            '  cat [file]  — preview file content',
            '  pwd         — print current path',
            '  neofetch    — system info',
            '  hire-me     — contact info',
            '  cd [dir]    — navigate to page',
            '  clear       — clear terminal',
            '  exit        — close terminal',
            '  help        — show this help',
        ].join('\n'))
    },
    'hire-me': () => {
        const lines = ['📧 Let\'s connect!']
        if (profile.value?.email) lines.push(`  Email:    ${profile.value.email}`)
        if (profile.value?.github_url) lines.push(`  GitHub:   ${profile.value.github_url}`)
        if (profile.value?.location) lines.push(`  Location: ${profile.value.location}`)
        lines.push('', '  Or visit /contact to send a message.')
        pushOutput(lines.join('\n'), 'hire-me')
    },
    cd: (args) => {
        const dir = args.trim().replace(/\/$/, '')
        if (!dir || dir === '~') {
            router.push('/')
            return
        }
        const routes: Record<string, string> = {
            'about': '/about',
            'projects': '/projects',
            'blog': '/blog',
            'contact': '/contact',
            '..': '/',
        }
        const target = routes[dir]
        if (target) {
            router.push(target)
        } else {
            pushOutput(`cd: ${dir}: No such directory`, 'error')
        }
    },
    clear: () => {
        history.value = []
    },
    exit: () => {
        router.push('/')
    },
    sudo: (args) => {
        if (args.trim() === 'rm -rf /') {
            pushOutput('🔥 Deleting everything...', 'error')
            setTimeout(() => pushOutput('Just kidding. This is a website. 😄'), 800)
        } else {
            pushOutput(`sudo: ${args.trim()}: command not found`, 'error')
        }
    },
}

function executeCommand() {
    const input = currentInput.value.trim()
    pushInput(input)
    currentInput.value = ''

    if (!input) return

    cmdHistory.value.unshift(input)
    cmdHistoryIndex.value = -1

    const spaceIdx = input.indexOf(' ')
    const cmd = spaceIdx === -1 ? input : input.slice(0, spaceIdx)
    const args = spaceIdx === -1 ? '' : input.slice(spaceIdx + 1)

    if (commands[cmd]) {
        commands[cmd](args)
    } else {
        pushOutput(`${cmd}: command not found. Type 'help' for available commands.`, 'error')
    }

    nextTick(() => {
        const el = inputRef.value?.closest('.terminal-page')
        if (el) el.scrollTop = el.scrollHeight
    })
}

function historyUp() {
    if (cmdHistoryIndex.value < cmdHistory.value.length - 1) {
        cmdHistoryIndex.value++
        currentInput.value = cmdHistory.value[cmdHistoryIndex.value]
    }
}

function historyDown() {
    if (cmdHistoryIndex.value > 0) {
        cmdHistoryIndex.value--
        currentInput.value = cmdHistory.value[cmdHistoryIndex.value]
    } else {
        cmdHistoryIndex.value = -1
        currentInput.value = ''
    }
}

function tabComplete() {
    const input = currentInput.value.trim()
    if (!input) return
    const matches = AVAILABLE_COMMANDS.filter(c => c.startsWith(input))
    if (matches.length === 1) {
        currentInput.value = matches[0] + ' '
    } else if (matches.length > 1) {
        pushInput(input)
        pushOutput(matches.join('  '))
    }
}

function focusInput() {
    inputRef.value?.focus()
}

onMounted(() => {
    setMode('INSERT')
    pushOutput('Welcome to the portfolio terminal. Type \'help\' for available commands.\n')
    nextTick(() => inputRef.value?.focus())
})

useHead({ title: 'Terminal' })
</script>

<style scoped>
.terminal-page {
    padding: 8px 16px;
    line-height: 22px;
    min-height: 100%;
    cursor: text;
}

.terminal-entry {
    white-space: pre-wrap;
    word-break: break-word;
}

.terminal-input-line {
    display: flex;
    align-items: baseline;
    flex-wrap: nowrap;
}

.prompt-user {
    color: var(--green);
}

.prompt-at {
    color: var(--fg);
}

.prompt-host {
    color: var(--cyan);
}

.prompt-colon {
    color: var(--fg);
}

.prompt-path {
    color: var(--blue);
}

.prompt-dollar {
    color: var(--fg);
}

.input-text {
    color: var(--fg);
}

.terminal-output {
    color: var(--fg);
    margin: 0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
}

.terminal-output.error {
    color: var(--red);
}

.terminal-output.neofetch {
    color: var(--cyan);
}

.terminal-output.ls-output {
    color: var(--blue);
}

.terminal-output.hire-me {
    color: var(--yellow);
}

.terminal-input {
    flex: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: var(--fg);
    background: transparent;
    border: none;
    outline: none;
    caret-color: var(--green);
    min-width: 0;
}
</style>
