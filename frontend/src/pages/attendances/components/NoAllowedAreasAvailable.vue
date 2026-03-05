<script setup lang="ts">
import { MapPinOff } from 'lucide-vue-next'
</script>

<template>
    <div class="flex items-start gap-3 rounded-xl border px-4 py-4 text-sm border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200">
        <MapPinOff />
        <span>You must be in an allowed area to check in.</span>
    </div>
</template>