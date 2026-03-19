interface CommandDef {
  name: string
  aliases: string[]
  description: string
  execute: (args: string) => void
}

export function useCommandParser() {
  const { commandMessage, commandHistory, editorState, telescopeOpen, helpOpen } = useSharedState()
  const router = useRouter()

  const commands: CommandDef[] = [
    {
      name: 'edit',
      aliases: ['e'],
      description: 'Open a file/buffer',
      execute: (args) => {
        const file = args.trim().replace(/\.md$/, '')
        if (!file) {
          setMessage('E32: No file name')
          return
        }
        const route = file === 'dashboard' ? '/' : `/${file}`
        router.push(route)
        setMessage('')
      },
    },
    {
      name: 'quit',
      aliases: ['q'],
      description: 'Quit (easter egg)',
      execute: () => {
        setMessage("E32: Can't quit, this is a website!")
      },
    },
    {
      name: 'quit!',
      aliases: ['q!'],
      description: 'Force quit',
      execute: () => {
        window.location.href = 'https://google.com'
      },
    },
    {
      name: 'write',
      aliases: ['w'],
      description: 'Save (admin only)',
      execute: () => {
        if (router.currentRoute.value.path.startsWith('/admin')) {
          // Trigger Ctrl+S programmatically to save
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))
          return
        }
        setMessage('E45: No write since last change (not in admin mode)')
      },
    },
    {
      name: 'wq',
      aliases: ['wq', 'x'],
      description: 'Save and quit',
      execute: () => {
        if (router.currentRoute.value.path.startsWith('/admin')) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true }))
          setTimeout(() => router.push('/admin'), 300)
          return
        }
        setMessage("E32: Can't quit, this is a website!")
      },
    },
    {
      name: 'admin',
      aliases: ['admin'],
      description: 'Navigate to admin section',
      execute: (args) => {
        const section = args.trim()
        const routes: Record<string, string> = {
          '': '/admin',
          projects: '/admin/projects',
          blog: '/admin/blog',
          profile: '/admin/profile',
          skills: '/admin/skills',
          experiences: '/admin/experiences',
          messages: '/admin/messages',
        }
        const target = routes[section]
        if (target) {
          router.push(target)
          setMessage('')
        } else {
          setMessage(`E492: Unknown admin section: ${section}`)
        }
      },
    },
    {
      name: 'Neotree toggle',
      aliases: ['Neotree'],
      description: 'Toggle file explorer sidebar',
      execute: () => {
        editorState.sidebarOpen = !editorState.sidebarOpen
        setMessage('')
      },
    },
    {
      name: 'Telescope',
      aliases: ['Telescope'],
      description: 'Open fuzzy finder',
      execute: () => {
        if (telescopeOpen.value) {
          telescopeOpen.value()
          setMessage('')
        } else {
          setMessage('[Telescope] Not available')
        }
      },
    },
    {
      name: 'set',
      aliases: ['set'],
      description: 'Set editor options',
      execute: (args) => {
        const parts = args.trim().split(/\s+/)
        if (parts[0] === 'number' || parts[0] === 'nu') {
          editorState.lineNumbers = !editorState.lineNumbers
          setMessage(editorState.lineNumbers ? 'number' : 'nonumber')
        } else if (parts[0] === 'theme' && parts[1]) {
          const { setTheme, themes } = useTheme()
          if (setTheme(parts[1])) {
            setMessage(`colorscheme ${parts[1]}`)
          } else {
            setMessage(`E185: Cannot find colorscheme '${parts[1]}'. Available: ${themes.join(', ')}`)
          }
        } else {
          setMessage(`E518: Unknown option: ${parts[0]}`)
        }
      },
    },
    {
      name: 'colorscheme',
      aliases: ['colorscheme'],
      description: 'Switch color scheme',
      execute: (args) => {
        const theme = args.trim()
        if (!theme) {
          const { theme: current } = useTheme()
          setMessage(current.value)
          return
        }
        const { setTheme, themes } = useTheme()
        if (setTheme(theme)) {
          setMessage(`colorscheme ${theme}`)
        } else {
          setMessage(`E185: Cannot find colorscheme '${theme}'. Available: ${themes.join(', ')}`)
        }
      },
    },
    {
      name: 'help',
      aliases: ['h'],
      description: 'Show help / keybindings',
      execute: () => {
        if (helpOpen.value) {
          helpOpen.value()
          setMessage('')
        } else {
          setMessage('hjkl=scroll  gg/G=top/bottom  :=command  i=insert  /=search  ?=help')
        }
      },
    },
    {
      name: 'terminal',
      aliases: ['term'],
      description: 'Open interactive terminal',
      execute: () => {
        router.push('/terminal')
        setMessage('')
      },
    },
    {
      name: 'Lazy',
      aliases: ['Lazy'],
      description: 'Show plugin/tech stack list',
      execute: () => {
        setMessage('[Lazy] Not yet implemented')
      },
    },
    {
      name: 'login',
      aliases: ['login'],
      description: 'Navigate to admin login',
      execute: () => {
        router.push('/admin/login')
        setMessage('')
      },
    },
    {
      name: 'logout',
      aliases: ['logout'],
      description: 'Sign out',
      execute: async () => {
        const client = useSupabaseClient()
        await client.auth.signOut()
        router.push('/')
        setMessage('Logged out')
      },
    },
  ]

  function setMessage(msg: string) {
    commandMessage.value = msg
  }

  function parse(input: string) {
    const trimmed = input.trim()
    if (!trimmed) return

    // Add to history
    commandHistory.value.unshift(trimmed)
    if (commandHistory.value.length > 50) commandHistory.value.pop()

    // Try exact full command match first (e.g. "Neotree toggle")
    for (const cmd of commands) {
      if (trimmed === cmd.name) {
        cmd.execute('')
        return
      }
    }

    // Split into command name and args
    const spaceIdx = trimmed.indexOf(' ')
    const cmdName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)
    const args = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1)

    const matched = commands.find(
      c => c.name === cmdName || c.aliases.includes(cmdName),
    )

    if (matched) {
      matched.execute(args)
    } else {
      setMessage(`E492: Not an editor command: ${trimmed}`)
    }
  }

  function getCompletions(input: string): string[] {
    if (!input) return commands.map(c => c.name)

    const lower = input.toLowerCase()
    const matches: string[] = []

    for (const cmd of commands) {
      if (cmd.name.toLowerCase().startsWith(lower)) {
        matches.push(cmd.name)
      }
      for (const alias of cmd.aliases) {
        if (alias.toLowerCase().startsWith(lower) && !matches.includes(alias)) {
          matches.push(alias)
        }
      }
    }

    return matches.slice(0, 8)
  }

  return {
    parse,
    getCompletions,
    history: readonly(commandHistory),
    message: readonly(commandMessage),
    setMessage,
  }
}
