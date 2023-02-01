const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const config = require('./config/key')
const { User } = require('./models/user')

// application/x-www-form-urlencoded
// 위와 같은 데이터를 분석해서 가져올 수 있도록 하는 설정
app.use(bodyParser.urlencoded({extended: true}))

// application/json
app.use(bodyParser.json())

mongoose.set("strictQuery", false)
// mongoose.connect('[Information]')
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/register', (req, res) => {
    // 회원 가입 할때, 필요한 정보들을 client에서 가져오면
    // 그것들을 database에 넣어준다.

    // bodyParser를 통해 client로 부터 얻은 정보를 req.body로 할당
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})