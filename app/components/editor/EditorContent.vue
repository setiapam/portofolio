<template>
    <div class="editor-content">
        <!-- Line numbers gutter -->
        <div v-if="state.lineNumbers" class="line-gutter" ref="gutterRef">
            <div v-for="n in lineCount" :key="n" class="line-number"
                :class="{ 'current-line': n === state.cursorLine }">
                {{ n }}
            </div>
        </div>

        <!-- Content area -->
        <div ref="contentRef" class="content-area" @scroll="syncGutter">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const { state } = useBufferManager()

const contentRef = ref<HTMLElement | null>(null)
const gutterRef = ref<HTMLElement | null>(null)
const lineCount = ref(40)

const LINE_HEIGHT = 22

function syncGutter() {
    if (gutterRef.value && contentRef.value) {
        gutterRef.value.scrollTop = contentRef.value.scrollTop
    }
}

function updateLineCount() {
    if (contentRef.value) {
        lineCount.value = Math.max(40, Math.floor(contentRef.value.clientHeight / LINE_HEIGHT))
    }
}

onMounted(() => {
    updateLineCount()
    const observer = new ResizeObserver(updateLineCount)
    if (contentRef.value) observer.observe(contentRef.value)
    onUnmounted(() => observer.disconnect())
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
    background-color: var(--bg-highlight);
}

.content-area {
    flex: 1;
    overflow-y: auto;
    line-height: 22px;
    font-size: 14px;
}
</style>
