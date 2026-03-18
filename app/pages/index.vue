<template>
    <EditorContent>
        <div class="dashboard">
            <!-- ASCII Art Header -->
            <pre class="ascii-header">{{ asciiArt }}</pre>

            <!-- Menu Items -->
            <div class="menu-items">
                <button v-for="(item, index) in menuItems" :key="item.label" class="menu-item"
                    :class="{ active: index === activeIndex }" @click="handleMenuItem(item)"
                    @mouseenter="activeIndex = index">
                    <span class="menu-icon">{{ getMenuIcon(item.icon) }}</span>
                    <span class="menu-label">{{ item.label }}</span>
                    <span class="menu-shortcut">{{ item.shortcut }}</span>
                </button>
            </div>

            <!-- Footer -->
            <div class="dashboard-footer">
                <span class="footer-bolt">&#x26A1;</span> Website loaded in {{ loadTime }}ms
            </div>
            <div class="dashboard-hint">
                Press shortcut key to navigate · <span class="hint-key">/</span> search · <span
                    class="hint-key">?</span> help · <span class="hint-key">:</span> command
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'
const client = useSupabaseClient<Database>()

const startTime = Date.now()
const loadTime = ref(0)
const activeIndex = ref(0)

type Profile = Database['public']['Tables']['profiles']['Row']

// Fetch profile for ASCII art
const { data: profile } = await useAsyncData('profile', async () => {
    const { data } = await client
        .from('profiles')
        .select('ascii_art')
        .limit(1)
        .single()
    return data as Pick<Profile, 'ascii_art'> | null
})

const asciiArt = computed(() => {
    return profile.value?.ascii_art ?? `
                 ▄ ▄  
             ▄   ▄▄▄     ▄ ▄▄▄ ▄ ▄     
             █ ▄ █▄█ ▄▄▄ █ █▄█ █ █     
          ▄▄ █▄█▄▄▄█ █▄█▄█▄▄█▄▄█ █     
        ▄ █▄▄█ ▄ ▄▄ ▄█ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄  
        █▄▄▄▄ ▄▄▄ █ ▄ ▄▄▄ ▄ ▄▄▄ ▄ ▄ █ ▄
      ▄ █ █▄█ █▄█ █ █ █▄█ █ █▄█ ▄▄▄ █ █
      █▄█ ▄ █▄▄█▄▄█ █ ▄▄█ █ ▄ █ █▄█▄█ █
      █▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█ █▄█▄▄▄█
    `.trim()
})

const menuItems = computed(() => {
    return [
        { label: 'About', icon: 'about', shortcut: 'a', route: '/about' },
        { label: 'Projects', icon: 'search', shortcut: 'p', route: '/projects' },
        { label: 'Blog', icon: 'grep', shortcut: 'b', route: '/blog' },
        { label: 'Contact', icon: 'contact', shortcut: 'c', route: '/contact' },
        { label: 'Lazy', icon: 'lazy', shortcut: 'l', action: 'easter_egg' },
        { label: 'Quit', icon: 'logout', shortcut: 'q', action: 'easter_egg' },
    ]
})

const iconMap: Record<string, string> = {
    about: '󰋽',
    search: '󰈞',
    grep: '󰊄',
    contact: '󰇮',
    lazy: '󰒲',
    logout: '󰈆',
}

function getMenuIcon(icon: string): string {
    return iconMap[icon] ?? ''
}

function handleMenuItem(item: { route?: string; action?: string }) {
    if (item.action === 'easter_egg') {
        const { setMessage } = useCommandParser()
        setMessage("E32: Can't quit, this is a website!")
        return
    }
    if (item.route) {
        navigateTo(item.route)
    }
}

const { mode: vimMode } = useVimMode()

function onDashboardKey(e: KeyboardEvent) {
    // Only handle in NORMAL mode, not when typing in input
    if (vimMode.value !== 'NORMAL') return
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    if (e.ctrlKey || e.metaKey || e.altKey) return

    const key = e.key
    const item = menuItems.value.find(m => m.shortcut === key)
    if (item) {
        e.preventDefault()
        e.stopPropagation()
        handleMenuItem(item)
    }
}

onMounted(() => {
    loadTime.value = Date.now() - startTime
    window.addEventListener('keydown', onDashboardKey, true) // capture phase
})

onUnmounted(() => {
    window.removeEventListener('keydown', onDashboardKey, true)
})
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 16px;
    gap: 32px;
}

.ascii-header {
    color: var(--blue);
    font-size: 14px;
    line-height: 1.3;
    text-align: center;
    white-space: pre;
}

.menu-items {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 360px;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 20px;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--cyan);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.05s;
}

.menu-item.active {
    background-color: var(--bg-highlight);
}

.menu-icon {
    width: 20px;
    text-align: center;
    color: var(--cyan);
    font-size: 15px;
}

.menu-label {
    flex: 1;
    color: var(--cyan);
}

.menu-shortcut {
    color: var(--orange);
    font-size: 14px;
}

.dashboard-footer {
    color: var(--comment);
    font-size: 13px;
    text-align: center;
}

.footer-bolt {
    color: var(--yellow);
}

.dashboard-hint {
    color: var(--comment);
    font-size: 12px;
    text-align: center;
}

.hint-key {
    color: var(--orange);
}

@media (max-width: 767px) {
    .dashboard {
        gap: 20px;
        padding: 12px;
        justify-content: start;
        padding-top: 10vh;
    }

    .ascii-header {
        font-size: 10px;
        line-height: 1.2;
    }

    .menu-items {
        min-width: auto;
        width: 100%;
    }

    .menu-item {
        padding: 10px 16px;
        font-size: 14px;
        min-height: 44px;
    }

    .dashboard-footer {
        font-size: 12px;
    }

    .dashboard-hint {
        font-size: 11px;
        display: none;
    }
}
</style>
