const toolbarInitialState = {
    categories: [],
    currentCategory: undefined,
    currentObject: undefined,
    toolbarTab: 'MAP-TOOLBAR',
    categoriesTab: 'CATEGORIES',
    newCategoryIcon: undefined,
    objectsTab: undefined
}

const toolbarReducer = (state = toolbarInitialState, action) => {
    switch(action.type) {
        case 'SET-CATEGORIES': {
            action.categories.map(category => {
                if (!state.categories.some(stateCategory => stateCategory._id === category._id)) {
                    category.objects = []
                    state.categories.push(category)
                }
            })

            return state
        }
        case 'SET-CURRENT-CATEGORY': {      
            state.currentCategory = state.categories.find(category => category.name === action.name)

            return state
        }
        case 'UPDATE-CATEGORY-DISPLAY': {
            state.currentCategory.displayed = !state.currentCategory.displayed

            state.currentCategory.objects.map(object => object.displayed = state.currentCategory.displayed)

            return state
        }
        case 'SET-OBJECTS': {            
            let currentCategory = {...state.currentCategory}

            action.objects.map(object => {
                if (!state.currentCategory.objects.some(currentCategoryObject => object._id === currentCategoryObject._id)) {
                    object.geoObject = new ymaps.Placemark([object.coordinates.longitude, object.coordinates.latitude], {
                        hintContent: object.name,
                        balloonContent: `
                        <h3><a href=${object.website}>${object.name}</a></h3>
                        `
                    }, {
                        iconLayout: "default#image",
                        iconImageHref: currentCategory.icon,
                        iconImageSize: [60, 60],
                    })
            
                    object.geoObject.events.add('balloonopen', async () => {
                        await setCurrentCategory(currentCategory.name)
                        setCurrentObject(object.name)
                    })

                    object.displayed = false

                    state.currentCategory.objects.push(object)
                }
            })
            
            return state
        }
        case 'SET-CURRENT-OBJECT': {
            if (state.currentCategory)
                state.currentObject = state.currentCategory.objects.find(object => object.name === action.name)
            else state.currentObject = undefined
            
            return state
        }
        case 'UPDATE-OBJECT-DISPLAY': {
            state.currentObject.displayed = !state.currentObject.displayed
            
            state.currentCategory.displayed = state.currentCategory.objects.every(object => object.displayed)

            return state
        }
        case 'SET-TOOLBAR-TAB': {
            state.toolbarTab = action.tab

            return state
        }
        case 'SET-CATEGORIES-TAB': {
            state.categoriesTab = action.tab

            return state
        }
        case 'SET-NEW-CATEGORY-ICON': {
            state.newCategoryIcon = action.filename

            return state
        }
        case 'CREATE-CATEGORY': {
            state.newCategoryIcon = ''

            return state
        }
        case 'DELETE-CATEGORY': {
            state.categories.map((category, index) => {
                if (category._id === state.currentCategory._id) 
                    state.categories.splice(index, 1)
            })
            
            return state
        }
        case 'SET-OBJECTS-TAB': {
            state.objectsTab = action.tab

            return state
        }
        case 'DELETE-OBJECT': {
            state.currentCategory.objects.map((object, index) => {
                if (object._id === state.currentObject._id) 
                    state.currentCategory.objects.splice(index, 1)
            })
            
            return state
        }
        default: return state
    }
}

const setCategoriesActionCreator = (categories) => ({ type: 'SET-CATEGORIES', categories })
const setCurrentCategoryActionCreator = (name) => ({ type: 'SET-CURRENT-CATEGORY', name }) 
const updateCategoryDisplayActionCreator = () => ({ type: 'UPDATE-CATEGORY-DISPLAY' }) 
const setObjectsActionCreator = (objects) => ({ type: 'SET-OBJECTS', objects }) 
const setCurrentObjectActionCreator = (name) => ({ type: 'SET-CURRENT-OBJECT', name })
const updateObjectDisplayActionCreator = () => ({ type: 'UPDATE-OBJECT-DISPLAY' }) 
const setToolbarTabActionCreator = (tab) => ({ type: 'SET-TOOLBAR-TAB', tab })
const setCategoriesTabActionCreator = (tab) => ({ type: 'SET-CATEGORIES-TAB', tab })
const setNewCategoryIconActionCreator = (filename) => ({ type: 'SET-NEW-CATEGORY-ICON', filename })
const createCategoryActionCreator = () => ({ type: 'CREATE-CATEGORY' })
const deleteCategoryActionCreator = () => ({ type: 'DELETE-CATEGORY' })
const setObjectsTabActionCreator = (tab) => ({ type: 'SET-OBJECTS-TAB', tab })
const createObjectActionCreator = () => ({ type: 'CREATE-OBJECT' })
const deleteObjectActionCreator = () => ({ type: 'DELETE-OBJECT' })