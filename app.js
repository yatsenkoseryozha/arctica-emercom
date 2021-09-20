require('dotenv').config()
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')

const Category = require('./models/Category')
const ArcticObject = require('./models/Object')

const categoryIconStorage = multer.diskStorage({
  destination: (request, file, cb) => {
    cb(null, __dirname + '/static/img/categories')
  },
  filename: (request, file, cb) => {
    cb(null, request.category_id + '.png')
  }
})

const uploadCategoryIcon = multer({ storage: categoryIconStorage })

const app = express()

app.use(express.json())
app.use(express.static(__dirname + '/static'))

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { 
      useNewUrlParser: true,
      useUnifiedTopology: true 
    })
    app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}...`))
  } catch (error) {
    console.log(error)
  }
}
start()

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/index.html')
})

app.get('/get-categories', async (request, response) => {
  try {
    const categories = await Category.find({})
    return response.status(200).json({ categories })
  } catch (error) {
    console.log(error)
  }
})

app.get('/get-objects', async (request, response) => {
  try {
    const { category } = request.headers
    const objects = await ArcticObject.find({ category })
    return response.status(200).json({ objects })
  } catch (error) {
    console.log(error)
  }
})

const createCategory = async (request, response, next) => {
  const category = new Category({})
  await category.save()
  request.category_id = category._id
  next()
}

app.post('/create-category', [createCategory, uploadCategoryIcon.single('icon')], async (request, response) => {
  try {
    await Category.updateOne({ _id: request.category_id }, {
      $set: { name: request.body.name, icon: `../img/categories/${request.file.filename}` }
    })
    const category = await Category.findOne({ _id: request.category_id })
    return response.status(200).json({ message: "Категория успешно создана!", category })
  } catch (error) {
    console.log(error)
  }
})

app.delete('/delete-category', async (request, response) => {
  try {
    const { id } = request.headers
    await Category.deleteOne({ _id: id })
    await ArcticObject.deleteMany({ category: id })
    fs.unlinkSync(__dirname + `/static/img/categories/${id}.png`)
    return response.status(200).json({ message: "Категория успешно удалена!" })
  } catch (error) {
    console.log(error)
  }
})

app.post('/create-object', async (request, response) => {
  try {
    const { name, category, coordinates, website } = request.body
    const object = new ArcticObject({ name, category, coordinates, website })
    await object.save()
    return response.status(200).json({ message: "Объект успешно создан!", object })
  } catch (error) {
    console.log(error)
  }
})

app.delete('/delete-object', async (request, response) => {
  try {
    const { id } = request.headers
    await ArcticObject.remove({ _id: id })
    return response.status(200).json({ message: "Объект успешно удален!" })
  } catch (error) {
    console.log(error)
  }
})