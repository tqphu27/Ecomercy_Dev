'use strict'

const { BadRequestError } = require("../core/error.response")
const {product, clothing, electronic, furniture} = require("../models/product.model")

// define Factory class to create product
class ProductFactory {
    static async createProduct(type, payload){
        switch(type){
            case 'Electronic':
                return new Electronic(payload).createProduct()
            case 'Clothing':
                return new Clothing(payload).createProduct()
            case 'Furniture':
                return new Furniture(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid Product Types ${type}`)
        }
    }
}

// define base Product class
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes
    }){
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    // create new product
    async createProduct(product_id){
        return await product.create({
            ...this,
            _id: product_id
        })
    }
}

// Define sub-class for different product's types clothing
class Clothing extends Product{
    async createProduct(){
        const newClothing = await clothing.create(this.product_attributes)
        if(!newClothing) throw new BadRequestError("Create new Clothing err")

        const newProduct = await super.createProduct()
        if(!newProduct) throw new BadRequestError("Create new Product err")

        return newProduct
    }
}

// Define sub-class for different product's types Electronic
class Electronic extends Product{
    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw new BadRequestError("Create new Electronic err")

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new BadRequestError("Create new Product err")

        return newProduct
    }
}

// Define sub-class for different product's types Furniture
class Furniture extends Product{
    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture) throw new BadRequestError("Create new Furniture err")

        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new BadRequestError("Create new Product err")

        return newProduct
    }
}

module.exports = ProductFactory;