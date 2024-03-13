'use strict'
const JWT = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, publickey, privateKey) => {
    try{
        const accessToken = await JWT.sign( payload, publickey, {
            // algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign( payload, privateKey, {
            // algorithm: 'RS256',
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

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1. Check user_id missing ?
        2. get accessToken
        3. verify token
        4. check user in dbs
        5. check keyStore with this userId
    */
    
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request')

    const keyStore = await findByUserId(userId)
    if(!keyStore) throw new NotFoundError('Not found keyStore')

    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if(userId !== decodeUser.userId) throw new AuthFailureError('Invalid User')
        req.keyStore = keyStore
        return next()
    }catch(error){
        throw error
    }

})

module.exports = {
    createTokenPair,
    authentication
}