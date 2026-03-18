const THEMES = ['solarized-osaka', 'catppuccin-mocha', 'gruvbox-dark', 'tokyo-night'] as const
type Theme = (typeof THEMES)[number]

const currentTheme = ref<Theme>('solarized-osaka')

export function useTheme() {
  function setTheme(name: string) {
    const theme = THEMES.find(t => t === name)
    if (!theme) return false
    currentTheme.value = theme
    document.documentElement.setAttribute('data-theme', theme === 'solarized-osaka' ? '' : theme)
    localStorage.setItem('theme', theme)
    return true
  }

  function initTheme() {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved && THEMES.includes(saved)) {
      setTheme(saved)
    }
  }

  function getThemes(): readonly string[] {
    return THEMES
  }

  return {
    theme: readonly(currentTheme),
    themes: THEMES,
    setTheme,
    initTheme,
    getThemes,
  }
}
