export function useVimMode() {
  const { vimMode, keyBuffer, pendingKeys, editorState, KEY_TIMEOUT, telescopeOpen } = useSharedState()

  const LINE_HEIGHT = 22

  function setMode(mode: 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND') {
    vimMode.value = mode
  }

  function resetKeyBuffer() {
    keyBuffer.value = { keys: '', timestamp: 0 }
    pendingKeys.value = ''
  }

  function getVisibleLineCount(): number {
    const main = document.querySelector('.content-area')
    if (!main) return 40
    return Math.floor(main.clientHeight / LINE_HEIGHT)
  }

  function moveCursor(delta: number) {
    const maxLine = getVisibleLineCount()
    editorState.cursorLine = Math.max(1, Math.min(maxLine, editorState.cursorLine + delta))
  }

  function moveCursorTo(line: number) {
    const maxLine = getVisibleLineCount()
    editorState.cursorLine = Math.max(1, Math.min(maxLine, line))
  }

  function handleKeydown(e: KeyboardEvent) {
    if (vimMode.value === 'COMMAND') return

    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.preventDefault()
        ;(e.target as HTMLElement).blur()
        setMode('NORMAL')
      }
      return
    }

    // INSERT mode: only Escape exits
    if (vimMode.value === 'INSERT') {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMode('NORMAL')
      }
      return
    }

    // VISUAL mode: only Escape exits
    if (vimMode.value === 'VISUAL') {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMode('NORMAL')
      }
      return
    }

    // ── NORMAL mode ──
    const now = Date.now()
    const elapsed = now - keyBuffer.value.timestamp

    if (elapsed > KEY_TIMEOUT) {
      resetKeyBuffer()
    }

    if (e.ctrlKey) {
      if (e.key === 'b') {
        e.preventDefault()
        editorState.sidebarOpen = !editorState.sidebarOpen
      }
      return
    }

    const currentKeys = keyBuffer.value.keys + e.key
    keyBuffer.value = { keys: currentKeys, timestamp: now }
    pendingKeys.value = currentKeys

    // Multi-key combos
    if (currentKeys === 'gg') {
      e.preventDefault()
      moveCursorTo(1)
      resetKeyBuffer()
      return
    }
    if (currentKeys === 'gt') {
      e.preventDefault()
      switchBufferDirection('next')
      resetKeyBuffer()
      return
    }
    if (currentKeys === 'gT') {
      e.preventDefault()
      switchBufferDirection('prev')
      resetKeyBuffer()
      return
    }
    if (currentKeys === 'g') {
      e.preventDefault()
      return
    }

    resetKeyBuffer()

    switch (e.key) {
      case ':':
        e.preventDefault()
        setMode('COMMAND')
        break
      case 'i':
        e.preventDefault()
        setMode('INSERT')
        break
      case 'v':
        e.preventDefault()
        setMode('VISUAL')
        break
      case 'Escape':
        e.preventDefault()
        setMode('NORMAL')
        break
      case 'j':
        e.preventDefault()
        moveCursor(1)
        break
      case 'k':
        e.preventDefault()
        moveCursor(-1)
        break
      case 'h':
        e.preventDefault()
        editorState.cursorCol = Math.max(1, editorState.cursorCol - 1)
        break
      case 'l':
        e.preventDefault()
        editorState.cursorCol = editorState.cursorCol + 1
        break
      case 'G':
        e.preventDefault()
        moveCursorTo(getVisibleLineCount())
        break
      case '/':
        e.preventDefault()
        if (telescopeOpen.value) telescopeOpen.value()
        break
      case 'Backspace':
        e.preventDefault()
        navigateTo('/')
        break
    }
  }

  function switchBufferDirection(direction: 'next' | 'prev') {
    const buffers = editorState.buffers
    const idx = buffers.findIndex(b => b.id === editorState.activeBufferId)
    if (idx === -1 || buffers.length <= 1) return

    const newIdx = direction === 'next'
      ? (idx + 1) % buffers.length
      : (idx - 1 + buffers.length) % buffers.length

    editorState.activeBufferId = buffers[newIdx].path
    navigateTo(buffers[newIdx].path)
  }

  function install() {
    window.addEventListener('keydown', handleKeydown)
  }

  function uninstall() {
    window.removeEventListener('keydown', handleKeydown)
  }

  return {
    mode: readonly(vimMode),
    pendingKeys: readonly(pendingKeys),
    setMode,
    install,
    uninstall,
  }
}
