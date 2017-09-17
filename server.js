var express = require('express')
var db      = require('./db')

var app        = express()
var session    = require('express-session')
var FileStore  = require('session-file-store')(session)
var bodyParser = require('body-parser')

var urlencodedParser = bodyParser.urlencoded({ extended: false})

app.use(session({
    name: 'name',
    secret: 'hati',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 600 * 1000  // 有效期，单位是毫秒
    }
}))

app.get('/', function (req, res) {
    //var sess = req.session
    //var name = sess.name
    //if (name == 'b') {
    //    console.log('session') 
    //}
    //req.session.name = 'b'
    
    res.send('Hello World')
})

app.get('/list', function (req, res) {
    db.list2(function (content) {
        res.send(content)
    })
    //res.send()
})

app.post('/login', urlencodedParser, function (req, res) {
    var response = {
        "username" : req.body.username,
        "password" : req.body.password
    }
    console.log(response)
    db.login(req.body.username, req.body.password, function (err, check) {
        if (check) {
            req.session.name = req.body.username    
            res.redirect('/')
            console.log(req.body.username + ' login')
        } else {
            req.session.name = ''
            console.log('login failed')
            res.send('login failed')
        }
        
    })
    //res.end(JSON.stringify(response))
    
})

app.get('/logout', function(req, res) {
    //req.session.destroy()
    req.session.name = ''
    res.redirect('/')
})

app.post('/create', urlencodedParser, function (req, res) {
    var response = {
        "username" : req.body.username,
        "password" : req.body.password
    }
    console.log(response)
    db.create(req.body.username, req.body.password)
    res.status(200).json(response)
})

app.post('/update', urlencodedParser, function (req, res) {
    console.log(req.session)
    var response = {
        "id" : req.body.id,
        "category" : req.body.category,
        "content" : req.body.content
    }
    var sess = req.session
    var name = sess.name
    if (name != null) {
        console.log(name + ' update!!')
        
        db.update(req.body.id, req.body.category, req.body.content, function (content) {
            res.send(content)
        })
    } else {
        console.log(response)
        res.status(401).json({'err' : 'login failed'})
        console.log('login failed')
    }
    
    //res.status(200).json(response)
})

app.post('/delete', urlencodedParser, function (req, res) {
    var response = {
        "id" : req.body.id
    }
    console.log(response)
    db.delete(req.body.id)
    res.status(200).json(response)
})

app.post('/upload', urlencodedParser, function (req, res) {
    console.log(req.session)
    var response = {
        "content"  : req.body.content,
        "category" : req.body.category  
    }
    var sess = req.session
    var name = sess.name
    if (name != null) {
        console.log(name + ' upload!!')
        db.insert(req.body.content, req.body.category)
        db.list()
        res.status(200).json(response)
    } else {
        console.log(response)
        res.status(401).json({'err' : 'login failed'})
        console.log('login failed')
    }
    
    
})

var server = app.listen(8080, function () {
    console.log('server start') 
    db.start()
})