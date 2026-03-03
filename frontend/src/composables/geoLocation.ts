import { onMounted, onUnmounted, ref } from "vue"

export function useGeoLocation() {
    const coords = ref({ latitude: 0, longitude: 0 });
    const isSupported = 'navigator' in window && 'geolocation' in navigator;
    const permissionDenied = ref(false);

    let watcher: number | null = null;

    onMounted(() => {
        if (isSupported) {

            navigator.permissions.query({ name: 'geolocation' })
            .then((permissionStatus) => {
                permissionStatus.onchange = function() {
                permissionDenied.value = this.state === 'denied';
                };
            });

            watcher = navigator.geolocation.watchPosition(
                (position) => {
                    coords.value = position.coords;
                    permissionDenied.value = false;
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        permissionDenied.value = true;
                    }
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });

    onUnmounted(() => {
        if (watcher) {
            navigator.geolocation.clearWatch(watcher);
        }
    });

    return {
        isSupported,
        coords,
        permissionDenied,
    };
}