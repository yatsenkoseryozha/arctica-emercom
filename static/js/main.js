const start = async () => {
    store.disptach(initMapActionCreator())

    getCategories()
}
ymaps.ready(start)

const updateRegionsDisplay = () => store.disptach(updateRegionsDisplayActionCreator())

const updateArcticDisplay = () => store.disptach(updateArcticDisplayActionCreator())

const getCategories = async () => {
    let response = await fetch('/get-categories', {
        method: 'GET'
    })
    let data = await response.json()

    store.disptach(setCategoriesActionCreator(data.categories))

    setCategoriesTab('CATEGORIES')
}

const setCurrentCategory = async (category) => {
    store.disptach(setCurrentCategoryActionCreator(category))

    await getObjects()
    setCurrentObject('')
}

const updateCategoryDisplay = () => store.disptach(updateCategoryDisplayActionCreator())

const getObjects = async () => {
    if (store.getState().toolbar.currentCategory) {
        let response = await fetch('/get-objects', {
            method: 'GET',
            headers: {
                category: store.getState().toolbar.currentCategory._id
            }
        })
        let data = await response.json()

        store.disptach(setObjectsActionCreator(data.objects))

        if (data.objects.length > 0) setObjectsTab('OBJECTS')
        else setObjectsTab('NEW-OBJECT')
    } else {
        store.disptach(setObjectsActionCreator([]))
    }
}

const setCurrentObject = (object) => store.disptach(setCurrentObjectActionCreator(object))

const updateObjectDisplay = () => store.disptach(updateObjectDisplayActionCreator())

const setToolbarTab = (tab) => store.disptach(setToolbarTabActionCreator(tab))

const setCategoriesTab = (tab) => store.disptach(setCategoriesTabActionCreator(tab))

const setNewCategoryIcon = () => {
    let filename = document.getElementById('new-category-icon').value.replace(/C:\\fakepath\\/, '')
    store.disptach(setNewCategoryIconActionCreator(filename))
}

const createCategory = async () => {
    var formData = new FormData();
    formData.append('name', document.getElementById('new-category-name').value)
    formData.append('icon', document.getElementById('new-category-icon').files[0])

    let response = await fetch('/create-category', {
        method: 'POST',
        body: formData
    })
    let data = await response.json()
    console.log(data.category)

    await getCategories()
    setCurrentCategory(data.category.name)

    store.disptach(createCategoryActionCreator())
}

const deleteCategory = async () => {
    let response = await fetch('/delete-category', {
        method: 'DELETE',
        headers: {
            id: store.getState().toolbar.currentCategory._id
        }
    })
    let data = await response.json()

    store.disptach(deleteCategoryActionCreator())
    setCurrentCategory('')
}

const setObjectsTab = (tab) => store.disptach(setObjectsTabActionCreator(tab))

const createObject = async () => {
    let response = await fetch('/create-object', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            name: document.getElementById('new-object-name').value, 
            category: store.getState().toolbar.currentCategory._id, 
            coordinates: {
                longitude: document.getElementById('new-object-longitude').value, 
                latitude: document.getElementById('new-object-latitude').value
            }, 
            website: document.getElementById('new-object-website').value
        })
    })
    let data = await response.json()

    await getObjects()
    setCurrentObject(data.object.name)

    store.disptach(createObjectActionCreator())
}

const deleteObject = async () => {
    let response = await fetch('/delete-object', {
        method: 'DELETE',
        headers: {
            id: store.getState().toolbar.currentObject._id
        }
    })
    let data = await response.json()

    store.disptach(deleteObjectActionCreator())
    setCurrentObject('')

    if (store.getState().toolbar.currentCategory.objects.length > 0) setObjectsTab('OBJECTS')
    else setObjectsTab('NEW-OBJECT')
}