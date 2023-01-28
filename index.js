const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const port = 3000

mongoose.set("strictQuery", false)
mongoose.connect('[Information]')
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})