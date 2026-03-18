export type VimMode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND'

export interface KeySequence {
  keys: string
  timestamp: number
}
