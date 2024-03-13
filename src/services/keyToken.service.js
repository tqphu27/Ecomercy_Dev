'use strict'

const keytokenModel = require("../models/keytoken.model")

class keyTokenService {

    static createKeyToken = async ({userId, publicKey, privateKey}) => {
        try{
            // const publicKeyString = publicKey.toString()
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey: publicKeyString
            // })
            const tokens = await keytokenModel.create({
                user: userId,
                publicKey,
                privateKey
            })
            return tokens ? tokens.publicKey : null

        }catch(error){
            return error
        }
    }
}

module.exports = keyTokenService