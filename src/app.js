const compression = require('compression')
const express = require('express')
const { default: helmet} = require('helmet')
const morgan = require('morgan')
const app = express()

// init middlewares
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())

app.get('/', (req, res, next) => {
    const strCompress = "Hello"

    return res.status(200).json({
        message: 'Welcome',
        metadata: strCompress.repeat(10000)
    })
})

module.exports = app
