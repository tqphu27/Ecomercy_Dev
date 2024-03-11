'use strict'

const mongoose = require("mongoose")
const os = require("os")
const process = require('process')
const _SECONDS = 5000

// count Connect
const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log(`Number of connections::${numConnection}`)
}

// Check overload connect
const checkOverload = () => {
    setInterval( () => {
        const numConnection = mongoose
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        
        // Example maximun number of connections based on number of cores
        const maxConnections = numCores*5

        console.log(`Active connnections::${numConnection}`)
        console.log(`Memory usage:: ${memoryUsage/1024/1024} MB`)

        if(numConnection > maxConnections){
            console.log(`Connections overload detected!`)
            // notify.send(....)
        }
    }, _SECONDS) //Mornitor every 5 seconde
}

module.exports = {
    countConnect,
    checkOverload
}