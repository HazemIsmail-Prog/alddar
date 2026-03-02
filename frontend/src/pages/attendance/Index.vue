<template>
    <SidebarLayout>
        <template #header>
            <div class="flex items-center justify-between gap-1 flex-1">
                <h1 class="text-xl font-semibold">Attendance</h1>
            </div>
        </template>
        <div class="space-y-4 max-w-md">
            <p class="text-sm text-muted-foreground">
                Your current location: {{ coords.latitude.toFixed(5) }}, {{ coords.longitude.toFixed(5) }}
            </p>
            <div
                v-if="locationStatus"
                class="flex items-center gap-2 rounded-lg border p-3 text-sm"
                :class="isWithinAllowedArea
                    ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400'"
            >
                <component :is="isWithinAllowedArea ? MapPin : MapPinOff" class="h-4 w-4 shrink-0" />
                <span>{{ locationStatus }}</span>
            </div>
            <p v-if="locationError" class="text-sm text-destructive">{{ locationError }}</p>
            <Button
                :disabled="!isWithinAllowedArea || isCheckingIn"
                @click="checkIn"
            >
                {{ isCheckingIn ? 'Checking in...' : 'Check In' }}
            </Button>
        </div>
    </SidebarLayout>
</template>

<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { Button } from '@/components/ui/button'
import { MapPin, MapPinOff } from 'lucide-vue-next'
import { ref, computed, onMounted, watch } from 'vue'
import axiosInstance from '@/lib/axios'
import type { AllowedArea } from '@/types'
// Allowed areas: center (lat, lng) + radius in meters
const allowedAreas = ref<AllowedArea[]>([])

function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371000 // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

const coords = ref({ latitude: 0, longitude: 0 })
const locationError = ref('')
const locationStatus = ref('')
const isCheckingIn = ref(false)

const isWithinAllowedArea = computed(() => {
    if (coords.value.latitude === 0 && coords.value.longitude === 0) return false
    return allowedAreas.value.some(
        (area) =>
            haversineDistance(
                coords.value.latitude,
                coords.value.longitude,
                area.latitude,
                area.longitude
            ) <= area.radius
    )
})

function updateLocationStatus() {
    if (coords.value.latitude === 0 && coords.value.longitude === 0) {
        locationStatus.value = ''
        return
    }
    const inArea = allowedAreas.value.find(
        (area) =>
            haversineDistance(
                coords.value.latitude,
                coords.value.longitude,
                area.latitude,
                area.longitude
            ) <= area.radius
    )
    locationStatus.value = inArea
        ? `You're in an allowed area (${inArea.name}). You can check in.`
        : 'You must be in an allowed area to check in.'
}

function checkIn() {
    if (!isWithinAllowedArea.value) return
    isCheckingIn.value = true
    // TODO: Call your check-in API when backend is ready
    setTimeout(() => {
        isCheckingIn.value = false
        // Placeholder for API: axiosInstance.post('/api/attendance/checkin', { lat: coords.value.latitude, lng: coords.value.longitude })
    }, 500)
}

onMounted(() => {
    locationError.value = ''
    navigator.geolocation.getCurrentPosition(
        (position) => {
            coords.value.latitude = position.coords.latitude
            coords.value.longitude = position.coords.longitude
            updateLocationStatus()
        },
        (err) => {
            locationError.value =
                err.code === 1
                    ? 'Location permission denied. Enable location access to check in.'
                    : 'Unable to get your location. Please try again.'
        },
        { enableHighAccuracy: true }
    )

    axiosInstance
        .get('/api/allowed-areas')
        .then((response) => {
            // Laravel paginate() returns { data: AllowedArea[], ... }
            allowedAreas.value = (response.data.data ?? response.data) as AllowedArea[]
            updateLocationStatus()
        })
        .catch(() => {
            locationError.value = 'Unable to load allowed areas.'
        })
})

watch(
    coords,
    () => {
        updateLocationStatus()
        console.log('coords changed', coords.value)
    },
    { deep: true }
)
</script>

<style scoped>
.attendance {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 70vh;
    text-align: center;
}

.attendance h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
}
</style>