<template>
    <div class="data-table">
        <div class="table-header">
            <span class="table-title">{{ title }}</span>
            <button class="btn-new" @click="$emit('create')">+ New</button>
        </div>
        <div class="table-body">
            <div v-if="rows.length === 0" class="table-empty">(empty)</div>
            <div
                v-for="(row, i) in rows"
                :key="row.id"
                class="table-row"
                :class="{ selected: selectedId === row.id }"
                @click="$emit('select', row)"
            >
                <span class="row-index">{{ i + 1 }}</span>
                <span class="row-label">{{ row[labelField] }}</span>
                <span v-if="statusField && row[statusField]" class="row-status" :class="row[statusField]">
                    {{ row[statusField] }}
                </span>
                <span class="row-date">{{ formatDate(row[dateField]) }}</span>
                <button class="row-delete" @click.stop="$emit('delete', row)" title="Delete">×</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string
    rows: Array<Record<string, any>>
    labelField: string
    statusField?: string
    dateField: string
    selectedId?: string
}>()

defineEmits<{
    create: []
    select: [row: Record<string, any>]
    delete: [row: Record<string, any>]
}>()

function formatDate(val: any): string {
    if (!val) return ''
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}
</script>

<style scoped>
.data-table {
    border: 1px solid var(--bg-highlight);
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    background: var(--bg-dark);
    border-bottom: 1px solid var(--bg-highlight);
}

.table-title {
    color: var(--cyan);
    font-weight: bold;
    font-size: 13px;
}

.btn-new {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--green);
    background: transparent;
    border: 1px solid var(--green);
    padding: 2px 8px;
    cursor: pointer;
    border-radius: 2px;
}

.btn-new:hover {
    background: var(--green);
    color: var(--bg);
}

.table-empty {
    padding: 12px;
    color: var(--comment);
    font-style: italic;
    text-align: center;
}

.table-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 12px;
    cursor: pointer;
    font-size: 13px;
}

.table-row:hover {
    background: var(--bg-highlight);
}

.table-row.selected {
    background: var(--bg-visual);
}

.row-index {
    color: var(--comment);
    width: 24px;
    text-align: right;
    flex-shrink: 0;
}

.row-label {
    flex: 1;
    color: var(--fg);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.row-status {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 2px;
}

.row-status.published {
    color: var(--green);
    border: 1px solid var(--green);
}

.row-status.draft {
    color: var(--yellow);
    border: 1px solid var(--yellow);
}

.row-status.archived {
    color: var(--comment);
    border: 1px solid var(--comment);
}

.row-date {
    color: var(--comment);
    font-size: 12px;
    flex-shrink: 0;
}

.row-delete {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    color: var(--comment);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
}

.row-delete:hover {
    color: var(--red);
}
</style>
