<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
    apiError: string
}>()
</script>

<template>
    <div
        v-if="apiError"
        class="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
        <AlertTriangle />
        {{ apiError }}
    </div>
</template>