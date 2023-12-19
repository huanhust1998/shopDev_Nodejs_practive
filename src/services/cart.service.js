"use strict";

const { cart } = require("../models/cart.model");

class CartService {
  static async createUserCart({ userId, product }) {
    const query = { cart_userId: userId, cart_state: "active" },
      updateOfInsert = {
        $addToSet: {
          cart_products: product,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateOfInsert, options);
  }

  static async updateUserCartQuantity({ userId, product }) {
    const { productId, quantity } = product;
    const query = {
        cart_userId: userId,
        "cart_products.productId": productId,
        cart_state: "action",
      },
      updateSet = {
        $inc: {
          "cart_products.$.quantity": quantity,
        },
      },
      options = { upsert: true, new: true };
    return await cart.findOneAndUpdate(query, updateSet, options);
  }

  static async addToCart({ userId, product = {} }) {
    //check cart tồn tại hay không
    const userCart = await cart.findOne({ cart_userId: userId });
    if (!userCart) {
      return await CartService.createUserCart({ userId, product });
    }
    //nếu giỏ hàng tồn tại và không có sản phẩm
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      return await userCart.save();
    }

    //giỏ hàng tồn tại, và có sản phẩm này thì update quantity
    return await CartService.updateUserCartQuantity({ userId, product });
  }
}

module.exports = CartService;
