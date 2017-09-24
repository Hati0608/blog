var fs      = require('fs')
var Promise = require('bluebird')

var dbFile  = './blog2.db'

/*var blogFile    = './blog.db'
var accountFile = './account.db'
    
var sqlite3 = require('sqlite3').verbose()
var blogDB  = new sqlite3.Database(blogFile)
var accountDB  = new sqlite3.Database(accountFile)*/

var blogDB = require('knex') ({
    dialect: 'sqlite3',
    connection: {
        filename: dbFile
    }
})

function start () {
    /*blogDB.serialize(function () {
        blogDB.run('CREATE TABLE IF NOT EXISTS  table01 (id INTEGER PRIMARY KEY,content TEXT,category TEXT)')
    })
    accountDB.serialize(function () {
        accountDB.run('CREATE TABLE IF NOT EXISTS  table01 (username TEXT,password TEXT)')
    })*/
    blogDB.schema.hasTable('account')
    .then(function(exists) {
        if (!exists) {
            return blogDB.schema.createTable('account', function(table) {
                table.increments('id').primary().unsigned()
                table.string('username')
                table.string('password')
            })
        }
    })

    blogDB.schema.hasTable('blog')
    .then(function(exists) {
        if (!exists) {
            return blogDB.schema.createTable('blog', function(table) {
                table.increments('id').primary().unsigned()
                table.string('category')
                table.string('content')
            })
        }
    })
    console.log('db start')
}

function login (username, password) {
  return new Promise(function (resolve, reject){
    /*accountDB.serialize(function () {
        var sql = 'SELECT password FROM table01 WHERE username=?'
        accountDB.each(sql, [username], function(err, row) {
            console.log('password :' + row.password)
            if (row.password === password) {
                resolve('true')
            }         
        })
    })*/
    blogDB.select('password').from('account').where('username', '=', username)
    .then(function(row) {
        console.log('password :' + row[0].password)
        if (row[0].password === password) {
            console.log('password true')
            resolve('true')
        } else {
            console.log('password failed')
            reject()
         }       
    })
    .catch(function(err) {
        console.log(err)
        reject()
    })
  })   
}

function insert (cont, cate) {
  return new Promise(function (resolve, reject){
    /*blogDB.serialize(function () {
        var sql = 'INSERT INTO table01(content,category) VALUES (?,?)'
        blogDB.run(sql,[content, category])
    })*/
    blogDB('blog').insert({category: cate, content: cont})
    .then(function() {
        resolve()
    }).catch(function(err) {
        console.log(err)
        reject()
    })
  })    
}

function list () {
  return new Promise(function(resolve){
    /*blogDB.serialize(function () {
        var sql = 'SELECT id,content,category FROM table01'
        blogDB.all(sql, function (err, rows) {
            console.log(JSON.stringify(rows))
            resolve(JSON.stringify(rows))
        });
        
    })*/
    blogDB.select('id', 'category', 'content').from('blog')
    .then(function(rows) {
        console.log(JSON.stringify(rows))
        resolve(JSON.stringify(rows))
    })
  })
}

function update (id, category, content) {
  return new Promise(function (resolve, reject) {
    /*blogDB.serialize(function () {
        var sql = 'UPDATE table01 SET category=? WHERE id=?'
        blogDB.run(sql, [category, id]);
        sql = 'UPDATE table01 SET content=? WHERE id=?'
        blogDB.run(sql, [content, id]);
        sql = 'SELECT content,category FROM table01 WHERE id=?'
        blogDB.all(sql, function (err, rows){
            console.log(JSON.stringify(rows))
            resolve(JSON.stringify(rows))
        })
        
    })*/
    blogDB('blog')
    .update({
        category: category,
        content: content
    })
    .where('id', id)
    .then(function() {
        blogDB.select('id', 'category', 'content').from('blog').where('id', id)
        .then(function(rows) {
            console.log(JSON.stringify(rows))
            resolve(JSON.stringify(rows))
        })
    })
  })
    
}

function del (id) {
    /*blogDB.serialize(function () {
        var sql = 'DELETE FROM table01 WHERE id = ?'
        blogDB.run(sql,id, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log('delete success')
            }
        });
        
    })*/
    blogDB('blog').where('id',id).del()
    .then(function() {
        console.log('delete finish')
    })
}

function createAccount (name, passwd) {
  return new Promise(function(resolve, reject){
    /*accountDB.serialize(function () {
        var sql = 'INSERT INTO table01(username,password) VALUES (?,?)'
        accountDB.run(sql,[username, password])
    })*/
    blogDB('account').insert({username: name, password: passwd})
    .then(function() {
        console.log('create success')
        resolve()
    }).catch(function(err) {
        console.log(err)
        reject()
    })

  })
    
}


exports.start  = start
exports.insert = insert
exports.list   = list
exports.update = update
exports.delete = del
exports.create = createAccount
exports.login  = login