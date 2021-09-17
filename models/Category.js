const {Schema, model} = require('mongoose')

const Category = new Schema({
    name: String,
    icon: String
}, {timestamps: true})

module.exports = model('Category', Category)