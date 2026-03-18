<template>
  <NuxtLink
    :to="path"
    class="tree-item"
    :class="{ active, indent }"
  >
    <span class="item-icon">{{ icon }}</span>
    <span class="item-label">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  path: string
  active: boolean
  indent?: boolean
}>()
</script>

<style scoped>
.tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  color: var(--fg-dark);
  text-decoration: none;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.1s;
}

.tree-item.indent {
  padding-left: 36px;
}

.tree-item:hover {
  background-color: var(--bg-highlight);
  color: var(--fg);
}

.tree-item.active {
  background-color: var(--bg-visual);
  color: var(--fg);
}

.item-icon {
  width: 16px;
  text-align: center;
  font-size: 14px;
}
</style>
