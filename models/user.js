const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10 //salt가 몇 글자인지 나타냄
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name:{
        type: String,
        maxlength: 50
    },
    email:{
        type: String,
        trim: true, // 중간 스페이스를 없애주는 역할
        unique: 1
    },
    password:{
        type: String,
        minlength: 5
    },
    lastname:{
        type: String,
        maxlength: 50
    },
    role:{
        type: Number,
        default: 0
    },
    image: String,
    token:{
        type: String
    },
    tokenExp:{
        type: Number
    }
})

userSchema.pre('save', function(next){
    var user = this

    // 비밀번호 변경시에만 암호화 해주기 위해
    if(user.isModified('password')){
        //비밀번호를 암호화 시킨다
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else{
        // 비밀번호 외 다른 정보들을 변경할 시에도 next로 보내줘야 한다
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    // plainPassword: 1234567, 암호화된 비밀번호: $2b$10$36q2XvgMyWwtwQ/C6mqeUe4Lz7DOKVmZFCeoEum37SEiVd.sm3hmi
    // plainPassword도 암호화하여 비교해야 한다
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this

    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

const User = mongoose.model('User', userSchema)
module.exports = { User }