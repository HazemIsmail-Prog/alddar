<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useIntersectionObserver } from '@vueuse/core'
import { Search } from 'lucide-vue-next'
import { onMounted, ref, watch, provide, computed } from 'vue'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Attendance } from '@/types'
import useCrud from '@/composables/crud'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAuthStore from '@/stores/auth'
// constants
const { can, canAny } = useAuthStore()

const abilities = computed(() => {
  return {
    canCreate: can('create attendance'),
    canEdit: can('edit attendance'),
    canDelete: can('delete attendance'),
    canView: can('view attendance'),
    showActions: canAny(['edit attendance', 'delete attendance']),
  }
})

const crud = useCrud<Attendance>()
// provide the crud instance to the Form component
provide('sharedCrud', crud);
const { records, total ,nextPageUrl ,isLoadingMore ,isLoading ,getRecords ,loadMoreRecords ,handleOpenForm} = crud
const apiUrl = '/api/attendances'
const loadMoreRef = ref<HTMLDivElement | null>(null)
const sortBy = ref<'date' | 'user'>('date')
const sortDirection = ref<'asc' | 'desc'>('asc')
const filters = ref({
  search: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
})

// lifecycle hooks
onMounted(() => {

  // infinite scroll: load more when loadMoreRef is visible
  useIntersectionObserver(
    loadMoreRef,
    ([entry]) => {
      if (entry?.isIntersecting && nextPageUrl.value && !isLoadingMore.value) {
        loadMoreRecords(filters.value)
      }
    },
    { threshold: 0.1 }
  )

  getRecords(apiUrl, filters.value)
})

const computedRecords = computed(() => {
  // Group by (date + user), find earliest "in" and latest "out" attendance per user per date
  const groups: Record<
    string,
    { date: string; user: string; checkIn: string | null; checkOut: string | null; total: string }
  > = {};

  records.value.forEach((attendance: Attendance) => {
    const date = new Date(attendance.created_at).toISOString().split('T')[0] as string;
    const user = attendance.user.name;
    const groupKey = `${date}_${user}`;

    // Initialize group if not present
    if (!groups[groupKey]) {
      groups[groupKey] = {
        date,
        user,
        checkIn: null,
        checkOut: null,
        total: "0.00",
      };
    }

    // For multiple records per date/user, find earliest "in" and latest "out"
    if (attendance.status === "in") {
      // Earliest check in
      if (
        !groups[groupKey].checkIn ||
        attendance.created_at < groups[groupKey].checkIn
      ) {
        groups[groupKey].checkIn = attendance.created_at;
      }
    } else if (attendance.status === "out") {
      // Latest check out
      if (
        !groups[groupKey].checkOut ||
        attendance.created_at > groups[groupKey].checkOut
      ) {
        groups[groupKey].checkOut = attendance.created_at;
      }

      groups[groupKey].total = ((new Date(groups[groupKey].checkOut ?? '').getTime() - new Date(groups[groupKey].checkIn ?? '').getTime()) / 60000).toFixed(2);
    }
  });

  if (sortBy.value === 'date') {
    if (sortDirection.value === 'asc') {
      return Object.values(groups).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      return Object.values(groups).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } else if (sortBy.value === 'user') {
    if (sortDirection.value === 'asc') {
      return Object.values(groups).sort((a, b) => a.user.localeCompare(b.user));
    } else {
      return Object.values(groups).sort((a, b) => b.user.localeCompare(a.user));
    }
  }

});

const handleSort = (field: 'date' | 'user') => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortDirection.value = 'asc';
  }
}


// watch
watch(filters.value, () => {
  // reset nextPageUrl to start from the first page
  nextPageUrl.value = null
  getRecords(apiUrl, filters.value)
}, { deep: true })

</script>   
<template>


  <SidebarLayout>

        <template #header>
            <div class="flex justify-between items-center flex-1"> 
              <h1 class="text-xl font-semibold">Attendances</h1>
              <Button v-if="abilities.canCreate" variant="default" size="sm" @click="handleOpenForm()">Create Attendance</Button>
            </div>
        </template>

        <!-- filters -->
        <InputGroup>
            <InputGroupInput type="search" placeholder="Search..." v-model="filters.search" />
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Badge variant="secondary" v-if="isLoading">
                <Spinner /> Loading...
              </Badge>
              <span v-else>
                {{ total }} results
              </span>
            </InputGroupAddon>
        </InputGroup>

        <!-- month and year selector -->
        <div class="flex justify-between items-center gap-2 mt-4">
          <Button variant="outline" size="sm" @click="filters.month--">Previous Month</Button>
          <span>{{ new Date(filters.year, filters.month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' }) }}</span>
          <Button variant="outline" size="sm" @click="filters.month++">Next Month</Button>
        </div>


        <!-- table -->
        <Table v-if="records.length > 0" class="mt-4">

            <TableHeader>
                <TableRow>
                    <TableHead @click="handleSort('date')">Date</TableHead>
                    <TableHead @click="handleSort('user')">User</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Minutes</TableHead>
                    <TableHead v-if="abilities.showActions" class="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableRow v-for="attendance in computedRecords" :key="attendance.date + attendance.user">
                    <TableCell>{{ attendance.date }}</TableCell>
                    <TableCell>{{ attendance.user }}</TableCell>
                    <TableCell>{{ attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString() : '-' }}</TableCell>
                    <TableCell>{{ attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString() : '-' }}</TableCell>
                    <TableCell>{{ attendance.total }} minutes</TableCell>
                    <TableCell v-if="abilities.showActions" class="flex gap-2 justify-end">
                    </TableCell>
                </TableRow>
            </TableBody>

        </Table>

        <!-- loadMoreRef -->
        <div class="flex justify-center my-4" v-if="nextPageUrl" ref="loadMoreRef">
          <Badge v-if="isLoadingMore" variant="outline">
            <Spinner /> Loading more...
          </Badge>
        </div>

    </SidebarLayout>

</template>