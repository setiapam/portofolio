export function useBufferManager() {
  const { editorState } = useSharedState()
  const route = useRoute()
  const router = useRouter()

  function openBuffer(path: string) {
    const existing = editorState.buffers.find(b => b.path === path)
    if (!existing) {
      editorState.buffers.push(getBufferFromRoute(path))
    }
    editorState.activeBufferId = path
    if (route.path !== path) {
      router.push(path)
    }
  }

  function closeBuffer(id: string) {
    const idx = editorState.buffers.findIndex(b => b.id === id)
    if (idx === -1) return

    editorState.buffers.splice(idx, 1)

    if (editorState.activeBufferId === id) {
      const next = editorState.buffers[Math.min(idx, editorState.buffers.length - 1)]
      if (next) {
        openBuffer(next.path)
      } else {
        editorState.activeBufferId = null
        router.push('/')
      }
    }
  }

  function switchBuffer(direction: 'next' | 'prev') {
    const idx = editorState.buffers.findIndex(b => b.id === editorState.activeBufferId)
    if (idx === -1) return

    const newIdx = direction === 'next'
      ? (idx + 1) % editorState.buffers.length
      : (idx - 1 + editorState.buffers.length) % editorState.buffers.length

    openBuffer(editorState.buffers[newIdx].path)
  }

  function toggleSidebar() {
    editorState.sidebarOpen = !editorState.sidebarOpen
  }

  // Sync route changes to buffers
  watch(() => route.path, (path) => {
    const existing = editorState.buffers.find(b => b.path === path)
    if (!existing) {
      editorState.buffers.push(getBufferFromRoute(path))
    }
    editorState.activeBufferId = path
  }, { immediate: true })

  return {
    state: editorState,
    openBuffer,
    closeBuffer,
    switchBuffer,
    toggleSidebar,
  }
}
