<script setup lang="ts">
import type { AllowedArea, AllowedAreaForm, LatLng } from '@/types'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ref, watch, inject, computed } from 'vue'
import useCrud from '@/composables/crud'
import { GoogleMap, AdvancedMarker, Polygon } from 'vue3-google-map'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Field,
    FieldLabel,
    FieldError,
} from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const form = ref<AllowedAreaForm>({
    name: '',
    is_active: true,
    polygon: [],
})

// Polygon points (synced with form.polygon for API)
const polygonPoints = ref<LatLng[]>([])

const props = defineProps<{
    apiUrl: string
}>()

const crud = inject<ReturnType<typeof useCrud<AllowedArea>>>('sharedCrud')!
const { isFormOpen, selectedRecord, updateRecord, createRecord, isSubmitting, formErrors } = crud

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

const defaultCenter = { lat: 29.330131665601, lng: 48.080625263766 }

// Map center: polygon centroid when editing/has points, else default
const mapCenter = computed(() => {
    if (polygonPoints.value.length > 0) {
        return polygonCentroid(polygonPoints.value)
    }
    const { polygon } = form.value
    if (polygon && polygon.length > 0) {
        return polygonCentroid(polygon)
    }
    return defaultCenter
})

function onMapClick(e: { latLng: { lat: () => number; lng: () => number } }) {
    polygonPoints.value = [
        ...polygonPoints.value,
        { lat: e.latLng.lat(), lng: e.latLng.lng() },
    ]
}

const polygonOptions = computed(() => ({
    paths: polygonPoints.value,
    strokeColor: '#0ea5e9',
    strokeOpacity: 0.9,
    strokeWeight: 2,
    fillColor: '#0ea5e9',
    fillOpacity: 0.25,
}))

function clearPolygon() {
    polygonPoints.value = []
}

function removeLastPoint() {
    if (polygonPoints.value.length > 0) {
        polygonPoints.value = polygonPoints.value.slice(0, -1)
    }
}

// When opening for edit, load polygon from record
watch(isFormOpen, (newVal) => {
    if (newVal) {
        if (selectedRecord.value) {
            form.value = { ...selectedRecord.value, polygon: selectedRecord.value.polygon ?? [] as LatLng[], is_active: selectedRecord.value.is_active ?? true as boolean }
            polygonPoints.value = selectedRecord.value.polygon?.length
                ? [...selectedRecord.value.polygon]
                : []
        } else {
            polygonPoints.value = []
        }
    } else {
        resetSheet()
    }
})

const resetSheet = () => {
    form.value = {
        name: '',
        is_active: true,
        polygon: [],
    }
    polygonPoints.value = []
    selectedRecord.value = null
}

function polygonCentroid(points: LatLng[]): LatLng {
    if (points.length === 0) return { lat: 0, lng: 0 }
    const sum = points.reduce(
        (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
        { lat: 0, lng: 0 }
    )
    return {
        lat: sum.lat / points.length,
        lng: sum.lng / points.length,
    }
}

const handleSubmitForm = () => {
    const payload: AllowedAreaForm = {
        ...form.value,
        polygon: polygonPoints.value.length >= 3 ? polygonPoints.value : null,
    }
    if (selectedRecord.value) {
        updateRecord(props.apiUrl, selectedRecord.value.id, payload)
    } else {
        createRecord(props.apiUrl, payload)
    }
}
</script>

<template>
    <Sheet :open="isFormOpen" @update:open="isFormOpen = false">

        <SheetContent class="w-1/2 !max-w-1/2" as="form" @submit.prevent="handleSubmitForm">
            
            <SheetHeader>
                <SheetTitle>{{ selectedRecord ? 'Edit Allowed Area' : 'Create Allowed Area' }}</SheetTitle>
                <SheetDescription>
                {{ selectedRecord ? 'Edit allowed area details' : 'Create a new allowed area' }}
                </SheetDescription>
            </SheetHeader>

            <div class="grid flex-1 auto-rows-min gap-4 px-4 overflow-y-auto">
                <Field>
                    <FieldLabel for="name">
                        Name
                    </FieldLabel>
                    <Input
                        id="name"
                        v-model="form.name"
                        :aria-invalid="formErrors.name ? true : false"
                    />
                    <FieldError :errors="formErrors.name" />
                </Field>

                <div class="flex items-center gap-3">
                    <Checkbox id="is_active" v-model="form.is_active as boolean" />
                    <Label for="is_active">Is Active</Label>
                </div>

                <Field v-if="googleMapsApiKey" class="space-y-2">
                    <FieldLabel>Draw allowed area (polygon)</FieldLabel>
                    <p class="text-sm text-muted-foreground">Click the map to add polygon points. Add at least 3 points to define the area.</p>
                    <div class="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" :disabled="polygonPoints.length === 0" @click="removeLastPoint">
                            Remove last point
                        </Button>
                        <Button type="button" variant="outline" size="sm" :disabled="polygonPoints.length === 0" @click="clearPolygon">
                            Clear polygon
                        </Button>
                        <span v-if="polygonPoints.length > 0" class="text-sm text-muted-foreground self-center">
                            {{ polygonPoints.length }} point{{ polygonPoints.length === 1 ? '' : 's' }}
                        </span>
                    </div>
                    <div class="overflow-hidden rounded-lg border border-input">
                        <GoogleMap
                            :api-key="googleMapsApiKey"
                            map-id="DEMO_MAP_ID"
                            class="h-[500px] w-full"
                            :center="mapCenter"
                            :zoom="14"
                            @click="onMapClick"
                        >
                            <Polygon v-if="polygonPoints.length >= 2" :options="polygonOptions" />
                            <AdvancedMarker
                                v-for="(point, i) in polygonPoints"
                                :key="`vertex-${i}`"
                                :options="{ position: point }"
                            >
                                <template #content>
                                    <div
                                        class="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-medium text-white shadow"
                                    >
                                        {{ i + 1 }}
                                    </div>
                                </template>
                            </AdvancedMarker>
                        </GoogleMap>
                    </div>
                </Field>
                <Field v-else class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                    Add <code class="rounded bg-amber-100 px-1 dark:bg-amber-900">VITE_GOOGLE_MAPS_API_KEY</code> to your <code class="rounded bg-amber-100 px-1 dark:bg-amber-900">.env</code> to pick location on the map.
                </Field>




            </div>

            <SheetFooter>
                <Button type="submit" :disabled="isSubmitting">
                    <Spinner v-if="isSubmitting" />
                    {{ isSubmitting ? 'Saving...' : 'Save' }}
                </Button>
                <SheetClose as-child>
                <Button variant="outline">
                    Close
                </Button>
                </SheetClose>
            </SheetFooter>

        </SheetContent>

    </Sheet>
</template>