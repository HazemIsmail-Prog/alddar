<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { Button } from '@/components/ui/button'
import { MapPin, MapPinOff, Download, Upload, AlertTriangle, LocateOff } from 'lucide-vue-next'
import { ref, computed, onMounted } from 'vue'
import axiosInstance from '@/lib/axios'
import type { AllowedArea, LatLng } from '@/types'
import { useGeoLocation } from '@/composables/geoLocation'

const {
    isSupported,
    coords,
    permissionDenied,
    locationErrorMessage,
} = useGeoLocation()

const allowedAreas = ref<AllowedArea[]>([])
const apiError = ref('')
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

const hasValidCoords = computed(() => {
    const { latitude, longitude } = coords.value
    return latitude !== 0 || longitude !== 0
})

const isWithinAllowedArea = computed(() => {
    if (!hasValidCoords.value) return false
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

const canShowCheckInUI = computed(() => {
    return isSupported
        && !permissionDenied.value
        && !locationErrorMessage.value
        && hasValidCoords.value
})

function submit(direction: 'in' | 'out') {
    if (!isWithinAllowedArea.value) return
    isSubmitting.value = true
    apiError.value = ''
    axiosInstance
        .post('/api/attendances', {
            latitude: coords.value.latitude,
            longitude: coords.value.longitude,
            allowed_area_id: intersectingAllowedAreas.value[0]?.id,
            status: direction,
        })
        .then(() => {
            isSubmitting.value = false
        })
        .catch(() => {
            apiError.value = `Unable to check ${direction}. Please try again.`
        })
        .finally(() => {
            isSubmitting.value = false
        })
}

onMounted(() => {
    isFetchingAllowedAreas.value = true
    axiosInstance
        .get('/api/attendances/getAllowedAreas')
        .then((response) => {
            allowedAreas.value = response.data as AllowedArea[]
        })
        .catch(() => {
            apiError.value = 'Unable to load allowed areas.'
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

        <div class="max-w-md mx-auto mt-10 space-y-8">

            <!-- Geolocation not supported -->
            <div
                v-if="!isSupported"
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

            


            

            <!-- Permission denied (uses locationErrorMessage from composable) -->
            <div
                v-else-if="permissionDenied"
                class="flex flex-col items-center justify-center text-center gap-4 rounded-xl border border-destructive/50 bg-destructive/10 px-6 py-10"
            >
                <AlertTriangle class="h-12 w-12 text-destructive" />
                <h2 class="text-lg font-semibold">Location access denied</h2>
                <p class="text-sm text-muted-foreground">
                    {{ locationErrorMessage || 'Please allow access to your location to use this feature.' }}
                </p>
                <ul class="text-left text-sm text-muted-foreground space-y-1 mt-2">
                    <li>• If you use a VPN, try disabling it.</li>
                    <li>• Disable any location-mocking or spoofing apps.</li>
                    <li>• Check your browser or device location settings.</li>
                </ul>
            </div>

            <!-- Other location errors (unavailable, timeout) -->
            <div
                v-else-if="locationErrorMessage"
                class="flex flex-col items-center justify-center text-center gap-4 rounded-xl border border-amber-500/50 bg-amber-500/10 px-6 py-10"
            >
                <AlertTriangle class="h-12 w-12 text-amber-600 dark:text-amber-400" />
                <h2 class="text-lg font-semibold text-amber-800 dark:text-amber-200">
                    Location unavailable
                </h2>
                <p class="text-sm text-amber-700 dark:text-amber-300">
                    {{ locationErrorMessage }}
                </p>
            </div>

            <!-- Main check-in UI (when location is available) -->
            <template v-else>
                <!-- Coordinates (only when we have valid coords) -->
                <div
                    v-if="hasValidCoords"
                    class="space-y-2 text-center rounded-lg border bg-muted/30 px-4 py-4"
                >
                    <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Current location
                    </p>
                    <p class="text-sm font-mono tabular-nums">
                        {{ coords.latitude.toFixed(5) }}, {{ coords.longitude.toFixed(5) }}
                    </p>
                </div>

                <!-- Location status (allowed area or not) -->
                <div
                    v-if="!isFetchingAllowedAreas && hasValidCoords"
                    class="flex items-start gap-3 rounded-xl border px-4 py-4 text-sm"
                    :class="isWithinAllowedArea
                        ? 'border-green-500/50 bg-green-500/10 text-green-800 dark:text-green-200'
                        : 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200'"
                >
                    <component
                        :is="isWithinAllowedArea ? MapPin : MapPinOff"
                        class="h-5 w-5 shrink-0 mt-0.5"
                    />
                    <span>{{ locationStatus }}</span>
                </div>

                <!-- API error (submit or fetch failure) -->
                <div
                    v-if="apiError"
                    class="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                    <AlertTriangle class="h-4 w-4 shrink-0" />
                    {{ apiError }}
                </div>

                <!-- Check In / Check Out buttons -->
                <div
                v-if="canShowCheckInUI && !isFetchingAllowedAreas && isWithinAllowedArea"
                    class="flex flex-wrap gap-3"
                >
                    <Button
                        :disabled="isSubmitting"
                        size="lg"
                        class="flex-1"
                        @click="submit('in')"
                    >
                        <Download class="h-4 w-4 shrink-0 mr-2" />
                        {{ isSubmitting ? 'Submitting...' : 'Check In' }}
                    </Button>
                    <Button
                        :disabled="isSubmitting"
                        variant="destructive"
                        size="lg"
                        class="flex-1"
                        @click="submit('out')"
                    >
                        <Upload class="h-4 w-4 shrink-0 mr-2" />
                        {{ isSubmitting ? 'Submitting...' : 'Check Out' }}
                    </Button>
                </div>

                <!-- Loading allowed areas -->
                <div
                    v-if="isFetchingAllowedAreas && hasValidCoords"
                    class="text-center text-sm text-muted-foreground py-4"
                >
                    Loading allowed areas…
                </div>
            </template>
        </div>
    </SidebarLayout>
</template>
