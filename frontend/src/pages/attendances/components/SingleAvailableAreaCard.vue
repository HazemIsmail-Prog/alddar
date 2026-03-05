<script setup lang="ts">
import { MapPin, Download, Upload } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { AllowedArea } from '@/types'
import useGeoLocationStore from '@/stores/geoLocation'
const geoLocationStore = useGeoLocationStore()

const props = defineProps<{
    area: AllowedArea
}>()

</script>

<template>
    <div class="group transition hover:shadow-xl hover:border-green-600 hover:bg-green-600/10 rounded-2xl border border-green-400/70 bg-white dark:bg-green-900/20 p-5 flex flex-col gap-3 w-full max-w-xl mx-auto">
        <div class="flex items-center gap-3 mb-2">
            <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-green-100 dark:bg-green-700/30">
                <MapPin class="w-7 h-7 text-green-600 dark:text-green-300" />
            </div>
            <div class="flex flex-col">
                <span class="text-lg font-semibold text-green-900 dark:text-green-200">{{ area.name }}</span>
            </div>
        </div>

        <div class="flex flex-row flex-wrap gap-4 mt-2 justify-end">
            <Button
                v-if="geoLocationStore.availableCheckButton === 'in'"
                :disabled="geoLocationStore.isChecking"
                size="sm"
                class="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-md"
                @click="geoLocationStore.submit('in', area.id)"
            >
                <Download class="w-4 h-4" />
                <span>{{ geoLocationStore.isChecking ? 'Checking In...' : 'Check In' }}</span>
            </Button>
            <Button
                v-if="geoLocationStore.availableCheckButton === 'out'"
                :disabled="geoLocationStore.isChecking"
                variant="destructive"
                size="sm"
                class="inline-flex items-center gap-2 px-4 py-2 font-medium rounded-md"
                @click="geoLocationStore.submit('out', area.id)"
            >
                <Upload class="w-4 h-4" />
                <span>{{ geoLocationStore.isChecking ? 'Checking Out...' : 'Check Out' }}</span>
            </Button>
        </div>
    </div>
</template>