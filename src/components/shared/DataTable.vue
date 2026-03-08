<script setup lang="ts">
interface Column {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
}

defineProps<{
  columns: Column[]
  data: Record<string, any>[]
}>()

function alignClass(align?: 'left' | 'right' | 'center'): string {
  switch (align) {
    case 'right':
      return 'text-right'
    case 'center':
      return 'text-center'
    default:
      return 'text-left'
  }
}
</script>

<template>
  <div class="card overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="bg-muted">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap',
              alignClass(column.align),
            ]"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in data"
          :key="index"
          class="border-b border-border transition-colors duration-150 last:border-b-0 hover:bg-muted/50"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="['px-6 py-4 text-sm text-foreground', alignClass(column.align)]"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
            >
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
