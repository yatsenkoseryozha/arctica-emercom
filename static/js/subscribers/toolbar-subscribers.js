store.subscribe(['SET-CATEGORIES'], (state) => {
    let selects = document.getElementsByClassName('categories-list')
    let groups = document.getElementsByClassName('categories-options-group')
    for (let i = 0; i < selects.length; i++) {
        groups[i].innerHTML = ''
        state.toolbar.categories.map(category => {
            let option = document.createElement('option')
            option.className = 'categories-option'
            option.innerHTML = category.name
            groups[i].append(option)
        })
        selects[i].removeAttribute('disabled')
    }
})

store.subscribe(['SET-CURRENT-CATEGORY'], (state) => {
    let options = document.getElementsByClassName('categories-option')
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === state.toolbar.currentCategory.name)
            options[i].selected = true
    }
})

store.subscribe(['SET-OBJECTS', 'DELETE-OBJECT'], (state) => {
    let selects = document.getElementsByClassName('objects-list')
    let groups = document.getElementsByClassName('objects-options-group')
    for (let i = 0; i < selects.length; i++) {
        groups[i].innerHTML = ''
        state.toolbar.currentCategory.objects.map(object => {
            let option = document.createElement('option')
            option.className = 'objects-option'
            option.innerHTML = object.name
            groups[i].append(option)
        })
    }

    if (state.toolbar.currentCategory.objects.length > 0) {
        document.getElementById('map-objects-list').removeAttribute('disabled')
        document.getElementById('update-category-display-button').value = `${
            (state.toolbar.currentCategory.objects.every(object => object.displayed)) ? 'Скрыть все' : 'Показать все'
        }`
        document.getElementById('update-category-display-button').removeAttribute('disabled')
    } else {
        document.getElementById('map-objects-list').disabled = true
        document.getElementById('update-category-display-button').disabled = true
        document.getElementById('update-object-display-button').disabled = true
    }
})

store.subscribe(['SET-CURRENT-OBJECT'], (state) => {
    if (state.toolbar.currentObject) {
        let options = document.getElementsByClassName('objects-option')
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === state.toolbar.currentObject.name) 
                options[i].selected = true
        }

        document.getElementById('delete-object-button').removeAttribute('disabled')
        document.getElementById('update-object-display-button').removeAttribute('disabled')
        document.getElementById('update-object-display-button').value = `${(state.toolbar.currentObject.displayed) ? 'Скрыть' : 'Показать'}`
    } else {
        document.getElementById('delete-object-button').disabled = true
        document.getElementById('update-object-display-button').disabled = true
    }
})

store.subscribe(['UPDATE-CATEGORY-DISPLAY', 'UPDATE-OBJECT-DISPLAY'], (state) => {
    document.getElementById('update-category-display-button').value = `${
        (state.toolbar.currentCategory.objects.every(object => object.displayed)) ? 'Скрыть все' : 'Показать все'
    }`
    if (state.toolbar.currentObject)
        document.getElementById('update-object-display-button').value = `${(state.toolbar.currentObject.displayed) ? 'Скрыть' : 'Показать'}`
})

store.subscribe(['SET-TOOLBAR-TAB'], (state) => {
    switch(state.toolbar.toolbarTab) {
        case 'MAP-TOOLBAR': {
            document.getElementById('db-toolbar').style.display = 'none'
            document.getElementById('map-toolbar').style.display = 'block'
            document.getElementById('toolbar-tab-button').setAttribute('onclick', 'setToolbarTab("DB-TOOLBAR")')
            document.getElementById('toolbar-tab-button').innerHTML = 'работать с базой'
            break
        }
        case 'DB-TOOLBAR': {
            document.getElementById('db-toolbar').style.display = 'block'
            document.getElementById('map-toolbar').style.display = 'none'
            document.getElementById('toolbar-tab-button').setAttribute('onclick', 'setToolbarTab("MAP-TOOLBAR")')
            document.getElementById('toolbar-tab-button').innerHTML = 'работать с картой'
            break
        }
        default: break
    }
})

store.subscribe(['SET-OBJECTS-TAB'], (state) => {
    switch(state.toolbar.objectsTab) {
        case 'OBJECTS': {
            document.getElementById('db-objects-list').style.display = 'block'
            document.getElementById('new-object-name').style.display = 'none'
            document.getElementById('new-object-website').style.display = 'none'
            document.getElementById('new-object-coordinates').style.display = 'none'
            document.getElementById('create-object-button').style.display = 'none'
            document.getElementById('delete-object-button').style.display = 'block'
            document.getElementById('db-objects-tab-button').setAttribute('onclick', 'setObjectsTab("NEW-OBJECT")')
            document.getElementById('db-objects-tab-button').innerHTML = 'создать новый'
            document.getElementById('db-objects-tab-button').style.display = 'block'
            break
        }
        case 'NEW-OBJECT': {
            document.getElementById('db-objects-list').style.display = 'none'
            document.getElementById('new-object-name').style.display = 'block'
            document.getElementById('new-object-website').style.display = 'block'
            document.getElementById('new-object-coordinates').style.display = 'flex'
            document.getElementById('create-object-button').style.display = 'block'
            document.getElementById('delete-object-button').style.display = 'none'
            document.getElementById('db-objects-tab-button').setAttribute('onclick', 'setObjectsTab("OBJECTS")')
            document.getElementById('db-objects-tab-button').innerHTML = 'выбрать существующий'
            if (state.toolbar.currentCategory.objects.length > 0) document.getElementById('db-objects-tab-button').style.display = 'block'
            else document.getElementById('db-objects-tab-button').style.display = 'none'
            break
        }
        default: break
    }
})

store.subscribe(['CREATE-OBJECT'], (state) => {
    document.getElementById('new-object-name').value = ''
    document.getElementById('new-object-website').value = ''
    document.getElementById('new-object-longitude').value = ''
    document.getElementById('new-object-latitude').value = ''
})