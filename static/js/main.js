const start = async () => {
    store.disptach(initMapActionCreator())

    if (sessionStorage.getItem('Toolbar-Tab'))
        store.disptach(setToolbarTabActionCreator(sessionStorage.getItem('Toolbar-Tab')))

    if (sessionStorage.getItem('User'))
        store.disptach(setCurrentUserActionCreator(sessionStorage.getItem('User')))

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
                'Category-ID': store.getState().toolbar.currentCategory._id
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

const setToolbarTab = (tab) => {
    sessionStorage.setItem('Toolbar-Tab', tab)

    store.disptach(setToolbarTabActionCreator(tab))
}

const login = async () => {
    let response = await fetch('/login', {
        method: 'GET',
        headers: {
            'Access-Key': document.getElementById('access-key').value
        },
    })
    let data = await response.json()

    if (response.status == 200) {
        sessionStorage.setItem('User', data.user)
        sessionStorage.setItem('Access-Key', data.accessKey)

        store.disptach(setCurrentUserActionCreator(data.user))
    } else alert(data.message)
}

const logout = () => {
    sessionStorage.removeItem('User')
    sessionStorage.removeItem('Access-Key')

    store.disptach(removeCurrentUserActionCreator())
}

const getAccessKey = async () => {
    if (sessionStorage.getItem('Access-Key')) 
        return sessionStorage.getItem('Access-Key')
    else {
        let response = await fetch('/login', {
            method: 'GET',
            headers: {
                'Access-Key': document.getElementById('access-key').value
            },
        })
        let data = await response.json()

        if (response.status == 200)
            return data.accessKey
        else return document.getElementById('access-key').value
    }
}

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
        headers: {
            'Access-Key': await getAccessKey()
        },
        body: formData
    })
    let data = await response.json()

    if (response.status == 200) {
        await getCategories()
        setCurrentCategory(data.category.name)

        store.disptach(createCategoryActionCreator())
    } else alert(data.message)
}

const deleteCategory = async () => {
    let response = await fetch('/delete-category', {
        method: 'DELETE',
        headers: {
            'Access-Key': await getAccessKey(),
            'Category-ID': store.getState().toolbar.currentCategory._id
        }
    })
    let data = await response.json()

    if (response.status == 200) {
        store.disptach(deleteCategoryActionCreator())
        setCurrentCategory('')
    } else alert(data.message)
}

const setObjectsTab = (tab) => store.disptach(setObjectsTabActionCreator(tab))

const createObject = async () => {
    let response = await fetch('/create-object', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Key': await getAccessKey()
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

    if (response.status == 200) {
        await getObjects()
        setCurrentObject(data.object.name)

        store.disptach(createObjectActionCreator())
    } else alert(data.message)
}

const deleteObject = async () => {
    let response = await fetch('/delete-object', {
        method: 'DELETE',
        headers: {
            'Access-Key': await getAccessKey(),
            'Object-ID': store.getState().toolbar.currentObject._id
        }
    })
    let data = await response.json()

    if (response.status == 200) {
        store.disptach(deleteObjectActionCreator())
        setCurrentObject('')

        if (store.getState().toolbar.currentCategory.objects.length > 0) setObjectsTab('OBJECTS')
        else setObjectsTab('NEW-OBJECT')
    } else alert(data.message)
}