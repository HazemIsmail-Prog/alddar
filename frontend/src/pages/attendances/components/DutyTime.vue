<script setup lang="ts">
import useGeoLocationStore from '@/stores/geoLocation'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
const geoLocationStore = useGeoLocationStore()

</script>

<template>
    <div class="rounded-lg border bg-muted/30 p-4">
        <div class="text-lg font-semibold text-center">Today's Duty Time</div>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="text-center">Check In</TableHead>
                    <TableHead class="text-center">Hours</TableHead>
                    <TableHead class="text-center">Minutes</TableHead>
                    <TableHead class="text-center">Seconds</TableHead>
                    <TableHead class="text-center">Check Out</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell class="text-center">{{ geoLocationStore.getFormattedTime(geoLocationStore.todaysCheckInTime ?? '') }}</TableCell>
                    <TableCell class="text-center">{{ geoLocationStore.getTransformedTotalTime(Number(geoLocationStore.totalTime)).hours }}</TableCell>
                    <TableCell class="text-center">{{ geoLocationStore.getTransformedTotalTime(Number(geoLocationStore.totalTime)).minutes }}</TableCell>
                    <TableCell class="text-center">{{ geoLocationStore.getTransformedTotalTime(Number(geoLocationStore.totalTime)).remainingSeconds }}</TableCell>
                    <TableCell class="text-center">{{ geoLocationStore.getFormattedTime(geoLocationStore.todaysCheckOutTime ?? '') }}</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>