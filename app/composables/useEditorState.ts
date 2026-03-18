import type { Buffer, EditorState } from '~/types/editor'
import type { VimMode, KeySequence } from '~/types/vim'

// ── Shared reactive state (module-level singletons) ──
const editorState = reactive<EditorState>({
  buffers: [],
  activeBufferId: null,
  sidebarOpen: true,
  lineNumbers: true,
  cursorLine: 1,
  cursorCol: 1,
})

const vimMode = ref<VimMode>('NORMAL')
const keyBuffer = ref<KeySequence>({ keys: '', timestamp: 0 })
const pendingKeys = ref('')
const commandMessage = ref('')
const commandHistory = ref<string[]>([])

const KEY_TIMEOUT = 500

// ── Export shared refs for all composables ──
export function useSharedState() {
  return {
    editorState,
    vimMode,
    keyBuffer,
    pendingKeys,
    commandMessage,
    commandHistory,
    KEY_TIMEOUT,
  }
}

// ── Convenience wrapper (backward compat) ──
export function useEditorState() {
  const { openBuffer, closeBuffer, switchBuffer, toggleSidebar, state } = useBufferManager()
  const { mode, pendingKeys: pk, setMode } = useVimMode()
  const { message, setMessage } = useCommandParser()

  return {
    state,
    vimMode: mode,
    commandMessage: message,
    pendingKeys: pk,
    setVimMode: setMode,
    setCommandMessage: setMessage,
    openBuffer,
    closeBuffer,
    switchBuffer,
    toggleSidebar,
  }
}

// ── Buffer helpers (used by useBufferManager) ──
export function getBufferFromRoute(path: string): Buffer {
  const segments = path.split('/').filter(Boolean)
  const name = segments.length === 0 ? 'dashboard' : segments.join('/')
  const iconMap: Record<string, string> = {
    about: '',
    projects: '',
    blog: '',
    contact: '',
    admin: '',
  }
  const icon = iconMap[segments[0] ?? ''] ?? ''

  return {
    id: path,
    name: name === 'dashboard' ? 'dashboard' : `${name}.md`,
    path,
    icon,
    modified: false,
  }
}
