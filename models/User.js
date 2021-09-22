const {Schema, model} = require('mongoose')

const User = new Schema({
    name: String,
    role: String,
    accessKey: String
}, {timestamps: true}) 

module.exports = model('User', User)
