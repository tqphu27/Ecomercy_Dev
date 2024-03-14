'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('./keyToken.service')
const {createTokenPair, verifyJWT} = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, ConflictRequestError, AuthFailureError, ForbiddenError } = require('../core/error.response')
const { findByEmail } = require('./shop.service')

const RoleShop = {
    SHOP: 0,
    WRITER: 1,
    EDITOR: 2,
    ADMIN: 3
}

class AccessService {

    // v2
    static handlerRefreshTokenV2 = async ({keyStore, user, refreshToken}) => {

        const {userId, email} = user

        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Somethings wrong happen !!! Please relogin')
        }

        if(keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered')

        const foundShop = await findByEmail({email})
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        // create new accesstoken and refreshtoken
        const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey)

        // update new token
        await keyStore.updateOne({
            $set:{
                refreshToken: tokens.refreshToken
            },
            $addToSet:{
                refreshTokensUsed: refreshToken
            }
        })
        
        return {
            user: {userId, email},
            tokens
        }
    }

    /*
        check token used? 
        v1
    */
    static handlerRefreshToken = async (refreshToken) => {

        // check token is used ?
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if(foundToken){
            // decode => which
            const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log(userId, email)

            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Somethings wrong happen !!! Please relogin')
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError('Shop not registered')

        // verify token
        const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log(userId, email)

        // check user_id
        const foundShop = await findByEmail({email})
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        // create new accesstoken and refreshtoken
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        // update new token
        await holderToken.updateOne({
            $set:{
                refreshToken: tokens.refreshToken
            },
            $addToSet:{
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user: {userId, email},
            tokens
        }
   }


    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey
    }
    /*
        1- check email in dbs
        2- match password
        3- create accesstoken and refreshtoken and save
        4- generate tokens
        5- get data and return login
    */

    static login = async ({email, password, refreshToken = null}) => {
        // 1.
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registerd')

        // 2.
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureError('Authentication error')

        // 3.
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        // 4.
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId,
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey
        })
        
        return {
            metadata: {
                shop: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop}),
                tokens
            }
        }

    }

    static signUp = async ({name, email, password}) => {
        // Check email exists
        const holderShop = await shopModel.findOne({email}).lean()
        if(holderShop){
            throw new BadRequestError('Error: Shop already registered!')
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if(newShop){
            // Bao mat cao => khong luu private key vao data base

            // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: 'pkcs1', 
            //         format: 'pem'
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     },
            // })

            // const publicKeyString = await KeyTokenService.createKeyToken({
            //     userId: newShop._id,
            //     publicKey
            // })
            
            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            // Public key CryptoGraphy Standards !
            console.log(privateKey, publicKey)

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if(!keyStore){
                throw new BadRequestError('Error: PublicKeyString error !!!')
            }
            
            // const publicKeyObject = crypto.createPublicKey(publicKeyString)
            // create token pair 
            // const tokens = await createTokenPair({userId: newShop._id, email}, publicKeyObject, privateKey)
            const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
            console.log(`Create token::`, tokens)
            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop}),
                    tokens
                }
            }
        }
        return {
            code: 200,
            metadata: null
        }
    }
}

module.exports = AccessService