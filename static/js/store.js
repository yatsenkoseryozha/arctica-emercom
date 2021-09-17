let store = new SimpleStore()

store.combineReducers({
    map: mapReducer,
    toolbar: toolbarReducer
})