<template>
  <div class="editor-content">
    <!-- Line numbers gutter -->
    <div v-if="state.lineNumbers" class="line-gutter">
      <div
        v-for="n in lineCount"
        :key="n"
        class="line-number"
        :class="{ 'current-line': n === currentLine }"
      >
        {{ n }}
      </div>
    </div>

    <!-- Content area -->
    <div ref="contentRef" class="content-area" @scroll="onScroll">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const { state } = useEditorState()

const contentRef = ref<HTMLElement | null>(null)
const lineCount = ref(40)
const currentLine = ref(1)

function onScroll() {
  if (!contentRef.value) return
  const lineHeight = 22
  currentLine.value = Math.floor(contentRef.value.scrollTop / lineHeight) + 1
}

onMounted(() => {
  if (contentRef.value) {
    const lineHeight = 22
    lineCount.value = Math.max(40, Math.ceil(contentRef.value.scrollHeight / lineHeight))
  }
})
</script>

<style scoped>
.editor-content {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.line-gutter {
  flex-shrink: 0;
  width: 48px;
  padding: 8px 8px 8px 0;
  text-align: right;
  background-color: var(--bg);
  color: var(--fg-gutter);
  font-size: 13px;
  line-height: 22px;
  user-select: none;
  overflow: hidden;
}

.line-number {
  padding-right: 8px;
}

.line-number.current-line {
  color: var(--fg);
}

.content-area {
  flex: 1;
  padding: 8px 16px;
  overflow-y: auto;
  line-height: 22px;
  font-size: 14px;
}
</style>
