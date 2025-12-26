
export const filterCategories = (categories, role) => {
    return categories.filter((category) => {
        if (!category.role || category.role.includes(role)) {
            if (role === 'Admin') {
                return category.name 
            }
            return true
        }
        return false
    })
}
