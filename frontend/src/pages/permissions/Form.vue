<script setup lang="ts">
import type { Permission, PermissionForm } from '@/types'
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

const form = ref<PermissionForm>({
    name: '',
    group: '',
})

const props = defineProps<{
    apiUrl: string
}>()

const crud = inject<ReturnType<typeof useCrud<Permission>>>('sharedCrud')!
const { isFormOpen, selectedRecord, updateRecord, createRecord, isSubmitting, formErrors } = crud

// watch if isFormOpen state is changed
watch(isFormOpen, (newVal) => {

    if (newVal) {
        // when isFormOpen
        if (selectedRecord.value) {
            form.value = {...selectedRecord.value}
        }
    } else {
        // when isFormClose
        resetSheet()
    }
})

const resetSheet = () => {
    form.value = {
        name: '',
        group: '',
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
                <SheetTitle>{{ selectedRecord ? 'Edit Permission' : 'Create Permission' }}</SheetTitle>
                <SheetDescription>
                {{ selectedRecord ? 'Edit permission details' : 'Create a new permission' }}
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
                <Field>
                    <FieldLabel for="group">
                        Group
                    </FieldLabel>
                    <Input
                        id="group"
                        type="text"
                        v-model="form.group"
                        :aria-invalid="formErrors.group ? true : false"
                    />
                    <FieldError :errors="formErrors.group" />
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