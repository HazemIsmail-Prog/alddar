<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useIntersectionObserver } from '@vueuse/core'
import { Search, Edit, Trash } from 'lucide-vue-next'
import { onMounted, ref, watch, provide, computed } from 'vue'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Permission } from '@/types'
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
    canCreate: can('create permission'),
    canEdit: can('edit permission'),
    canDelete: can('delete permission'),
    canView: can('view permission'),
    showActions: canAny(['edit permission', 'delete permission']),
  }
})

const crud = useCrud<Permission>()
// provide the crud instance to the Form component
provide('sharedCrud', crud);
const { records, total ,nextPageUrl ,isLoadingMore ,isLoading ,isDeleting ,getRecords ,deleteRecord ,loadMoreRecords ,handleOpenForm} = crud
const apiUrl = '/api/permissions'
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
              <h1 class="text-xl font-semibold">Permissions</h1>
              <Button v-if="abilities.canCreate" variant="default" size="sm" @click="handleOpenForm()">Create Permission</Button>
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
                    <TableHead>Group</TableHead>
                    <TableHead v-if="abilities.showActions" class="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="permission in records" :key="permission.id">
                  <TableCell class="font-medium">
                  {{ permission.name }}
                  </TableCell>
                  <TableCell>{{ permission.group }}</TableCell>

                  <TableCell v-if="abilities.showActions" class="flex gap-2 justify-end">
                      <Edit v-if="abilities.canEdit" @click="handleOpenForm(permission)" class="size-5 cursor-pointer" />
                      <Trash v-if="abilities.canDelete && isDeleting !== permission.id" class="size-5 cursor-pointer text-red-500 dark:text-red-400" @click="deleteRecord(apiUrl, permission.id)" />
                      <Badge variant="destructive" v-if="isDeleting === permission.id">
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