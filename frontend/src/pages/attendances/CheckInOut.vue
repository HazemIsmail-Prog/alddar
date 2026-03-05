<script setup lang="ts">

import NoAllowedAreasAvailable from './components/NoAllowedAreasAvailable.vue'
import WaitingForAllowedAreas from './components/WaitingForAllowedAreas.vue'
import AvailableAreasList from './components/AvailableAreasList.vue'
import WaitingForLocation from './components/WaitingForLocation.vue'
import PermissionDenied from './components/PermissionDenied.vue'
import CoordinatesCard from './components/CoordinatesCard.vue'
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import UnSupported from './components/UnSupported.vue'
import useGeoLocationStore from '@/stores/geoLocation'
import ApiError from './components/ApiError.vue'
import { onMounted, onUnmounted } from 'vue'
import DutyTime from './components/DutyTime.vue'

const geoLocationStore = useGeoLocationStore()




onMounted(() => {
        if (geoLocationStore.isSupported) {

            navigator.permissions.query({ name: 'geolocation' })
            .then((permissionStatus) => {
                permissionStatus.onchange = function() {
                geoLocationStore.permissionDenied = this.state === 'denied';
                geoLocationStore.setWatcher();
                };
            });

            geoLocationStore.setWatcher();
            
        } else {
            alert('Geolocation is not supported by this browser.');
        }

        geoLocationStore.intervalId = setInterval(() => {
            geoLocationStore.now = Date.now();
        }, 1000); // refresh every second

        geoLocationStore.getAllowedAreas()

    });

    onUnmounted(() => {
        if (geoLocationStore.watcher) {
            navigator.geolocation.clearWatch(geoLocationStore.watcher);
        }
        if (geoLocationStore.intervalId) {
            clearInterval(geoLocationStore.intervalId);
        }   
    });

</script>

<template>
    <SidebarLayout>
        
        <template #header>
            <div class="flex items-center justify-between gap-1 flex-1">
                <h1 class="text-xl font-semibold">Check In/Out</h1>
            </div>
        </template>

        <div class="max-w-md mx-auto mt-10 space-y-4">

            <UnSupported v-if="!geoLocationStore.isSupported" />

            <template v-if="geoLocationStore.isSupported">
                
                <PermissionDenied v-if="geoLocationStore.permissionDenied" />

                <template v-if="!geoLocationStore.permissionDenied">

                    <WaitingForLocation v-if="!geoLocationStore.hasValidCoords" />

                    <template v-if="geoLocationStore.hasValidCoords">

                        <DutyTime v-if="geoLocationStore.todaysCheckInTime" />

                        <CoordinatesCard />

                        <ApiError 
                            v-if="geoLocationStore.apiError" 
                            :apiError="geoLocationStore.apiError" 
                        />

                        <template v-if="!geoLocationStore.apiError">

                            <WaitingForAllowedAreas v-if="geoLocationStore.isFetchingAllowedAreas" />

                            <template v-if="!geoLocationStore.isFetchingAllowedAreas">

                                <NoAllowedAreasAvailable v-if="geoLocationStore.intersectingAllowedAreas(geoLocationStore.allowedAreas).length === 0" />

                                <AvailableAreasList v-if="geoLocationStore.intersectingAllowedAreas(geoLocationStore.allowedAreas).length > 0" />

                            </template>
                    
                        </template>
                
                    </template>
            
                </template>
        
            </template>

        </div>

    </SidebarLayout>

</template>
