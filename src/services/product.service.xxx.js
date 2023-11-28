"use strict";

const {
  product,
  electronic,
  clothing,
  furniture,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");
const {
  findAllDraftsForShopRepo,
  findAllPublishForShopRepo,
  publishProductByShopRepo,
  unpublishProductByShopRepo,
  searchProductByUserRepo,
  fillAllProductsRepo,
  fillOneProductRepo,
  updateProductByIdRepo,
} = require("../models/repositoies/product.repo");
const { removeUndefinedObject, updateNestedObjectParser } = require("../utils");
const { insertInventory } = require("../models/repositoies/inventory.repo");

//define Factory class to create product
class ProductFactory {
  static productRegistry = {}; //key-class

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProductFactory(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid Product Type ${type}`);
    return new productClass(payload).createProduct();
  }

  static async updateProductFactory(type, productId, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid Product Type ${type}`);
    return new productClass(payload).updateProduct(productId);
  }

  //PUT
  static async publishProductByShop({ product_shop, product_id }) {
    return await publishProductByShopRepo({ product_shop, product_id });
  }

  static async unpublishProductByShop({ product_shop, product_id }) {
    return await unpublishProductByShopRepo({ product_shop, product_id });
  }
  //END PUT

  //query
  static async findAllDraftsForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isDraft: true };
    return await findAllDraftsForShopRepo({ query, limit, skip });
  }

  static async findAllPublishForShop({ product_shop, limit = 50, skip = 0 }) {
    const query = { product_shop, isPublished: true };
    return await findAllPublishForShopRepo({ query, limit, skip });
  }

  static async searchProducts({ keySearch }) {
    return await searchProductByUserRepo({ keySearch });
  }

  static async findAllProducts({
    limit = 50,
    sort = "ctime",
    page = 1,
    filter = { isPublished: true },
  }) {
    return await fillAllProductsRepo({
      limit,
      sort,
      page,
      filter,
      select: ["product_name", "product_price", "product_thumb"],
    });
  }

  static async findOneProduct({ product_id }) {
    return await fillOneProductRepo({
      product_id,
      unSelect: ["isDraft, isPublished", "createdAt", "updatedAt", "__v"],
    });
  }
}

//define base product class
class Product {
  constructor({
    product_name,
    product_thumb,
    product_description,
    product_price,
    product_quantity,
    product_type,
    product_shop,
    product_attributes,
  }) {
    this.product_name = product_name;
    this.product_thumb = product_thumb;
    this.product_description = product_description;
    this.product_price = product_price;
    this.product_quantity = product_quantity;
    this.product_type = product_type;
    this.product_shop = product_shop;
    this.product_attributes = product_attributes;
  }

  //create new Product
  async createProduct(product_id) {
    const newProduct = await product.create({ ...this, _id: product_id });
    if(newProduct){
      //add product_stock vào inventory collection
      await insertInventory({
        productId: newProduct.id,
        shopId: this.product_shop,
        stock: this.product_quantity,
      });
    }

    return newProduct;
  }

  async updateProduct({ productId, payload }) {
    return await updateProductByIdRepo({model: product, productId, payload });
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newClothing) throw new BadRequestError("Create new Clothing error");
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new Product error");
    return newProduct;
  }

  async updateProduct(productId) {
    const objectParams = removeUndefinedObject(this);
    if (objectParams.product_attributes) {
      await updateProductByIdRepo({
        model: clothing,
        productId,
        payload: updateNestedObjectParser(objectParams.product_attributes),
      });
    }
    const productUpdate = await super.updateProduct({
      productId,
      payload: updateNestedObjectParser(objectParams),
    });
    return productUpdate;
  }
}

class Electronics extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newElectronic)
      throw new BadRequestError("Create new electronics error");
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create new electronics error");
    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.product_attributes,
      product_shop: this.product_shop,
    });
    if (!newFurniture)
      throw new BadRequestError("Create new electronics error");
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new electronics error");
    return newProduct;
  }
}

// register product types
ProductFactory.registerProductType("Electronics", Electronics);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
