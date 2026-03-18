<template>
  <div class="mobile-toolbar">
    <button class="toolbar-btn" @click="$emit('toggle-sidebar')" title="NeoTree">
      <svg class="toolbar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 3h7v18H3z"/><path d="M14 3h7v8h-7z"/><path d="M14 15h7v6h-7z"/>
      </svg>
    </button>
    <button class="toolbar-btn" @click="$emit('open-telescope')" title="Search">
      <svg class="toolbar-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    </button>
    <button class="toolbar-btn" @click="$emit('open-command')" title="Command">
      <span class="toolbar-icon">:</span>
    </button>
    <button class="toolbar-btn" @click="$emit('open-help')" title="Help">
      <span class="toolbar-icon">?</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'toggle-sidebar': []
  'open-telescope': []
  'open-command': []
  'open-help': []
}>()
</script>

<style scoped>
.mobile-toolbar {
  display: none;
}

@media (max-width: 767px) {
  .mobile-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 6px 12px;
    background-color: var(--bg-highlight);
    border-top: 1px solid var(--bg-visual);
    grid-column: 1 / -1;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 36px;
    background: transparent;
    border: 1px solid var(--bg-visual);
    border-radius: 4px;
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.1s, color 0.1s;
  }

  .toolbar-btn:active {
    background-color: var(--blue);
    color: var(--bg-dark);
  }

  .toolbar-icon {
    font-size: 15px;
    line-height: 1;
  }

  .toolbar-svg {
    width: 18px;
    height: 18px;
  }
}
</style>
