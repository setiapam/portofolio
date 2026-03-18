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
            <div class="preview-content" v-html="renderedHtml"></div>
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

const renderedHtml = computed(() => {
    return (props.modelValue ?? '')
        .replace(/^### (.*$)/gm, '<h3 style="color:var(--green);font-weight:bold">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 style="color:var(--cyan);font-weight:bold">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 style="color:var(--blue);font-weight:bold;font-size:16px">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code style="color:var(--green);background:var(--bg-highlight);padding:1px 4px;border-radius:2px">$1</code>')
        .replace(/^\- (.*$)/gm, '<div style="padding-left:16px">• $1</div>')
        .replace(/\n\n/g, '<div style="height:22px"></div>')
        .replace(/\n/g, '<br>')
})

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
    font-family: 'JetBrains Mono', monospace;
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

@media (max-width: 767px) {
    .markdown-editor {
        flex-direction: column;
    }
}
</style>
