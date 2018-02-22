const MongoClient = require('mongodb').MongoClient
const settings = require('../settings.js')

// 连接数据库
function _connectDB (callback) {
  let url = settings.dburl // 导入数据库地址
  MongoClient.connect(url, function (err, db) {
    if (err) {
      callback(err, null)
      return
    }
    callback(err, db)
  })
}

// 数据库查找
exports.findAsync = function (collectionName, findJson, sortJson, limitNum) {
  return new Promise(function (resolve, reject) {
    _connectDB(function (err, db) {
      db.collection(collectionName).find(findJson).sort(sortJson).limit(limitNum).toArray(function (err, items) {
        if (err) {
          reject(err)
          db.close()
          return
        }
        resolve(items)
        db.close()
      })
    })
  })
}
