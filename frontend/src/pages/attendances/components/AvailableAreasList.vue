<script setup lang="ts">
import SingleAvailableAreaCard from './SingleAvailableAreaCard.vue'
import useGeoLocationStore from '@/stores/geoLocation'
const geoLocationStore = useGeoLocationStore()



</script>

<template>
    <div 
    v-if="geoLocationStore.availableCheckButton !== null"
    v-for="area in geoLocationStore.intersectingAllowedAreas(geoLocationStore.allowedAreas)" :key="area.id" >
        <SingleAvailableAreaCard :area="area" />
    </div>
</template>