<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
</script>


<template>
    <div
        class="flex flex-col items-center justify-center text-center gap-4 rounded-xl border border-destructive/50 bg-destructive/10 px-6 py-10"
    >
        <AlertTriangle class="h-12 w-12 text-destructive" />
        <h2 class="text-lg font-semibold">Location access denied</h2>
        <p class="text-sm text-muted-foreground">
            Please allow access to your location to use this feature.
        </p>
        <ul class="text-left text-sm text-muted-foreground space-y-1 mt-2">
            <li>• If you use a VPN, try disabling it.</li>
            <li>• Disable any location-mocking or spoofing apps.</li>
            <li>• Check your browser or device location settings.</li>
        </ul>
    </div>
</template>

