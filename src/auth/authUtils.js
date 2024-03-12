'use strict'
const JWT = require('jsonwebtoken')

const createTokenPair = async (payload, publickey, privateKey) => {
    try{
        const accessToken = await JWT.sign( payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign( payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publickey, (err, decode) => {
            if(err){
                console.log(`error verify::`, err)
            }else{
                console.log(`decode verify::`, decode)
            }
        })
        return {accessToken, refreshToken}
    }catch(error){

    }
}

module.exports = createTokenPair