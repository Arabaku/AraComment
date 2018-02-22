const express = require('express')
const router = express.Router()
const comment = require('./comment')

// Add Routes
router.use('/comment', comment)

module.exports = router