<template>
    <Teleport to="body">
        <div v-if="isOpen" class="help-overlay" @click.self="close">
            <div class="help-window">
                <div class="help-header">
                    <span class="help-icon"></span>
                    <span class="help-title">Keybindings</span>
                    <span class="help-hint">Esc to close</span>
                </div>

                <div class="help-content">
                    <div class="help-section">
                        <div class="section-title">Navigation</div>
                        <div class="kb-row"><span class="kb-key">j / k</span><span class="kb-desc">Scroll down / up</span></div>
                        <div class="kb-row"><span class="kb-key">h / l</span><span class="kb-desc">Cursor left / right</span></div>
                        <div class="kb-row"><span class="kb-key">gg</span><span class="kb-desc">Go to top</span></div>
                        <div class="kb-row"><span class="kb-key">G</span><span class="kb-desc">Go to bottom</span></div>
                        <div class="kb-row"><span class="kb-key">gt / gT</span><span class="kb-desc">Next / previous tab</span></div>
                        <div class="kb-row"><span class="kb-key">Backspace</span><span class="kb-desc">Go to dashboard</span></div>
                    </div>

                    <div class="help-section">
                        <div class="section-title">Buffers</div>
                        <div class="kb-row"><span class="kb-key">x</span><span class="kb-desc">Close current tab</span></div>
                        <div class="kb-row"><span class="kb-key">Ctrl+b</span><span class="kb-desc">Toggle sidebar</span></div>
                    </div>

                    <div class="help-section">
                        <div class="section-title">Modes</div>
                        <div class="kb-row"><span class="kb-key">i</span><span class="kb-desc">Enter INSERT mode</span></div>
                        <div class="kb-row"><span class="kb-key">v</span><span class="kb-desc">Enter VISUAL mode</span></div>
                        <div class="kb-row"><span class="kb-key">:</span><span class="kb-desc">Enter COMMAND mode</span></div>
                        <div class="kb-row"><span class="kb-key">Esc</span><span class="kb-desc">Return to NORMAL mode</span></div>
                    </div>

                    <div class="help-section">
                        <div class="section-title">Search & Help</div>
                        <div class="kb-row"><span class="kb-key">/</span><span class="kb-desc">Open Telescope search</span></div>
                        <div class="kb-row"><span class="kb-key">?</span><span class="kb-desc">Open this help</span></div>
                    </div>

                    <div class="help-section">
                        <div class="section-title">Commands</div>
                        <div class="kb-row"><span class="kb-key">:e [file]</span><span class="kb-desc">Open file</span></div>
                        <div class="kb-row"><span class="kb-key">:q</span><span class="kb-desc">Quit (easter egg)</span></div>
                        <div class="kb-row"><span class="kb-key">:w</span><span class="kb-desc">Save (admin)</span></div>
                        <div class="kb-row"><span class="kb-key">:Telescope</span><span class="kb-desc">Open search</span></div>
                        <div class="kb-row"><span class="kb-key">:Neotree toggle</span><span class="kb-desc">Toggle sidebar</span></div>
                        <div class="kb-row"><span class="kb-key">:colorscheme [name]</span><span class="kb-desc">Switch theme</span></div>
                        <div class="kb-row"><span class="kb-key">:terminal</span><span class="kb-desc">Open terminal</span></div>
                        <div class="kb-row"><span class="kb-key">:help</span><span class="kb-desc">Quick help</span></div>
                        <div class="kb-row"><span class="kb-key">:login / :logout</span><span class="kb-desc">Auth</span></div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
const isOpen = ref(false)

function open() {
    isOpen.value = true
}

function close() {
    isOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
    if (isOpen.value && e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        close()
    }
}

onMounted(() => window.addEventListener('keydown', onKeydown, true))
onUnmounted(() => window.removeEventListener('keydown', onKeydown, true))

defineExpose({ open, close, isOpen })
</script>

<style scoped>
.help-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    z-index: 100;
}

.help-window {
    width: 500px;
    max-width: 90%;
    max-height: 75vh;
    background: var(--bg);
    border: 1px solid var(--bg-highlight);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.help-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--bg-highlight);
    font-size: 12px;
}

.help-icon {
    color: var(--yellow);
}

.help-title {
    color: var(--yellow);
    font-weight: bold;
}

.help-hint {
    color: var(--comment);
    margin-left: auto;
    font-size: 11px;
}

.help-content {
    overflow-y: auto;
    padding: 8px 0;
}

.help-section {
    padding: 4px 12px;
}

.section-title {
    color: var(--cyan);
    font-weight: bold;
    font-size: 13px;
    padding: 4px 0 2px;
}

.kb-row {
    display: flex;
    align-items: baseline;
    padding: 1px 0;
    font-size: 13px;
}

.kb-key {
    color: var(--orange);
    min-width: 180px;
    flex-shrink: 0;
}

.kb-desc {
    color: var(--fg);
}
</style>
