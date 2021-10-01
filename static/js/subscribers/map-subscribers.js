store.subscribe(['UPDATE-REGIONS-DISPLAY'], (state) => {
    if (state.map.regions.every(region => region.displayed))
        state.map.regions.map(region => state.map.map.geoObjects.add(region))
    else
        state.map.regions.map(region => state.map.map.geoObjects.remove(region))
})

store.subscribe(['UPDATE-ARCTIC-DISPLAY'], (state) => {
    if (state.map.arctic.displayed)
        state.map.map.geoObjects.add(state.map.arctic.geoObject)
    else
        state.map.map.geoObjects.remove(state.map.arctic.geoObject)
})

store.subscribe(['UPDATE-CATEGORY-DISPLAY'], (state) => {
    if (state.toolbar.currentCategory.objects) {
        if (state.toolbar.currentCategory.displayed)
            state.toolbar.currentCategory.objects.map(object => state.map.map.geoObjects.add(object.geoObject))
        else
            state.toolbar.currentCategory.objects.map(object => state.map.map.geoObjects.remove(object.geoObject))
    }
})

store.subscribe(['DELETE-CATEGORY'], (state) => {
    state.toolbar.currentCategory.objects.map(object => {
        if (object.displayed) state.map.map.geoObjects.remove(object.geoObject)
    })
})

store.subscribe(['UPDATE-OBJECT-DISPLAY'], (state) => {
    if (state.toolbar.currentObject) {
        if (state.toolbar.currentObject.displayed) {
            state.map.map.geoObjects.add(state.toolbar.currentObject.geoObject)
            state.map.map.setCenter([state.toolbar.currentObject.coordinates.latitude, state.toolbar.currentObject.coordinates.longitude])
        } else
            state.map.map.geoObjects.remove(state.toolbar.currentObject.geoObject)
    }
})

store.subscribe(['DELETE-OBJECT'], (state) => {
    state.map.map.geoObjects.remove(state.toolbar.currentObject.geoObject)
})