<script setup lang="ts">
import useGeoLocationStore from '@/stores/geoLocation'
const geoLocationStore = useGeoLocationStore()
</script>

<template>
    <div
        class="space-y-2 text-center rounded-lg border bg-muted/30 px-4 py-4"
    >
        <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Current location
        </p>
        <p class="text-sm font-mono tabular-nums">
            {{ geoLocationStore.coords.latitude.toFixed(5) }}, {{ geoLocationStore.coords.longitude.toFixed(5) }}
        </p>
    </div>
</template>