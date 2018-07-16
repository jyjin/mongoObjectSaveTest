const mongoose = require('mongoose');
var connection = mongoose.connect('mongodb://jyjin:123456@192.168.130.109:27017/acdService',(err, result)=>{
    if(err){
        console.log('[ 链接数据库错误 ]', err)
    }
});

const async = require('async')

const MessageSchema = new mongoose.Schema({
    text: { type: String, default: '' },
    textCode: { type: String },
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
var Message = mongoose.model('Message', MessageSchema)

const UserSchema = new mongoose.Schema({
    name: { type: String, index: true },
    age: { type: Number, default: 20 },
    messageIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    msgIds: [{ type: String }],
    extend: {},
    extend1: [],
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
})
var User = connection.model('User', UserSchema)

/**
 * 新增Message
 * @param {*} opt 
 * @param {*} callback 
 */
var addMessageDao = (opt, callback) => {
    var message = new Message()
    for (var key in opt) {
        message[key] = opt[key]
    }
    message.save(callback)
}

/**
 * 新增User
 * @param {*} opt 
 * @param {*} callback 
 */
var addUserDao = (opt, callback) => {
    var user = new User()
    for (var key in opt) {
        user[key] = opt[key]
    }
    user.save(callback)
}


let addMessage = (callback) => {
    async.auto({
        msg1: (cb) => {
            addMessageDao({
                text: '你好'
            }, cb)
        },
        msg2: (cb) => {
            addMessageDao({
                text: '我是jyjin'
            }, cb)
        },
        msg3: (cb) => {
            addMessageDao({
                text: '我要去拯救世界了'
            }, cb)
        }
    }, (err, result) => {
        if (err) {
            console.log(`[ 添加消息失败！ ]`, err)
        }
        callback(err, result)
    })

}

let addUser = (message, callback) => {
    addUserDao({
        name: 'jyjin',
        messageIds: [message._id]
    }, (err, user) => {
        if (err) {
            console.log('添加用户失败！')
        }
        callback(err, user)
    })
}

let queryMessage = (callback) => {
    Message.findOne({ text: '我是jyjin' }).exec((err, message) => {
        if (err) {
            console.log('err === ', err)
        }
        console.log('message === ', message)
        callback(err, message)
    })
}


let queryUser = (callback) => {
    User.findOne({ name: 'jyjin' }).exec((err, user) => {
        if (err) {
            console.log('err === ', err)
        }
        console.log('user === ', user)
        callback(err, user)
    })
}


async.auto({
    message: (cb) => {
        addMessage(cb)
    },
    user: ['message', (ret, cb) => {
        addUser(ret.message.msg1, cb)
    }]
}, (err, result) => {
    if(err){
        console.log(`[ 错误 ]`, err)
    }

    let user = result.user
    let message = result.message

    //1.测试markModified对 ObjectId Array类型是否起作用 -> 不起作用
    // user.markModified('messageIds')
    // user.messageIds.push(message._id)

    //2.测试转换类型对Array类型是否起作用 -> 起作用
    let arr = JSON.stringify(user.messageIds)
    arr = JSON.parse(arr)
    arr.push(message._id)
    user.messageIds = arr

    //3.测试markModified对String数组类型是否起作用 -> 不起作用
    // user.msgIds.push(message._id.toString())
    // user.markModified('msgIds')

    //4.测试markModified对Object类型是否起作用 -> 起作用
    // !user.extend && (user.extend = {})
    // user.extend.desc = 'test123'
    // user.markModified('extend')

    //5.测试markModified对纯属组类型是否起作用 -> 不起作用
    // user.extend1.push(message._id.toString())
    // user.markModified('extend1')

    user.age = 30
    console.log('user 保存 === ', user)

    user.save((err, result) => {
        console.log('保存错误 -- ', err)
        console.log('保存结果 -- ', result)
    });
})






