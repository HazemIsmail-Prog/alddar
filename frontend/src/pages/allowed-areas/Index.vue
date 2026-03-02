<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useIntersectionObserver } from '@vueuse/core'
import { Search, Edit, Trash } from 'lucide-vue-next'
import { onMounted, ref, watch, provide, computed } from 'vue'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { AllowedArea } from '@/types'
import useCrud from '@/composables/crud'
import Form from './Form.vue'
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
    canCreate: can('create allowed area'),
    canEdit: can('edit allowed area'),
    canDelete: can('delete allowed area'),
    canView: can('view allowed area'),
    showActions: canAny(['edit allowed area', 'delete allowed area']),
  }
})

const crud = useCrud<AllowedArea>()
// provide the crud instance to the Form component
provide('sharedCrud', crud);
const { records, total ,nextPageUrl ,isLoadingMore ,isLoading ,isDeleting ,getRecords ,deleteRecord ,loadMoreRecords ,handleOpenForm} = crud
const apiUrl = '/api/allowed-areas'
const loadMoreRef = ref<HTMLDivElement | null>(null)
const filters = ref({
  search: '',
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

  getRecords(apiUrl)
})

// watch
watch(filters.value, () => {
  // reset nextPageUrl to start from the first page
  nextPageUrl.value = null
  getRecords(apiUrl, filters.value)
}, { deep: true })

</script>   
<template>

  <Form :apiUrl="apiUrl" />

  <SidebarLayout>

        <template #header>
            <div class="flex justify-between items-center flex-1"> 
              <h1 class="text-xl font-semibold">Allowed Areas</h1>
              <Button v-if="abilities.canCreate" variant="default" size="sm" @click="handleOpenForm()">Create Allowed Area</Button>
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


        <!-- table -->
        <Table v-if="records.length > 0" class="mt-4">

            <TableHeader>
                <TableRow>
                    <TableHead class="w-[100px]">Name</TableHead>
                    <TableHead>Latitude</TableHead>
                    <TableHead>Longitude</TableHead>
                    <TableHead>Radius</TableHead>
                    <TableHead v-if="abilities.showActions" class="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="allowedArea in records" :key="allowedArea.id">
                  <TableCell class="font-medium">
                  {{ allowedArea.name }}
                  </TableCell>
                  <TableCell>{{ allowedArea.latitude }}</TableCell>
                  <TableCell>{{ allowedArea.longitude }}</TableCell>
                  <TableCell>{{ allowedArea.radius }}</TableCell>

                  <TableCell v-if="abilities.showActions" class="flex gap-2 justify-end">
                      <Edit v-if="abilities.canEdit" @click="handleOpenForm(allowedArea)" class="size-5 cursor-pointer" />
                      <Trash v-if="abilities.canDelete && isDeleting !== allowedArea.id" class="size-5 cursor-pointer text-red-500 dark:text-red-400" @click="deleteRecord(apiUrl, allowedArea.id)" />
                      <Badge variant="destructive" v-if="isDeleting === allowedArea.id">
                        <Spinner /> Deleting...
                      </Badge>
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