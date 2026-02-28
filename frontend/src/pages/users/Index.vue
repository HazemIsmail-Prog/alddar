<script setup lang="ts">
import SidebarLayout from '@/layouts/SidebarLayout.vue'
import { useIntersectionObserver } from '@vueuse/core'
import type { User, Permission, Role } from '@/types'
import { Search, Edit, Trash } from 'lucide-vue-next'
import { onMounted, ref, watch, provide, computed } from 'vue'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useCrud from '@/composables/crud'
import axiosInstance from '@/lib/axios'
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
    canCreate: can('create user'),
    canEdit: can('edit user'),
    canDelete: can('delete user'),
    canView: can('view user'),
    showActions: canAny(['edit user', 'delete user']),
  }
})

const crud = useCrud<User>()
// provide the crud instance to the Form component
provide('sharedCrud', crud);
const { records, total ,nextPageUrl ,isLoadingMore ,isLoading ,isDeleting ,getRecords ,deleteRecord ,loadMoreRecords ,handleOpenForm} = crud
const apiUrl = '/api/users'
const loadMoreRef = ref<HTMLDivElement | null>(null)
const filters = ref({
  search: '',
})
const permissions = ref<Permission[]>([])
const roles = ref<Role[]>([])
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

  axiosInstance.get('/api/users/getRelatedLists')
  .then(response => {
    permissions.value = response.data.permissions
    roles.value = response.data.roles
  })
  .catch(error => {
    console.error('Error fetching related lists:', error)
  })

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

  <Form :apiUrl="apiUrl" :permissions="permissions" :roles="roles" />

  <SidebarLayout>

        <template #header>
            <div class="flex justify-between items-center flex-1"> 
              <h1 class="text-xl font-semibold">Users</h1>
              <Button v-if="abilities.canCreate" variant="default" size="sm" @click="handleOpenForm()">Create User</Button>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead v-if="abilities.showActions" class="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow v-for="user in records" :key="user.id">
                  <TableCell class="font-medium">
                  {{ user.name }}
                  </TableCell>
                  <TableCell>{{ user.email }}</TableCell>
                  <TableCell class="w-full">
                    <div class="flex flex-wrap gap-2">
                      <Badge variant="outline" v-for="role in user.roles" :key="role.id">
                          {{ role.name }}
                        </Badge>
                    </div>
                  </TableCell>
                  <TableCell class="w-full">
                    <div class="flex flex-wrap gap-2">
                      <Badge variant="outline" v-for="permission in user.permissions" :key="permission.id">
                        {{ permission.name }}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell v-if="abilities.showActions">
                      <div class="flex gap-2 justify-end">
                        <Edit v-if="abilities.canEdit" @click="handleOpenForm(user)" class="size-5 cursor-pointer" />
                        <Trash v-if="abilities.canDelete && isDeleting !== user.id" class="size-5 cursor-pointer text-red-500 dark:text-red-400" @click="deleteRecord(apiUrl, user.id)" />
                        <Badge variant="destructive" v-if="isDeleting === user.id">
                          <Spinner /> Deleting...
                        </Badge>
                      </div>
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

