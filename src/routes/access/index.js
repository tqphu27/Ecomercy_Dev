'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

router.post('/shop/sign-up', asyncHandler(accessController.signUp))
router.post('/shop/log-in', asyncHandler(accessController.login))

// authentication
router.use(authentication)
router.post('/shop/log-out', asyncHandler(accessController.logout))

module.exports = router