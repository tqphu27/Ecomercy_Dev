'use strict'

const { Types: { ObjectId } } = require('mongoose')
const keytokenModel = require("../models/keytoken.model")

class KeyTokenService {

    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken}) => {
        try{
            // Level 0
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // return tokens ? tokens.publicKey : null
            
            // Level xxx
            const filter = {user: userId}, update = {
                publicKey, privateKey, refreshTokenUsed: [], refreshToken
            }, options = {upsert: true, new: true} //chua co thi insert, co roi thi update

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey :null

        }catch(error){
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({ user: userId})
    }

    static removeKeyById = async (id) => {
        return await keytokenModel.deleteOne(id)
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne({refreshTokensUsed: refreshToken}).lean()
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne({refreshToken})
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({user: userId})
    }
}

module.exports = KeyTokenService