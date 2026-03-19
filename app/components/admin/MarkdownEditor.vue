<template>
    <div class="markdown-editor">
        <!-- Split view: editor left, preview right -->
        <div class="editor-pane">
            <div class="pane-header">
                <span class="pane-title">{{ title }} [INSERT]</span>
            </div>
            <textarea
                ref="textareaRef"
                :value="modelValue"
                class="editor-textarea"
                @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
                spellcheck="false"
            ></textarea>
        </div>
        <div class="preview-pane">
            <div class="pane-header">
                <span class="pane-title">Preview</span>
            </div>
            <div class="preview-content markdown-body" v-html="renderedHtml"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    modelValue: string
    title?: string
}>()

defineEmits<{
    'update:modelValue': [value: string]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const { renderMarkdown } = useMarkdown()

const renderedHtml = computed(() => renderMarkdown(props.modelValue))

defineExpose({ textareaRef })
</script>

<style scoped>
.markdown-editor {
    display: flex;
    gap: 1px;
    background: var(--bg-highlight);
    height: 100%;
    min-height: 300px;
}

.editor-pane,
.preview-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    overflow: hidden;
}

.pane-header {
    padding: 4px 12px;
    background: var(--bg-dark);
    border-bottom: 1px solid var(--bg-highlight);
    font-size: 12px;
}

.pane-title {
    color: var(--comment);
}

.editor-textarea {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 22px;
    color: var(--fg);
    background: var(--bg);
    border: none;
    outline: none;
    padding: 8px 12px;
    resize: none;
    caret-color: var(--green);
}

.preview-content {
    flex: 1;
    padding: 8px 12px;
    overflow-y: auto;
    color: var(--fg);
    font-size: 14px;
    line-height: 22px;
}

.preview-content :deep(h1) { color: var(--blue); font-weight: bold; font-size: 16px; margin: 8px 0 4px; }
.preview-content :deep(h2) { color: var(--cyan); font-weight: bold; margin: 8px 0 4px; }
.preview-content :deep(h3) { color: var(--green); font-weight: bold; margin: 8px 0 4px; }
.preview-content :deep(h4) { color: var(--yellow); font-weight: bold; margin: 4px 0; }
.preview-content :deep(code) { color: var(--green); background: var(--bg-highlight); padding: 1px 4px; border-radius: 2px; }
.preview-content :deep(pre) { background: var(--bg-highlight); padding: 12px; border-radius: 4px; overflow-x: auto; margin: 8px 0; }
.preview-content :deep(pre code) { background: none; padding: 0; }
.preview-content :deep(ul) { padding-left: 24px; margin: 4px 0; list-style: disc; }
.preview-content :deep(ol) { padding-left: 24px; margin: 4px 0; list-style: decimal; }
.preview-content :deep(ul ul) { list-style: circle; }
.preview-content :deep(ul ul ul) { list-style: square; }
.preview-content :deep(li) { margin: 2px 0; }
.preview-content :deep(blockquote) { border-left: 3px solid var(--cyan); padding-left: 12px; color: var(--comment); margin: 8px 0; }
.preview-content :deep(a) { color: var(--cyan); text-decoration: none; }
.preview-content :deep(a:hover) { text-decoration: underline; }
.preview-content :deep(hr) { border: none; border-top: 1px solid var(--bg-visual); margin: 12px 0; }
.preview-content :deep(table) { border-collapse: collapse; width: 100%; margin: 8px 0; }
.preview-content :deep(th), .preview-content :deep(td) { border: 1px solid var(--bg-visual); padding: 4px 8px; text-align: left; }
.preview-content :deep(th) { background: var(--bg-highlight); color: var(--cyan); }
.preview-content :deep(strong) { color: var(--yellow); }
.preview-content :deep(em) { color: var(--purple); font-style: italic; }
.preview-content :deep(p) { margin: 4px 0; }

@media (max-width: 767px) {
    .markdown-editor {
        flex-direction: column;
    }
}
</style>
