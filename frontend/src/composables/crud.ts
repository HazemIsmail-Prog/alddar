import axiosInstance from "@/lib/axios"
import { ref } from "vue"

const useCrud = <T>() => {

    const records = ref<T[]>([])
    const total = ref(0)
    const nextPageUrl = ref(null)
    const isLoading = ref(false)
    const isLoadingMore = ref(false)
    const isSubmitting = ref(false)
    const isDeleting = ref<number | null>(null)

    const isFormOpen = ref(false)
    const selectedRecord = ref<T | null>(null)
    const formErrors = ref<any>({})

    const getRecords = (url: string, params: any = {}) => {
        isLoading.value = true
        axiosInstance.get(url, { params })
        .then(response => {
            records.value = response.data.data
            total.value = response.data.total
            nextPageUrl.value = response.data.next_page_url
        })
        .catch(error => {
            console.error('Error fetching records:', error)
        })
        .finally(() => {
            isLoading.value = false
        })
    }

    const loadMoreRecords = (params: any = {}) => {
        if (!nextPageUrl.value) {
            return
        }
        isLoadingMore.value = true
        axiosInstance.get(nextPageUrl.value, { params })
        .then(response => {
            records.value = [...records.value, ...response.data.data]
            nextPageUrl.value = response.data.next_page_url
        })
        .catch(error => {
            console.error('Error loading more records:', error)
        })
        .finally(() => {
            isLoadingMore.value = false
        })
    }
    

    const createRecord = (url: string, payload: any) => {
        isSubmitting.value = true
        axiosInstance.post(url, payload)
        .then(response => {
            records.value.unshift(response.data)
            total.value = total.value + 1
            isFormOpen.value = false
            selectedRecord.value = null
        })
        .catch(error => {
            console.error('Error creating record:', error)
            formErrors.value = error.response.data.errors
        })
        .finally(() => {
            isSubmitting.value = false
        })
    }
    
    const updateRecord = (url: string, id: number, payload: any) => {
        isSubmitting.value = true
        axiosInstance.put(`${url}/${id}`, payload)
        .then(response => {
            records.value = records.value.map((item: any) => item.id === response.data.id ? response.data : item)
            isFormOpen.value = false
            selectedRecord.value = null
        })
        .catch(error => {
            console.error('Error updating record:', error)
            formErrors.value = error.response.data.errors
        })
        .finally(() => {
            isSubmitting.value = false
        })
    }

    const deleteRecord = (url: string, id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) {
            return
        }
        isDeleting.value = id
        axiosInstance.delete(`${url}/${id}`)
        .then(() => {
            records.value = records.value.filter((item: any) => item.id !== id)
            total.value = total.value - 1
        })
        .catch(error => {
            console.error('Error deleting record:', error)
        })
        .finally(() => {
            isDeleting.value = null
        })
    }

    const handleOpenForm = (record: T | null = null) => {
        formErrors.value = {}
        isFormOpen.value = true
        selectedRecord.value = record 
    }

    return {
        getRecords,
        createRecord,
        updateRecord,
        deleteRecord,
        loadMoreRecords,
        handleOpenForm,
        records,
        total,
        nextPageUrl,
        isLoading,
        isLoadingMore,
        isSubmitting,
        isDeleting,
        isFormOpen,
        selectedRecord,
        formErrors,
    }
}

export default useCrud