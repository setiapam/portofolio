<template>
  <aside class="neotree">
    <div class="neotree-header">
      <span class="neotree-title"> neo-tree</span>
    </div>

    <nav class="neotree-tree">
      <!-- Static root entries -->
      <NeoTreeItem
        icon=""
        label="dashboard"
        path="/"
        :active="route.path === '/'"
      />
      <NeoTreeItem
        icon=""
        label="about.md"
        path="/about"
        :active="route.path === '/about'"
      />

      <!-- Projects folder -->
      <div class="tree-folder">
        <button class="tree-folder-toggle" @click="projectsOpen = !projectsOpen">
          <span class="folder-chevron">{{ projectsOpen ? '' : '' }}</span>
          <span class="folder-icon"></span>
          <span>projects/</span>
        </button>
        <div v-show="projectsOpen" class="tree-children">
          <NeoTreeItem
            v-for="project in projects"
            :key="project.slug"
            icon=""
            :label="`${project.slug}.md`"
            :path="`/projects/${project.slug}`"
            :active="route.path === `/projects/${project.slug}`"
            indent
          />
          <div v-if="projects.length === 0" class="tree-empty">
            (empty)
          </div>
        </div>
      </div>

      <!-- Blog folder -->
      <div class="tree-folder">
        <button class="tree-folder-toggle" @click="blogOpen = !blogOpen">
          <span class="folder-chevron">{{ blogOpen ? '' : '' }}</span>
          <span class="folder-icon"></span>
          <span>blog/</span>
        </button>
        <div v-show="blogOpen" class="tree-children">
          <NeoTreeItem
            v-for="post in blogPosts"
            :key="post.slug"
            icon=""
            :label="`${post.slug}.md`"
            :path="`/blog/${post.slug}`"
            :active="route.path === `/blog/${post.slug}`"
            indent
          />
          <div v-if="blogPosts.length === 0" class="tree-empty">
            (empty)
          </div>
        </div>
      </div>

      <NeoTreeItem
        icon=""
        label="contact.md"
        path="/contact"
        :active="route.path === '/contact'"
      />
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()
const client = useSupabaseClient()

const projectsOpen = ref(true)
const blogOpen = ref(false)

const { data: projects } = await useAsyncData('neotree-projects', async () => {
  const { data } = await client
    .from('projects')
    .select('slug, title')
    .eq('status', 'published')
    .order('sort_order')
  return data ?? []
})

const { data: blogPosts } = await useAsyncData('neotree-blog', async () => {
  const { data } = await client
    .from('blog_posts')
    .select('slug, title')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  return data ?? []
})
</script>

<style scoped>
.neotree {
  width: 220px;
  min-width: 220px;
  background-color: var(--bg-dark);
  border-right: 1px solid var(--bg-highlight);
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 13px;
}

.neotree-header {
  padding: 8px 12px;
  color: var(--comment);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--bg-highlight);
}

.neotree-tree {
  padding: 4px 0;
}

.tree-folder-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  padding: 3px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--fg);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
}

.tree-folder-toggle:hover {
  background-color: var(--bg-highlight);
}

.folder-chevron {
  width: 14px;
  font-size: 10px;
  color: var(--comment);
}

.folder-icon {
  color: var(--blue);
}

.tree-children {
  margin-left: 0;
}

.tree-empty {
  padding: 2px 12px 2px 40px;
  color: var(--comment);
  font-style: italic;
  font-size: 12px;
}
</style>
