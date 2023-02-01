const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10 //salt가 몇 글자인지 나타냄

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

const User = mongoose.model('User', userSchema)
module.exports = { User }