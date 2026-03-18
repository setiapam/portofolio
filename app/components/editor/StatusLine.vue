<template>
  <div class="statusline">
    <!-- Left: mode badge -->
    <div class="statusline-left">
      <span class="mode-badge" :class="modeClass">
        {{ vimMode }}
      </span>
    </div>

    <!-- Center: branch + encoding -->
    <div class="statusline-center">
      <span class="branch"> main</span>
      <span class="encoding">utf-8</span>
    </div>

    <!-- Right: position + filetype -->
    <div class="statusline-right">
      <span class="position">{{ line }}:{{ col }}</span>
      <span class="filetype">markdown</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { mode: vimMode } = useVimMode()
const { state } = useBufferManager()

const line = computed(() => state.cursorLine)
const col = computed(() => state.cursorCol)

const modeClass = computed(() => {
  const map: Record<string, string> = {
    NORMAL: 'mode-normal',
    INSERT: 'mode-insert',
    VISUAL: 'mode-visual',
    COMMAND: 'mode-command',
  }
  return map[vimMode.value] ?? 'mode-normal'
})
</script>

<style scoped>
.statusline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 8px;
  font-size: 12px;
  background-color: var(--bg-dark);
  border-top: 1px solid var(--bg-highlight);
  color: var(--comment);
}

.statusline-left,
.statusline-center,
.statusline-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-badge {
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 2px;
}

.mode-normal {
  background-color: var(--blue);
  color: var(--bg-dark);
}

.mode-insert {
  background-color: var(--green);
  color: var(--bg-dark);
}

.mode-visual {
  background-color: var(--purple);
  color: var(--bg-dark);
}

.mode-command {
  background-color: var(--orange);
  color: var(--bg-dark);
}

/* Mobile: only show mode + position */
@media (max-width: 767px) {
  .statusline {
    padding: 4px 8px;
  }

  .statusline-center {
    display: none;
  }

  .filetype {
    display: none;
  }
}
</style>
