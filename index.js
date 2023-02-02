const express = require('express')
const { default: mongoose } = require('mongoose')
const app = express()
const port = 8000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./server/config/key')
const { auth } = require('./server/middleware/auth')
const { User } = require('./server/models/user')

// application/x-www-form-urlencoded
// 위와 같은 데이터를 분석해서 가져올 수 있도록 하는 설정
app.use(bodyParser.urlencoded({extended: true}))

// application/json
app.use(bodyParser.json())
app.use(cookieParser())

mongoose.set("strictQuery", false)
// mongoose.connect('[Information]')
mongoose.connect(config.mongoURI)
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/api/users/register', (req, res) => {
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

app.post('/api/users/login', (req, res) => {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인한다
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })

            // 비밀번호까지 일치한다면 토큰을 생성한다
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err)

                // 쿠키에 토큰을 저장한다
                res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

// role 1 : Admin, role 2 : 특정 부서 admin
// role 0 : 일반 user, role 0이 아니면 : 관리자
app.get('/api/users/auth', auth, (req, res) => {
    // 여기까지 middleware를 통과해 왔다는 얘기는 Authentication이 True라는 뜻
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        email : req.user.email,
        name : req.user.name,
        lastname : req.user.lastname,
        role : req.user.role,
        image : req.user.image
    })
})

app.get('/api/users/logout', auth, (req,res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, ( err, user ) => {
        if(err) return res.json({ success: false, err})
        return res.status(200).send({ success: true })
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})