<template>
  <div class="editor-layout font-mono">
    <!-- BufferLine — full width top row -->
    <EditorBufferLine />

    <!-- NeoTree Sidebar -->
    <Transition name="sidebar">
      <EditorNeoTree v-show="state.sidebarOpen" />
    </Transition>

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="state.sidebarOpen && isMobile"
      class="sidebar-overlay"
      @click="toggleSidebar"
    />

    <!-- Main content area -->
    <main class="editor-main">
      <slot />
    </main>

    <!-- StatusLine — full width -->
    <EditorStatusLine />

    <!-- CommandLine — full width bottom -->
    <EditorCommandLine />
  </div>
</template>

<script setup lang="ts">
const { state, toggleSidebar } = useBufferManager()
const { install, uninstall } = useVimMode()

const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  install()

  if (isMobile.value) {
    state.sidebarOpen = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  uninstall()
})
</script>

<style scoped>
.editor-layout {
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  grid-template-columns: auto 1fr;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg);
  color: var(--fg);
}

/* BufferLine spans full width */
.editor-layout > :deep(.bufferline) {
  grid-column: 1 / -1;
}

/* NeoTree is left column */
.editor-layout > :deep(.neotree) {
  grid-row: 2;
  grid-column: 1;
}

/* Main content fills remaining space */
.editor-main {
  grid-row: 2;
  grid-column: 2;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
}

/* StatusLine spans full width */
.editor-layout > :deep(.statusline) {
  grid-column: 1 / -1;
}

/* CommandLine spans full width */
.editor-layout > :deep(.commandline) {
  grid-column: 1 / -1;
}

/* Sidebar transition */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: width 0.15s ease, opacity 0.15s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  width: 0 !important;
  opacity: 0;
}

/* Mobile overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* Mobile: sidebar is overlay */
@media (max-width: 767px) {
  .editor-layout > :deep(.neotree) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 20;
    height: 100vh;
  }

  .editor-main {
    grid-column: 1 / -1;
  }
}
</style>
