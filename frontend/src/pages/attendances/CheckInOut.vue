<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { Button } from '@/components/ui/button'
import { MapPin, MapPinOff, Download, Upload, AlertTriangle } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import axiosInstance from '@/lib/axios'
import type { AllowedArea, LatLng } from '@/types'
import { useGeoLocation } from '@/composables/geoLocation'

const { coords, permissionDenied } = useGeoLocation()
const allowedAreas = ref<AllowedArea[]>([])
const locationError = ref('')
const isSubmitting = ref(false)
const isFetchingAllowedAreas = ref(false)

/** Ray-casting point-in-polygon (lat/lng as y/x). */
function pointInPolygon(lat: number, lng: number, polygon: LatLng[]): boolean {
    if (polygon.length < 3) return false
    let inside = false
    const n = polygon.length
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const pi = polygon[i]
        const pj = polygon[j]
        if (!pi || !pj) continue
        const yi = pi.lat
        const xi = pi.lng
        const yj = pj.lat
        const xj = pj.lng
        if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
            inside = !inside
        }
    }
    return inside
}

/** True if (lat, lng) is inside this area: polygon if defined, else radius around center. */
function areaContainsPoint(area: AllowedArea, lat: number, lng: number): boolean {
    const poly = area.polygon ?? []
    return pointInPolygon(lat, lng, poly as LatLng[])

}

const isWithinAllowedArea = computed(() => {
    if (coords.value.latitude === 0 && coords.value.longitude === 0) return false
    return allowedAreas.value.some((area) =>
        areaContainsPoint(area, coords.value.latitude, coords.value.longitude)
    )
})

const intersectingAllowedAreas = computed(() => {
    return allowedAreas.value.filter((area) =>
        areaContainsPoint(area, coords.value.latitude, coords.value.longitude)
    )
})

const locationStatus = computed(() => {
    return isWithinAllowedArea.value
        ? `You're in an allowed area (${intersectingAllowedAreas.value.map(area => area.name).join(', ')}). You can check in.`
        : 'You must be in an allowed area to check in.'
})

function submit(direction: 'in' | 'out') {
    if (!isWithinAllowedArea.value) return
    isSubmitting.value = true
    axiosInstance.post('/api/attendances', {
        latitude: coords.value.latitude,
        longitude: coords.value.longitude,
        allowed_area_id: intersectingAllowedAreas.value[0]?.id,
        status: direction
    }).then(() => {
        isSubmitting.value = false
    }).catch(() => {
        locationError.value = `Unable to check-${direction}.`
    }).finally(() => {
        isSubmitting.value = false
    })
}

onMounted(() => {
    isFetchingAllowedAreas.value = true
    axiosInstance
        .get('/api/attendances/getAllowedAreas')
        .then((response) => {
            allowedAreas.value = response.data.data as AllowedArea[]
        })
        .catch(() => {
            locationError.value = 'Unable to load allowed areas.'
        })
        .finally(() => {
            isFetchingAllowedAreas.value = false
        })
})

</script>

<template>
    <SidebarLayout>
        <template #header>
            <div class="flex items-center justify-between gap-1 flex-1">
                <h1 class="text-xl font-semibold">Attendance</h1>
            </div>
        </template>
        <div v-if="!permissionDenied" class="space-y-4 max-w-md">
            <p class="text-sm text-muted-foreground">
                Your current location: {{ coords.latitude.toFixed(5) }}, {{ coords.longitude.toFixed(5) }}
            </p>
            <div
                v-if="locationStatus && !isFetchingAllowedAreas && locationError === ''"
                class="flex items-center gap-2 rounded-lg border p-3 text-sm"
                :class="isWithinAllowedArea
                    ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400'"
            >
                <component :is="isWithinAllowedArea ? MapPin : MapPinOff" class="h-4 w-4 shrink-0" />
                <span>{{ locationStatus }}</span>
            </div>
            <p v-if="locationError" class="text-sm text-destructive">{{ locationError }}</p>
            <div v-if="!isFetchingAllowedAreas && intersectingAllowedAreas.length > 0" class="flex gap-2">
                <Button
                    :disabled="!isWithinAllowedArea || isSubmitting"
                    @click="submit('in')"
                >
                <!-- icon inbox -->
                    <Download class="h-4 w-4 shrink-0" />
                    {{ isSubmitting ? 'Submitting...' : 'Check In' }}
                </Button>
                <Button
                    :disabled="!isWithinAllowedArea || isSubmitting"
                    variant="destructive"
                    @click="submit('out')"
                >
                    <Upload class="h-4 w-4 shrink-0" />
                    {{ isSubmitting ? 'Submitting...' : 'Check Out' }}
                </Button>
            </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center text-center gap-6 py-10">
            <AlertTriangle class="h-10 w-10 text-destructive" />
            <h1 class="text-2xl font-semibold">Location Access Denied</h1>
            <p class="text-muted-foreground">Please allow access to your location to use this feature.</p>
            <p class="text-muted-foreground">If you are using a VPN, please disable it.</p>
            <p class="text-muted-foreground">If you are using a location-mocking app, please disable it.</p>
            <p class="text-muted-foreground">If you are using a location-spoofing app, please disable it.</p>
        </div>
    </SidebarLayout>
</template>



