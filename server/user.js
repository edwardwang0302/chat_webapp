const express = require('express')
const utils = require('utility')
const Router = express.Router()
const models = require('./model')
const User = models.getModel('user')
const Chat = models.getModel('chat')
const _filter = {'pwd':0, '__v': 0}

Router.get('/list', function(req, res) {
    const { type } = req.query
    // User.remove({}, function(e, d){})
    User.find({type}, function(err, doc) {
        return res.json({code:0, data:doc})
    })
})
Router.get('/getmsglist', function(req, res) {
    const user = req.cookies.userid
    User.find({}, function(e, userdoc) {
        let users = {}
        userdoc.forEach(v=>{
            users[v._id] = {name:v.user, avator: v.avator}
        })
        // $or查询多个条件，后面的数组每个元素是一组条件
        Chat.find({'$or': [{from:user}, {to:user}]}, function(err, doc) {
            if (!err) {
                return res.json({code:0, msgs:doc, users:users})
            }
        })
    })
})
Router.post('/readmsg', function(req, res) {
    const userid = req.cookies.userid
    const { from } = req.body
    Chat.update(
        {from, to:userid},
        {'$set':{read:true}},
        {'multi':true},
        function(err, doc) {
            console.log(doc)
            if(!err) {
                return res.json({code:0, num:doc.nModified})
            }
            return res.json({code:1, msg:'修改失败'})
    })
})
Router.post('/update', function(req, res) {
    const userid = req.cookies.userid
    if (!userid) {
        return JSON.dumps({code:1})
    }
    const body = req.body
    User.findByIdAndUpdate(userid, body, function(err, doc) {
        // 使用Object.assign做merge
        const data = Object.assign({}, {
            user: doc.user,
            type: doc.type
        }, body)
        return res.json({code:0, data})
    })
})
Router.post('/login', function(req, res) {
    const { user, pwd } = req.body
    // 第一个参数是查询条件，第二个设置显示值0不显示 这里不希望返回密码
    User.findOne({user, pwd:md5Pwd(pwd)}, _filter, function(err, doc) {
        if (!doc) {
            return res.json({code:1, msg:'用户名不存在或者密码错误'})
        }
        // 设置cookie
        res.cookie('userid', doc._id)
        return res.json({code:0, data:doc})
    })
})
Router.post('/register', function(req, res) {
    // 要安装body-parser插件
    const {user, pwd, type} = req.body
    User.findOne({user:user}, function(err, doc) {
        if (doc) {
            return res.json({code:1, msg:'用户名重复'})
        }
        const userModel = new User({user, type, pwd:md5Pwd(pwd)})
        userModel.save(function(e, d) {
            if (e) {
                return res.json({code:1, msg:'后端出错了'})
            }
            const { user, type, _id } = d
            // 写cookie
            res.cookie('userid', _id)
            return res.json({code:0, data:{ user, type, _id }})
        })
        // 这里使用utility 来进行md5加密
        // User.create({user,type,pwd:md5Pwd(pwd)}, function(e, d) {
        //     if (e) {
        //         return res.json({code:1, msg:'后端出错了'})
        //     }
        //     return res.json({code:0})
        // })
    })
})
Router.get('/info', function(req, res) {
    const { userid } = req.cookies
    if (!userid) {
        return res.json({code:1})
    }
    User.findOne({_id:userid}, _filter, function(err, doc){
        if (err) {
            return res.json({code:1, msg:'后端出错了'})
        }
        if (doc) {
            console.log(doc)
            return res.json({code:0, data:doc})
        }
    })
    // 用户有没有cookie
    // return res.json({code:1})
})

// 加密加盐
function md5Pwd(pwd) {
    const salt = 'i_wanna_be_bestx8yza6!@#IUHJH~~'
    return utils.md5(utils.md5(pwd+salt))
}

module.exports = Router
