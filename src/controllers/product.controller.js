const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");
const {SuccessResponse} = require("../core/success.response");

class ProductController {
  // createProduct = async (req, res, next) => {
  //   new SuccessResponse({
  //     message: "Create new Product success",
  //     metadata: await ProductService.createProduct(
  //       req.body.product_type,
  //       {
  //         ...req.body,
  //         product_shop: req.user.userId
  //       }
  //     ),
  //   }).send(res);
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new Product success",
      metadata: await ProductServiceV2.createProduct(req.body.product_type, {
        ...req.body,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Publish product success",
      metadata: await ProductServiceV2.publishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  unpublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Unpublish product success",
      metadata: await ProductServiceV2.unpublishProductByShop({
        product_id: req.params.id,
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  // query
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all drafts product success",
      metadata: await ProductServiceV2.findAllDraftsForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all drafts product success",
      metadata: await ProductServiceV2.findAllPublishForShop({
        product_shop: req.user.userId,
      }),
    }).send(res);
  };

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list search product success",
      metadata: await ProductServiceV2.searchProducts(req.params),
    }).send(res);
  };
}

module.exports = new ProductController();