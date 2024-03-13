'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const keyTokenService = require('./keyToken.service')
const {createTokenPair} = require('../auth/authUtils')
const { getInfoData } = require('../utils')
const { BadRequestError, ConflictRequestError, AuthFailureError } = require('../core/error.response')
const { findByEmail } = require('./shop.service')

const RoleShop = {
    SHOP: 0,
    WRITER: 1,
    EDITOR: 2,
    ADMIN: 3
}

class AccessService {

    static logout = async (keyStore) => {
        const delKey = await keyTokenService.removeKeyById(keyStore._id)
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

        await keyTokenService.createKeyToken({
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

            // const publicKeyString = await keyTokenService.createKeyToken({
            //     userId: newShop._id,
            //     publicKey
            // })
            
            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            // Public key CryptoGraphy Standards !
            console.log(privateKey, publicKey)

            const keyStore = await keyTokenService.createKeyToken({
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