"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodesUnSelect,
  checkDiscountExists,
} = require("../models/repositoies/discount.repo");
const { fillAllProductsRepo } = require("../models/repositoies/product.repo");
const { convertToObjectIdMongoDb } = require("../utils");

/**
 * Discount service
 * 1 - Generator Discount Code [Shop/Admin]
 * 2 - Get discount amount [User]
 * 3 - Get all discount code [User/Shop]
 * 4 - Verify discount code [User]
 * 5 - Delete discount code [Shop/Admin]
 * 6 - Cancel discount code [User]
 */

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      users_used,
    } = payload;

    if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
      throw new BadRequestError("Discount code has expired!");
    }

    if (new Date(start_date) > new Date(end_date)) {
      throw new BadRequestError("Start date must not be after end date!");
    }
   
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        //discount_shopId: convertToObjectIdMongoDb(shopId),
        discount_shopId: shopId,
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount exit!");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_applies_to: applies_to,
      discount_code: code,
      discount_description: description,
      discount_end_date: new Date(end_date),
      discount_is_active: is_active,
      discount_max_uses: max_uses,
      discount_max_uses_per_user: max_uses_per_user,
      discount_min_order_value: min_order_value || 0,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
      discount_start_date: new Date(start_date),
      discount_type: type,
      discount_uses_count: uses_count,
      discount_value: value,
      discount_shopId: shopId,
      discount_users_used: users_used,
      discount_max_value: max_value,
    });

    return newDiscount;
  }

  static async updateDiscountCode() {}

  /**
   * Get all discount codes available with products
   */

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    //create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        //discount_shopId: convertToObjectIdMongoDb(shopId),
        discount_shopId: shopId
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount not exists!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;

    let products;

    if (discount_applies_to === "all") {
      // get all product
      products = await fillAllProductsRepo({
        filter: {
          product_shop: convertToObjectIdMongoDb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      //get the products ids
      products = await fillAllProductsRepo({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  // Get all discount codes of shop
  static async getAllDiscountCodesByShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnSelect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongoDb(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discountModel,
    });
    return discounts;
  }

  /**
   * Apply discount code
   */

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists(discountModel, {
      discount_code: codeId,
      discount_shopId: shopId,
    });

    if (!foundDiscount) throw new NotFoundError(`Discount  doesn't exits`);
    const {
      discount_is_active,
      discount_max_uses,
      discount_end_date,
      discount_start_date,
      discount_type,
      discount_value,
      discount_min_order_value,
      discount_max_uses_per_user,
      discount_users_used
    } = foundDiscount;
    if (!discount_is_active) throw new NotFoundError(`Discount expired!`);
    if (!discount_max_uses) throw new NotFoundError(`Discount are out!`);
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    ) {
      throw new NotFoundError(`Discount expired!`);
    }

    let totalOrder;
    if (discount_min_order_value > 0) {
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);
      if (totalOrder < discount_min_order_value) {
        throw new NotFoundError(
          `Discount  requires a minium order value of ${discount_min_order_value}`
        );
      }
    }

    if (discount_max_uses_per_user > 0) {
      const userUserDiscount = discount_users_used.find(
        (user) => user.userId === userId
      );
      if (userUserDiscount) {
      }
    }

    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  // delete discount code
  static async deleteDiscountCode({shopId, codeId}){
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: shopId
    })
    return deleted
  }

  static async cancelDiscountCode({shopId, codeId, userId}){
    const foundDiscount = await checkDiscountExists(discountModel,{
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongoDb(shopId)
    })

    if(!foundDiscount) throw new NotFoundError(`Discount expired!`)

    const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc:{
        discount_max_uses: 1,
        discount_user_count: -1
      }
    })

    return result

  }
}

module.exports = DiscountService
