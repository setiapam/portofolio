<template>
  <div class="bufferline">
    <div class="bufferline-tabs">
      <button
        v-for="buffer in state.buffers"
        :key="buffer.id"
        class="buffer-tab"
        :class="{ active: buffer.id === state.activeBufferId }"
        @click="openBuffer(buffer.path)"
        @mousedown.middle.prevent="closeBuffer(buffer.id)"
      >
        <span class="buffer-icon">{{ buffer.icon }}</span>
        <span class="buffer-name">{{ buffer.name }}</span>
        <span
          class="buffer-close"
          @click.stop="closeBuffer(buffer.id)"
        >&times;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { state, openBuffer, closeBuffer } = useEditorState()
</script>

<style scoped>
.bufferline {
  background-color: var(--bg-dark);
  border-bottom: 1px solid var(--bg-highlight);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.bufferline::-webkit-scrollbar {
  display: none;
}

.bufferline-tabs {
  display: flex;
  min-width: max-content;
}

.buffer-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--comment);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.1s, border-color 0.1s;
}

.buffer-tab:hover {
  color: var(--fg);
}

.buffer-tab.active {
  color: var(--fg);
  border-bottom-color: var(--blue);
}

.buffer-icon {
  font-size: 14px;
}

.buffer-close {
  opacity: 0;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  border-radius: 2px;
  transition: opacity 0.1s;
}

.buffer-tab:hover .buffer-close {
  opacity: 0.6;
}

.buffer-close:hover {
  opacity: 1 !important;
  background-color: var(--bg-highlight);
}
</style>
