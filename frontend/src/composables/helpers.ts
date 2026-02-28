
export const toggleItemInList = (itemId: number, list: number[]) => {
    if (list.includes(itemId)) {
        return list.filter(id => id !== itemId)
    } else {
        return [...list, itemId]
    }
}


export const filteredListByKey = (list: any[], key: string, search: string) => {
    return list.filter(item => item[key].toLowerCase().includes(search.toLowerCase()))
}