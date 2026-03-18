<template>
    <EditorContent>
        <div class="admin-dashboard">
            <div class="file-comment">-- admin/dashboard</div>
            <div class="file-comment">-- Logged in as {{ user?.email }}</div>
            <div class="blank-line">&nbsp;</div>

            <div class="heading"># Admin Panel</div>
            <div class="blank-line">&nbsp;</div>

            <div class="admin-menu">
                <NuxtLink to="/admin/profile" class="admin-item">
                    <span class="item-icon"></span>
                    <span class="item-label">Profile</span>
                    <span class="item-desc">Edit name, bio, links</span>
                </NuxtLink>
                <NuxtLink to="/admin/projects" class="admin-item">
                    <span class="item-icon"></span>
                    <span class="item-label">Projects</span>
                    <span class="item-desc">Manage portfolio projects</span>
                </NuxtLink>
                <NuxtLink to="/admin/blog" class="admin-item">
                    <span class="item-icon"></span>
                    <span class="item-label">Blog</span>
                    <span class="item-desc">Manage blog posts</span>
                </NuxtLink>
                <NuxtLink to="/admin/messages" class="admin-item">
                    <span class="item-icon"></span>
                    <span class="item-label">Messages</span>
                    <span class="item-desc">{{ unreadCount }} unread</span>
                </NuxtLink>
                <button class="admin-item logout-item" @click="logout">
                    <span class="item-icon">󰈆</span>
                    <span class="item-label">Logout</span>
                    <span class="item-desc">Sign out</span>
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

const { data: unreadCount } = await useAsyncData('admin-unread', async () => {
    const { count } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
    return count ?? 0
})

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
}

.logout-item .item-icon,
.logout-item .item-label {
    color: var(--red);
}
</style>
