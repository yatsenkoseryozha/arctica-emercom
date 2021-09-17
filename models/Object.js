const {Schema, model} = require('mongoose')

const ArcticObject = new Schema({
    name: String,
    category: String,
    coordinates: Object,
    website: String
}, {timestamps: true}) 

module.exports = model('Object', ArcticObject)
