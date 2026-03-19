<template>
    <EditorContent>
        <div class="admin-dashboard">
            <div class="file-comment">-- admin/dashboard</div>
            <div class="file-comment">-- Logged in as {{ user?.email }}</div>
            <div class="blank-line">&nbsp;</div>

            <div class="heading"># Admin Panel</div>
            <div class="blank-line">&nbsp;</div>

            <div class="admin-menu">
                <NuxtLink v-for="item in menuItems" :key="item.route" :to="item.route" class="admin-item">
                    <span class="item-icon">{{ item.icon }}</span>
                    <span class="item-label">{{ item.label }}</span>
                    <span class="item-desc">{{ item.label === 'Messages' ? `${unreadCount} unread` : item.desc }}</span>
                    <span class="item-shortcut">{{ item.shortcut }}</span>
                </NuxtLink>
                <button class="admin-item logout-item" @click="logout">
                    <span class="item-icon">{{ '\u{f0206}' }}</span>
                    <span class="item-label">Logout</span>
                    <span class="item-desc">Sign out</span>
                    <span class="item-shortcut">q</span>
                </button>
            </div>
        </div>
    </EditorContent>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database'

definePageMeta({ middleware: 'auth' })

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const router = useRouter()

const menuItems = [
    { icon: '\u{f0004}', label: 'Profile', desc: 'Edit name, bio, links', route: '/admin/profile', shortcut: 'p' },
    { icon: '\u{f024b}', label: 'Projects', desc: 'Manage portfolio projects', route: '/admin/projects', shortcut: 'j' },
    { icon: '\u{f0219}', label: 'Blog', desc: 'Manage blog posts', route: '/admin/blog', shortcut: 'b' },
    { icon: '\u{f0e6}', label: 'Skills', desc: 'Manage skills & proficiency', route: '/admin/skills', shortcut: 's' },
    { icon: '\u{f0510}', label: 'Experiences', desc: 'Manage work experience', route: '/admin/experiences', shortcut: 'e' },
    { icon: '\u{f01ee}', label: 'Messages', desc: '', route: '/admin/messages', shortcut: 'm' },
]

const { data: unreadCount } = await useAsyncData('admin-unread', async () => {
    const { count } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
    return count ?? 0
})

function onKeydown(e: KeyboardEvent) {
    // Ignore if typing in input or in INSERT/COMMAND mode
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const key = e.key.toLowerCase()

    if (key === 'q') {
        e.preventDefault()
        logout()
        return
    }

    const item = menuItems.find(i => i.shortcut === key)
    if (item) {
        e.preventDefault()
        router.push(item.route)
    }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

async function logout() {
    await client.auth.signOut()
    router.push('/')
}

useHead({ title: 'Admin' })
</script>

<style scoped>
.admin-dashboard {
    padding: 8px 16px;
    line-height: 22px;
}

.file-comment { color: var(--comment); font-style: italic; }
.blank-line { height: 22px; }
.heading { color: var(--blue); font-weight: bold; font-size: 16px; }

.admin-menu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: 500px;
}

.admin-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--fg);
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
}

.admin-item:hover {
    background: var(--bg-highlight);
}

.item-icon {
    color: var(--cyan);
    width: 20px;
    text-align: center;
}

.item-label {
    color: var(--cyan);
    width: 100px;
}

.item-desc {
    color: var(--comment);
    font-size: 13px;
    flex: 1;
}

.item-shortcut {
    color: var(--yellow);
    font-size: 13px;
    margin-left: auto;
}

.logout-item .item-icon,
.logout-item .item-label {
    color: var(--red);
}

.logout-item .item-shortcut {
    color: var(--red);
}
</style>
