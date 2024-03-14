'use strict'

const {Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_name:{
        type: String,
        require: true
    },

    product_thumb:{
        type: String,
        required: true
    },

    product_description: {type: Schema.Types.ObjectId, ref: 'Shop'},

    product_price: {
        type: Number,
        required: true
    },

    product_quantity: {
        type: Number,
        required: true
    },

    product_type: {
        type: String,
        required: true,
        enum: ['Electionics', 'Clothing', 'Furniture']
    },

    product_shop: String ,

    product_attributes: {
        types: Schema.Types.Mixed,
        required: true
    }
    },{
        collection: COLLECTION_NAME,
        timestamps: true
})

// define the product type = clothing

const clothingSchema = new Schema({
    brand: {type: String, require: true},
    size: String,
    material: String
    },{
        collection: 'clothes',
        timestamps: true
})

const electionicSchema = new Schema({
    manufacturer: {type: String, require: true},
    model: String,
    color: String
    },{
        collection: 'electionics',
        timestamps: true
})

module.exports = {
    product: model( DOCUMENT_NAME, productSchema),
    product: model( 'Electronics', electionicSchema),
    product: model( 'Clothing', clothingSchema)
}