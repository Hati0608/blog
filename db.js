var fs      = require('fs')
var Promise = require('bluebird')

var blogFile    = './blog.db'
var accountFile = './account.db'
    
var sqlite3 = require('sqlite3').verbose()
var blogDB  = new sqlite3.Database(blogFile)
var accountDB  = new sqlite3.Database(accountFile)

function start () {
    blogDB.serialize(function () {
        blogDB.run('CREATE TABLE IF NOT EXISTS  table01 (id INTEGER PRIMARY KEY,content TEXT,category TEXT)')
    })
    accountDB.serialize(function () {
        accountDB.run('CREATE TABLE IF NOT EXISTS  table01 (username TEXT,password TEXT)')
    })
    
    console.log('db start')
}

function login (username, password) {
  return new Promise(function (resolve){
    accountDB.serialize(function () {
        var sql = 'SELECT password FROM table01 WHERE username=?'
        accountDB.each(sql, [username], function(err, row) {
            console.log('password :' + row.password)
            if (row.password === password) {
                resolve('true')
            }         
        })
    })
  })   
}

function insert (content, category) {
    blogDB.serialize(function () {
        var sql = 'INSERT INTO table01(content,category) VALUES (?,?)'
        blogDB.run(sql,[content, category])
    })
    
}

/*function list () {
    blogDB.serialize(function () {
        var sql = 'SELECT content,category FROM table01'
        blogDB.each(sql, function(err, row) {
            console.log(row.category + ": " + row.content)
        })
    })
}*/

function list () {
  return new Promise(function(resolve){
    blogDB.serialize(function () {
        var sql = 'SELECT id,content,category FROM table01'
        blogDB.all(sql, function (err, rows) {
            console.log(JSON.stringify(rows))
            resolve(JSON.stringify(rows))
        });
        
    })
  })
}

function update (id, category, content) {
  return new Promise(function (resolve, reject) {
    blogDB.serialize(function () {
        var sql = 'UPDATE table01 SET category=? WHERE id=?'
        blogDB.run(sql, [category, id]);
        sql = 'UPDATE table01 SET content=? WHERE id=?'
        blogDB.run(sql, [content, id]);
        sql = 'SELECT content,category FROM table01 WHERE id=?'
        blogDB.all(sql, function (err, rows){
            console.log(JSON.stringify(rows))
            resolve(JSON.stringify(rows))
        })
        
    })
  })
    
}

function del (id) {
    blogDB.serialize(function () {
        var sql = 'DELETE FROM table01 WHERE id = ?'
        blogDB.run(sql,id, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log('delete success')
            }
        });
        
    })
}

function createAccount (username, password) {
    accountDB.serialize(function () {
        var sql = 'INSERT INTO table01(username,password) VALUES (?,?)'
        accountDB.run(sql,[username, password])
    })
}


exports.start  = start
exports.insert = insert
exports.list   = list
//exports.list2  = list2
exports.update = update
exports.delete = del
exports.create = createAccount
exports.login  = login