const app = require("./src/app");

const PORT = 3055

const server = app.listen(3055, () => {
    console.log(`WSV ecomerce start with ${PORT}`)
})

// process.on('SIGINT', () => {
//     server.close( () => console.log(`Exit Server Express`))
// })