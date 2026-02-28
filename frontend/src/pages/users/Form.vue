<script setup lang="ts">
import { toggleItemInList, filteredListByKey } from '@/composables/helpers'
import type { User, UserForm, Permission, Role } from '@/types'
import { CircleCheck, Search } from 'lucide-vue-next'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ref, watch ,inject } from 'vue'
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group'
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

const roleSearch = ref('')
const permissionSearch = ref('')
const form = ref<UserForm>({
    name: '',
    email: '',
    password: '',
    file: '',
    permission_ids: [],
    role_ids: [],
})
const props = defineProps<{
    apiUrl: string
    permissions: Permission[]
    roles: Role[]
}>()

const crud = inject<ReturnType<typeof useCrud<User>>>('sharedCrud')!
const { isFormOpen, selectedRecord, updateRecord, createRecord, isSubmitting, formErrors } = crud

// watch if isFormOpen state is changed
watch(isFormOpen, (newVal) => {

    if (newVal) {
        // when isFormOpen
        if (selectedRecord.value) {
            form.value = {
                ...selectedRecord.value,
                permission_ids: selectedRecord.value.permissions.map(permission => permission.id),
                role_ids: selectedRecord.value.roles.map(role => role.id),
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
        email: '',
        password: '',
        file: '',
        permission_ids: [],
        role_ids: [],
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
                <SheetTitle>{{ selectedRecord ? 'Edit User' : 'Create User' }}</SheetTitle>
                <SheetDescription>
                {{ selectedRecord ? 'Edit user details' : 'Create a new user' }}
                </SheetDescription>
            </SheetHeader>

            <div class="grid flex-1 auto-rows-min gap-4 px-4 overflow-y-auto">

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

                <Field>
                    <FieldLabel for="email">
                        Email
                    </FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        v-model="form.email"
                        :aria-invalid="formErrors.email ? true : false"
                    />
                    <FieldError :errors="formErrors.email" />
                </Field>

                <Field>
                    <FieldLabel for="password">
                        Password
                    </FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        v-model="form.password"
                        :aria-invalid="formErrors.password ? true : false"
                    />
                    <FieldError :errors="formErrors.password" />
                </Field>

                <Field class="p-3 shadow-md rounded-md bg-primary-foreground">
                    <FieldLabel for="roles">Roles</FieldLabel>
                    <InputGroup>
                        <InputGroupInput type="search" placeholder="Search..." v-model="roleSearch" />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>
                    <div class="flex flex-wrap gap-2">
                        <Button
                            v-for="role in filteredListByKey(props.roles, 'name', roleSearch)"
                            :key="role.id"
                            type="button"
                            variant="outline"
                            size="sm"
                            :class="{ 'border-primary text-primary': form.role_ids?.includes(role.id) }"
                            class="w-fit rounded-full text-xs h-6"
                            @click="form.role_ids = toggleItemInList(role.id, form.role_ids ?? [])"
                        >
                            <CircleCheck v-if="form.role_ids?.includes(role.id)" class="duration-300 transition-all text-white fill-primary size-5" />
                            {{ role.name }}
                        </Button>
                    </div>
                    <FieldError :errors="formErrors.role_ids" />
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
                            @click="form.permission_ids = toggleItemInList(permission.id, form.permission_ids ?? [])"
                        >
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