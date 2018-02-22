const express = require('express')
const router = express.Router()
const db = require('../models/db')

router.get('/getByArticleId/:id', function (req, res) {
  let arr = []
  let arrTransform = []

  async function traverseAll (comment) {
    arr.push(comment)
    if (comment.reply === null) {
      return
    }
    for (let i = 0; i < comment.reply.length; i++) {
      let reply = await db.findAsync('comment', {'_id': comment.reply[i]}, {}, 0)
      await traverseAll(reply[0])
    }
  }

  function transform (data) {
    if (data.reply === null) {
      return
    }
    data.reply = data.reply.map(function (v) {
      return arr.filter(function (i) {
        if (i._id.toString() === v.toString()) {
          return i
        }
      })
    })
    for (let i = 0; i < data.reply.length; i++) {
      transform(data.reply[i][0])
    }
  }

  async function transformUser (data) {
    let user = await db.findAsync('user', {'_id': data.user}, {}, 0)
    data.user = {
      username: user[0].username,
      userId: user[0]._id
    }
    if (data.reply === null) {
      return
    }
    for (let i = 0; i < data.reply.length; i++) {
      await transformUser(data.reply[i][0])
    }
  }

  (async function () {
    let commentIndex = await db.findAsync('comment', {'articleid': parseInt(req.params.id)}, {'_id': -1}, 0)
    for (let i = 0; i < commentIndex.length; i++) {
      // 单个大回复
      let comment = commentIndex[i]
      // 遍历所有回复进入 arr
      await traverseAll(comment)
    }
    // 此时已经遍历了 comment 进 arr
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].articleid !== undefined) {
        transform(arr[i])
        arrTransform.push(arr[i])
      }
    }
    // 根据 reply 建树完毕，开始注入 user
    for (let i = 0; i < arrTransform.length; i++) {
      await transformUser(arrTransform[i])
    }
    res.json(arrTransform)
  })()
})

module.exports = router
