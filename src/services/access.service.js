'use strict'

const shopModel = require('../models/shop.model')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const keyTokenService = require('./keyToken.service')
const createTokenPair = require('../auth/authUtils')
const { getInfoData } = require('../utils')

const RoleShop = {
    SHOP: 0,
    WRITER: 1,
    EDITOR: 2,
    ADMIN: 3
}

class AccessService {
    static signUp = async ({name, email, password}) => {
        try{
            // Check email exists
            const holderShop = await shopModel.findOne({email}).lean()
            if(holderShop){
                return{
                    code: 'XXX',
                    message: 'Shop already exists !!!'
                }
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
                    return{
                        code: 'XXX',
                        message: 'PublicKeyString error !!!'
                    }
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
        }catch(error){
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService