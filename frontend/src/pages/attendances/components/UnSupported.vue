<script setup lang="ts">
import { LocateOff } from 'lucide-vue-next'
</script>

<template>
    <div
        class="flex flex-col items-center justify-center text-center gap-4 rounded-xl border border-amber-500/50 bg-amber-500/10 px-6 py-10"
    >
        <LocateOff class="h-12 w-12 text-amber-600 dark:text-amber-400" />
        <h2 class="text-lg font-semibold text-amber-800 dark:text-amber-200">
            Geolocation not supported
        </h2>
        <p class="text-sm text-amber-700 dark:text-amber-300">
            This browser does not support location access. Please use a modern browser to check in.
        </p>
    </div>
</template>