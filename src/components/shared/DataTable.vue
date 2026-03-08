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
  <div class="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
    <table class="w-full table-fixed">
      <thead>
        <tr class="bg-slate-50/80">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
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
          class="border-b border-border/40 transition-colors duration-150 last:border-b-0 hover:bg-slate-50/50"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="['px-5 py-4 text-sm text-foreground', alignClass(column.align)]"
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
