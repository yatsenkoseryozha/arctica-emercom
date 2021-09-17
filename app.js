require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')

const Category = require('./models/Category')
const ArcticObject = require('./models/Object')

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
  } catch (err) {
    console.log(err)
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