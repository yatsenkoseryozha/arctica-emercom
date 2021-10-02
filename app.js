require('dotenv').config()
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Category = require('./models/Category')
const ArcticObject = require('./models/Object')
const User = require('./models/User')

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
    const category = request.headers['category-id']
    const objects = await ArcticObject.find({ category })
    return response.status(200).json({ objects })
  } catch (error) {
    console.log(error)
  }
})

app.post('/registration', async (request, response) => {
  try {
    const { username, accessKey } = request.body
    const hashAccessKey = bcrypt.hashSync(accessKey, 7)
    const user = new User({ name: username, role: '', accessKey: hashAccessKey })
    user.save()
    return response.status(200).json({ message: "Пользователь создан!"})
  } catch (error) {
    console.log(error)
  }
})

app.get('/login', async (request, response) => {
  try {
    const accessKey = request.headers['access-key']
    if (!accessKey)
      return response.status(403).json({ message: "Нет доступа!" })
    let candidate = undefined
    const users = await User.find({})
    users.map(user => {
      if (bcrypt.compareSync(accessKey, user.accessKey)) 
        candidate = user
    })
    if (!candidate)
      return response.status(403).json({ message: "Нет доступа!" })
    return response.status(200).json({ user: candidate.name, accessKey: jwt.sign(candidate.accessKey, process.env.JWT_SECRET)})
  } catch (error) {
    console.log(error)
  }
})

const auth = (action) => async (request, response, next) => {
  const accessKey = request.headers['access-key']
  if (!accessKey)
    return response.status(403).json({ message: "Нет доступа!" })
  const decodedAccessKey = jwt.verify(accessKey, process.env.JWT_SECRET)
  const user = await User.findOne({ accessKey: decodedAccessKey })
  if (!user)
    return response.status(403).json({ message: "Нет доступа!" })
  if (action === 'CREATE-CATEGORY' || action === 'DELETE-CATEGORY') {
    if (user.role !== 'admin') 
      return response.status(403).json({ message: "Нет доступа!" })
    next()
  } else if (action === 'CREATE-OBJECT') {
    const category = await Category.findOne({ _id: request.body.category })
    if (category.name !== 'Другие объекты' && user.role !== 'admin')
      return response.status(403).json({ message: "Нет доступа!" })
    next()
  } else if (action === 'DELETE-OBJECT') {
    const object = await ArcticObject.findOne({ _id: request.headers['object-id'] })
    const category = await Category.findOne({ _id: object.category })
    if (category.name !== 'Другие объекты' && user.role !== 'admin')
      return response.status(403).json({ message: "Нет доступа!" })
    next()
  } else return response.status(404).json({ message: "Некорректный запрос!" })
}

const createCategory = async (request, response, next) => {
  const category = new Category({})
  await category.save()
  request.category_id = category._id
  next()
}

app.post('/create-category', [auth('CREATE-CATEGORY'), createCategory, uploadCategoryIcon.single('icon')], async (request, response) => {
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

app.delete('/delete-category', auth('DELETE-CATEGORY'), async (request, response) => {
  try {
    const id = request.headers['category-id']
    await Category.deleteOne({ _id: id })
    await ArcticObject.deleteMany({ category: id })
    fs.unlinkSync(__dirname + `/static/img/categories/${id}.png`)
    return response.status(200).json({ message: "Категория успешно удалена!" })
  } catch (error) {
    console.log(error)
  }
})

app.post('/create-object', auth('CREATE-OBJECT'), async (request, response) => {
  try {
    const { name, category, coordinates, website } = request.body
    const object = new ArcticObject({ name, category, coordinates, website })
    await object.save()
    return response.status(200).json({ message: "Объект успешно создан!", object })
  } catch (error) {
    console.log(error)
  }
})

app.delete('/delete-object', auth('DELETE-OBJECT'), async (request, response) => {
  try {
    const id = request.headers['object-id']
    await ArcticObject.remove({ _id: id })
    return response.status(200).json({ message: "Объект успешно удален!" })
  } catch (error) {
    console.log(error)
  }
})