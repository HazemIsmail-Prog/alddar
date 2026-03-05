    <script setup lang="ts">
    import { Loader2 } from 'lucide-vue-next'
    import useGeoLocationStore from '@/stores/geoLocation'
    const geoLocationStore = useGeoLocationStore()

    </script>
<template>
    <div
        class="flex flex-col items-center justify-center text-center gap-4 rounded-xl border border-amber-500/50 bg-amber-500/10 px-6 py-10"
    >
        <Loader2 class="h-12 w-12 text-amber-600 dark:text-amber-400 animate-spin" />
        <h2 class="text-lg font-semibold text-amber-800 dark:text-amber-200">
            Waiting for location
        </h2>
        <p class="text-sm text-amber-700 dark:text-amber-300">
            {{ geoLocationStore.locationErrorMessage || 'We are waiting for your location. Please wait a moment.' }}
        </p>
    </div>
</template>
