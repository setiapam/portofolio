import { marked } from 'marked'

// Configure marked for terminal/neovim aesthetic
marked.setOptions({
    breaks: true,
    gfm: true,
})

export function useMarkdown() {
    function renderMarkdown(text: string | null | undefined): string {
        if (!text) return ''
        return marked.parse(text, { async: false }) as string
    }

    return { renderMarkdown }
}
