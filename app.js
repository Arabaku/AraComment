const express = require('express')
const api = require('./api')

const app = express()

// 载入 Routes API
app.use('/api', api)

const host = '127.0.0.1'
const port = 3000
app.listen(port, host)