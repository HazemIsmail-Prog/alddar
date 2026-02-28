<script setup lang="ts">
import { toggleItemInList, filteredListByKey } from '@/composables/helpers'
import type { Role, RoleForm, Permission } from '@/types'
import { CircleCheck, Search } from 'lucide-vue-next'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ref, watch ,inject } from 'vue'
import useCrud from '@/composables/crud'
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
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group'

const permissionSearch = ref('')
const form = ref<RoleForm>({
    name: '',
    permission_ids: [],
})
const props = defineProps<{
    apiUrl: string
    permissions: Permission[]
}>()

const crud = inject<ReturnType<typeof useCrud<Role>>>('sharedCrud')!
const { isFormOpen, selectedRecord, updateRecord, createRecord, isSubmitting, formErrors } = crud

// watch if isFormOpen state is changed
watch(isFormOpen, (newVal) => {

    if (newVal) {
        // when isFormOpen
        if (selectedRecord.value) {
            form.value = {
                ...selectedRecord.value,
                permission_ids: selectedRecord.value.permissions.map(permission => permission.id),
            }
        }
    } else {
        // when isFormClose
        resetSheet()
    }
})

const resetSheet = () => {
    form.value = {
        name: '',
        permission_ids: [],
    }
    selectedRecord.value = null
}

const handleSubmitForm = () => {
    if (selectedRecord.value) {
        updateRecord(props.apiUrl, selectedRecord.value.id, form.value)
    } else {
        createRecord(props.apiUrl, form.value)
    }
}



</script>

<template>
    <Sheet :open="isFormOpen" @update:open="isFormOpen = false">

        <SheetContent as="form" @submit.prevent="handleSubmitForm">

            <SheetHeader>
                <SheetTitle>{{ selectedRecord ? 'Edit Role' : 'Create Role' }}</SheetTitle>
                <SheetDescription>
                {{ selectedRecord ? 'Edit role details' : 'Create a new role' }}
                </SheetDescription>
            </SheetHeader>

            <div class="grid flex-1 auto-rows-min gap-4 px-4">

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
                <Field class="p-3 shadow-md rounded-md bg-primary-foreground">
                    <FieldLabel for="permissions">Permissions</FieldLabel>
                    <InputGroup>
                        <InputGroupInput type="search" placeholder="Search..." v-model="permissionSearch" />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    <div class="flex flex-wrap gap-2">
                        <Button
                            v-for="permission in filteredListByKey(props.permissions, 'name', permissionSearch)"
                            :key="permission.id"
                            type="button"
                            variant="outline"
                            size="sm"
                            :class="{ 'border-primary text-primary': form.permission_ids?.includes(permission.id) }"
                            class="w-fit rounded-full text-xs h-6"
                            @click="form.permission_ids = toggleItemInList(permission.id, form.permission_ids ?? [])">
                            <CircleCheck v-if="form.permission_ids?.includes(permission.id)" class="duration-300 transition-all text-white fill-primary size-5" />
                            {{ permission.name }}
                        </Button>
                    </div>
                    <FieldError :errors="formErrors.permission_ids" />
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