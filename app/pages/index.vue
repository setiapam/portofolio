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

            <!-- Lazy plugin manager overlay -->
            <Transition name="lazy-fade">
                <div v-if="showLazy" class="lazy-overlay" @click.self="showLazy = false; lazyPlugins = []">
                <div class="lazy-panel">
                    <div class="lazy-header">
                        <span class="lazy-title">lazy.nvim</span>
                        <span class="lazy-close" @click="showLazy = false">x</span>
                    </div>
                    <div class="lazy-list">
                        <div v-for="(plugin, i) in lazyPlugins" :key="i" class="lazy-row">
                            <span class="lazy-check">&#x2713;</span>
                            <span class="lazy-name">{{ plugin }}</span>
                        </div>
                    </div>
                    <div class="lazy-footer">
                        Total: {{ lazyPlugins.length }} plugins &middot; All loaded
                    </div>
                </div>
                </div>
            </Transition>

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
        { label: 'Lazy', icon: 'lazy', shortcut: 'l', action: 'lazy' },
        { label: 'Quit', icon: 'logout', shortcut: 'q', action: 'quit' },
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

const lazyPlugins = ref<string[]>([])
const showLazy = ref(false)

function handleMenuItem(item: { route?: string; action?: string }) {
    const { setMessage } = useCommandParser()
    if (item.action === 'quit') {
        setMessage("E32: Can't quit, this is a website!")
        return
    }
    if (item.action === 'lazy') {
        showLazy.value = !showLazy.value
        if (showLazy.value) {
            lazyPlugins.value = [
                'nuxt.lua              4.4.2    Loaded',
                'vue.lua               3.5.30   Loaded',
                'supabase.lua          2.0.4    Loaded',
                'tailwindcss.lua       6.14.0   Loaded',
                'shiki.lua             4.0.2    Loaded',
                'marked.lua            17.0.4   Loaded',
                'google-fonts.lua      3.2.0    Loaded',
                'typescript.lua        strict   Loaded',
                'vim-mode.lua          1.0.0    Loaded',
                'telescope.lua         1.0.0    Loaded',
                'neo-tree.lua          1.0.0    Loaded',
                'bufferline.lua        1.0.0    Loaded',
                'solarized-osaka.lua   1.0.0    Loaded',
            ]
            setMessage(`Total: ${lazyPlugins.value.length} plugins loaded`)
        } else {
            lazyPlugins.value = []
            setMessage('')
        }
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

    if (e.key === 'Escape' && showLazy.value) {
        e.preventDefault()
        e.stopPropagation()
        showLazy.value = false
        lazyPlugins.value = []
        return
    }

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

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string

useHead({ title: 'Dimas Setia Pambudi - Software Developer' })
useSeoMeta({
    description: 'Portfolio website of Dimas Setia Pambudi — Software Developer. Built as an interactive Neovim simulator with Vim keybindings, buffer management, and terminal commands.',
    ogTitle: 'Dimas Setia Pambudi - Software Developer',
    ogDescription: 'Interactive Neovim-themed portfolio. Navigate with Vim keybindings, explore projects, read blog posts, and more.',
    ogUrl: siteUrl,
    ogType: 'website',
    ogImage: `${siteUrl}/og-image.png`,
    twitterCard: 'summary_large_image',
    twitterTitle: 'Dimas Setia Pambudi - Software Developer',
    twitterDescription: 'Interactive Neovim-themed portfolio. Navigate with Vim keybindings, explore projects, read blog posts, and more.',
    twitterImage: `${siteUrl}/og-image.png`,
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

.lazy-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.lazy-panel {
    width: 520px;
    max-width: 90vw;
    max-height: 70vh;
    background: var(--bg-dark);
    border: 1px solid var(--bg-visual);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.lazy-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid var(--bg-visual);
}

.lazy-title {
    color: var(--blue);
    font-weight: bold;
    font-size: 14px;
}

.lazy-close {
    color: var(--comment);
    cursor: pointer;
    font-size: 14px;
}

.lazy-close:hover {
    color: var(--red);
}

.lazy-list {
    padding: 8px 0;
    overflow-y: auto;
    flex: 1;
}

.lazy-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 16px;
    font-size: 13px;
}

.lazy-row:hover {
    background: var(--bg-highlight);
}

.lazy-check {
    color: var(--green);
    flex-shrink: 0;
}

.lazy-name {
    color: var(--fg);
    font-family: var(--font-mono);
    white-space: pre;
}

.lazy-footer {
    padding: 6px 16px;
    border-top: 1px solid var(--bg-visual);
    color: var(--comment);
    font-size: 12px;
    text-align: center;
}

.lazy-fade-enter-active,
.lazy-fade-leave-active {
    transition: opacity 0.15s ease;
}

.lazy-fade-enter-from,
.lazy-fade-leave-to {
    opacity: 0;
}
</style>
