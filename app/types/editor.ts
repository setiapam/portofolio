export interface Buffer {
  id: string
  name: string
  path: string
  icon: string
  modified: boolean
}

export interface EditorState {
  buffers: Buffer[]
  activeBufferId: string | null
  sidebarOpen: boolean
  lineNumbers: boolean
  cursorLine: number
  cursorCol: number
}
