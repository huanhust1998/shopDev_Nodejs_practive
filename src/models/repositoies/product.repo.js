"use strict";

const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../product.model");
const { Types } = require("mongoose");

const queryProduct = async (query, limit, skip) => {
  return await product
    .find(query)
    .populate("product_shop", "name email -_id")
    .sort({ updateAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
};

const findAllDraftsForShopRepo = async ({ query, limit, skip }) => {
  return await queryProduct(query, limit, skip);
};

const findAllPublishForShopRepo = async ({ query, limit, skip }) => {
  return await queryProduct(query, limit, skip);
};

const searchProductByUserRepo = async ({ keySearch }) => {
  const regexSearch = new RegExp(keySearch);
  const results = await product
    .find(
      {
        isDraft: false,
        $text: { $search: regexSearch },
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .lean();

  return results;
};

const publishProductByShopRepo = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;
  foundShop.isDraft = false;
  foundShop.isPublished = true;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

const unpublishProductByShopRepo = async ({ product_shop, product_id }) => {
  const foundShop = await product.findOne({
    product_shop: new Types.ObjectId(product_shop),
    _id: new Types.ObjectId(product_id),
  });

  if (!foundShop) return null;
  foundShop.isDraft = true;
  foundShop.isPublished = false;

  const { modifiedCount } = await foundShop.updateOne(foundShop);
  return modifiedCount;
};

module.exports = {
  findAllDraftsForShopRepo,
  publishProductByShopRepo,
  findAllPublishForShopRepo,
  unpublishProductByShopRepo,
  searchProductByUserRepo
};
