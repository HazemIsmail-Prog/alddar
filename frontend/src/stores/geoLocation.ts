import { defineStore } from "pinia"
import { computed, ref } from "vue"
import type { AllowedArea, Attendance, LatLng } from "@/types";
import axiosInstance from "@/lib/axios"

const useGeoLocationStore = defineStore('geoLocation', () => {

    const coords = ref({ latitude: 0, longitude: 0 });
    const isSupported = 'navigator' in window && 'geolocation' in navigator;
    const permissionDenied = ref(false);
    const locationErrorMessage = ref('');
    const allowedAreas = ref<AllowedArea[]>([])
    const userTodaysActivities = ref<Attendance[]>([])
    const apiError = ref('')
    const isFetchingAllowedAreas = ref(false)
    const availableCheckButton = ref<'in' | 'out' | null>(null);
    const todaysCheckInTime = ref<string | null>(null);
    const todaysCheckOutTime = ref<string | null>(null);

    const now = ref(Date.now());


    const totalTime = computed(() => {
        if (todaysCheckInTime.value && !todaysCheckOutTime.value) {
            return ((now.value - new Date(todaysCheckInTime.value).getTime()) / 1000).toFixed(0);
        }
        if (todaysCheckInTime.value && todaysCheckOutTime.value) {
            return (
                (new Date(todaysCheckOutTime.value).getTime() -
                    new Date(todaysCheckInTime.value).getTime()) /
                1000
            );
        }
        return 0;
    });

    const getTransformedTotalTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return { hours, minutes, remainingSeconds };
    }


    const getFormattedTime = (time: string) => {
        return time
            ? new Date(time)
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            : '-'
    }

    let watcher: number | null = null;

    const intervalId = ref<number | null>(null);




    const setWatcher = () => {
        watcher = navigator.geolocation.watchPosition(
            (position) => {
                coords.value = position.coords;
                permissionDenied.value = false;
                locationErrorMessage.value = '';
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    permissionDenied.value = true;
                    locationErrorMessage.value = 'Location access denied. Please allow access to your location to use this feature.';
                }
                if (error.code === error.POSITION_UNAVAILABLE) {
                    locationErrorMessage.value = 'Location information is unavailable.';
                }
                if (error.code === error.TIMEOUT) {
                    locationErrorMessage.value = 'The request timed out.';
                }
            }
        );
    }

    // onMounted(() => {
    //     if (isSupported) {

    //         navigator.permissions.query({ name: 'geolocation' })
    //         .then((permissionStatus) => {
    //             permissionStatus.onchange = function() {
    //             permissionDenied.value = this.state === 'denied';
    //             setWatcher();
    //             };
    //         });

    //         setWatcher();
            
    //     } else {
    //         alert('Geolocation is not supported by this browser.');
    //     }

    //     console.log('mounted');

    //     intervalId = setInterval(() => {
    //         now.value = Date.now();
    //     }, 1000); // refresh every second


    // });

    // onUnmounted(() => {
    //     if (watcher) {
    //         navigator.geolocation.clearWatch(watcher);
    //     }
    //     if (intervalId) {
    //         clearInterval(intervalId);
    //     }
    //     console.log('unmounted');
    // });


    const pointInPolygon = (lat: number, lng: number, polygon: LatLng[]): boolean => {
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


    const areaContainsPoint = (area: AllowedArea, lat: number, lng: number): boolean => {
        const poly = area.polygon ?? []
        return pointInPolygon(lat, lng, poly as LatLng[])
    }


    const hasValidCoords = computed(() => {
        return coords.value.latitude !== 0 && coords.value.longitude !== 0 && locationErrorMessage.value === ''
    })


    const isWithinAllowedArea = (allowedAreas: AllowedArea[]) => {
        if (!hasValidCoords.value) return false
        return allowedAreas.some((area) =>
            areaContainsPoint(area, coords.value.latitude, coords.value.longitude)
        )
    }


    const intersectingAllowedAreas = (allowedAreas: AllowedArea[]) => {
        return allowedAreas.filter((area) =>
            areaContainsPoint(area, coords.value.latitude, coords.value.longitude)
        )
    }

    const getAllowedAreas = () => {
        isFetchingAllowedAreas.value = true
        axiosInstance
            .get('/api/attendances/getAllowedAreas')
            .then((response) => {
                allowedAreas.value = response.data.allowedAreas
                userTodaysActivities.value = response.data.userTodaysActivities
                todaysCheckInTime.value = userTodaysActivities.value.find((activity) => activity.status === 'in')?.created_at ?? null
                todaysCheckOutTime.value = userTodaysActivities.value.find((activity) => activity.status === 'out')?.created_at ?? null
                const lastUserActivity = userTodaysActivities.value[userTodaysActivities.value.length - 1]
                switch(lastUserActivity?.status){
                    case 'in':
                        availableCheckButton.value = 'out';
                        break;
                    case 'out':
                        availableCheckButton.value = null;
                        break;
                    default:
                        availableCheckButton.value = 'in';
                        break;
    
                }
            })
            .catch(() => {
                apiError.value = 'Unable to load allowed areas.'
            })
            .finally(() => {
                isFetchingAllowedAreas.value = false
            })
    }

    const isChecking = ref<boolean>(false)

    function submit(direction: 'in' | 'out', areaId: number) {
        isChecking.value = true
        axiosInstance
            .post('/api/attendances', {
                latitude: coords.value.latitude,
                longitude: coords.value.longitude,
                allowed_area_id: areaId,
                status: direction,
            })
            .then((response) => {
                switch(direction){
                    case 'in':
                        availableCheckButton.value = 'out';
                        todaysCheckInTime.value = response.data.created_at;
                        break;
                    case 'out':
                        availableCheckButton.value = null;
                        todaysCheckOutTime.value = response.data.created_at;
                        // if (intervalId) {
                        //     clearInterval(intervalId);
                        // }

                        break;
                }
                // TODO: show success message
            })
            .catch(() => {
                // TODO: show error message
            })
            .finally(() => {
                isChecking.value = false
            })
    }


    return {


        coords,
        isSupported,
        hasValidCoords,
        permissionDenied,
        locationErrorMessage,
        allowedAreas,
        userTodaysActivities,
        apiError,
        isFetchingAllowedAreas,
        availableCheckButton,
        isChecking,
        todaysCheckInTime,
        todaysCheckOutTime,
        totalTime,
        pointInPolygon,
        areaContainsPoint,
        isWithinAllowedArea,
        intersectingAllowedAreas,
        getAllowedAreas,
        submit,
        getFormattedTime,
        getTransformedTotalTime,
        watcher,

        // intervalId,
        now,
        intervalId,
        setWatcher,
    }
})

export default useGeoLocationStore